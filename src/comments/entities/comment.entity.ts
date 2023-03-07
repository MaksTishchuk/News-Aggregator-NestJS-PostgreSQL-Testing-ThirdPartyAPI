import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne
} from 'typeorm';
import {UserEntity} from "../../user/entities/user.entity";
import {NewsEntity} from "../../news/entities/news.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity('comments')
export class CommentEntity {

  @ApiProperty({required: true, nullable: false, description:'The comment unique identifier'})
  @PrimaryGeneratedColumn({comment: 'The comment unique identifier'})
  id: number

  @ApiProperty({required: true, nullable: false, description:'Comment text'})
  @Column({ type: "text", nullable: false })
  text: string

  @ApiProperty({required: true, nullable: false, type: () => UserEntity, description:'Comment author'})
  @ManyToOne(() => UserEntity, (user) => user.comments, {nullable: false, onDelete: 'CASCADE'})
  author: UserEntity

  @Column()
  authorId: number

  @ApiProperty({required: true, nullable: false, type: () => NewsEntity, description:'News for comment'})
  @ManyToOne(() => NewsEntity, (news) => news.comments, {nullable: false, onDelete: 'CASCADE'})
  news: NewsEntity

  @Column()
  newsId: number

  @ApiProperty({required: true, nullable: false, description:'Create date comment'})
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({required: true, nullable: false, description:'Update date comment'})
  @UpdateDateColumn()
  updatedAt: Date

}