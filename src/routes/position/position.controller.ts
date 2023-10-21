import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PositionService } from './position.service';
import { PositionDto, PositionWithIdDto } from './position.dto';
import { Observable } from 'rxjs';
import { SuccessMessage } from '../../dto.dto';
import { UserId } from '../../decorator/userid.decorator';
import { Types } from 'mongoose';

@Controller()
@ApiTags('Position')
@ApiBearerAuth()
export class PositionController {
  constructor(private readonly service: PositionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/position')
  @ApiOperation({
    summary: 'Get your actual position save as a rescuer',
  })
  @ApiResponse({
    status: 200,
    description: 'Your position as a rescuer',
    type: PositionDto,
  })
  async getPosition(@UserId() userId: Types.ObjectId): Promise<PositionDto> {
    return this.service.getPosition(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/position')
  @ApiOperation({
    summary: 'Set your position as a rescuer',
  })
  @ApiResponse({
    status: 200,
    description: 'Set your position as a rescuer',
    type: PositionDto,
  })
  async setPosition(
    @UserId() userId: Types.ObjectId,
    @Body() body: PositionDto,
  ): Promise<PositionDto> {
    return this.service.setPosition(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/position')
  @ApiOperation({
    summary: 'Delete your position as a rescuer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Delete your position as a rescuer',
    type: PositionDto,
  })
  async deletePosition(
    @UserId() userId: Types.ObjectId,
  ): Promise<SuccessMessage> {
    return this.service.deletePosition(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/position/all')
  @ApiOperation({
    summary: 'Get all rescuer position of connected rescuer',
  })
  @ApiResponse({
    status: 200,
    description: 'Get all positions',
    type: PositionWithIdDto,
    isArray: true,
  })
  async getAllPositions(): Promise<PositionWithIdDto[]> {
    return this.service.getAllPositions();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/position/nearest')
  @ApiOperation({
    summary:
      'Get the nearest position of a rescuer from the position given in the body',
  })
  @ApiResponse({
    status: 200,
    description: 'Get nearest position',
    type: PositionWithIdDto,
  })
  async getNearestPosition(
    @Body() position: PositionDto,
  ): Promise<PositionWithIdDto> {
    return this.service.getNearestPosition(position);
  }

  @UseGuards(JwtAuthGuard)
  @Sse('/position/:id')
  @ApiOperation({
    summary: 'Follow to position of a rescuer in real time via SSE',
  })
  @ApiResponse({
    status: 200,
    description: 'Get the real time position of rescuer',
    type: PositionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'If the id given not correspond to any rescuer',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The user id of the rescuer to follow',
    example: new Types.ObjectId(),
  })
  sse(@Param('id') id: string): Observable<{ data: PositionDto }> {
    return this.service.getPositionSse(id);
  }

  disconnectRedis() {
    return this.service.disconnectRedis();
  }
}