import { Module } from '@nestjs/common';
import { StabilityAiService } from './stability-ai.service';
import { StabilityAiController } from './stability-ai.controller';
import {HttpModule} from "@nestjs/axios";

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 20000,
        maxRedirects: 5,
      })
    })
  ],
  controllers: [StabilityAiController],
  providers: [StabilityAiService]
})
export class StabilityAiModule {}
