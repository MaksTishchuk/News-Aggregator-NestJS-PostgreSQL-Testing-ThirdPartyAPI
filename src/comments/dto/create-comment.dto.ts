import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'This is comment text',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'News slug to add comment',
    example: 'this-is-news-1',
  })
  @IsNotEmpty()
  @IsString()
  newsSlug: string;
}
