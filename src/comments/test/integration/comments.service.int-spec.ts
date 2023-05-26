import {Test} from "@nestjs/testing";
import {AppModule} from "../../../app.module";
import {Repository} from "typeorm";
import {UserEntity} from "../../../user/entities/user.entity";
import {NotFoundException} from "@nestjs/common";
import {NewsEntity} from "../../../news/entities/news.entity";
import {CommentEntity} from "../../entities/comment.entity";
import {CommentsService} from "../../comments.service";
import {CreateCommentDto} from "../../dto/create-comment.dto";
import {UpdateCommentDto} from "../../dto/update-comment.dto";

describe('CommentsService Int', () =>  {
  let commentRepository: Repository<CommentEntity>
  let userRepository: Repository<UserEntity>
  let newsRepository: Repository<NewsEntity>
  let commentsService: CommentsService

  let user: UserEntity
  let news: NewsEntity
  let comment: CommentEntity

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile()

    commentRepository = module.get('CommentEntityRepository')
    userRepository = module.get('UserEntityRepository')
    newsRepository = module.get('NewsEntityRepository')
    commentsService = module.get(CommentsService)
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
    const comments = await commentRepository.find()
    for (const comment of comments) {
      await newsRepository.delete({id: comment.id})
    }
  })

  describe('createComment', () => {

    it('should create user and news', async () => {
      user = await userRepository.save({
        email: 'test-comment-user@gmail.com', username: 'test-comment-user', password: 'qwerty', isActivated: true
      })
      news = await newsRepository.save({
        title: 'news', body: 'body', slug: 'slug', author: user
      })
    })


    it('should create comment', async () => {
      const createCommentDto: CreateCommentDto = {
        text: 'Comment 1',
        newsSlug: news.slug
      }

      comment = await commentsService.createComment(createCommentDto, user)
      expect(comment.text).toEqual(createCommentDto.text)
      expect(comment.author).toEqual(user)
      expect(comment.newsId).toEqual(news.id)
    })
  })

  describe('findAllComments', () => {

    it('should create several comments for test', async () => {
      await commentsService.createComment({text: 'Comment 2', newsSlug: news.slug}, user)
      await commentsService.createComment({text: 'Comment 3', newsSlug: news.slug}, user)
    })

    it('should find all news', async () => {
      const comments = await commentsService.findAllComments()
      expect(comments.length).toEqual(3)
    })
  })

  describe('findOneComment', () => {

    it('should find one comment', async () => {
      const findComment = await commentsService.findOneComment(comment.id)
      expect(findComment.id).toEqual(comment.id)
      expect(findComment.text).toEqual(comment.text)
      expect(findComment.authorId).toEqual(user.id)
      expect(findComment.newsId).toEqual(news.id)
    })

    it('should throw error after not found comment', async () => {
      try {
        await commentsService.findOneComment(9999)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Comment with id "${9999}" was not found!`)
      }
    })
  })

  describe('updateComment', () => {
    const updateCommentDto: UpdateCommentDto = {
    text: 'Comment 111'
  }

    it('should find update comment', async () => {
      const updatedComment = await commentsService.updateComment(comment.id, updateCommentDto, user)
      expect(updatedComment.id).toEqual(comment.id)
      expect(updatedComment.text).toEqual(updateCommentDto.text)
      expect(updatedComment.authorId).toEqual(user.id)
      expect(updatedComment.newsId).toEqual(news.id)
    })

    it('should throw error after update fail', async () => {
      try {
        await commentsService.updateComment(9999, updateCommentDto, user)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Comment with id "${9999}" was not updated! Access Denied!`)
      }
    })
  })

  describe('deleteComment', () => {

    it('should throw error after no access user for delete', async () => {
      const createdUser = await userRepository.save({
        email: 'test-comment-user-2@gmail.com', username: 'test-comment-user-2', password: 'qwerty', isActivated: true
      })
      try {
        await commentsService.deleteComment(comment.id, createdUser)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Comment with id "${comment.id}" was not deleted! Access Denied!`)
      }
    })

    it('should delete one comment', async () => {
      const result = await commentsService.deleteComment(comment.id, user)
      expect(result).toStrictEqual({success: true, message: 'Comment has been deleted!'})
    })

    it('should throw error after not found comment', async () => {
      try {
        await commentsService.deleteComment(comment.id, user)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toContain(`Comment with id "${comment.id}" was not deleted! Access Denied!`)
      }
    })
  })
})