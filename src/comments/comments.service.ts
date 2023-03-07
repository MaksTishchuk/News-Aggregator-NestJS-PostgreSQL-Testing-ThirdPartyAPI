import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CommentEntity} from "./entities/comment.entity";
import {UserEntity} from "../user/entities/user.entity";
import {NewsEntity} from "../news/entities/news.entity";
import {UserRoleEnum} from "../user/entities/enum/user-role.enum";

@Injectable()
export class CommentsService {

  constructor(
    @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
    @InjectRepository(NewsEntity) private newsRepository: Repository<NewsEntity>,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, user: UserEntity) {
    const news = await this.newsRepository.findOne({where: {slug: createCommentDto.newsSlug}})
    const comment = this.commentRepository.create({
      text: createCommentDto.text,
      news: news,
      author: user
    })
    await this.commentRepository.save(comment)
    return comment
  }

  async findAllComments() {
    return await this.commentRepository.find({relations: ['author', 'news']})
  }

  async findOneComment(id: number) {
    const comment = await this.commentRepository.findOne({where: {id}, relations: ['author', 'news']})
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" was not found!`)
    }
    return comment
  }

  async updateComment(id: number, updateCommentDto: UpdateCommentDto, user: UserEntity) {
    let updateComment
    if (user.role === UserRoleEnum.ADMIN) {
      updateComment = await this.commentRepository.update({id: id}, {text: updateCommentDto.text})
    } else {
      updateComment = await this.commentRepository.update({id: id, authorId: user.id}, {text: updateCommentDto.text})
    }
    if (!updateComment.affected) {
      throw new NotFoundException(`Comment with id "${id}" was not updated! Access Denied!`)
    }
    return await this.findOneComment(id)
  }

  async deleteComment(id: number, user: UserEntity) {
    let result
    if (user.role === UserRoleEnum.ADMIN) {
      result = await this.commentRepository.delete({id})
    } else {
      result = await this.commentRepository.delete({id, authorId: user.id})
    }
    if (!result.affected) {
      throw new NotFoundException(`Comment with id "${id}" was not deleted! Access Denied!`)
    }
    return {success: true, message: 'Comment has been deleted!'}
  }
}
