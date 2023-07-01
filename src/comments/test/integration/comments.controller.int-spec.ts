import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { NewsEntity } from '../../../news/entities/news.entity';
import { CommentEntity } from '../../entities/comment.entity';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../../../user/guards/admin-role.guard';
import * as request from 'supertest';

describe('CommentsService Int', () => {
  let app: any;
  let httpServer: any;
  let commentRepository: Repository<CommentEntity>;
  let userRepository: Repository<UserEntity>;
  let newsRepository: Repository<NewsEntity>;

  let user: UserEntity;
  let news: NewsEntity;
  let comment: CommentEntity;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx) => {
          const request = ctx.switchToHttp().getRequest();
          request.user = user;
          return true;
        },
      })
      .overrideGuard(AdminRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    commentRepository = module.get('CommentEntityRepository');
    userRepository = module.get('UserEntityRepository');
    newsRepository = module.get('NewsEntityRepository');
  });

  afterAll(async () => {
    const users = await userRepository.find();
    for (const user of users) {
      await userRepository.delete({ id: user.id });
    }
    const news = await newsRepository.find();
    for (const n of news) {
      await newsRepository.delete({ id: n.id });
    }
    const comments = await commentRepository.find();
    for (const comment of comments) {
      await newsRepository.delete({ id: comment.id });
    }
  });

  describe('createComment', () => {
    it('should create user and news', async () => {
      user = await userRepository.save({
        email: 'test-com-controller-user@gmail.com',
        username: 'test-com-controller-user',
        password: 'qwerty',
        isActivated: true,
      });
      news = await newsRepository.save({
        title: 'news controller',
        body: 'body',
        slug: 'news-controller',
        author: user,
      });
    });

    it('should create comment', async () => {
      const createCommentDto: CreateCommentDto = {
        text: 'Comment 10',
        newsSlug: news.slug,
      };

      const response = await request(httpServer)
        .post('/comments')
        .send(createCommentDto);
      expect(response.status).toBe(201);
      expect(response.body.text).toEqual(createCommentDto.text);
      expect(response.body.news.slug).toEqual(createCommentDto.newsSlug);
      comment = response.body;
    });
  });

  describe('findAllComments', () => {
    it('should create several comments for test', async () => {
      await commentRepository.save({
        text: 'Comment 20',
        slug: 'comment-20',
        news: news,
        author: user,
      });
      await commentRepository.save({
        text: 'Comment 30',
        slug: 'comment-30',
        news: news,
        author: user,
      });
    });

    it('should find all comments', async () => {
      const response = await request(httpServer).get('/comments');
      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(3);
    });
  });

  describe('findOneComment', () => {
    it('should find one comment', async () => {
      const response = await request(httpServer).get(`/comments/${comment.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toEqual(comment.id);
      expect(response.body.text).toEqual(comment.text);
      expect(response.body.authorId).toEqual(user.id);
      expect(response.body.newsId).toEqual(news.id);
    });

    it('should throw error after not found comment', async () => {
      const response = await request(httpServer).get(`/comments/${99999}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toStrictEqual(
        `Comment with id "${99999}" was not found!`,
      );
    });
  });

  describe('updateComment', () => {
    const updateCommentDto: UpdateCommentDto = {
      text: 'Comment 1011',
    };

    it('should update comment', async () => {
      const response = await request(httpServer)
        .put(`/comments/${comment.id}`)
        .send(updateCommentDto);
      expect(response.status).toBe(200);
      expect(response.body.id).toEqual(comment.id);
      expect(response.body.text).toEqual(updateCommentDto.text);
      expect(response.body.authorId).toEqual(user.id);
      expect(response.body.newsId).toEqual(news.id);
    });

    it('should throw error after update fail', async () => {
      const response = await request(httpServer)
        .put(`/comments/${99999}`)
        .send(updateCommentDto);
      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        `Comment with id "${99999}" was not updated! Access Denied!`,
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete one comment', async () => {
      const response = await request(httpServer).delete(
        `/comments/${comment.id}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        success: true,
        message: 'Comment has been deleted!',
      });
    });

    it('should throw error after not found comment', async () => {
      const response = await request(httpServer).delete(
        `/comments/${comment.id}`,
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toStrictEqual(
        `Comment with id "${comment.id}" was not deleted! Access Denied!`,
      );
    });
  });
});
