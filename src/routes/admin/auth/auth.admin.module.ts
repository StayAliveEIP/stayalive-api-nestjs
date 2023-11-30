import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from '../../../guards/jwt.strategy';
import { ReactEmailService } from '../../../services/react-email/react-email.service';
import { Admin, AdminSchema } from '../../../database/admin.schema';
import { AuthAdminService } from './auth.admin.service';
import { AuthAdminController } from './auth.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  controllers: [AuthAdminController],
  providers: [JwtStrategy, AuthAdminService, ReactEmailService],
})
export class AuthAdminModule {}