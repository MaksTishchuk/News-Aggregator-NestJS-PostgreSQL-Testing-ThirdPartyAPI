import {
  Controller, Get, Post, Body, Param, Delete, UseGuards, Put, NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {UserEntity} from "../user/entities/user.entity";
import {CommentEntity} from "./entities/comment.entity";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetUser} from "../auth/decorators/get-user.decorator";
import {
  ApiBody, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation,
  ApiSecurity, ApiTags
} from "@nestjs/swagger";

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({description: 'Create comment'})
  @ApiBody({
    required: true, schema: {
      example: {
        text: 'Text of comment',
        newsSlug: 'news-1'
      }
    }
  })
  @ApiOkResponse({type: CommentEntity})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @ApiSecurity('bearer')
  @Post()
  @UseGuards(JwtAuthGuard)
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: UserEntity
  ): Promise<CommentEntity> {
    return this.commentsService.createComment(createCommentDto, user)
  }

  @ApiOkResponse({type: [CommentEntity]})
  @ApiOperation({description: 'Get all comments'})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @Get()
  findAllComments(): Promise<CommentEntity[]> {
    return this.commentsService.findAllComments()
  }

  @ApiOkResponse({type: CommentEntity})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`Comment with id was not found!`)}})
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  findOneComment(@Param('id') id: number): Promise<CommentEntity> {
    return this.commentsService.findOneComment(id)
  }

  @ApiOkResponse({type: CommentEntity})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`Comment with id was not updated! Access Denied!`)}})
  @ApiSecurity('bearer')
  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: UserEntity
  ): Promise<CommentEntity> {
    return this.commentsService.updateComment(id, updateCommentDto, user)
  }

  @ApiOkResponse({
    description: 'success: true, message: `Comment has been deleted!`',
    schema: {
      example: {
        success: true,
        message: 'Comment has been deleted!'
      }
    }
  })
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`Comment with id was not deleted! Access Denied!`)}})
  @ApiSecurity('bearer')
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('id') id: number,
    @GetUser() user: UserEntity
  ) {
    return this.commentsService.deleteComment(id, user)
  }
}
