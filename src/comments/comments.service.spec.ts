import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {NewsEntity} from "../news/entities/news.entity";
import {CommentEntity} from "./entities/comment.entity";
import {Repository} from "typeorm";
import {UserEntity} from "../user/entities/user.entity";
import {MockComment, MockNews, MockUser} from "../../test/mock-const";
import {CreateCommentDto} from "./dto/create-comment.dto";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {NotFoundException} from "@nestjs/common";

describe('CommentsService', () => {
  let commentsService: CommentsService
  let commentRepository: Repository<CommentEntity>
  let newsRepository: Repository<NewsEntity>

  const mockComment: CommentEntity = MockComment

  const mockCommentList: CommentEntity[] = [
    {...mockComment},
    {...mockComment, text: 'Comment 2'},
    {...mockComment, text: 'Comment 3'}
  ]

  const mockUser: UserEntity = MockUser
  const mockNews: NewsEntity = MockNews

  const mockCreateCommentDto: CreateCommentDto = {
    text: mockComment.text,
    newsSlug: mockNews.slug
  }

  const mockUpdateCommentDto: UpdateCommentDto = {
    text: 'Comment 111'
  }

  const mockCommentRepository = {
    create: jest.fn((mockCreateCommentDto, mockUser) => Promise.resolve(mockComment)),
    save: jest.fn(),
    find: jest.fn(() => mockCommentList),
    findOne: jest.fn((id) => mockComment),
    update: jest.fn((id, mockUpdateCommentDto, mockUser) => Promise.resolve({affected: 1})),
    delete: jest.fn((id, mockUser) => Promise.resolve({affected: 1}))
  }
  const mockNewsRepository = {
    findOne: jest.fn((slug) => Promise.resolve(mockNews)),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: mockCommentRepository
        },
        {
          provide: getRepositoryToken(NewsEntity),
          useValue: mockNewsRepository
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService)
    commentRepository = module.get<Repository<CommentEntity>>(getRepositoryToken(CommentEntity))
    newsRepository = module.get<Repository<NewsEntity>>(getRepositoryToken(NewsEntity))
  });

  afterEach(async () => {
    jest.clearAllMocks()
  })

  it('should be defined commentsService', () => {
    expect(commentsService).toBeDefined()
  })

  it('should be defined commentRepository', () => {
    expect(commentRepository).toBeDefined()
  })

  it('should be defined newsRepository', () => {
    expect(newsRepository).toBeDefined()
  })

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const findOneSpy = jest.spyOn(mockNewsRepository, 'findOne')
      const createSpy = jest.spyOn(mockCommentRepository, 'create')
      const saveSpy = await jest.spyOn(mockCommentRepository, 'save')
      const createdComment = await commentsService.createComment(mockCreateCommentDto, mockUser)
      expect(createdComment).toEqual(mockComment)
      expect(findOneSpy).toHaveBeenCalledTimes(1)
      expect(findOneSpy).toHaveBeenCalledWith({where: {slug: mockCreateCommentDto.newsSlug}})
      expect(createSpy).toHaveBeenCalledTimes(1)
      expect(createSpy).toHaveBeenCalledWith({text: mockCreateCommentDto.text, news: mockNews, author: mockUser})
      expect(saveSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('findAllComments', () => {
    it('should find all comments', async () => {
      const findSpy = jest.spyOn(mockCommentRepository, 'find')
      const comments = await commentsService.findAllComments()
      expect(comments).toEqual(mockCommentList)
      expect(findSpy).toHaveBeenCalledTimes(1)
      expect(findSpy).toHaveBeenCalledWith({relations: ['author', 'news']})
    })
  })

  describe('findOneComment', () => {
    it('should find one comment', async () => {
      const findOneSpy = jest.spyOn(mockCommentRepository, 'findOne')
      const comment = await commentsService.findOneComment(mockComment.id)
      expect(comment).toEqual(mockComment)
      expect(findOneSpy).toHaveBeenCalledTimes(1)
      expect(findOneSpy).toHaveBeenCalledWith({where: {id: mockComment.id}, relations: ['author', 'news']})
    })

    it('should throw error on find one comment', async () => {
      mockCommentRepository.findOne = jest.fn().mockResolvedValue(null)
      try {
        await commentsService.findOneComment(mockComment.id)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Comment with id "${mockComment.id}" was not found!`)
      }
    })
  })

  describe('updateComment', () => {
    it('should update comment', async () => {
      const updateSpy = jest.spyOn(mockCommentRepository, 'update')
      const findOneSpy = jest.spyOn(mockCommentRepository, 'findOne')
      mockCommentRepository.findOne.mockReturnValue({...MockComment, text: mockUpdateCommentDto.text})
      const comment = await commentsService.updateComment(mockComment.id, mockUpdateCommentDto, mockUser)
      expect(comment).toEqual({...mockComment, text: mockUpdateCommentDto.text})
      expect(updateSpy).toHaveBeenCalledTimes(1)
      expect(updateSpy).toHaveBeenCalledWith({id: mockComment.id, authorId: mockUser.id}, {text: mockUpdateCommentDto.text})
      expect(findOneSpy).toHaveBeenCalledTimes(1)
      expect(findOneSpy).toHaveBeenCalledWith({where: {id: mockComment.id}, relations: ['author', 'news']})
    })

    it('should throw error on update comment', async () => {
      mockCommentRepository.update = jest.fn().mockResolvedValue({affected: false})
      try {
        await commentsService.updateComment(mockComment.id, mockUpdateCommentDto, mockUser)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Comment with id "${mockComment.id}" was not updated! Access Denied!`)
      }
    })

    it('should throw error on find user by update comment', async () => {
      mockCommentRepository.update = jest.fn().mockResolvedValue({affected: true})
      mockCommentRepository.findOne = jest.fn().mockResolvedValue(null)
      try {
        await commentsService.updateComment(mockComment.id, mockUpdateCommentDto, mockUser)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Comment with id "${mockComment.id}" was not found!`)
      }
    })
  })

  describe('deleteComment', () => {
    it('should delete one comment', async () => {
      const deleteSpy = jest.spyOn(mockCommentRepository, 'delete')
      const response = await commentsService.deleteComment(mockComment.id, mockUser)
      expect(response).toStrictEqual({success: true, message: 'Comment has been deleted!'})
      expect(deleteSpy).toHaveBeenCalledTimes(1)
      expect(deleteSpy).toHaveBeenCalledWith({id: mockComment.id, authorId: mockUser.id})
    })

    it('should throw error on delete comment', async () => {
      mockCommentRepository.delete = jest.fn().mockResolvedValue({affected: false})
      try {
        await commentsService.deleteComment(mockComment.id, mockUser)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Comment with id "${mockComment.id}" was not deleted! Access Denied!`)
      }
    })
  })
});
