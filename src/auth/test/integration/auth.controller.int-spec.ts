import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../user/entities/user.entity';
import { RegisterCredentialsDto } from '../../dto/register-credentials.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import * as request from 'supertest';
import { JwtPayloadInterface } from '../../dto/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginCredentialsDto } from '../../dto/login-credentials.dto';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto';
import { ChangePasswordDto } from '../../dto/change-password.dto';

describe('AuthService Int', () => {
  let app: any;
  let httpServer: any;
  let userRepository: Repository<UserEntity>;
  let jwtService: JwtService;

  let user: UserEntity;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideGuard(JwtAuthGuard)
      // .useValue({
      //   canActivate: (ctx) => {
      //     const request = ctx.switchToHttp().getRequest();
      //     request.user = user
      //     return true
      //   }
      // })
      .compile();

    app = module.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    userRepository = module.get('UserEntityRepository');
    jwtService = module.get(JwtService);
  });

  afterAll(async () => {
    const users = await userRepository.find();
    for (const user of users) {
      await userRepository.delete({ id: user.id });
    }
    await app.close();
  });

  describe('register', () => {
    const registerCredentialsDto: RegisterCredentialsDto = {
      username: 'maks-auth-controller',
      email: 'maks-auth-controller@gmail.com',
      password: 'Qwerty123',
    };

    it('should register user', async () => {
      const response = await request(httpServer)
        .post('/auth/register')
        .send(registerCredentialsDto);
      user = await userRepository.findOne({
        where: { username: registerCredentialsDto.username },
      });
      delete user.password;
      expect(response.status).toBe(201);
      expect(response.body.message).toStrictEqual(
        'We sent activation link on your email address! Please, confirm your email!',
      );
      expect(response.body.user.email).toEqual(registerCredentialsDto.email);
      expect(response.body.user.username).toEqual(
        registerCredentialsDto.username,
      );
    });

    it('should throw ConflictException via unique email', async () => {
      const response = await request(httpServer)
        .post('/auth/register')
        .send(registerCredentialsDto);
      expect(response.status).toBe(409);
      expect(response.body.message).toStrictEqual('Email already exists!');
    });
  });

  describe('activate', () => {
    it('should register user', async () => {
      const payload: JwtPayloadInterface = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
      const accessToken = await jwtService.sign(payload);
      const response = await request(httpServer).get(
        `/auth/activate/${accessToken}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        success: true,
        message: `Account with email "${user.email}" has been activated!`,
      });
    });
  });

  describe('login', () => {
    const loginCredentialsDto: LoginCredentialsDto = {
      email: 'maks-auth-controller@gmail.com',
      password: 'Qwerty123',
    };

    it('should throw UnauthorizedException via invalid email', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({ ...loginCredentialsDto, email: 'fake-email@gmail.com' });
      expect(response.status).toBe(401);
      expect(response.body.message).toStrictEqual(
        'User with this credentials was not found!',
      );
    });

    it('should throw UnauthorizedException via invalid password', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({ ...loginCredentialsDto, password: 'fakePassword' });
      expect(response.status).toBe(401);
      expect(response.body.message).toStrictEqual(
        'User with this credentials was not found!',
      );
    });

    it('should login user', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send(loginCredentialsDto);
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toEqual('string');
      expect(response.body.accessToken).toBeTruthy();
      token = response.body.accessToken;
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'maks-auth-controller@gmail.com',
    };

    it('should send forgot password link on user email', async () => {
      const response = await request(httpServer)
        .post('/auth/forgot-password')
        .send(forgotPasswordDto);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        message:
          'We sent forgot password link on your email address! Please, check your email!',
      });
    });

    it('should throw NotFoundException invalid email', async () => {
      const response = await request(httpServer)
        .post('/auth/forgot-password')
        .send({ email: 'fake@gmail.com' });
      expect(response.status).toBe(404);
      expect(response.body.message).toStrictEqual(
        'User with this email was not found!',
      );
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      password: 'Qwerty1234',
    };

    it('should change user password', async () => {
      const response = await request(httpServer)
        .patch('/auth/change-password')
        .send(changePasswordDto)
        .set('Authorization', `bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        success: true,
        message: 'User password has been updated!',
      });
    });
  });
});
