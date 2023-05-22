import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {NewsEntity} from "../news/entities/news.entity";
import {CommentEntity} from "./entities/comment.entity";

describe('CommentsService', () => {
  let commentsService: CommentsService

  const mockCommentRepository = {}
  const mockNewsRepository = {}

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

    commentsService = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(commentsService).toBeDefined();
  });
});
