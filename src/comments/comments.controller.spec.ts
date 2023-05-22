import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import {UserEntity} from "../user/entities/user.entity";
import * as httpMocks from "node-mocks-http";
import {NewsEntity} from "../news/entities/news.entity";
import {CommentEntity} from "./entities/comment.entity";
import {CreateCommentDto} from "./dto/create-comment.dto";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {MockComment, MockNews, MockUser} from "../../test/mock-const";

describe('CommentsController', () => {
  let commentController: CommentsController

  const mockUser: UserEntity = MockUser

  const mockRequest = httpMocks.createRequest()
  mockRequest.user = mockUser

  const mockNews: NewsEntity = MockNews

  const mockComment: CommentEntity = MockComment

  const mockCommentList: CommentEntity[] = [
    {...mockComment},
    {...mockComment, text: 'Comment 2'},
    {...mockComment, text: 'Comment 3'}
  ]

  const mockCreateCommentDto: CreateCommentDto = {
    text: mockComment.text,
    newsSlug: mockNews.slug
  }

  const mockUpdateCommentDto: UpdateCommentDto = {
    text: 'Comment 111'
  }

  const mockCommentService = {
    createComment: jest.fn().mockImplementation((createCommentDto: CreateCommentDto, user: UserEntity) => {
      return {
        ...mockComment,
        text: createCommentDto.text,
        author: user
      }
    }),

    findAllComments: jest.fn().mockImplementation(() => {
      return mockCommentList
    }),

    findOneComment: jest.fn().mockImplementation((id: number) => {
      return {
        ...mockComment,
        id
      }
    }),

    updateComment: jest.fn().mockImplementation((id: number, updateCommentDto: UpdateCommentDto, user: UserEntity) => {
      return {
        ...mockComment,
        id,
        text: updateCommentDto.text,
        author: user
      }
    }),

    deleteComment: jest.fn().mockImplementation((id: number, user: UserEntity) => {
      return {success: true, message: 'Comment has been deleted!'}
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService],
    })
      .overrideProvider(CommentsService).useValue(mockCommentService)
      .compile();

    commentController = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(commentController).toBeDefined();
  });

  it('should creat a comment', () => {
    expect(commentController.createComment(mockCreateCommentDto, mockUser)).toEqual({
      ...mockComment,
      text: mockCreateCommentDto.text,
      author: mockUser
    })
    expect(mockCommentService.createComment).toHaveBeenCalledWith(mockCreateCommentDto, mockUser)
  })

  it('should find all comments', () => {
    expect(commentController.findAllComments()).toEqual(mockCommentList);
    expect(commentController.findAllComments()).toHaveLength(3)
    expect(mockCommentService.findAllComments).toHaveBeenCalledWith()
  })

  it('should find one comment', () => {
    expect(commentController.findOneComment(1)).toEqual(mockComment)
    expect(mockCommentService.findOneComment).toHaveBeenCalledWith(1)
  })

  it('should update a comment', () => {
    expect(commentController.updateComment(1, mockUpdateCommentDto, mockUser)).toEqual({
      ...mockComment,
      id: 1,
      text: mockUpdateCommentDto.text,
      author: mockUser
    })
    expect(mockCommentService.updateComment).toHaveBeenCalledWith(1, mockUpdateCommentDto, mockUser)
  })

  it('should delete comment', () => {
    expect(commentController.deleteComment(1, mockUser)).toEqual({
      success: true, message: 'Comment has been deleted!'
    })
    expect(mockCommentService.deleteComment).toHaveBeenCalledWith(1, mockUser)
  })
});
