import { IsNotEmpty, IsString } from 'class-validator';

export class CountryInfoDto {
  @IsString()
  @IsNotEmpty()
  country: string;
}
