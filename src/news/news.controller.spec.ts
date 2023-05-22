import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import * as httpMocks from 'node-mocks-http'
import {UserEntity} from "../user/entities/user.entity";
import {NewsEntity} from "./entities/news.entity";
import {CreateNewsDto} from "./dto/create-news.dto";
import {SearchNewsDto} from "./dto/search-news.dto";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {MockNews, MockUser} from "../../test/mock-const";

describe('NewsController', () => {
  let newsController: NewsController

  const mockUser: UserEntity = MockUser

  const mockRequest = httpMocks.createRequest()
  mockRequest.user = mockUser

  const createMockNewsDto: CreateNewsDto = {
    title: "news 1",
    body: "body 1"
  }

  const mockNews: NewsEntity = MockNews
  const mockNewsWithLike: NewsEntity = {
    ...mockNews,
    likedByUsers: [mockUser],
    generateSlug: function (): void {}
  }

  const mockUpdateNewsDto: UpdateNewsDto = {
    title: 'news 111',
    body: 'body 111'
  }

  const mockNewsList: NewsEntity[] = [
    mockNews,
    { ...mockNews, id: 2, title: 'news 2', body: 'body 2', slug: 'news-2', generateSlug(): void {}},
    { ...mockNews, id: 3, title: 'news 3', body: 'body 3', slug: 'news-3', generateSlug(): void {}}
  ]

  const mockSearchNewsDto: SearchNewsDto = {
    skip: 1,
    take: 2
  }

  const mockNewsService = {
    findAllNews: jest.fn().mockImplementation(() => {
      return mockNewsList
    }),

    createNews: jest.fn().mockImplementation((createNewsDto: CreateNewsDto, user: UserEntity, []) => {
      return {
        ...mockNews,
        ...createNewsDto,
        author: user,
        authorId: user.id
      }
    }),

    searchNews: jest.fn().mockImplementation((searchNewsDto: SearchNewsDto) => {
      const newsAfterSkipping = mockNewsList.slice(searchNewsDto.skip)
      return newsAfterSkipping.slice(0, searchNewsDto.take)
    }),

    findOneNews: jest.fn().mockImplementation((slug: string) => {
      return {...mockNews, slug}
    }),

    updateNews: jest.fn().mockImplementation((slug: string, updateNewsDto: UpdateNewsDto, user: UserEntity, []) => {
      return {
        ...mockNews,
        ...updateNewsDto,
        author: user,
        authorId: user.id
      }
    }),

    deleteNews: jest.fn().mockImplementation((slug: string, user: UserEntity) => {
      return {
        success: true,
        message: 'News has been deleted!'
      }
    }),

    likeNews: jest.fn().mockImplementation( (newsSlug: string, user: UserEntity) => {
      mockNews.likedByUsers.push(user)
      return {...mockNews, slug: newsSlug}
    }),

    unlikeNews: jest.fn().mockImplementation( (newsSlug: string, user: UserEntity) => {
      mockNewsWithLike.likedByUsers = mockNewsWithLike.likedByUsers.filter(likeUser => likeUser.id !== user.id)
      return {...mockNewsWithLike, slug: newsSlug}
    })
  }

  // const mockUserService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        NewsService,
        // {provide: NewsService, useValue: mockNewsService}, // another way to declare this bellow
        // {provide: JwtAuthGuard, useValue: jest.fn().mockImplementation(() => true)}
      ],
    })
      .overrideProvider(NewsService).useValue(mockNewsService) // i am about it early
      .compile();

    newsController = module.get<NewsController>(NewsController);
  });


  it('should be defined', () => {
    expect(newsController).toBeDefined();
  })

  it('should find all news', () => {
    expect(newsController.findAllNews()).toEqual(mockNewsList)
    expect(newsController.findAllNews()).toHaveLength(3)
    expect(mockNewsService.findAllNews).toHaveBeenCalledWith()
  })

  it('should creat a news', () => {
    expect(newsController.createNews(createMockNewsDto, mockUser,[])).toEqual({
      ...mockNews,
      ...createMockNewsDto,
      author: mockUser,
      authorId: mockUser.id
    })
    expect(mockNewsService.createNews).toHaveBeenCalledWith(createMockNewsDto, mockUser, [])
  })

  it('should skip some news and take some news', () => {
    expect(newsController.searchNews(mockSearchNewsDto)).toEqual(
      (mockNewsList.slice(mockSearchNewsDto.skip)).slice(0, mockSearchNewsDto.take)
    )
    expect(newsController.searchNews(mockSearchNewsDto)).toHaveLength(2)
    expect(mockNewsService.searchNews).toHaveBeenCalledWith(mockSearchNewsDto)
  })

  it('should find one news', () => {
    expect(newsController.findOneNews('news-1')).toEqual(mockNews)
    expect(mockNewsService.findOneNews).toHaveBeenCalledWith('news-1')
  })

  it('should update a news', () => {
    expect(newsController.updateNews('news-1', mockUpdateNewsDto, mockUser,[])).toEqual({
      ...mockNews,
      ...mockUpdateNewsDto,
      author: mockUser,
      authorId: mockUser.id
    })
    expect(mockNewsService.updateNews).toHaveBeenCalledWith('news-1', mockUpdateNewsDto, mockUser, [])
  })

  it('should delete news', () => {
    expect(newsController.deleteNews('news-1', mockUser)).toEqual({
      success: true, message: 'News has been deleted!'
    })
    expect(mockNewsService.deleteNews).toHaveBeenCalledWith('news-1', mockUser)
  })

  it('should like news', () => {
    expect(newsController.likeNews('news-1', mockUser)).toEqual({
      ...mockNews,
      slug: 'news-1',
      likedByUsers: [mockUser]
    })
    expect(mockNewsService.likeNews).toHaveBeenCalledWith('news-1', mockUser)
  })

  it('should unlike news', () => {
    expect(newsController.unlikeNews('news-1', mockUser)).toEqual({
      ...mockNewsWithLike,
      slug: 'news-1',
      likedByUsers: []
    })
    expect(mockNewsService.likeNews).toHaveBeenCalledWith('news-1', mockUser)
  })

})
