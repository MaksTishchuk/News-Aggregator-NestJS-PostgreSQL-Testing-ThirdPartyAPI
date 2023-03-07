import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert, BeforeUpdate, ManyToOne, OneToMany, ManyToMany, JoinTable, RelationCount
} from 'typeorm';
import slugify from "slugify";
import * as shortId from 'shortId'
import {UserEntity} from "../../user/entities/user.entity";
import {CommentEntity} from "../../comments/entities/comment.entity";
import {ImageEntity} from "./images.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity('news')
export class NewsEntity {

  @ApiProperty({required: true, nullable: false, description:'The news unique identifier'})
  @PrimaryGeneratedColumn({comment: 'The news unique identifier'})
  id: number

  @ApiProperty({required: true, nullable: false, description:'News title'})
  @Column({ nullable: false })
  title: string

  @ApiProperty({required: true, nullable: false, description:'News slug'})
  @Column({ nullable: false })
  slug: string

  @ApiProperty({required: true, nullable: false, description:'News text'})
  @Column({ type: "text", nullable: false })
  body: string

  @ApiProperty({required: true, nullable: false, description:'Views count'})
  @Column({default: 0})
  views: number

  @ApiProperty({required: false, nullable: true, type: () => UserEntity, description:'News author'})
  @ManyToOne(() => UserEntity, (user) => user.news, {nullable: false, onDelete: 'CASCADE'})
  author: UserEntity

  @Column()
  authorId: number

  @ApiProperty({required: false, nullable: true, type: () => [ImageEntity], description:'News images'})
  @OneToMany(() => ImageEntity, (image) => image.news)
  images: ImageEntity[]

  @ApiProperty({required: false, nullable: true, type: () => [CommentEntity], description:'News comments'})
  @OneToMany(() => CommentEntity, (comment) => comment.news)
  comments: CommentEntity[]

  @ApiProperty({required: false, nullable: true, type: () => [UserEntity], description:'News likes by users'})
  @ManyToMany(
    type => UserEntity,
    user => user.likesNews,
    {eager: true}
  )
  @JoinTable()
  likedByUsers: UserEntity[]

  @ApiProperty({required: true, nullable: false, description:'Likes count'})
  @RelationCount((news: NewsEntity) => news.likedByUsers )
  likesCount: number

  @ApiProperty({required: true, nullable: false, description:'Create date comment'})
  @CreateDateColumn()
  created: Date

  @ApiProperty({required: true, nullable: false, description:'Updated date comment'})
  @UpdateDateColumn()
  updated: Date

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.title, { lower: true }) + '-' + shortId.generate()
  }
}