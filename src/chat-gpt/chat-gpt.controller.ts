import {Body, Controller, Post} from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import {ChatGptQuestionDto} from "./dto/chat-gpt-question.dto";

@Controller('chatGPT')
export class ChatGptController {
  constructor(private readonly chatGptService: ChatGptService) {}

  @Post('')
  getChatGPTAnswer(@Body() dto: ChatGptQuestionDto) {
    return this.chatGptService.getChatGPTAnswer(dto.question)
  }
}
