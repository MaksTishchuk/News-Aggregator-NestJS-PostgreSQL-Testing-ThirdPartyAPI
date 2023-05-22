import {
  BadRequestException, ConflictException, HttpException, HttpStatus, Injectable,
  InternalServerErrorException, NotFoundException
} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {ILike, Repository} from "typeorm";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {FileService} from "../file/file.service";

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private fileService: FileService
  ) {}

  async findAllUsers(): Promise<UserEntity[]> {
    // const users = await this.userRepository.createQueryBuilder('user')
    //   .select(['user.id', 'user.username', 'user.email', 'user.created', 'user.updated'])
    //   .getMany()
    const users = await this.userRepository.find()
    return users.map(user => {
        delete user.password
        return user
    })
  }

  async searchUsers(searchUsersDto: SearchUsersDto): Promise<UserEntity[]> {
    if (!searchUsersDto.username && !searchUsersDto.email) {
      throw new NotFoundException('Search fields should not be empty!')
    }
    const users = await this.userRepository.findBy([
      {username: ILike(`%${searchUsersDto.username}%`)}, {email: ILike(`%${searchUsersDto.email}%`)}
    ])
    return users.map(user => {
        delete user.password
        return user
    })
  }

  async findOneUser(id: number): Promise<UserEntity> {
    try {
      const user = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect("user.news", "news")
        .leftJoinAndSelect("user.comments", "comments")
        .leftJoinAndSelect("user.followers", "followers")
        .leftJoinAndSelect("user.following", "following")
        .where("user.id = :id", {id: id})
        .getOne()
      delete user.password
      return user
    } catch (error) {throw new NotFoundException(`User with id "${id}" was not found!`)}
  }

  async getUserProfile(user: UserEntity): Promise<UserEntity> {
    const profile = await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect("user.news", "news")
      .leftJoinAndSelect("user.comments", "comments")
      .where("user.id = :id", { id: user.id })
      .getOne()
    delete profile.password
    return profile
  }

  async updateUserProfile(user: UserEntity, updateUserProfileDto: UpdateUserProfileDto, avatar): Promise<UserEntity> {
    try {
      let {firstName, lastName, phoneNumber, country, city, gender} = updateUserProfileDto
      const userProfile = await this.userRepository.findOne({where:  {id: user.id}})
      if (!userProfile) throw new HttpException(`User with ID "${user.id}" has not been updated!`, HttpStatus.BAD_REQUEST)
      if (avatar) {
        this.fileService.removeFile(userProfile.avatar)
        avatar = this.fileService.createFile(avatar)
      }
      const updatedUser = await this.userRepository.update(
        {id: user.id},
        {
          firstName: typeof firstName !== 'undefined' ? firstName : userProfile.firstName,
          lastName: typeof lastName !== 'undefined' ? lastName : userProfile.lastName,
          phoneNumber: typeof phoneNumber !== 'undefined' ? phoneNumber : userProfile.phoneNumber,
          country: typeof country !== 'undefined' ? country : userProfile.country,
          city: typeof city !== 'undefined' ? city : userProfile.city,
          gender: typeof gender !== 'undefined' ? gender : userProfile.gender,
          avatar: typeof avatar !== 'undefined' ? avatar : userProfile.avatar,
        }
      )
      if (!updatedUser.affected) {
        throw new NotFoundException(`User with id "${user.id}" has not been updated!`)
      }
      return await this.findOneUser(user.id)
    } catch (error) {
      if (error.code === '22P02') {
        throw new ConflictException('Gender should be only Male, Female and Unselected!')
      }
      throw new InternalServerErrorException('Something went wrong!')
    }
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete({id})
    if (!result.affected) {
      throw new NotFoundException(`User with id ${id} was not deleted!`)
    }
    return {success: true, message: 'User has been deleted!'}
  }

  async followUser(user: UserEntity, followUserId: number) {
    const foundUser = await this.userRepository.findOne({where: {id: followUserId}, relations: ['followers']})
    if (!foundUser) {
      throw new NotFoundException(`User with this id ${followUserId} was not found! Follow failed!`)
    }
    if (foundUser.id === user.id) {
      throw new BadRequestException(`A user cannot subscribe to himself!`)
    }
    foundUser.followers.push(user)
    await this.userRepository.save(foundUser)
    return this.findOneUser(followUserId)
  }

  async unfollowUser(user: UserEntity, followUserId: number) {
    const foundUser = await this.userRepository.findOne({where: {id: followUserId}, relations: ['followers']})
    if (!foundUser) {
      throw new NotFoundException(`User with this id ${followUserId} was not found! Unfollow failed!`)
    }
    foundUser.followers = foundUser.followers.filter(follower => follower.id !== user.id)
    await this.userRepository.save(foundUser)
    return this.findOneUser(followUserId)
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findOne({where: {email}})
  }
}
