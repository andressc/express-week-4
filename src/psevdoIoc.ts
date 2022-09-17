import 'reflect-metadata';
import { BloggersRepository } from './repositories/bloggers-repository';
import { BloggersService } from './application/bloggers-service';
import { RefreshTokensRepository } from './repositories/refresh-tokens-repository';
import { PostsRepository } from './repositories/posts-repository';
import { CommentsRepository } from './repositories/comments-repository';
import { RemoteUserIpRepository } from './repositories/remote-user-ip-repository';
import { UsersRepository } from './repositories/users-repository';
import { PostsService } from './application/posts-service';
import { PostController } from './controllers/post-controller';
import { UsersService } from './application/users-service';
import { CommentsService } from './application/comments-service';
import { RemoteUserIpService } from './application/remote-user-ip-service';
import { TestingService } from './application/testing-service';
import { Container } from 'inversify';
import { AuthService } from './application/auth-service';
import { JwtService } from './application/jwt-service';
import { AuthController } from './controllers/auth-controller';
import { BloggerController } from './controllers/blogger-controller';
import { CommentController } from './controllers/comment-controller';
import { TestingController } from './controllers/testing-controller';
import { UserController } from './controllers/user-controller';
import { LikesRepository } from './repositories/likes-repository';
import { LikesService } from './application/likes-service';

/*const bloggersRepository = new BloggersRepository()
const commentsRepository = new CommentsRepository()
const postsRepository = new PostsRepository()
const refreshTokensRepository = new RefreshTokensRepository()
const remoteUserIpRepository = new RemoteUserIpRepository()
const usersRepository = new UsersRepository()


const userService = new UsersService(usersRepository)
const commentsService = new CommentsService(commentsRepository)
export const remoteUserIpService = new RemoteUserIpService(remoteUserIpRepository)

const postsService = new PostsService(postsRepository, commentsRepository, userService, commentsService)
const bloggersService = new BloggersService(bloggersRepository, postsService)
const testingService = new TestingService(
    bloggersRepository,
    commentsRepository,
    postsRepository,
    refreshTokensRepository,
    remoteUserIpRepository,
    usersRepository
)

export const postController = new PostController(postsService)*/

export const container = new Container();
container.bind<PostController>(PostController).to(PostController);
container.bind<AuthController>(AuthController).to(AuthController);
container.bind<BloggerController>(BloggerController).to(BloggerController);
container.bind<CommentController>(CommentController).to(CommentController);
container.bind<TestingController>(TestingController).to(TestingController);
container.bind<UserController>(UserController).to(UserController);

container.bind<UsersService>(UsersService).to(UsersService);
container.bind<CommentsService>(CommentsService).to(CommentsService);
container.bind<AuthService>(AuthService).to(AuthService);
container.bind<BloggersService>(BloggersService).to(BloggersService);
container.bind<JwtService>(JwtService).to(JwtService);
container.bind<PostsService>(PostsService).to(PostsService);
container.bind<RemoteUserIpService>(RemoteUserIpService).to(RemoteUserIpService);
container.bind<TestingService>(TestingService).to(TestingService);
container.bind<LikesService>(LikesService).to(LikesService);

container.bind<CommentsRepository>(CommentsRepository).to(CommentsRepository);
container.bind<BloggersRepository>(BloggersRepository).to(BloggersRepository);
container.bind<PostsRepository>(PostsRepository).to(PostsRepository);
container.bind<RefreshTokensRepository>(RefreshTokensRepository).to(RefreshTokensRepository);
container.bind<RemoteUserIpRepository>(RemoteUserIpRepository).to(RemoteUserIpRepository);
container.bind<UsersRepository>(UsersRepository).to(UsersRepository);
container.bind<LikesRepository>(LikesRepository).to(LikesRepository);
