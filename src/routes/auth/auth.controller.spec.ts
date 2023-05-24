import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { MongooseModule } from '@nestjs/mongoose';
import { Rescuer, RescuerSchema } from '../../schemas/rescuer.schema';
import { ConfigModule } from '@nestjs/config';
import { envValidation } from '../../validation/envValidation';
import mongoose from 'mongoose';

describe('AuthController', () => {
  let appController: AuthController;

  const randomNumberEmail: number = Math.floor(Math.random() * 1000000);
  const email: string = 'test+' + randomNumberEmail + '@test.net';

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        // Set up the environment variables.
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema: envValidation,
        }),
        // Connect to the MongoDB database.
        MongooseModule.forRoot(process.env.MONGODB_URI, {
          dbName: process.env.MONGODB_DATABASE,
        }),
        // Get the rescuer model.
        MongooseModule.forFeature([
          { name: Rescuer.name, schema: RescuerSchema },
        ]),
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();
    appController = app.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Register and login the rescuer', () => {
    describe('Register the rescuer', () => {
      it('should pass the register and get the message', async () => {
        const body: RegisterDTO = {
          email: email,
          firstname: 'test',
          lastname: 'test',
          password: 'password123!',
          phone: '0102030405',
        };
        const registerResponse = await appController.register(body);
        expect(registerResponse.message).toBe(
          'Votre compte à bien été enregistré, vous pouvez maintenant vous connecter !',
        );
      });
    });

    describe('Login the rescuer', () => {
      it('should pass the login and get the access token', async () => {
        const body: LoginDTO = {
          email: email,
          password: 'password123!',
        };
        const loginResponsePromise = await appController.login(body);
        expect(loginResponsePromise.accessToken).toBeDefined();
      });
    });
  });
});
