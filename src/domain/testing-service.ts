import { bloggersRepository } from '../repositories/bloggers-repository';
import { postsRepository } from '../repositories/posts-repository';
import { usersRepository } from '../repositories/users-repository';
import { commentsRepository } from '../repositories/comments-repository';

export const testingService = {
	async deleteAllData(): Promise<boolean> {
		await bloggersRepository.deleteAllBloggers();
		await postsRepository.deleteAllPosts();
		await usersRepository.deleteAllUsers();
		await commentsRepository.deleteAllComments();
		return true;
	},
};
