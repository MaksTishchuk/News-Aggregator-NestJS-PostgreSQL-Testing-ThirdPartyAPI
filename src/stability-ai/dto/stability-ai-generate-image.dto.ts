import { IsNotEmpty, IsString } from 'class-validator';

export class StabilityAiGenerateImageDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
