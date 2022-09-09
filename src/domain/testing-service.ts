import {
	bloggersRepository,
	commentsRepository,
	postsRepository,
	refreshTokensRepository,
	remoteUserIpRepository,
	usersRepository,
} from '../index';

export const testingService = {
	async deleteAllData(): Promise<void> {
		await bloggersRepository.deleteAllBloggers();
		await postsRepository.deleteAllPosts();
		await usersRepository.deleteAllUsers();
		await commentsRepository.deleteAllComments();
		await remoteUserIpRepository.deleteAllRemoteUserIp();
		await refreshTokensRepository.deleteAllTokens();
	},
};
