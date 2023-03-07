import {PassportStrategy} from "@nestjs/passport";
import {Strategy, ExtractJwt} from 'passport-jwt'
import {Injectable, UnauthorizedException} from "@nestjs/common";

import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {JwtPayloadInterface} from "../dto/jwt-payload.interface";
import {UserEntity} from "../../user/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayloadInterface): Promise<UserEntity> {
    const {email} = payload
    const user = await this.userRepository.findOne({where: {email}})
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
