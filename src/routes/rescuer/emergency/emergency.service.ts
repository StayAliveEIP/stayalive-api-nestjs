import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rescuer } from '../../../database/rescuer.schema';
import { Emergency, EmergencyStatus } from '../../../database/emergency.schema';
import { SuccessMessage } from '../../../dto.dto';
import {
  EmergencyAssignedEvent,
  EmergencyCreatedEvent,
  EmergencyTerminatedEvent,
  EventType,
} from '../../../services/emergency-manager/emergencyManager.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CallCenter } from '../../../database/callCenter.schema';

@Injectable()
export class EmergencyService {
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(Emergency.name) private emergencyModel: Model<Emergency>,
    @InjectModel(Rescuer.name) private rescuerModel: Model<Rescuer>,
    @InjectModel(CallCenter.name) private callCenterModel: Model<CallCenter>,
  ) {}

  async acceptEmergency(
    userId: Types.ObjectId,
    id: string,
  ): Promise<SuccessMessage> {
    // Get the emergency from the database
    const emergency = await this.emergencyModel.findById(
      new Types.ObjectId(id),
    );
    if (!emergency) {
      throw new NotFoundException("L'urgence n'existe pas.");
    }
    // Verify the state of the emergency
    if (emergency.status === EmergencyStatus.ASSIGNED) {
      throw new BadRequestException("L'urgence a déjà été assignée.");
    }
    if (emergency.status === EmergencyStatus.RESOLVED) {
      throw new BadRequestException("L'urgence a déjà été résolue.");
    }

    const updatedEmergency = await this.emergencyModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      {
        $set: {
          rescuerAssigned: userId,
          status: EmergencyStatus.ASSIGNED,
        },
      },
      { new: true },
    );

    if (!updatedEmergency) {
      throw new Error('Failed to update emergency.');
    }

    const callCenter = await this.callCenterModel.findById(
      emergency.callCenterId,
    );
    if (!callCenter) {
      throw new Error('Call center not found');
    }
    const rescuer = await this.rescuerModel.findById(userId);
    if (!rescuer) {
      throw new Error('Rescuer not found');
    }

    const emergencyAccepted: EmergencyAssignedEvent = {
      emergency: emergency,
      callCenter: callCenter,
      rescuer: rescuer,
    };
    this.eventEmitter.emit(EventType.EMERGENCY_ASSIGNED, emergencyAccepted);
    return {
      message: "Vous avez bien accepté l'urgence.",
    };
  }

  async terminateEmergency(userId: Types.ObjectId, id: string) {
    // Get the emergency from the database
    const emergency = await this.emergencyModel.findById(
      new Types.ObjectId(id),
    );
    const callCenter = await this.callCenterModel.findById(
      emergency.callCenterId,
    );
    if (!callCenter) {
      throw new Error('Call center not found');
    }
    const rescuer = await this.rescuerModel.findById(userId);
    if (!rescuer) {
      throw new Error('Rescuer not found');
    }
    if (!emergency) {
      throw new NotFoundException("L'urgence n'existe pas.");
    }
    // Verify the state of the emergency
    if (emergency.status === EmergencyStatus.PENDING) {
      throw new BadRequestException("L'urgence n'a pas encore été assignée.");
    }
    if (emergency.status === EmergencyStatus.RESOLVED) {
      throw new BadRequestException("L'urgence a déjà été résolue.");
    }
    // Verify that the rescuer is the one assigned to the emergency

    if (!emergency.rescuerAssigned.equals(userId)) {
      throw new BadRequestException("Vous n'êtes pas assigné à cette urgence.");
    }
    // Send event
    const event: EmergencyTerminatedEvent = {
      emergency: emergency,
      callCenter: callCenter,
      rescuer: rescuer,
    };
    this.eventEmitter.emit(EventType.EMERGENCY_TERMINATED, event);
    // Terminate the emergency
    const updatedEmergency = await this.emergencyModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { status: EmergencyStatus.RESOLVED } },
      { new: true },
    );
    if (!updatedEmergency) {
      throw new Error('Failed to update emergency.');
    }
    return {
      message: "L'urgence a bien été terminée.",
    };
  }

  //TODO : Redis
  async refuseEmergency(
    userId: Types.ObjectId,
    id: string,
  ): Promise<SuccessMessage> {
    const emergency = await this.emergencyModel.findById(
      new Types.ObjectId(id),
    );
    if (!emergency) {
      throw new NotFoundException("L'urgence n'existe pas.");
    }
    if (emergency.status === EmergencyStatus.RESOLVED) {
      throw new BadRequestException("L'urgence a déjà été résolue.");
    }
    try {
      emergency.rescuerHidden.push(new Types.ObjectId(userId));
      await this.emergencyModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        emergency,
      );
    } catch (error) {
      console.error('Error during emergency save operation:', error);
      throw error;
    }

    const eventCreatedTemplate: EmergencyCreatedEvent = {
      emergency: emergency,
      callCenter: await this.callCenterModel.findById(emergency.callCenterId),
    };
    this.eventEmitter.emit(EventType.EMERGENCY_CREATED, eventCreatedTemplate);
    return {
      message: "Vous avez bien refusé l'urgence",
    };
  }

  async getEmergencyHistory(userId: Types.ObjectId) {
    const rescuer = await this.rescuerModel.findById(userId);
    if (!rescuer) {
      throw new NotFoundException('Rescuer not found');
    }
    const emergencies = await this.emergencyModel
      .find({
        rescuerAssigned: userId,
      })
      .exec();
    return emergencies.map((emergency) => ({
      id: emergency._id,
      status: emergency.status,
      address: emergency.address,
      info: emergency.info ? emergency.info : '',
    }));
  }
}
