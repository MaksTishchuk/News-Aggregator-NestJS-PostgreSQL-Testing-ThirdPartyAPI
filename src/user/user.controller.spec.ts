import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {UserEntity} from "./entities/user.entity";
import {MockUser} from "../../test/mock-const";
import * as httpMocks from "node-mocks-http";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {SearchUsersDto} from "./dto/search-users.dto";

describe('UserController', () => {
  let userController: UserController;

  const mockUser: UserEntity = MockUser

  const mockUserList = [
    {...mockUser},
    {...mockUser, id: 3, username: 'maks3', email: 'maks3@gmail.com'},
    {...mockUser, id: 4, username: 'maks4', email: 'maks4@gmail.com'}
  ]

  const mockRequest = httpMocks.createRequest()
  mockRequest.user = mockUser

  const mockUpdateUserProfileDto: UpdateUserProfileDto = {
    firstName: 'Maks',
    lastName: 'Lastname'
  }

  const mockSearchUsersDto: SearchUsersDto = {
    username: 'maks'
  }

  const mockUserService = {
    findAllUsers: jest.fn().mockImplementation(() => {
      return mockUserList
    }),

    searchUsers: jest.fn().mockImplementation((searchUsersDto: SearchUsersDto) => {
      return mockUserList.filter(user => user.username === searchUsersDto.username)
    }),

    getUserProfile: jest.fn().mockImplementation((user: UserEntity) => {
      return {...mockUser, id: user.id}
    }),

    updateUserProfile: jest.fn().mockImplementation((user: UserEntity, updateUserProfileDto: UpdateUserProfileDto, avatar=[]) => {
      return {...mockUser, id: user.id, ...updateUserProfileDto}
    }),

    findOneUser: jest.fn().mockImplementation((id: number) => {
      return {...mockUser, id}
    }),

    deleteUser: jest.fn().mockImplementation((id: number) => {
      return {success: true, message: 'User has been deleted!'}
    })

  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('should find all users', () => {
    expect(userController.findAllUsers()).toEqual(mockUserList)
    expect(userController.findAllUsers()).toHaveLength(3)
    expect(mockUserService.findAllUsers).toHaveBeenCalledWith()
  })

  it('should find user with same username', () => {
    expect(userController.searchUsers(mockSearchUsersDto)).toEqual(
      mockUserList.filter(user => user.username === mockSearchUsersDto.username)
    )
    expect(userController.searchUsers(mockSearchUsersDto)).toHaveLength(1)
    expect(mockUserService.searchUsers).toHaveBeenCalledWith(mockSearchUsersDto)
  })

  it('should get user profile', () => {
    expect(userController.getUserProfile(mockUser)).toEqual({...mockUser, id: mockUser.id})
    expect(mockUserService.getUserProfile).toHaveBeenCalledWith(mockUser)
  })

  it('should update user profile', () => {
    expect(userController.updateUserProfile(mockUser, mockUpdateUserProfileDto, [])).toEqual(
      {...mockUser, id: mockUser.id, ...mockUpdateUserProfileDto}
    )
    expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(mockUser, mockUpdateUserProfileDto, [])
  })

  it('should find one user', () => {
    expect(userController.findOneUser(1)).toEqual(mockUser)
    expect(mockUserService.findOneUser).toHaveBeenCalledWith(1)
  })

  it('should delete user', () => {
    expect(userController.deleteUser(1)).toStrictEqual(
      {success: true, message: 'User has been deleted!'}
    )
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(1)
  })

});
