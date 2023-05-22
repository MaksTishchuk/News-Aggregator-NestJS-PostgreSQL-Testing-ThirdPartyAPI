import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {NewsEntity} from "./entities/news.entity";
import {ImageEntity} from "./entities/images.entity";
import {UserEntity} from "../user/entities/user.entity";
import {FileService} from "../file/file.service";
import {CreateNewsDto} from "./dto/create-news.dto";
import {MockNews, MockUser} from "../../test/mock-const";

describe('NewsService', () => {
  let service: NewsService;

  const mockUser: UserEntity = MockUser

  const mockNews: NewsEntity = MockNews

  const createMockNewsDto: CreateNewsDto = {
    title: "news 1",
    body: "body 1",
    images: []
  }

  const mockUserRepository = {}
  const mockImageRepository = {}
  const mockFileService = {}

  const mockNewsRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(news => Promise.resolve({id: Date.now(), ...news}))
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

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should create a new news record and return that', async () => {
  //   expect(await service.createNews(createMockNewsDto, mockUser, [])).toEqual({
  //     ...mockNews
  //   })
  // })
});
