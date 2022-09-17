import { BloggersRepository } from '../repositories/bloggers-repository';
import { PostsRepository } from '../repositories/posts-repository';
import { UsersRepository } from '../repositories/users-repository';
import { CommentsRepository } from '../repositories/comments-repository';
import { RemoteUserIpRepository } from '../repositories/remote-user-ip-repository';
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository';
import { inject, injectable } from 'inversify';
import { LikesRepository } from '../repositories/likes-repository';

@injectable()
export class TestingService {
	constructor(
		@inject(BloggersRepository) protected bloggersRepository: BloggersRepository,
		@inject(CommentsRepository) protected commentsRepository: CommentsRepository,
		@inject(PostsRepository) protected postsRepository: PostsRepository,
		@inject(RefreshTokensRepository) protected refreshTokensRepository: RefreshTokensRepository,
		@inject(RemoteUserIpRepository) protected remoteUserIpRepository: RemoteUserIpRepository,
		@inject(UsersRepository) protected usersRepository: UsersRepository,
		@inject(LikesRepository) protected likesRepository: LikesRepository,
	) {}

	async deleteAllData(): Promise<void> {
		await this.bloggersRepository.deleteAllBloggers();
		await this.postsRepository.deleteAllPosts();
		await this.usersRepository.deleteAllUsers();
		await this.commentsRepository.deleteAllComments();
		await this.remoteUserIpRepository.deleteAllRemoteUserIp();
		await this.refreshTokensRepository.deleteAllTokens();
		await this.likesRepository.deleteAllLikes();
	}
}
