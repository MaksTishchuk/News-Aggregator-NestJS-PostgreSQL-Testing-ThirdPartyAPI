import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { StabilityAiService } from './stability-ai.service';
import { StabilityAiGenerateImageDto } from './dto/stability-ai-generate-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('stability-ai')
export class StabilityAiController {
  constructor(private readonly stabilityAiService: StabilityAiService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async generateImage(@Body() dto: StabilityAiGenerateImageDto) {
    return this.stabilityAiService.generateImageFromText(dto);
  }
}
