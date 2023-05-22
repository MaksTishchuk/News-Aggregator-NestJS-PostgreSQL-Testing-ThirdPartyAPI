import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {JwtService} from "@nestjs/jwt";
import {MailerService} from "@nestjs-modules/mailer";
import {UserEntity} from "../user/entities/user.entity";

describe('AuthService', () => {
  let authService: AuthService

  const mockUserRepository = {}
  const mockJwtService = {}
  const mockMailerService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: MailerService,
          useValue: mockMailerService
        }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});
