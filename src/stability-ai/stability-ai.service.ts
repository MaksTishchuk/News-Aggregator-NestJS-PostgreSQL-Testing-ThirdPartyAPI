import { Injectable } from '@nestjs/common';
import {StabilityAiGenerateImageDto} from "./dto/stability-ai-generate-image.dto";
import {HttpService} from "@nestjs/axios";
import {ConfigService} from "@nestjs/config";
import {lastValueFrom} from "rxjs";
import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class StabilityAiService {

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async generateImageFromText(dto: StabilityAiGenerateImageDto) {
    const engineId = 'stable-diffusion-512-v2-0'
    const result = await this.httpService.post(
      `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
      {
        text_prompts: [
          {
            text: dto.prompt,
            weight: 1
          },
        ],
        cfg_scale: 7,
        clip_guidance_preset: 'FAST_BLUE',
        height: 512,
        width: 512,
        samples: 1,
        steps: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.configService.get<string>('STABILITY_AI_KEY')}`,
        },
        responseType : 'arraybuffer'
      }
    )
    const data = await lastValueFrom(result)
    const folderPath = this.getDataFolderPath()
    const imageName = `${Date.now()}.png`
    const localFilePath = `${folderPath}\\${imageName}`
    const bufferFrom = Buffer.from(data.data)
    this.saveData(bufferFrom, localFilePath)
    return `http://localhost:4000/images/${imageName}`
  }

  private saveData(data: any, localFilePath) {
    fs.writeFileSync(localFilePath, data)
  }

  private getDataFolderPath() {
    const thisPath = path.resolve(__dirname, '..', 'static')
    this.createFolderIfNotExists(thisPath)
    return thisPath
  }

  private createFolderIfNotExists(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath)
    }
  }

}
