import {Test} from "@nestjs/testing";
import {AppModule} from "../../../app.module";
import {Repository} from "typeorm";
import {UserEntity} from "../../../user/entities/user.entity";
import {NewsEntity} from "../../entities/news.entity";
import {CreateNewsDto} from "../../dto/create-news.dto";
import {SearchNewsDto} from "../../dto/search-news.dto";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {UpdateNewsDto} from "../../dto/update-news.dto";
import {JwtAuthGuard} from "../../../auth/guards/jwt-auth.guard";
import {AdminRoleGuard} from "../../../user/guards/admin-role.guard";
import * as request from "supertest";

describe('NewsService Int', () =>  {
  let app: any
  let httpServer: any
  let userRepository: Repository<UserEntity>
  let newsRepository: Repository<NewsEntity>

  let user: UserEntity
  let notAuthorUser: UserEntity
  let slug: string

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
    newsRepository = module.get('NewsEntityRepository')
  })

  afterAll(async () => {
    const users = await userRepository.find()
    for (const user of users) {
      await userRepository.delete({id: user.id})
    }
    const news = await newsRepository.find()
    for (const n of news) {
      await newsRepository.delete({id: n.id})
    }
    await app.close()
  })

  describe('createNews', () => {

    const createNewsDto: CreateNewsDto = {
      title: "news 10",
      body: "body 10"
    }

    it('should create user', async () => {
      user = await userRepository.save({
        email: 'test-user-news-controller@gmail.com', username: 'test-user-news-controller', password: 'qwerty', isActivated: true
      })
    })

    it('should create news', async () => {
      const response = await request(httpServer).post('/news').send(createNewsDto)
      expect(response.status).toBe(201)
      expect(response.body.title).toEqual(createNewsDto.title)
      expect(response.body.body).toEqual(createNewsDto.body)
      expect(response.body.views).toEqual(0)
      slug = response.body.slug
    })
  })

  describe('findAllNews', () => {

    it('should create several news for test', async () => {
      await newsRepository.save({title: 'news 20', slug: 'news-20', body: 'body 20', author: user})
      await newsRepository.save({title: 'news 30', slug: 'news-30', body: 'body 30', author: user})
    })

    it('should find all news', async () => {
      const response = await request(httpServer).get('/news')
      expect(response.status).toBe(200)
      expect(response.body.length).toEqual(3)
    })
  })

  describe('searchNews', () => {

    const searchNewsDto: SearchNewsDto = {
      skip: 1,
      take: 2
    }

    it('should search news', async () => {
      const response = await request(httpServer).get('/news/search').query(searchNewsDto)
      expect(response.status).toBe(200)
      expect(response.body.total).toEqual(3)
      expect(response.body.news.length).toEqual(2)
    })
  })

  describe('findOneNews', () => {

    it('should find one news', async () => {
      const response = await request(httpServer).get(`/news/${slug}`)
      expect(response.status).toBe(200)
      expect(response.body.slug).toEqual(slug)
      expect(response.body.views).toEqual(1)
    })

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug'
      const response = await request(httpServer).get(`/news/${testSlug}`)
      expect(response.status).toBe(404)
      expect(response.body.message).toEqual(`News with slug "${testSlug}" was not found!`)
    })
  })

  describe('updateNews', () => {
    const updateNewsDto: UpdateNewsDto = {
      title: 'news 111',
      body: 'body 111'
    }

    it('should find update news', async () => {
      const response = await request(httpServer).put(`/news/${slug}`).send(updateNewsDto)
      expect(response.status).toBe(200)
      expect(response.body.slug).toEqual(slug)
      expect(response.body.title).toEqual(updateNewsDto.title)
      expect(response.body.body).toEqual(updateNewsDto.body)
    })

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug'
      const response = await request(httpServer).put(`/news/${testSlug}`).send(updateNewsDto)
      expect(response.status).toBe(404)
      expect(response.body.message).toEqual(`News with slug "${testSlug}" was not found!`)
    })
  })

  describe('likeNews', () => {
    it('should like news', async () => {
      const response = await request(httpServer).post(`/news/${slug}/like`)
      expect(response.status).toBe(200)
      expect(response.body.slug).toEqual(slug)
      expect(response.body.likedByUsers.length).toEqual(1)
    })

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug'
      const response = await request(httpServer).post(`/news/${testSlug}/like`)
      expect(response.status).toBe(404)
      expect(response.body.message).toEqual(`News with slug "${testSlug}" was not found!`)
    })
  })

  describe('unlikeNews', () => {
    it('should unlike news', async () => {
      const response = await request(httpServer).delete(`/news/${slug}/like`)
      expect(response.status).toBe(200)
      expect(response.body.slug).toEqual(slug)
      expect(response.body.likedByUsers.length).toEqual(0)
    })

    it('should throw error after not found news', async () => {
      const testSlug = 'test-slug'
      const response = await request(httpServer).delete(`/news/${testSlug}/like`)
      expect(response.status).toBe(404)
      expect(response.body.message).toStrictEqual(`News with slug "${testSlug}" was not found!`)
    })
  })

  describe('deleteNews', () => {

    it('should delete one news', async () => {
      const response = await request(httpServer).delete(`/news/${slug}`)
      expect(response.status).toBe(200)
      expect(response.body).toStrictEqual({success: true, message: 'News has been deleted!'})
    })

    it('should throw error after not found news', async () => {
      const response = await request(httpServer).delete(`/news/${slug}`)
      expect(response.status).toBe(404)
      expect(response.body.message).toStrictEqual(`News with slug "${slug}" was not found!`)
    })
  })
})