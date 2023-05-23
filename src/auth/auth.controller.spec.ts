import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {UserEntity} from "../user/entities/user.entity";
import * as httpMocks from "node-mocks-http";
import {LoginCredentialsDto} from "./dto/login-credentials.dto";
import {RegisterCredentialsDto} from "./dto/register-credentials.dto";
import {MockUser} from "../../test/mock-const";
import {ForgotPasswordDto} from "./dto/forgot-password.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";


describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService

  const mockUser: UserEntity = MockUser

  const mockRequest = httpMocks.createRequest()
  mockRequest.user = mockUser

  const mockRegisterCredentialsDto: RegisterCredentialsDto = {
    username: "maks",
    email: "maks@gmail.com",
    password: "Qwerty123"
  }

  const mockLoginCredentialsDto: LoginCredentialsDto = {
    email: "maks@gmail.com",
    password: "Qwerty123"
  }

  const mockForgotPasswordDto: ForgotPasswordDto = {
    email: "maks@gmail.com"
  }

  const mockChangePasswordDto: ChangePasswordDto = {
    password: "Qwerty1234"
  }

  const token = 'token'

  const mockAuthService = {
    register: jest.fn().mockImplementation((registerCredentialsDto: RegisterCredentialsDto) => {
      return {
        message: 'We sent activation link on your email address! Please, confirm your email!',
        user: {...mockUser, ...registerCredentialsDto, isActivated: false}
      }
    }),

    activate: jest.fn().mockImplementation((token: string) => {
      return {success: true, message: `Account with email "${mockUser.email}" has been activated!`}
    }),

    login: jest.fn().mockImplementation((loginCredentialsDto: LoginCredentialsDto) => {
      return {accessToken: token}
    }),

    forgotPassword: jest.fn().mockImplementation((forgotPasswordDto: ForgotPasswordDto) => {
      return {message: 'We sent forgot password link on your email address! Please, check your email!'}
    }),

    changePassword: jest.fn().mockImplementation((user: UserEntity, changePasswordDto: ChangePasswordDto) => {
      return {success: true, message: 'User password has been updated!'}
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService).useValue(mockAuthService)
      .compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should register a user', () => {
    expect(authController.register(mockRegisterCredentialsDto)).toEqual({
      message: 'We sent activation link on your email address! Please, confirm your email!',
      user: {
        ...mockUser,
        ...mockRegisterCredentialsDto,
        isActivated: false
      }
    })
    expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterCredentialsDto)
  })

  it('should activate account', () => {
    expect(authController.activate(token)).toStrictEqual({
      success: true,
      message: `Account with email "${mockUser.email}" has been activated!`
    })
    expect(mockAuthService.activate).toHaveBeenCalledWith(token)
  })

  it('should login and return accessToken', () => {
    expect(authController.login(mockLoginCredentialsDto)).toEqual({
      accessToken: token
    })
    expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginCredentialsDto)
  })

  it('should return info about sent forgot password link on email', () => {
    expect(authController.forgotPassword(mockForgotPasswordDto)).toStrictEqual({
      message: 'We sent forgot password link on your email address! Please, check your email!'
    })
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(mockForgotPasswordDto)
  })


  it('should return info about change password success', () => {
    expect(authController.changePassword(mockUser, mockChangePasswordDto)).toStrictEqual({
      success: true, message: 'User password has been updated!'
    })
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(mockForgotPasswordDto)
  })
});
