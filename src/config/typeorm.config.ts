import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../user/entities/user.entity';
import { NewsEntity } from '../news/entities/news.entity';
import { CommentEntity } from '../comments/entities/comment.entity';
import { ImageEntity } from '../news/entities/images.entity';

export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  database: configService.get<string>('DB_NAME'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  autoLoadEntities: true,
  // entities: [UserEntity, NewsEntity, CommentEntity, ImageEntity],
  synchronize: true,
});
