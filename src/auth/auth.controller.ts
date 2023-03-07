import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  Patch,
  Post, UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterCredentialsDto} from "./dto/register-credentials.dto";
import {LoginCredentialsDto} from "./dto/login-credentials.dto";
import {ForgotPasswordDto} from "./dto/forgot-password.dto";
import {GetUser} from "./decorators/get-user.decorator";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import {ChangePasswordDto} from "./dto/change-password.dto";
import {UserEntity} from "../user/entities/user.entity";
import {
  ApiBadRequestResponse,
  ApiBody, ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse
} from "@nestjs/swagger";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({description: 'User registration'})
  @ApiBody({
    required: true, schema: {
      example: {
        email: 'maks@gmail.com',
        username: 'Maks',
        password: 'Qwerty123'
      }
    }
  })
  @ApiConflictResponse({schema: {example: new ConflictException('Email already exists!')}})
  @ApiOkResponse({description: 'message: `We sent activation link on your email address! Please, confirm your email!`', type: UserEntity})
  @Post('/register')
  register(@Body() registerCredentialsDto: RegisterCredentialsDto) {
    return this.authService.register(registerCredentialsDto)
  }

  @ApiOperation({description: 'User activate email'})
  @ApiUnauthorizedResponse({schema: {example: new UnauthorizedException(`User with this activation link was not found!`)}})
  @ApiOkResponse({
    description: 'success: true, message: `Account with email has been activated!`',
    schema: {
      example: {
        success: true,
        message: `Account with email  has been activated!`
      }
    }
  })
  @Get('/activate/:token')
  activate(@Param('token') token: string) {
    return this.authService.activate(token);
  }

  @ApiOperation({description: 'User login'})
  @ApiBody({
    required: true, schema: {
      example: {
        email: 'maks@gmail.com',
        password: 'Qwerty123'
      }
    }
  })
  @ApiUnauthorizedResponse({schema: {example: new UnauthorizedException('User with this credentials was not found!')}})
  @ApiOkResponse({
    description: 'token: Token',
    schema: {
      example: {
        accessToken: `Access token string`
      }
    }
  })
  @Post('/login')
  login(@Body() loginCredentialsDto: LoginCredentialsDto): Promise<{accessToken: string}> {
    return this.authService.login(loginCredentialsDto)
  }

  @ApiOperation({description: 'User forgot password'})
  @ApiBody({
    required: true, schema: {
      example: {
        email: 'maks@gmail.com'
      }
    }
  })
  @ApiBadRequestResponse({schema: {example: new BadRequestException('User with this email was not found!')}})
  @ApiOkResponse({
    description: 'message: `We sent forgot password link on your email address! Please, check your email!`',
    schema: {
      example: {
        message: 'We sent forgot password link on your email address! Please, check your email!'
      }
    }
  })
  @Post('/forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    return this.authService.forgotPassword(forgotPasswordDto)
  }

  @ApiOperation({description: 'User change password'})
  @ApiBody({
    required: true, schema: {
      example: {
        password: 'Qwerty123'
      }
    }
  })
  @ApiUnauthorizedResponse({schema: {example: new UnauthorizedException('User with this credentials was not found!')}})
  @ApiOkResponse({
    description: 'success: true, message: `User password has been updated!`',
    schema: {
      example: {
        success: true,
        message: 'User password has been updated!'
      }
    }
  })
  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser() user: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
