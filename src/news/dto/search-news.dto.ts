import {IsNotEmpty, IsOptional, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {ApiModelPropertyOptional} from "@nestjs/swagger/dist/decorators/api-model-property.decorator";

export class SearchNewsDto {
  @ApiModelPropertyOptional({
    description: 'News title',
    example: 'This is news title',
  })
  @IsOptional()
  title?: string

  @ApiModelPropertyOptional({
    description: 'News body',
    example: 'This is news body with text',
  })
  @IsOptional()
  body?: string

  @ApiModelPropertyOptional({
    description: 'Sort by views - DESC or ASC',
    example: 'DESC',
  })
  @IsOptional()
  views?: 'DESC' | 'ASC'

  @ApiModelPropertyOptional({
    description: 'Number of news by page',
    example: 10,
  })
  @IsOptional()
  take?: number

  @ApiModelPropertyOptional({
    description: 'Number of news to skip',
    example: 10,
  })
  @IsOptional()
  skip?: number
}
