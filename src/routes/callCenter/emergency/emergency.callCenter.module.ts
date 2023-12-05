import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from '../../../guards/jwt.strategy';
import { ReactEmailService } from '../../../services/react-email/react-email.service';
import { EmergencyCallCenterController } from './emergency.callCenter.controller';
import { EmergencyCallCenterService } from './emergency.callCenter.service';
import { Emergency, EmergencySchema } from '../../../database/emergency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Emergency.name, schema: EmergencySchema },
    ]),
  ],
  controllers: [EmergencyCallCenterController],
  providers: [JwtStrategy, EmergencyCallCenterService, ReactEmailService],
})
export class EmergencyCallCenterModule {}