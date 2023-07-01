import { Body, Controller, Get, Param } from '@nestjs/common';
import { ThirdPartyApiService } from './third-party-api.service';
import { CountryInfoDto } from './dto/country-info.dto';

@Controller('third-party-api')
export class ThirdPartyApiController {
  constructor(private readonly thirdPartyApiService: ThirdPartyApiService) {}

  @Get('github-user/:username')
  getGitHubInfo(@Param('username') username: string) {
    return this.thirdPartyApiService.getGitHubInfo(username);
  }

  @Get('exchange-privat')
  exchangePrivatBank() {
    return this.thirdPartyApiService.exchangePrivatBank();
  }

  @Get('country-info')
  countryInfo(@Body() dto: CountryInfoDto) {
    return this.thirdPartyApiService.countryInfo(dto.country);
  }

  @Get('chuck-norris-jokes')
  chuckNorrisJoke() {
    return this.thirdPartyApiService.chuckNorrisJoke();
  }
}
