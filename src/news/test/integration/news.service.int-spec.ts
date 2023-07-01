import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../user/entities/user.entity';
import { NewsEntity } from '../../entities/news.entity';
import { ImageEntity } from '../../entities/images.entity';
import { NewsService } from '../../news.service';
import { CreateNewsDto } from '../../dto/create-news.dto';
import { SearchNewsDto } from '../../dto/search-news.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateNewsDto } from '../../dto/update-news.dto';

describe('NewsService Int', () => {
  let userRepository: Repository<UserEntity>;
  let newsRepository: Repository<NewsEntity>;
  let imageRepository: Repository<ImageEntity>;
  let newsService: NewsService;

  let user: UserEntity;
  let notAuthorUser: UserEntity;
  let slug: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = module.get('UserEntityRepository');
    newsRepository = module.get('NewsEntityRepository');
    imageRepository = module.get('ImageEntityRepository');
    newsService = module.get(NewsService);
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
  });

  describe('createNews', () => {
    const createNewsDto: CreateNewsDto = {
      title: 'news 1',
      body: 'body 1',
    };

    it('should create user', async () => {
      user = await userRepository.save({
        email: 'test-user@gmail.com',
        username: 'test-user',
        password: 'qwerty',
        isActivated: true,
      });
    });

    it('should create news', async () => {
      const news = await newsService.createNews(createNewsDto, user, []);
      expect(news.title).toEqual(createNewsDto.title);
      expect(news.body).toEqual(createNewsDto.body);
      expect(news.views).toEqual(0);
      slug = news.slug;
    });
  });

  describe('findAllNews', () => {
    it('should create several news for test', async () => {
      await newsService.createNews(
        { title: 'news 2', body: 'body 2' },
        user,
        [],
      );
      await newsService.createNews(
        { title: 'news 3', body: 'body 3' },
        user,
        [],
      );
    });

    it('should find all news', async () => {
      const news = await newsService.findAllNews();
      expect(news.length).toEqual(3);
    });
  });

  describe('searchNews', () => {
    const searchNewsDto: SearchNewsDto = {
      skip: 1,
      take: 2,
    };

    it('should search news', async () => {
      const result = await newsService.searchNews(searchNewsDto);
      expect(result.total).toEqual(3);
      expect(result.news.length).toEqual(2);
    });
  });

  describe('findOneNews', () => {
    it('should find one news', async () => {
      const news = await newsService.findOneNews(slug);
      expect(news.slug).toEqual(slug);
      expect(news.views).toEqual(1);
    });

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug';
      try {
        await newsService.findOneNews(testSlug);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain(
          `News with slug "${testSlug}" was not found!`,
        );
      }
    });
  });

  describe('updateNews', () => {
    const updateNewsDto: UpdateNewsDto = {
      title: 'news 111',
      body: 'body 111',
    };

    it('should find update news', async () => {
      const news = await newsService.updateNews(slug, updateNewsDto, user, []);
      expect(news.slug).toEqual(slug);
      expect(news.title).toEqual(updateNewsDto.title);
      expect(news.body).toEqual(updateNewsDto.body);
    });

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug';
      try {
        await newsService.updateNews(testSlug, updateNewsDto, user, []);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain(
          `News with slug "${testSlug}" was not found!`,
        );
      }
    });

    it('should throw error after try to update news by another user who not author', async () => {
      notAuthorUser = await userRepository.save({
        email: 'not-author@gmail.com',
        username: 'not-author',
        password: 'qwerty',
        isActivated: true,
      });
      try {
        await newsService.updateNews(slug, updateNewsDto, notAuthorUser, []);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain(
          `News with slug "${slug}" was not updated! Access denied!`,
        );
      }
    });
  });

  describe('likeNews', () => {
    it('should like news', async () => {
      const news = await newsService.likeNews(slug, notAuthorUser);
      expect(news.slug).toEqual(slug);
      expect(news.likedByUsers.length).toEqual(1);
    });

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug';
      try {
        await newsService.likeNews(testSlug, notAuthorUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain(
          `News with slug "${testSlug}" was not found!`,
        );
      }
    });
  });

  describe('unlikeNews', () => {
    it('should unlike news', async () => {
      const news = await newsService.unlikeNews(slug, notAuthorUser);
      expect(news.slug).toEqual(slug);
      expect(news.likedByUsers.length).toEqual(0);
    });

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug';
      try {
        await newsService.unlikeNews(testSlug, notAuthorUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain(
          `News with slug "${testSlug}" was not found!`,
        );
      }
    });
  });

  describe('deleteNews', () => {
    it('should throw error after try to delete news by another user who not author', async () => {
      try {
        await newsService.deleteNews(slug, notAuthorUser);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain(
          `News with slug "${slug}" was not deleted! Access denied!`,
        );
      }
    });

    it('should delete one news', async () => {
      const result = await newsService.deleteNews(slug, user);
      expect(result).toEqual({
        success: true,
        message: 'News has been deleted!',
      });
    });

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug';
      try {
        await newsService.deleteNews(testSlug, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain(
          `News with slug "${testSlug}" was not found!`,
        );
      }
    });
  });
});
