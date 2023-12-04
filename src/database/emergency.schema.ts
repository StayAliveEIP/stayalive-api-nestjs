import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum EmergencyStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  RESOLVED = 'RESOLVED',
}

@Schema({ versionKey: false })
export class Position {
  @Prop({ required: true, type: Number })
  lat: number;

  @Prop({ required: true, type: Number })
  long: number;
}

@Schema({ versionKey: false, collection: 'emergencies' })
export class Emergency {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ required: true })
  info: string;

  @Prop({ required: true })
  position: Position;

  @Prop({ required: true })
  callCenterId: Types.ObjectId;

  @Prop({ required: true })
  status: EmergencyStatus;

  @Prop({ required: true })
  rescuerAssigned: Types.ObjectId;
}

export const EmergencySchema = SchemaFactory.createForClass(Emergency);
