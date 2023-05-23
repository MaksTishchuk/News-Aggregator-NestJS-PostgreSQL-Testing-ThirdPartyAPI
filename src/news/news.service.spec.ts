import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {NewsEntity} from "./entities/news.entity";
import {ImageEntity} from "./entities/images.entity";
import {UserEntity} from "../user/entities/user.entity";
import {FileService} from "../file/file.service";
import {CreateNewsDto} from "./dto/create-news.dto";
import {MockNews, MockUser} from "../../test/mock-const";
import {Repository} from "typeorm";

describe('NewsService', () => {
  let newsService: NewsService;
  let fileService: FileService
  let newsRepository: Repository<NewsEntity>
  let userRepository: Repository<UserEntity>
  let imageRepository: Repository<ImageEntity>

  const mockUser: UserEntity = MockUser

  const mockNews: NewsEntity = MockNews

  const mockNewsList: NewsEntity[] = [
    mockNews,
    { ...mockNews, id: 2, title: 'news 2', body: 'body 2', slug: 'news-2', generateSlug(): void {}},
    { ...mockNews, id: 3, title: 'news 3', body: 'body 3', slug: 'news-3', generateSlug(): void {}}
  ]

  const createMockNewsDto: CreateNewsDto = {
    title: "news 1",
    body: "body 1",
    images: []
  }

  const mockUserRepository = {
    findOne: jest.fn((id) => mockUser)
  }
  const mockImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn()
  }
  const mockFileService = {
    createFile: jest.fn(),
    removeFile: jest.fn()
  }

  const mockNewsRepository = {
    create: jest.fn((createMockNewsDto, mockUser) => Promise.resolve(mockNews)),
    save: jest.fn(),
    findOne: jest.fn((slug) => Promise.resolve(mockNews)),
    find: jest.fn(() => Promise.resolve(mockNewsList)),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: getRepositoryToken(NewsEntity),
          useValue: mockNewsRepository
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository
        },
        {
          provide: getRepositoryToken(ImageEntity),
          useValue: mockImageRepository
        },
        {
          provide: FileService,
          useValue: mockFileService
        }
      ],
    }).compile();

    newsService = module.get<NewsService>(NewsService);
    fileService = module.get<FileService>(FileService)
    newsRepository = module.get<Repository<NewsEntity>>(getRepositoryToken(NewsEntity))
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity))
    imageRepository = module.get<Repository<ImageEntity>>(getRepositoryToken(ImageEntity))
  });

  afterEach(() => jest.clearAllMocks())

  it('should be defined newsService', () => {
    expect(newsService).toBeDefined();
  })

  it('should be defined fileService', () => {
    expect(fileService).toBeDefined();
  })

  it('should be defined newsRepository', () => {
    expect(newsRepository).toBeDefined();
  })

  it('should be defined userRepository', () => {
    expect(userRepository).toBeDefined();
  })

  it('should be defined imageRepository', () => {
    expect(imageRepository).toBeDefined();
  })

  describe('createNews', () => {
    it('should create a new news', async () => {
      const createSpy = jest.spyOn(mockNewsRepository, 'create')
      const saveSpy = await jest.spyOn(mockNewsRepository, 'save')
      const findOneSpy = jest.spyOn(mockNewsRepository, 'findOne')
      const createdNews = await newsService.createNews(createMockNewsDto, mockUser, [])
      expect(createdNews).toEqual(mockNews)
      expect(createSpy).toHaveBeenCalledTimes(1)
      expect(createSpy).toHaveBeenCalledWith({...createMockNewsDto, author: mockUser})
      expect(saveSpy).toHaveBeenCalledTimes(1)
      expect(saveSpy).toHaveBeenCalled()
      expect(findOneSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('findAllNews', () => {
    it('should find all news', async () => {
      const findSpy = jest.spyOn(mockNewsRepository, 'find')
      const newsList = await newsService.findAllNews()
      expect(newsList).toEqual(mockNewsList)
      expect(findSpy).toHaveBeenCalledTimes(1)
      expect(findSpy).toHaveBeenCalledWith({relations: ['author', 'comments', 'comments.author', 'images'], order: {created: 'DESC'}})
    })
  })

  describe('findOneNews', () => {
    it('should find one news', async () => {
      const findOneSpy = jest.spyOn(mockNewsRepository, 'findOne')
      const news = await newsService.findOneNews(mockNews.slug)
      expect(news).toEqual(mockNews)
      expect(findOneSpy).toHaveBeenCalledTimes(1)
      expect(findOneSpy).toHaveBeenCalledWith({where: {slug: mockNews.slug}, relations: ['author', 'comments', 'comments.author', 'images']})
    })
  })

});
