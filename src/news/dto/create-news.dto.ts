import {IsNotEmpty, IsOptional, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {ApiModelPropertyOptional} from "@nestjs/swagger/dist/decorators/api-model-property.decorator";

export class CreateNewsDto {

  @ApiProperty({
    description: 'News title',
    example: 'This is news title',
  })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({
    description: 'News body',
    example: 'This is news body with text',
  })
  @IsNotEmpty()
  @IsString()
  body: string

  @ApiModelPropertyOptional({ type: ['string'], format: 'binary' })
  @IsOptional()
  images: any;
}
