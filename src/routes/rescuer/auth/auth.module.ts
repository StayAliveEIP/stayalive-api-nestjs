import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Rescuer, RescuerSchema } from '../../../database/rescuer.schema';
import { ReactEmailModule } from '../../../services/react-email/react-email.module';
import { GoogleStrategy } from '../../../stategies/google.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rescuer.name, schema: RescuerSchema }]),
    ReactEmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
