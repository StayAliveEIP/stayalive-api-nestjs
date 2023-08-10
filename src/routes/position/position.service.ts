import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PositionDeletedDto,
  PositionDto,
  PositionWithIdDto,
} from './position.dto';
import {
  RedisService,
  RescuerPosition,
  RescuerPositionWithId,
} from '../../services/redis/redis.service';
import { Model, Types } from 'mongoose';
import {
  GeoCoordinates,
  getDistanceInKilometers,
} from '../../utils/position.utils';
import { from, interval, map, Observable, switchMap, throwError } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Rescuer } from '../../database/rescuer.schema';

@Injectable()
export class PositionService {
  constructor(
    private readonly redisService: RedisService,
    @InjectModel(Rescuer.name) private rescuerModel: Model<Rescuer>,
  ) {}

  async getPosition(req: Request): Promise<PositionDto> {
    const id: string = req['user'].userId;
    const objectId: Types.ObjectId = new Types.ObjectId(id);
    const position: RescuerPosition =
      await this.redisService.getPositionOfRescuer(objectId);
    if (!position) throw new NotFoundException('Position introuvable.');
    return {
      latitude: position.lat,
      longitude: position.lng,
    };
  }

  async setPosition(req: Request, body: PositionDto): Promise<PositionDto> {
    const id: string = req['user'].userId;
    const objectId: Types.ObjectId = new Types.ObjectId(id);
    const rescuerPosition: RescuerPosition = {
      lat: body.latitude,
      lng: body.longitude,
    };
    await this.redisService.setPositionOfRescuer(objectId, rescuerPosition);
    return body;
  }

  async deletePosition(req: Request): Promise<PositionDeletedDto> {
    const id: string = req['user'].userId;
    const objectId: Types.ObjectId = new Types.ObjectId(id);
    await this.redisService.deletePositionOfRescuer(objectId);
    return {
      message: 'La position a été supprimée.',
    };
  }

  async getAllPositions(): Promise<PositionWithIdDto[]> {
    const positionRedis: RescuerPositionWithId[] =
      await this.redisService.getAllPositions();
    return positionRedis.map((position: RescuerPositionWithId) => {
      const convert: PositionWithIdDto = {
        id: position.id.toString(),
        latitude: position.position.lat,
        longitude: position.position.lng,
      };
      return convert;
    });
  }

  async getNearestPosition(position: PositionDto): Promise<PositionWithIdDto> {
    const allPositions: PositionWithIdDto[] = await this.getAllPositions();
    if (allPositions.length === 0)
      throw new NotFoundException('Aucune position trouvée.');
    const nearestPosition: PositionWithIdDto = allPositions.reduce(
      (prev, curr) => {
        getDistanceInKilometers(
          new GeoCoordinates(position.latitude, position.longitude),
          new GeoCoordinates(curr.latitude, curr.longitude),
        );
        const prevDistance: number = getDistanceInKilometers(
          new GeoCoordinates(position.latitude, position.longitude),
          new GeoCoordinates(prev.latitude, prev.longitude),
        );
        const currDistance: number = getDistanceInKilometers(
          new GeoCoordinates(position.latitude, position.longitude),
          new GeoCoordinates(curr.latitude, curr.longitude),
        );
        return prevDistance < currDistance ? prev : curr;
      },
    );
    return nearestPosition;
  }

  getPositionSse(id: string): Observable<{ data: PositionDto }> {
    const objectId: Types.ObjectId = new Types.ObjectId(id);

    // Convert the Promise to an Observable and then chain the logic using RxJS operators
    return from(this.rescuerModel.findById(objectId).exec()).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () => new NotFoundException('No user found with this id'),
          );
        }

        return interval(1000).pipe(
          switchMap(() => {
            // Utilisez le redisService pour récupérer la position réelle ici
            const userId = new Types.ObjectId(user.id);
            return from(this.redisService.getPositionOfRescuer(userId)).pipe(
              map((positionData: RescuerPosition) => {
                if (!positionData) return { data: undefined };
                const positionDto: PositionDto = {
                  longitude: positionData.lng,
                  latitude: positionData.lat,
                };
                return { data: positionDto };
              }),
            );
          }),
        );
      }),
    );
  }
}
