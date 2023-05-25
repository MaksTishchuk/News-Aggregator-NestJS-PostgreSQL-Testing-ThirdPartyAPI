import {Test} from "@nestjs/testing";
import {AppModule} from "../../../app.module";
import {Repository} from "typeorm";
import {UserEntity} from "../../../user/entities/user.entity";
import {AuthService} from "../../auth.service";
import {RegisterCredentialsDto} from "../../dto/register-credentials.dto";
import {LoginCredentialsDto} from "../../dto/login-credentials.dto";
import {ConflictException, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {ForgotPasswordDto} from "../../dto/forgot-password.dto";
import {ChangePasswordDto} from "../../dto/change-password.dto";

describe('AuthService Int', () =>  {
  let userRepository: Repository<UserEntity>
  let authService: AuthService

  let user: UserEntity

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile()

    userRepository = module.get('UserEntityRepository')
    authService = module.get(AuthService)
  })

  afterAll(async () => {
    const users = await userRepository.find()
    for (const user of users) {
      await userRepository.delete({id: user.id})
    }
  })

  describe('register', () => {
    const registerCredentialsDto: RegisterCredentialsDto = {
      username: "user",
      email: "maks@gmail.com",
      password: "Qwerty123"
    }

    it('should register user', async () => {
      const result = await authService.register(registerCredentialsDto)
      user = await userRepository.findOne({where: {username: registerCredentialsDto.username}})
      expect(result.message).toEqual('We sent activation link on your email address! Please, confirm your email!')
      expect(result.user.username).toEqual(registerCredentialsDto.username)
      expect(result.user.email).toEqual(registerCredentialsDto.email)
    })

    it('should throw ConflictException via unique email', async () => {
      try {
        await authService.register(registerCredentialsDto)
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException)
        expect(error.message).toContain('Email already exists!')
      }
    })
  })

  describe('login', () => {
    const loginCredentialsDto: LoginCredentialsDto = {
      email: "maks@gmail.com",
      password: "Qwerty123"
    }

    it('should throw UnauthorizedException via invalid email', async () => {
      try {
        await authService.login({...loginCredentialsDto, email: 'maks2@gmail.com'})
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException)
        expect(error.message).toContain('User with this credentials was not found!')
      }
    })

    it('should throw UnauthorizedException via invalid password', async () => {
      try {
        await authService.login({...loginCredentialsDto, password: 'qwerty'})
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException)
        expect(error.message).toContain('User with this credentials was not found!')
      }
    })

    it('should throw UnauthorizedException via not activated user login', async () => {
      try {
        await authService.login(loginCredentialsDto)
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException)
        expect(error.message).toContain('User with this credentials was not activated by email!')
      }
    })

    it('should login user', async () => {
      await userRepository.update({id: user.id}, {isActivated: true})
      const result = await authService.login(loginCredentialsDto)
      expect(typeof result.accessToken).toBeDefined()
      expect(typeof result.accessToken).toEqual("string")
      expect(result.accessToken).toBeTruthy()
    })
  })

  describe('forgotPassword', () => {

    const forgotPasswordDto: ForgotPasswordDto = {
      email: "maks@gmail.com"
    }

    it('should register user', async () => {
      const result = await authService.forgotPassword(forgotPasswordDto)
      expect(result).toStrictEqual({message: 'We sent forgot password link on your email address! Please, check your email!'})
    })

    it('should throw NotFoundException invalid email', async () => {
      try {
        await authService.forgotPassword({email: 'fake@gmail.com'})
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain('User with this email was not found!')
      }
    })
  })

  describe('changePassword', () => {

    const changePasswordDto: ChangePasswordDto = {
      password: "Qwerty1234"
    }

    it('should change user password', async () => {
      const result = await authService.changePassword(user, changePasswordDto)
      expect(result).toStrictEqual({success: true, message: 'User password has been updated!'})
    })

    it('should throw NotFoundException invalid email', async () => {
      try {
        user.email = 'fake-email@gmail.com'
        await authService.changePassword(user, changePasswordDto)
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException)
        expect(error.message).toContain('User with this credentials was not found!')
      }
    })
  })
})