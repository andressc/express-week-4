import { bloggersRepository } from '../repositories/bloggers-repository';
import { BloggersType } from '../types/bloggersType';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { PostsType } from '../types/postsType';
import { postsRepository } from '../repositories/posts-repository';
import { idCreator } from '../helpers/idCreator';
import { postBodyFilter } from '../helpers/postBodyFilter';

export const bloggersService = {
	async findAllBloggers(query: PaginationTypeQuery): Promise<PaginationType<BloggersType[]>> {
		return bloggersRepository.findAllBloggers(query);
	},

	async findAllPostsBlogger(
		query: PaginationTypeQuery,
		id: string | null = null,
	): Promise<PaginationType<PostsType[]>> {
		return postsRepository.findAllPosts(query, id);
	},

	async findBloggerById(id: string): Promise<BloggersType | null> {
		return bloggersRepository.findBloggerById(id);
	},

	async deleteBlogger(id: string): Promise<boolean> {
		return await bloggersRepository.deleteBlogger(id);
	},

	async updateBlogger(id: string, name: string, youtubeUrl: string): Promise<boolean> {
		return await bloggersRepository.updateBlogger(id, name, youtubeUrl);
	},

	async createBlogger(name: string, youtubeUrl: string): Promise<BloggersType> {
		const newBlogger = { id: idCreator(), name, youtubeUrl };

		return await bloggersRepository.createBlogger(newBlogger);
	},

	async createBloggerPost(id: string, body: PostsType): Promise<PostsType | null> {
		const blogger = await bloggersService.findBloggerById(id);

		if (!blogger) return null;
		return await postsRepository.createPost({
			id: idCreator(),
			...postBodyFilter(body),
			bloggerId: blogger.id,
			bloggerName: blogger.name,
		});
	},
};
