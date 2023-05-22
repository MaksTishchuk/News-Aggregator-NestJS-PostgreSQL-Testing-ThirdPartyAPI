import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {FileService} from "../file/file.service";

describe('UserService', () => {
  let service: UserService

  const mockUserRepository = {}
  const mockFileService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository
        },
        {
          provide: FileService,
          useValue: mockFileService
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
