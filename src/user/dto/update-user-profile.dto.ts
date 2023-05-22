import {GenderEnum} from "../entities/enum/gender.enum";
import {IsOptional} from "class-validator";
import {ApiModelPropertyOptional} from "@nestjs/swagger/dist/decorators/api-model-property.decorator";

export class UpdateUserProfileDto {

  @ApiModelPropertyOptional({
    description: 'First Name',
    example: 'Maks',
  })
  @IsOptional()
  firstName?: string

  @ApiModelPropertyOptional({
    description: 'Last Name',
    example: 'Tishchuk',
  })
  @IsOptional()
  lastName?: string

  @ApiModelPropertyOptional({
    description: 'Phone Number',
    example: '0991234567',
  })
  @IsOptional()
  phoneNumber?: string

  @ApiModelPropertyOptional({
    description: 'Country',
    example: 'Ukraine',
  })
  @IsOptional()
  country?: string

  @ApiModelPropertyOptional({
    description: 'City',
    example: 'Kyiv',
  })
  @IsOptional()
  city?: string

  @ApiModelPropertyOptional({
    description: 'Gender - only Unselected, Male, Female',
    example: 'Male',
  })
  @IsOptional()
  gender?: GenderEnum

  @ApiModelPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  avatar?: any;
}