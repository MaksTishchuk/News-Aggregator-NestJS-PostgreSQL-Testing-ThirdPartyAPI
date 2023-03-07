import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "./user/entities/user.entity";
import {ConfigModule} from "@nestjs/config";
import { NewsModule } from './news/news.module';
import {NewsEntity} from "./news/entities/news.entity";
import { CommentsModule } from './comments/comments.module';
import {CommentEntity} from "./comments/entities/comment.entity";
import { FileModule } from './file/file.module';
import {MailerModule} from "@nestjs-modules/mailer";
import { AuthModule } from './auth/auth.module';
import {ImageEntity} from "./news/entities/images.entity";
import {ServeStaticModule} from "@nestjs/serve-static";
import * as path from 'path'

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [UserEntity, NewsEntity, CommentEntity, ImageEntity],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
      }
    }),
    ServeStaticModule.forRoot({serveRoot: '/images', rootPath: path.resolve(__dirname, 'static')}),
    UserModule,
    NewsModule,
    CommentsModule,
    FileModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
