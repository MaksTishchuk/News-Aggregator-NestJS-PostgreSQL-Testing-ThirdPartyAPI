import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { NewsEntity } from './news.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('images')
export class ImageEntity {
  @ApiProperty({
    required: true,
    nullable: false,
    description: 'The photo unique identifier',
  })
  @PrimaryGeneratedColumn({ comment: 'The image unique identifier' })
  id: number;

  @ApiProperty({
    required: true,
    nullable: false,
    description: 'The photo url',
  })
  @Column({ nullable: false })
  url: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: () => NewsEntity,
    description: 'The photo news',
  })
  @ManyToOne(() => NewsEntity, (news) => news.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  news: NewsEntity;

  @Column()
  newsId: number;

  @ApiProperty({
    required: true,
    nullable: false,
    description: 'Create date comment',
  })
  @CreateDateColumn()
  created: Date;

  @ApiProperty({
    required: true,
    nullable: false,
    description: 'Update date comment',
  })
  @UpdateDateColumn()
  updated: Date;
}
