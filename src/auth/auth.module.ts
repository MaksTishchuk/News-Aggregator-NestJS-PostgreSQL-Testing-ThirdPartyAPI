import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {ConfigModule} from "@nestjs/config";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../user/entities/user.entity";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {UserModule} from "../user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d'
      }
    }),
    TypeOrmModule.forFeature([UserEntity]),
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule]
})
export class AuthModule {}
