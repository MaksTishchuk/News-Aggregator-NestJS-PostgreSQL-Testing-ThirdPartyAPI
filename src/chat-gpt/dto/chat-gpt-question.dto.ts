import { IsNotEmpty, IsString } from 'class-validator';

export class ChatGptQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}
