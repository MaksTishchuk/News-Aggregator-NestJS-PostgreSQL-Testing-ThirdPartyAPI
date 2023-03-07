import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {NewsEntity} from "./entities/news.entity";
import {UserModule} from "../user/user.module";
import {UserEntity} from "../user/entities/user.entity";
import {FileService} from "../file/file.service";
import {ImageEntity} from "./entities/images.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsEntity, ImageEntity, UserEntity]),
    UserModule
  ],
  controllers: [NewsController],
  providers: [NewsService, FileService]
})
export class NewsModule {}
