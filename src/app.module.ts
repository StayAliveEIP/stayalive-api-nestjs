import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidation } from './validation/env.validation';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './routes/auth/auth.module';
import { AccountModule } from './routes/account/account.module';
import { ForgotPasswordModule } from './routes/account/forgotPassword/forgotPassword.module';
import { RedisModule } from './services/redis/redis.module';
import { RedisService } from './services/redis/redis.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import {EmergencyModule} from "./routes/emergency/emergency.module";
import { PositionModule } from './routes/position/position.module';
import { DocumentModule } from './routes/account/document/document.module';
import { MailJetModule } from './services/mailjet/mailjet.module';
import {StatusModule} from "./routes/status/status.module";


@Module({
  imports: [
    // Set up the environment variables.
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidation }),
    // Connect to the MongoDB database.
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DATABASE,
    }),
    // Add the Redis module.
    RedisModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    AuthModule,
    AccountModule,
    StatusModule,
    EmergencyModule,
    ForgotPasswordModule,
    DocumentModule,
    PositionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
