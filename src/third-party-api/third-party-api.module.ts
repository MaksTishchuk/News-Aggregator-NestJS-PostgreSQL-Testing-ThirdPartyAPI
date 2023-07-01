import { Module } from '@nestjs/common';
import { ThirdPartyApiService } from './third-party-api.service';
import { ThirdPartyApiController } from './third-party-api.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [ThirdPartyApiController],
  providers: [ThirdPartyApiService],
})
export class ThirdPartyApiModule {}
