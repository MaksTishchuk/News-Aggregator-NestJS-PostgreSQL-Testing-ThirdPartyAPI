import {
  Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query, UseInterceptors, UploadedFiles,
  InternalServerErrorException, NotFoundException, BadRequestException
} from '@nestjs/common';
import {NewsService} from './news.service';
import {CreateNewsDto} from './dto/create-news.dto';
import {UpdateNewsDto} from './dto/update-news.dto';
import {NewsEntity} from "./entities/news.entity";
import {UserEntity} from "../user/entities/user.entity";
import {SearchNewsDto} from "./dto/search-news.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetUser} from "../auth/decorators/get-user.decorator";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {
  ApiBadRequestResponse, ApiConsumes, ApiInternalServerErrorResponse, ApiNotFoundResponse,
  ApiOkResponse, ApiOperation, ApiSecurity, ApiTags
} from "@nestjs/swagger";

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {
  }

  @ApiOkResponse({type: NewsEntity})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @ApiSecurity('bearer')
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{name: 'images', maxCount: 10}]))
  createNews(
    @GetUser() user: UserEntity,
    @Body() createNewsDto: CreateNewsDto,
    @UploadedFiles() images
  ): Promise<NewsEntity> {
    return this.newsService.createNews(createNewsDto, user, images);
  }

  @ApiOkResponse({type: [NewsEntity]})
  @ApiOperation({description: 'Get all news'})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @Get()
  findAllNews(): Promise<NewsEntity[]> {
    return this.newsService.findAllNews();
  }

  @ApiOkResponse({type: [NewsEntity]})
  @ApiOperation({description: 'Get news by search params'})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @Get('/search')
  searchNews(
    @Query() searchNewsDto: SearchNewsDto
  ) {
    return this.newsService.searchNews(searchNewsDto)
  }

  @ApiOkResponse({type: [NewsEntity]})
  @ApiOperation({description: 'Get news of following users'})
  @ApiInternalServerErrorResponse({schema: {example: new InternalServerErrorException('Something went wrong!')}})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`User with id has not been updated!`)}})
  @ApiSecurity('bearer')
  @Get('/following-users-news')
  @UseGuards(JwtAuthGuard)
  followingUsersNews(@GetUser() user: UserEntity): Promise<NewsEntity[]> {
    return this.newsService.followingUsersNews(user);
  }

  @ApiOkResponse({type: NewsEntity})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`News with slug was not found!`)}})
  @Get('/:slug')
  @UseGuards(JwtAuthGuard)
  findOneNews(@Param('slug') slug: string): Promise<NewsEntity> {
    return this.newsService.findOneNews(slug);
  }

  @ApiOkResponse({type: NewsEntity})
  @ApiBadRequestResponse({schema: {example: new NotFoundException(`News with slug was not updated!`)}})
  @ApiNotFoundResponse({schema: {example: new BadRequestException(`News with slug was not updated! Access denied!`)}})
  @ApiSecurity('bearer')
  @ApiConsumes('multipart/form-data')
  @Put('/:slug')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{name: 'images', maxCount: 10}]))
  updateNews(
    @GetUser() user: UserEntity,
    @Param('slug') slug: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @UploadedFiles() images
  ): Promise<NewsEntity> {
    return this.newsService.updateNews(slug, updateNewsDto, user, images);
  }

  @ApiOkResponse({
    description: 'success: true, message: `News has been deleted!`',
    schema: {
      example: {
        success: true,
        message: 'News has been deleted!'
      }
    }
  })
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`News with slug was not deleted!`)}})
  @ApiBadRequestResponse({schema: {example: new BadRequestException(`News with slug was not deleted! Access denied!`)}})
  @ApiSecurity('bearer')
  @Delete('/:slug')
  @UseGuards(JwtAuthGuard)
  deleteNews(
    @GetUser() user: UserEntity,
    @Param('slug') slug: string
  ) {
    return this.newsService.deleteNews(slug, user);
  }

  @ApiOkResponse({type: NewsEntity})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`News with this slug was not found!`)}})
  @ApiSecurity('bearer')
  @Post('/:slug/like')
  @UseGuards(JwtAuthGuard)
  async likeNews(
    @GetUser() user: UserEntity,
    @Param('slug') newsSlug: string
  ) {
    return this.newsService.likeNews(newsSlug, user);
  }

  @ApiOkResponse({type: NewsEntity})
  @ApiNotFoundResponse({schema: {example: new NotFoundException(`News with this slug was not found!`)}})
  @ApiSecurity('bearer')
  @Delete('/:slug/like')
  @UseGuards(JwtAuthGuard)
  async unlikeNews(
    @GetUser() user: UserEntity,
    @Param('slug') newsSlug: string
  ) {
    return this.newsService.unlikeNews(newsSlug, user);
  }
}
