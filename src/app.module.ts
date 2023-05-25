import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import { NewsModule } from './news/news.module';
import { CommentsModule } from './comments/comments.module';
import { FileModule } from './file/file.module';
import {MailerModule} from "@nestjs-modules/mailer";
import { AuthModule } from './auth/auth.module';
import {ServeStaticModule} from "@nestjs/serve-static";
import * as path from 'path'
import {getTypeOrmConfig} from "./config/typeorm.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `stage.${process.env.NODE_ENV}.env`
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig
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
