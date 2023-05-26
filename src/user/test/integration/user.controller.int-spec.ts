import {Test} from "@nestjs/testing";
import {AppModule} from "../../../app.module";
import {Repository} from "typeorm";
import {UserEntity} from "../../entities/user.entity";
import {UserService} from "../../user.service";
import * as request from 'supertest'
import {SearchUsersDto} from "../../dto/search-users.dto";
import {JwtAuthGuard} from "../../../auth/guards/jwt-auth.guard";
import {UpdateUserProfileDto} from "../../dto/update-user-profile.dto";
import {AdminRoleGuard} from "../../guards/admin-role.guard";

describe('UserController Int', () =>  {
  let app: any
  let httpServer: any
  let userRepository: Repository<UserEntity>

  let user: UserEntity
  let users: UserEntity[]

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx) => {
          const request = ctx.switchToHttp().getRequest();
          request.user = user
          return true
        }
      })
      .overrideGuard(AdminRoleGuard).useValue({ canActivate: () => true })
      .compile()

    app = module.createNestApplication()
    await app.init()
    httpServer = app.getHttpServer()

    userRepository = module.get('UserEntityRepository')
  })

  afterAll(async () => {
    const users = await userRepository.find()
    for (const user of users) {
      await userRepository.delete({id: user.id})
    }
    await app.close()
  })

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  })

  describe('findAllUsers', () => {
    it('should create several users and find them', async () => {
      user = await userRepository.save({
        email: 'controller-user-1@gmail.com', username: 'controller-user-1', password: 'qwerty', isActivated: true
      })
      await userRepository.save({
        email: 'controller-user-2@gmail.com', username: 'controller-user-2', password: 'qwerty', isActivated: true
      })
      await userRepository.save({
        email: 'controller-user-3@gmail.com', username: 'controller-user-3', password: 'qwerty', isActivated: true
      })
      users = await userRepository.find()
      users.map(user => {
        delete user.password
        return user
      })
    })

    it('should return an array of users', async () => {
      const response = await request(httpServer).get('/users')
      expect(response.status).toBe(200)
      expect(response.body.length).toEqual(3)
    })
  })

  describe('searchUsers', () => {
    const searchUsersDto: SearchUsersDto = {
      username: 'controller-user-1'
    }

    it('should return an array of find users by searchUsersDto', async () => {
      const response = await request(httpServer).get('/users/search').query(searchUsersDto)
      expect(response.status).toBe(200)
      expect(response.body.length).toEqual(1)
      expect(response.body[0].username).toEqual(searchUsersDto.username)
    })

    it('should return error by empty searchUsersDto', async () => {
      const response = await request(httpServer).get('/users/search').query({})
      expect(response.status).toBe(404)
      expect(response.body.message).toStrictEqual('Search fields should not be empty!')
    })
  })

  describe('getUserProfile', () => {

    it('should return user profile', async () => {
      const response = await request(httpServer).get(`/users/my-profile`)
      expect(response.status).toBe(200)
      expect(response.body.id).toEqual(user.id)
    })
  })

  describe('updateUserProfile', () => {
    const updateUserProfileDto: UpdateUserProfileDto = {
      firstName: 'Maks',
      lastName: 'Lastname'
    }

    it('should return updated user profile', async () => {
      const response = await request(httpServer).put(`/users/my-profile`).send(updateUserProfileDto)
      expect(response.status).toBe(200)
      expect(response.body.id).toEqual(user.id)
      expect(response.body.firstName).toEqual(updateUserProfileDto.firstName)
      expect(response.body.lastName).toEqual(updateUserProfileDto.lastName)
    })
  })

  describe('findOneUser', () => {

    it('should return one user', async () => {
      const response = await request(httpServer).get(`/users/${user.id}`)
      expect(response.status).toBe(200)
      expect(response.body.id).toEqual(user.id)
    })

    it('should return error by user not found with fake id', async () => {
      const response = await request(httpServer).get(`/users/${99999}`)
      expect(response.status).toBe(404)
      expect(response.body.message).toStrictEqual(`User with id "${99999}" was not found!`)
    })
  })

  describe('followUser', () => {

    it('should follow user', async () => {
      const response = await request(httpServer).post(`/users/${users[1].id}/follow`)
      expect(response.status).toBe(200)
      expect(response.body.id).toEqual(users[1].id)
      expect(response.body.followers.length).toEqual(1)
      expect(response.body.followers[0].username).toEqual(user.username)
    })

    it('should return error by user not found with fake id', async () => {
      const response = await request(httpServer).post(`/users/${99999}/follow`)
      expect(response.status).toBe(404)
      expect(response.body.message).toStrictEqual(`User with this id ${99999} was not found! Follow failed!`)
    })

    it('should return error by try to follow by himself', async () => {
      const response = await request(httpServer).post(`/users/${user.id}/follow`)
      expect(response.status).toBe(400)
      expect(response.body.message).toStrictEqual(`A user cannot subscribe to himself!`)
    })
  })

  describe('unfollowUser', () => {
    it('should return error by user not found with fake id', async () => {
      const response = await request(httpServer).delete(`/users/${99999}/follow`)
      expect(response.status).toBe(404)
      expect(response.body.message).toStrictEqual(`User with this id ${99999} was not found! Unfollow failed!`)
    })

    it('should unfollow user', async () => {
      const response = await request(httpServer).delete(`/users/${users[1].id}/follow`)
      expect(response.status).toBe(200)
      expect(response.body.followers.length).toEqual(0)
    })
  })

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const response = await request(httpServer).delete(`/users/${user.id}`)
      expect(response.status).toBe(200)
      expect(response.body).toStrictEqual({success: true, message: 'User has been deleted!'})
    })

    it('should return error by user not found by delete', async () => {
      const response = await request(httpServer).delete(`/users/${user.id}`)
      expect(response.status).toBe(404)
      expect(response.body.message).toStrictEqual(`User with id ${user.id} was not deleted!`)
    })
  })

})