import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from '../user/entities/user.entity';
import { MockUser } from '../../test/mock-const';
import { RegisterCredentialsDto } from './dto/register-credentials.dto';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcryptjs from 'bcryptjs';
import { throws } from 'assert';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let mailService: MailerService;

  const mockUser: UserEntity = MockUser;

  const mockRegisterCredentialsDto: RegisterCredentialsDto = {
    username: 'maks',
    email: 'maks@gmail.com',
    password: 'Qwerty123',
  };

  const mockLoginCredentialsDto: LoginCredentialsDto = {
    email: 'maks@gmail.com',
    password: 'Qwerty123',
  };

  const mockForgotPasswordDto: ForgotPasswordDto = {
    email: 'maks@gmail.com',
  };

  const mockChangePasswordDto: ChangePasswordDto = {
    password: 'Qwerty1234',
  };

  const mockAccessToken = 'fsjfdafadskfldanfdskfksflgjfdslgsfdmkl;';

  const mockUserRepository = {
    create: jest.fn((username, email, password) => mockUser),
    save: jest.fn((mockUser) => Promise.resolve(mockUser)),
    findOne: jest.fn(() => mockUser),
    update: jest.fn((email, password) => Promise.resolve({ affected: 1 })),
  };
  const mockJwtService = {
    sign: jest.fn(({ id, username, email }) => mockAccessToken),
    verify: jest.fn(() =>
      Promise.resolve({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      }),
    ),
  };
  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailerService>(MailerService);

    jest.clearAllMocks();
  });

  it('should be defined authService', () => {
    expect(authService).toBeDefined();
  });

  it('should be defined jwtService', () => {
    expect(jwtService).toBeDefined();
  });

  it('should be defined mailService', () => {
    expect(mailService).toBeDefined();
  });

  describe('register', () => {
    it('should register user', async () => {
      const createSpy = jest.spyOn(mockUserRepository, 'create');
      const hashPassword = 'hashPassword';
      jest
        .spyOn(bcryptjs, 'hash')
        .mockImplementation((password, salt) => hashPassword);
      const users = await authService.register(mockRegisterCredentialsDto);
      expect(users).toStrictEqual({
        message:
          'We sent activation link on your email address! Please, confirm your email!',
        user: { ...mockUser },
      });
      expect(createSpy).toHaveBeenCalledWith({
        username: mockUser.username,
        email: mockUser.email,
        password: hashPassword,
      });
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException', async () => {
      jest.spyOn(mockUserRepository, 'create').mockImplementation(() => null);
      try {
        await authService.register(mockRegisterCredentialsDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toContain('Something went wrong!');
      }
    });
  });

  describe('activate', () => {
    it('should activate user', async () => {
      const findOneSpy = jest.spyOn(mockUserRepository, 'findOne');
      const result = await authService.activate(mockAccessToken);
      expect(result).toStrictEqual({
        success: true,
        message: `Account with email "${mockUser.email}" has been activated!`,
      });
      expect(findOneSpy).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(findOneSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockImplementation(() => null);
      try {
        await authService.activate(mockAccessToken);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toContain(
          `User with activation link token "${mockAccessToken}" was not found!`,
        );
      }
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const findOneSpy = jest.spyOn(mockUserRepository, 'findOne');
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockImplementation(() => mockUser);
      jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true);
      const users = await authService.login(mockLoginCredentialsDto);
      expect(users).toStrictEqual({
        accessToken: mockAccessToken,
      });
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(findOneSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException with no user', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockImplementation(() => null);
      try {
        await authService.login(mockLoginCredentialsDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toContain(
          'User with this credentials was not found!',
        );
      }
    });

    it('should throw UnauthorizedException with failed compare password', async () => {
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockImplementation(() => mockUser);
      jest.spyOn(bcryptjs, 'compare').mockResolvedValue(false);
      try {
        await authService.login(mockLoginCredentialsDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toContain(
          'User with this credentials was not found!',
        );
      }
    });

    it('should throw UnauthorizedException with no activated user', async () => {
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockImplementation(() => mockUser);
      jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true);
      mockUser.isActivated = false;
      try {
        await authService.login(mockLoginCredentialsDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toContain(
          'User with this credentials was not activated by email!',
        );
      }
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password link on email', async () => {
      const findOneSpy = jest.spyOn(mockUserRepository, 'findOne');
      const result = await authService.forgotPassword(mockForgotPasswordDto);
      expect(result).toStrictEqual({
        message:
          'We sent forgot password link on your email address! Please, check your email!',
      });
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(findOneSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException with no user', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockImplementation(() => null);
      try {
        await authService.forgotPassword(mockLoginCredentialsDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain('User with this email was not found!');
      }
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const findOneSpy = jest.spyOn(mockUserRepository, 'findOne');
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockImplementation(() => mockUser);
      const hashPassword = 'hashPassword';
      jest
        .spyOn(bcryptjs, 'hash')
        .mockImplementation((password, salt) => hashPassword);
      const result = await authService.changePassword(
        mockUser,
        mockChangePasswordDto,
      );
      expect(result).toStrictEqual({
        success: true,
        message: 'User password has been updated!',
      });
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(findOneSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException with no user', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockImplementation(() => null);
      try {
        await authService.changePassword(mockUser, mockChangePasswordDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toContain(
          'User with this credentials was not found!',
        );
      }
    });

    it('should throw InternalServerErrorException by cant update user', async () => {
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockImplementation(() => mockUser);
      mockUserRepository.update = jest
        .fn()
        .mockResolvedValue({ affected: false });
      try {
        await authService.changePassword(mockUser, mockChangePasswordDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toContain(
          `Password for user with email "${mockUser.email}" has not been updated!`,
        );
      }
    });
  });
});
