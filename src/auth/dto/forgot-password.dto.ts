import {IsEmail, IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ForgotPasswordDto {

  @ApiProperty({
    description: 'Email address of the user',
    example: 'maks@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string
}