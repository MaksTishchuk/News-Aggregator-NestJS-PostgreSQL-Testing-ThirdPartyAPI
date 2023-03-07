import {IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class RegisterCredentialsDto {

  @ApiProperty({
    description: 'Username',
    example: 'Maks',
  })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({
    description: 'Email address of the user',
    example: 'maks@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Password',
    example: 'UserPassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  // Regular expression for contains password 1 Big, 1 small letter and 1 number
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {message: 'Password too week'})
  password: string
}