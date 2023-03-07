import {IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateCommentDto {

  @ApiProperty({
    description: 'Comment text',
    example: 'This is comment text',
  })
  @IsNotEmpty()
  @IsString()
  text: string
}