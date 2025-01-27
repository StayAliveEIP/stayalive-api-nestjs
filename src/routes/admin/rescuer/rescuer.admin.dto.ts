import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { boolean } from 'joi';

export class SuspendRescuerAdminRequest {
  @IsString({ message: "L'id du sauveteur doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "L'id du sauveteur est obligatoire" })
  @IsMongoId({ message: "L'id du sauveteur doit être un identifiant MongoDB" })
  @ApiProperty({
    type: String,
    description: "L'id du sauveteur",
    example: '60b8a3d7e4e0a40015f1f5f2',
  })
  rescuerId: string;

  @IsString({ message: 'La raison doit être une chaîne de caractères' })
  @Length(1, 100, {
    message: 'La raison doit être comprise entre 1 et 100 caractères',
  })
  @ApiProperty({
    type: String,
    description: 'La raison de la suspension',
    example: 'Comportement inapproprié',
  })
  reason: string;
}

export class RescuerInfoAdminResponse {
  @ApiProperty({
    type: String,
    description: 'The id of the rescuer.',
    example: '5f9d7a3b9d1e8c1b7c9d4401',
  })
  _id: Types.ObjectId;

  @ApiProperty({
    type: String,
    description: 'The firstname of the rescuer.',
    example: 'John',
  })
  firstname: string;

  @ApiProperty({
    type: String,
    description: 'The lastname of the rescuer.',
    example: 'Doe',
  })
  lastname: string;

  @ApiProperty({
    type: String,
    description: 'The email of the rescuer',
    example: 'john@doe.net',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'The url of the profile picture of the rescuer.',
    example: 'https://mybucket.s3.amazonaws.com/myimage.jpg',
    nullable: true,
  })
  profilePictureUrl: string | null;

  @ApiProperty({
    type: boolean,
    description: 'If the rescuer is suspended or not.',
    example: false,
  })
  suspended: boolean;
}
