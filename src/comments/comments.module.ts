import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CommentEntity} from "./entities/comment.entity";
import {UserEntity} from "../user/entities/user.entity";
import {UserModule} from "../user/user.module";
import {NewsEntity} from "../news/entities/news.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, NewsEntity, UserEntity]),
    UserModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
