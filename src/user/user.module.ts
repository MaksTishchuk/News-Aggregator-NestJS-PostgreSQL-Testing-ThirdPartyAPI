import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {ConfigModule} from "@nestjs/config";
import {FileService} from "../file/file.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, FileService],
  exports: [UserService]
})
export class UserModule {}
