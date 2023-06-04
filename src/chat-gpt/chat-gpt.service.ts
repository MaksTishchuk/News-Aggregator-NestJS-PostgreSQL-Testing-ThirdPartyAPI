import {BadRequestException, Injectable} from '@nestjs/common';
import {Configuration, CreateCompletionRequest, OpenAIApi} from "openai";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class ChatGptService {
  private defaultModelId = 'text-davinci-003'
  private defaultTemperature = 0.9
  private openAiApi: OpenAIApi

  constructor(
    private readonly configService: ConfigService
  ) {
    const configuration = new Configuration({
      organization: this.configService.get<string>('ORGANIZATION_ID'),
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    })
    this.openAiApi = new OpenAIApi(configuration)
  }

  async getChatGPTAnswer(question: string, temperature?: number) {
    try {
      const params: CreateCompletionRequest = {
        model: this.defaultModelId,
        prompt: question,
        max_tokens: 250,
        temperature: temperature !== undefined ? temperature : this.defaultTemperature
      }
      const response = await this.openAiApi.createCompletion(params)
      return {answer: response.data.choices}
    } catch (error) {
      throw new BadRequestException(`${error.response.statusText}!`)
    }
  }
}
