import { BloggersRepository } from '../repositories/bloggers-repository';
import { PostsRepository } from '../repositories/posts-repository';
import { UsersRepository } from '../repositories/users-repository';
import { CommentsRepository } from '../repositories/comments-repository';
import { RemoteUserIpRepository } from '../repositories/remote-user-ip-repository';
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository';

export class TestingService {
	bloggersRepository: BloggersRepository;
	postsRepository: PostsRepository;
	usersRepository: UsersRepository;
	commentsRepository: CommentsRepository;
	remoteUserIpRepository: RemoteUserIpRepository;
	refreshTokensRepository: RefreshTokensRepository;

	constructor() {
		this.bloggersRepository = new BloggersRepository();
		this.postsRepository = new PostsRepository();
		this.usersRepository = new UsersRepository();
		this.commentsRepository = new CommentsRepository();
		this.remoteUserIpRepository = new RemoteUserIpRepository();
		this.refreshTokensRepository = new RefreshTokensRepository();
	}

	async deleteAllData(): Promise<void> {
		await this.bloggersRepository.deleteAllBloggers();
		await this.postsRepository.deleteAllPosts();
		await this.usersRepository.deleteAllUsers();
		await this.commentsRepository.deleteAllComments();
		await this.remoteUserIpRepository.deleteAllRemoteUserIp();
		await this.refreshTokensRepository.deleteAllTokens();
	}
}
