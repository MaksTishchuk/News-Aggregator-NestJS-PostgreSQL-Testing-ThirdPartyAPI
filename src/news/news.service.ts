import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import * as lodash from 'lodash'
import {NewsEntity} from "./entities/news.entity";
import {UserEntity} from "../user/entities/user.entity";
import {SearchNewsDto} from "./dto/search-news.dto";
import {UserRoleEnum} from "../user/entities/enum/user-role.enum";
import {ImageEntity} from "./entities/images.entity";
import {FileService} from "../file/file.service";

@Injectable()
export class NewsService {

  constructor(
    @InjectRepository(NewsEntity) private newsRepository: Repository<NewsEntity>,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ImageEntity) private imageRepository: Repository<ImageEntity>,
    private fileService: FileService
  ) {}

  async createNews(createNewsDto: CreateNewsDto, user: UserEntity, images): Promise<NewsEntity> {
    const news = this.newsRepository.create({...createNewsDto, author: user})
    await this.newsRepository.save(news)
    let newsFromDb = await this.newsRepository.findOne({where: {slug: news.slug}, relations: ['images']})
    if (images && images.images) {
      for (const image of images.images) {
        const thisImage = this.fileService.createFile(image)
        const newImage = this.imageRepository.create({url: thisImage, news: newsFromDb})
        await this.imageRepository.save(newImage)
        newsFromDb.images.push(newImage)
      }
    }
    return newsFromDb
  }

  async findAllNews(): Promise<NewsEntity[]> {
    return await this.newsRepository.find({relations: ['author', 'comments', 'comments.author', 'images'], order: {created: 'DESC'}})
  }

  async searchNews(searchNewsDto: SearchNewsDto) {
    const qb = this.newsRepository.createQueryBuilder('n')
    qb.take(searchNewsDto.take || 10)
    qb.skip(searchNewsDto.skip || 0)
    if (searchNewsDto.views) {
      qb.orderBy('views', searchNewsDto.views || 'DESC')
    } else {
      qb.orderBy('created', 'DESC')
    }
    if (searchNewsDto.title) {
      qb.orWhere(`n.title ILIKE :title`)
    }
    if (searchNewsDto.body) {
      qb.orWhere(`n.body ILIKE :body`)
    }
    qb.setParameters({
      title: `%${searchNewsDto.title}%`,
      body: `%${searchNewsDto.body}%`
    })

    const [news, total] = await qb.getManyAndCount()
    return {news, total}
  }

  async followingUsersNews(user: UserEntity): Promise<NewsEntity[]> {
    const foundUser = await this.userRepository.findOne({where: {id: user.id}, relations: ['following', 'following.news']})
    if (!foundUser) {
      throw new NotFoundException(`User with id ${user.id} was not found!`)
    }
    let followingUsersNews = []
    foundUser.following.forEach(user => {
      followingUsersNews.push(...user.news)
    })
    let sortedNews = lodash.sortBy(followingUsersNews, 'created').reverse()
    return sortedNews
  }

  async findOneNews(slug: string): Promise<NewsEntity> {
    const news = await this.findNewsBySlug(slug)
    news.views += 1
    await this.newsRepository.save(news)
    return news
  }

  async findNewsBySlug(slug: string): Promise<NewsEntity> {
    const news = await this.newsRepository.findOne({where: {slug}, relations: ['author', 'comments', 'comments.author', 'images']})
    if (!news) {
      throw new NotFoundException(`News with slug "${slug}" was not found!`)
    }
    return news
  }

  async updateNews(slug: string, updateNewsDto: UpdateNewsDto, user: UserEntity, images): Promise<NewsEntity> {
    let news = await this.findNewsBySlug(slug)
    if (news.authorId === user.id || user.role === UserRoleEnum.ADMIN) {
      const updatedNews = await this.newsRepository.update({slug: slug}, updateNewsDto)
      if (!updatedNews.affected) {
        throw new NotFoundException(`News with slug "${slug}" was not updated!`)
      }
      if (images && images.images) {
        const imagesOnDelete = await this.imageRepository.find({where: {newsId: news.id}})
        let imagesIds = []
        for (const image of imagesOnDelete) {
          this.fileService.removeFile(image.url)
          imagesIds.push(image.id)
        }
        try {
          await this.imageRepository.createQueryBuilder()
            .delete()
            .from(ImageEntity)
            .where('images.id IN (:...ids)', { ids: imagesIds })
            .execute()
        } catch (error) {console.log('Images for delete not found!')}

        for (const image of images.images) {
          const thisImage = this.fileService.createFile(image)
          const newImage = this.imageRepository.create({url: thisImage, news: news})
          await this.imageRepository.save(newImage)
          news.images.push(newImage)
        }
      }
      return await this.findNewsBySlug(slug)
    } else {
      throw new BadRequestException(`News with slug "${slug}" was not updated! Access denied!`)
    }
  }

  async deleteNews(slug: string, user: UserEntity) {
    let news = await this.findNewsBySlug(slug)
    if (news.authorId === user.id || user.role === UserRoleEnum.ADMIN) {
      const imagesOnDelete = await this.imageRepository.find({where: {newsId: news.id}})
      const result = await this.newsRepository.delete({slug: slug})
      if (!result.affected) {
        throw new NotFoundException(`News with slug "${slug}" was not deleted!`)
      }
      if (imagesOnDelete) {
        for (const image of imagesOnDelete) {
          this.fileService.removeFile(image.url)
        }
      }
      return {success: true, message: 'News has been deleted!'}
    } else {
      throw new BadRequestException(`News with slug "${slug}" was not deleted! Access denied!`)
    }
  }

  async likeNews(newsSlug: string, user: UserEntity) {
    const news = await this.findNewsBySlug(newsSlug)
    news.likedByUsers.push(user)
    await this.newsRepository.save(news)
    return this.findNewsBySlug(news.slug)
  }

  async unlikeNews(newsSlug: string, user: UserEntity) {
    const news = await this.findNewsBySlug(newsSlug)
    news.likedByUsers = news.likedByUsers.filter(likeUser => likeUser.id !== user.id)
    await this.newsRepository.save(news)
    return this.findNewsBySlug(news.slug)
  }
}
