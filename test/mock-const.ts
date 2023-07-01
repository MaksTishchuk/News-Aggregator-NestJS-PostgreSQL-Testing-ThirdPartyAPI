import { UserEntity } from '../src/user/entities/user.entity';
import { GenderEnum } from '../src/user/entities/enum/gender.enum';
import { UserRoleEnum } from '../src/user/entities/enum/user-role.enum';
import { NewsEntity } from '../src/news/entities/news.entity';
import { CommentEntity } from '../src/comments/entities/comment.entity';

export const MockUser: UserEntity = {
  avatar: '',
  city: '',
  comments: [],
  country: '',
  created: new Date(),
  email: 'maks@gmail.com',
  firstName: '',
  followers: [],
  followersCount: 0,
  following: [],
  followingCount: 0,
  gender: GenderEnum.UNSELECTED,
  id: 1,
  isActivated: true,
  lastName: '',
  likesNews: [],
  news: [],
  password: 'Qwerty123',
  phoneNumber: '',
  role: UserRoleEnum.MEMBER,
  updated: new Date(),
  username: 'maks',
};

export const MockNews: NewsEntity = {
  id: 1,
  title: 'news 1',
  slug: 'news-1',
  body: 'body 1',
  author: MockUser,
  authorId: MockUser.id,
  comments: [],
  created: new Date(),
  images: [],
  likedByUsers: [],
  likesCount: 0,
  updated: new Date(),
  views: 0,
  generateSlug(): void {},
};

export const MockComment: CommentEntity = {
  id: 1,
  text: 'Comment 1',
  author: MockUser,
  authorId: MockUser.id,
  news: MockNews,
  newsId: MockNews.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};
