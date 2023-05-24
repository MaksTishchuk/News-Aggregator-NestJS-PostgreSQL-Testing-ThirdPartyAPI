import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {FileService} from "../file/file.service";
import {ILike, Repository} from "typeorm";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {SearchUsersDto} from "./dto/search-users.dto";
import {MockUser} from "../../test/mock-const";
import {NotFoundException} from "@nestjs/common";
import {GenderEnum} from "./entities/enum/gender.enum";

describe('UserService', () => {
  let userService: UserService
  let userRepository: Repository<UserEntity>
  let fileService: FileService

  const mockUser: UserEntity = MockUser

  const mockUserList = [
    {...mockUser},
    {...mockUser, id: 2, username: 'maks2', email: 'maks2@gmail.com'},
    {...mockUser, id: 3, username: 'maks3', email: 'maks3@gmail.com'}
  ]

  let mockUpdateUserProfileDto: UpdateUserProfileDto = {
    firstName: 'Maks',
    lastName: 'Lastname'
  }

  const mockSearchUsersDto: SearchUsersDto = {
    username: 'maks'
  }

  const mockUserRepository = {
    find: jest.fn(() => mockUserList),
    findBy: jest.fn((mockSearchUsersDto) => [mockUser]),
    createQueryBuilder: jest.fn(),
    findOne: jest.fn((id) => mockUser),
    update: jest.fn((id, mockUpdateUserProfileDto) => Promise.resolve({affected: 1})),
    delete: jest.fn((id) => Promise.resolve({affected: 1})),
    save: jest.fn()
  }
  const mockFileService = {
    removeFile: jest.fn(),
    createFile: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository
        },
        {
          provide: FileService,
          useValue: mockFileService
        }
      ],
    }).compile();

    userService = module.get<UserService>(UserService)
    fileService = module.get<FileService>(FileService)
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity))

    jest.clearAllMocks()
  });

  it('should be defined userService', () => {
    expect(userService).toBeDefined();
  });

  it('should be defined fileService', () => {
    expect(fileService).toBeDefined();
  });

  it('should be defined userRepository', () => {
    expect(userRepository).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should find all users', async () => {
      const findSpy = jest.spyOn(mockUserRepository, 'find')
      const users = await userService.findAllUsers()
      expect(users).toEqual(mockUserList)
      expect(findSpy).toHaveBeenCalled()
      expect(findSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('searchUsers', () => {
    it('should find users by SearchUsersDto', async () => {
      const findBySpy = jest.spyOn(mockUserRepository, 'findBy')
      const user = await userService.searchUsers(mockSearchUsersDto)
      expect(user).toEqual([mockUser])
      expect(findBySpy).toHaveBeenCalledTimes(1)
      expect(findBySpy).toHaveBeenCalledWith([
        {username: ILike(`%${mockSearchUsersDto.username}%`)},
        {email: ILike(`%${mockSearchUsersDto.email}%`)}
      ])
    })

    it('should throw error if SearchUsersDto without username and email', async () => {
      try {
        await userService.searchUsers({})
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain('Search fields should not be empty!')
      }
    })
  })

  describe('findOneUser', () => {
    it('should find user', async () => {
      const createQueryBuilder: any = {
        leftJoinAndSelect: () => createQueryBuilder,
        where: () => createQueryBuilder,
        getOne: () => mockUser
      }
      jest.spyOn(mockUserRepository, 'createQueryBuilder').mockImplementation(() => createQueryBuilder)
      const user = await userService.findOneUser(mockUser.id)
      expect(user).toEqual(mockUser)
    })

    it('should throw user not found error', async () => {
      jest.spyOn(mockUserRepository, 'createQueryBuilder').mockImplementation(() => null)
      try {
        const user = await userService.findOneUser(mockUser.id)
        expect(user).toEqual(mockUser)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`User with id "${mockUser.id}" was not found!`)
      }
    })
  })

  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      const createMockQueryBuilder: any = {
        leftJoinAndSelect: () => createMockQueryBuilder,
        where: () => createMockQueryBuilder,
        getOne: () => mockUser
      }
      const createQueryBuilder = jest.spyOn(mockUserRepository, 'createQueryBuilder').mockImplementation(() => createMockQueryBuilder)
      const user = await userService.getUserProfile(mockUser)
      expect(user).toEqual(mockUser)
      expect(createQueryBuilder).toHaveBeenCalled()
      expect(createQueryBuilder).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const findOneSpy = jest.spyOn(mockUserRepository, 'findOne')
      const updateSpy = jest.spyOn(mockUserRepository, 'update')
      const mockUpdateUserProfileWithGenderDto = {...mockUpdateUserProfileDto, gender: GenderEnum.MALE}
      const mockUpdatedUser = {...MockUser, ...mockUpdateUserProfileWithGenderDto}
      const createQueryBuilder: any = {
        leftJoinAndSelect: () => createQueryBuilder,
        where: () => createQueryBuilder,
        getOne: () => mockUpdatedUser
      }
      jest.spyOn(mockUserRepository, 'createQueryBuilder').mockImplementation(() => createQueryBuilder)
      const user = await userService.updateUserProfile(mockUser, mockUpdateUserProfileWithGenderDto, '')
      expect(user).toEqual(mockUpdatedUser)
      expect(findOneSpy).toHaveBeenCalledWith({where:  {id: mockUser.id}})
      expect(findOneSpy).toHaveBeenCalledTimes(1)
      expect(updateSpy).toHaveBeenCalled()
      expect(updateSpy).toHaveBeenCalledTimes(1)
    })

    it('should throw error on update user', async () => {
      mockUserRepository.update = jest.fn().mockResolvedValue({affected: false})
      try {
        await userService.updateUserProfile(mockUser, mockUpdateUserProfileDto, '')
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Something went wrong! ${error.response}`)
      }
    })
  })

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const deleteSpy = jest.spyOn(mockUserRepository, 'delete')
      const response = await userService.deleteUser(mockUser.id)
      expect(response).toStrictEqual({success: true, message: 'User has been deleted!'})
      expect(deleteSpy).toHaveBeenCalledTimes(1)
      expect(deleteSpy).toHaveBeenCalledWith({id: mockUser.id})
    })

    it('should throw error on delete user', async () => {
      mockUserRepository.delete = jest.fn().mockResolvedValue({affected: false})
      try {
        await userService.deleteUser(mockUser.id)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`User with id ${mockUser.id} was not deleted!`)
      }
    })
  })

});
