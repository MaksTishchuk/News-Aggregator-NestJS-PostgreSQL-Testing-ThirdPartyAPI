import {Test} from "@nestjs/testing";
import {AppModule} from "../../../app.module";
import {Repository} from "typeorm";
import {UserEntity} from "../../entities/user.entity";
import {UserService} from "../../user.service";
import {SearchUsersDto} from "../../dto/search-users.dto";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {UpdateUserProfileDto} from "../../dto/update-user-profile.dto";

describe('UserService Int', () =>  {
  let userRepository: Repository<UserEntity>
  let userService: UserService

  let user: UserEntity
  let users: UserEntity[]

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile()

    userRepository = module.get('UserEntityRepository')
    userService = module.get(UserService)
  })

  afterAll(async () => {
    const users = await userRepository.find()
    for (const user of users) {
      await userRepository.delete({id: user.id})
    }
  })

  describe('findAllUsers', () => {

    it('should create several users', async () => {
      user = await userRepository.save({
        email: 'test-user-1@gmail.com', username: 'test-user-1', password: 'qwerty', isActivated: true
      })
      await userRepository.save({
        email: 'test-user-2@gmail.com', username: 'test-user-2', password: 'qwerty', isActivated: true
      })
      await userRepository.save({
        email: 'test-user-3@gmail.com', username: 'test-user-3', password: 'qwerty', isActivated: true
      })
    })

    it('should find all user', async () => {
      const findUsers = await userService.findAllUsers()
      users = await userRepository.find()
      users.map(user => {
        delete user.password
        return user
      })
      expect(findUsers).toEqual(users)
    })
  })

  describe('searchUsers', () => {
    const searchUsersDto: SearchUsersDto = {
      username: 'test-user-1'
    }

    it('should search users', async () => {
      const findUsers = await userService.searchUsers(searchUsersDto)
      expect(findUsers).toEqual([users[0]])
    })

    it('should throw NotFoundException via no username and email in dto', async () => {
      try {
        await userService.searchUsers({})
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain('Search fields should not be empty!')
      }
    })
  })

  describe('findOneUser', () => {
    it('should find one user', async () => {
      const findUser = await userService.findOneUser(user.id)
      const userWithRelations = await userRepository.findOne({
        where: {id: user.id},
        relations: ['news', 'comments', 'followers', 'following']
      })
      delete userWithRelations.password
      expect(findUser).toEqual(userWithRelations)
    })

    it('should throw NotFoundException via user not found', async () => {
      try {
        await userService.findOneUser(999)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`User with id "${999}" was not found!`)
      }
    })
  })

  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      const profile = await userService.getUserProfile(user)
      const userWithRelations = await userRepository.findOne({
        where: {id: user.id},
        relations: ['news', 'comments']
      })
      delete userWithRelations.password
      expect(profile).toEqual(userWithRelations)
    })
  })

  describe('followUser', () => {
    it('should follow on user', async () => {
      const followUser = await userService.followUser(users[2], users[1].id)
      expect(followUser.followers.length).toEqual(1)
    })

    it('should throw NotFoundException via user not found', async () => {
      try {
        await userService.followUser(users[2],999)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`User with this id ${999} was not found! Follow failed!`)
      }
    })

    it('should throw BadRequestException via user try to follow to himself', async () => {
      try {
        await userService.followUser(users[2],users[2].id)
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
        expect(error.message).toContain(`A user cannot subscribe to himself!`)
      }
    })
  })

  describe('unfollowUser', () => {
    it('should unfollow from user', async () => {
      const followUser = await userService.unfollowUser(users[2], users[1].id)
      expect(followUser.followers.length).toEqual(0)
    })

    it('should throw NotFoundException via user not found', async () => {
      try {
        await userService.unfollowUser(users[2],999)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`User with this id ${999} was not found! Unfollow failed!`)
      }
    })
  })

  describe('updateUserProfile', () => {

    let updateUserProfileDto: UpdateUserProfileDto = {
      firstName: 'Maks',
      lastName: 'Lastname'
    }

    it('should update one user', async () => {
      const updatedUser = await userService.updateUserProfile(user, updateUserProfileDto, '')
      expect(updatedUser.firstName).toEqual(updateUserProfileDto.firstName)
      expect(updatedUser.lastName).toEqual(updateUserProfileDto.lastName)
    })

    it('should throw NotFoundException via user not found', async () => {
      try {
        users[2].id = 999
        await userService.updateUserProfile(users[2], updateUserProfileDto, '')
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
      }
    })
  })

  describe('deleteUser', () => {
    it('should delete one user', async () => {
      const result = await userService.deleteUser(user.id)
      expect(result).toEqual({success: true, message: 'User has been deleted!'})
    })

    it('should throw NotFoundException via user not found before delete', async () => {
      try {
        await userService.deleteUser(user.id)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`User with id ${user.id} was not deleted!`)
      }
    })
  })

})