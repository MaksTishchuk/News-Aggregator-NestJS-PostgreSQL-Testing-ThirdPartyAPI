import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, ManyToMany, JoinTable, RelationCount, JoinColumn
} from 'typeorm';
import {NewsEntity} from "../../news/entities/news.entity";
import {CommentEntity} from "../../comments/entities/comment.entity";
import {UserRoleEnum} from "./enum/user-role.enum";
import {GenderEnum} from "./enum/gender.enum";
import {ApiProperty} from "@nestjs/swagger";

@Entity('users')
export class UserEntity {

  @ApiProperty({required: true, nullable: false, description:'The user unique identifier'})
  @PrimaryGeneratedColumn({comment: 'The user unique identifier'})
  id: number

  @ApiProperty({required: true, nullable: false, description:'User username'})
  @Column()
  username: string

  @ApiProperty({required: true, nullable: false, description:'User email'})
  @Column({unique: true})
  email: string

  @ApiProperty({required: true, nullable: false, description:'User password'})
  @Column()
  password: string

  @ApiProperty({required: true, nullable: false, default: false, description:'User account activation'})
  @Column({default: false})
  isActivated: boolean

  @ApiProperty({required: true, nullable: false, type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.MEMBER, description:'User role'})
  @Column({type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.MEMBER})
  role: UserRoleEnum

  @ApiProperty({required: false, nullable: false, default: '', description:'User first name'})
  @Column({default: ''})
  firstName: string

  @ApiProperty({required: false, nullable: false, default: '', description:'User last name'})
  @Column({default: ''})
  lastName: string

  @ApiProperty({required: false, nullable: false, default: '', description:'User phone number'})
  @Column({default: ''})
  phoneNumber: string

  @ApiProperty({required: false, nullable: false, default: '', description:'User country'})
  @Column({default: ''})
  country: string

  @ApiProperty({required: false, nullable: false, default: '', description:'User city'})
  @Column({default: ''})
  city: string

  @ApiProperty({required: true, nullable: false, type: 'enum', enum: GenderEnum, default: GenderEnum.UNSELECTED, description:'User role'})
  @Column({type: 'enum', enum: GenderEnum, default: GenderEnum.UNSELECTED})
  gender: GenderEnum

  @ApiProperty({required: false, nullable: false, default: '', description:'User avatar'})
  @Column({default: ''})
  avatar: string

  @ApiProperty({required: false, nullable: true, type: () => [NewsEntity], description:'User News'})
  @OneToMany(() => NewsEntity, (news) => news.author)
  news: NewsEntity[]

  @ApiProperty({required: false, nullable: true, type: () => [CommentEntity], description:'User Comments'})
  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[]

  @ApiProperty({required: false, nullable: true, type: () => [UserEntity], description:'User Followers'})
  @ManyToMany(type => UserEntity, user => user.following)
  @JoinTable()
  followers: UserEntity[]

  @ApiProperty({required: false, nullable: true, type: () => [UserEntity], description:'User Following'})
  @ManyToMany(type => UserEntity, user => user.followers)
  following: UserEntity[]

  @ApiProperty({required: true, nullable: false, description:'User Followers count'})
  @RelationCount((user: UserEntity) => user.followers)
  followersCount: number

  @ApiProperty({required: true, nullable: false, description:'User Following count'})
  @RelationCount((user: UserEntity) => user.following)
  followingCount: number

  @ApiProperty({required: false, nullable: true, type: () => [NewsEntity], description:'User Liked News'})
  @ManyToMany(type => NewsEntity, news => news.likedByUsers)
  @JoinColumn()
  likesNews: NewsEntity[]

  @ApiProperty({required: true, nullable: false, description:'Create date comment'})
  @CreateDateColumn()
  created: Date

  @ApiProperty({required: true, nullable: false, description:'Update date comment'})
  @UpdateDateColumn()
  updated: Date
}