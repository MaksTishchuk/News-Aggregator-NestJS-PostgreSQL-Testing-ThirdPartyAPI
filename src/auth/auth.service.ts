import {
  ConflictException,
  Injectable,
  InternalServerErrorException, NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../user/entities/user.entity";
import {Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import {MailerService} from "@nestjs-modules/mailer";
import * as bcryptjs from 'bcryptjs';
import {RegisterCredentialsDto} from "./dto/register-credentials.dto";
import {JwtPayloadInterface} from "./dto/jwt-payload.interface";
import {LoginCredentialsDto} from "./dto/login-credentials.dto";
import {ForgotPasswordDto} from "./dto/forgot-password.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private mailService: MailerService
  ) {}


  async register(registerCredentialsDto: RegisterCredentialsDto) {
    let {username, email, password} = registerCredentialsDto
    const hashPassword = await bcryptjs.hash(password, 10)
    const user = this.userRepository.create({username, email, password: hashPassword})
    try {
      await this.userRepository.save(user)
      const accessToken = await this.generateAccessToken(user.id, user.username, user.email)
      const fullActivationLink = `${process.env.SERVER_HOST}/api/auth/activate/${accessToken}`
      await this.sendActivationLinkOnEmail(fullActivationLink, user.email, user.username)
      delete user.password
      return {
        message: 'We sent activation link on your email address! Please, confirm your email!',
        user: {...user}
      }
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Email already exists!')
      } else {
        throw new InternalServerErrorException(`Something went wrong! ${err}`)
      }
    }
  }

  async activate(token: string) {
    const data = await this.jwtService.verify(token)
    const user = await this.userRepository.findOne({where: {id: data.id}})
    if (!user) {
      throw new UnauthorizedException(`User with activation link token "${token}" was not found!`)
    }
    user.isActivated = true
    await this.userRepository.save(user)
    return {success: true, message: `Account with email "${user.email}" has been activated!`}
  }

  async login(loginCredentialsDto: LoginCredentialsDto):  Promise<{accessToken: string}> {
    let {email, password} = loginCredentialsDto
    const user = await this.userRepository.findOne({where: {email}})
    if (!user || !(await bcryptjs.compare(password, user.password))) {
      throw new UnauthorizedException('User with this credentials was not found!')
    }
    if (!user.isActivated) {
      throw new UnauthorizedException('User with this credentials was not activated by email!')
    }
    const accessToken = await this.generateAccessToken(user.id, user.username, user.email)
    return {accessToken}
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({where: {email: forgotPasswordDto.email}})
    if (!user) {
      throw new NotFoundException('User with this email was not found!')
    }
    const accessToken = await this.generateAccessToken(user.id, user.username, user.email)
    const forgotPasswordLink = `${process.env.CLIENT_HOST}/api/auth/forgot-password/${accessToken}`
    await this.sendForgotPasswordLinkOnEmail(forgotPasswordLink, user.email, user.username)
    return {message: 'We sent forgot password link on your email address! Please, check your email!'}
  }

  async changePassword(user: UserEntity, changePasswordDto: ChangePasswordDto) {
    const foundUser = await this.userRepository.findOne({where: {email: user.email}})
    if (!foundUser) {
      throw new UnauthorizedException('User with this credentials was not found!')
    }
    const password = await bcryptjs.hash(changePasswordDto.password, 10)
    const updatedUser = await this.userRepository.update(
      {email: user.email},
      {password}
    )
    if (!updatedUser.affected) {
      throw new InternalServerErrorException(`Password for user with email "${user.email}" has not been updated!`)
    }
    return {success: true, message: 'User password has been updated!'}
  }


  async generateAccessToken(id, username, email) {
    const payload: JwtPayloadInterface = {id, username, email}
    const accessToken = await this.jwtService.sign(payload)
    return accessToken
  }

  async sendActivationLinkOnEmail(fullActivationLink, email, username) {
    await this.mailService.sendMail({
      to: email,
      from: process.env.SMTP_USER,
      subject: `Confirmation your email on ${process.env.CLIENT_HOST}`,
      text: '',
      html:
        `
          <div>
            <h1>Hello, ${username}! Follow the link to activate your account on ${process.env.CLIENT_HOST}!</h1>
            <a href="${fullActivationLink}">${fullActivationLink}</a>
          </div>
        `
    })
  }

  async sendForgotPasswordLinkOnEmail(forgotPasswordLink, email, username) {
    await this.mailService.sendMail({
      to: email,
      from: process.env.SMTP_USER,
      subject: `Change your password on ${process.env.CLIENT_HOST}`,
      text: '',
      html:
        `
          <div>
            <h1>Hello, ${username}! Follow the link to change your password on ${process.env.CLIENT_HOST}!</h1>
            <a href="${forgotPasswordLink}">${forgotPasswordLink}</a>
          </div>
        `
    })
  }
}
