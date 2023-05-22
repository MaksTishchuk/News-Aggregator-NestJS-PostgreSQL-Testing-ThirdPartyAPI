import {IsOptional} from "class-validator";
import {ApiModelPropertyOptional} from "@nestjs/swagger/dist/decorators/api-model-property.decorator";

export class SearchUsersDto {

  @ApiModelPropertyOptional({
    description: 'Password',
    example: 'UserPassword123',
  })
  @IsOptional()
  username?: string

  @ApiModelPropertyOptional({
    description: 'Email address of the user',
    example: 'maks@gmail.com',
  })
  @IsOptional()
  email?: string
}