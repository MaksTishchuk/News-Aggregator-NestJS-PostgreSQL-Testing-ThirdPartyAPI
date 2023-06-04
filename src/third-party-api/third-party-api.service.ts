import {BadRequestException, Injectable} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {catchError, firstValueFrom, map} from "rxjs";
import {AxiosError} from "axios";

@Injectable()
export class ThirdPartyApiService {

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async getGitHubInfo(username: string) {
    return firstValueFrom(this.httpService
      .get(`https://api.github.com/users/${username}`)
      .pipe(
        map((response) => response.data),
        map((data) => ({
          id: data.id,
          login: data.login,
          url: data.url,
          name: data.name,
          email: data.email,
          location: data.location,
          bio: data.bio,
          created_at: data.created_at,
          updated_at: data.updated_at,
          public_repos: data.public_repos,
          followers: data.followers,
          following: data.following,
          company: data.company,
          avatar_url: data.avatar_url,
          repos_url: data.repos_url,
          type: data.type,
          site_admin: data.site_admin
        }))
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(`${error.response.statusText}!`)
        })
      )
    )
  }

  async exchangePrivatBank() {
    return firstValueFrom(this.httpService
      .get(`https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5`)
      .pipe(
        map((response) => response.data)
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(`${error.response.statusText}!`)
        })
      )
    )
  }

  async countryInfo(country: string) {
    return firstValueFrom(this.httpService
      .get(`https://restcountries.com/v3.1/name/${country}`)
      .pipe(
        map((response) => response.data[0]),
        map((data) => ({
          name: data.name.common,
          officialName: data.name.official,
          nativeName: data.name.nativeName,
          capital: data.capital[0],
          area: data.area,
          population: data.population,
          region: data.region,
          subregion: data.subregion,
          timezones: data.timezones,
          codeTwoSymbols: data.cca2,
          codeThreeSymbols: data.cca3,
          currencies: data.currencies,
          phoneCode: data.idd,
          languages: data.languages,
          borders: data.borders,
          maps: data.maps,
          flags: data.flags,
          coatOfArms: data.coatOfArms
        }))
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(`${error.response.statusText}!`)
        })
      )
    )
  }

  async chuckNorrisJoke() {
    return firstValueFrom(this.httpService
      .get(`https://geek-jokes.sameerkumar.website/api?format=json`)
      .pipe(
        map((response) => response.data.joke),
        map((data) => ({
          joke: data
        }))
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(`${error.response.statusText}!`)
        })
      )
    )
  }
}
