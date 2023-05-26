import {
  Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, UseInterceptors, UploadedFile,
  ParseIntPipe, BadRequestException, NotFoundException, HttpException, HttpStatus,
  ConflictException, InternalServerErrorException, HttpCode
} from '@nestjs/common';
import {UserService} from './user.service';
import {UserEntity} from "./entities/user.entity";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {AdminRoleGuard} from "./guards/admin-role.guard";
import {GetUser} from "../auth/decorators/get-user.decorator";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {
  ApiBadRequestResponse, ApiConflictResponse, ApiConsumes, ApiInternalServerErrorResponse,
  ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags
} from "@nestjs/swagger";

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @ApiOkResponse({type: [UserEntity]})
  @ApiOperation({description: 'Get all users'})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @Get()
  findAllUsers(): Promise<UserEntity[]> {
    return this.userService.findAllUsers()
  }

  @ApiOkResponse({type: [UserEntity]})
  @ApiOperation({description: 'Get users by search params'})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @Get('/search')
  searchUsers(
    @Query() searchUsersDto: SearchUsersDto
  ): Promise<UserEntity[]> {
    return this.userService.searchUsers(searchUsersDto)
  }

  @ApiOkResponse({type: UserEntity})
  @ApiOperation({description: 'Get user profile'})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`User with id was not found!`)}})
  @ApiSecurity('bearer')
  @Get('/my-profile')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@GetUser() user: UserEntity): Promise<UserEntity> {
    return this.userService.getUserProfile(user)
  }

  @ApiOkResponse({type: UserEntity})
  @ApiBadRequestResponse({schema: {example: new HttpException(`User with ID has not been updated!`, HttpStatus.BAD_REQUEST)}})
  @ApiConflictResponse({schema: {example: new ConflictException('Gender should be only Male, Female and Unselected!')}})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`User with id has not been updated!`)}})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @ApiSecurity('bearer')
  @ApiConsumes('multipart/form-data')
  @Put('/my-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  updateUserProfile(
    @GetUser() user: UserEntity,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @UploadedFile() avatar
  ): Promise<UserEntity> {
    return this.userService.updateUserProfile(user, updateUserProfileDto, avatar)
  }

  @ApiOkResponse({type: UserEntity})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`User with id was not found!`)}})
  @Get(':id')
  findOneUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.userService.findOneUser(+id)
  }

  @ApiOkResponse({type: UserEntity})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`User with this id was not found! Follow failed!`)}})
  @ApiBadRequestResponse({schema: {example: new BadRequestException(`A user cannot subscribe to himself!`)}})
  @ApiSecurity('bearer')
  @Post('/:id/follow')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  followUser(
    @GetUser() user: UserEntity,
    @Param('id', ParseIntPipe) followUserId: number
  ) {
    return this.userService.followUser(user, followUserId)
  }

  @ApiOkResponse({type: UserEntity})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`User with this id was not found! Unfollow failed!`)}})
  @ApiSecurity('bearer')
  @Delete('/:id/follow')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  unfollowUser(
    @GetUser() user: UserEntity,
    @Param('id', ParseIntPipe) followUserId: number
  ) {
    return this.userService.unfollowUser(user, followUserId)
  }

  @ApiOkResponse({
    description: 'success: true, message: `User has been deleted!`',
    schema: {
      example: {
        success: true,
        message: 'User has been deleted!'
      }
    }
  })
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`User with id was not deleted!`)}})
  @ApiSecurity('bearer')
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(+id)
  }

}
