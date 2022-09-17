import { BloggersType, BloggersTypeDb } from '../types/bloggersType';
import { PaginationCalc, PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { PostsType } from '../types/postsType';
import { idCreator } from '../helpers/idCreator';
import { ObjectId } from 'mongodb';
import { paginationCalc } from '../helpers/paginationCalc';
import { BLOGGER_NOT_FOUND, ERROR_DB } from '../errors/errorsMessages';
import { NotFoundError } from '../errors/notFoundError';
import { BloggersRepository } from '../repositories/bloggers-repository';
import { PostsService } from './posts-service';
import { inject, injectable } from 'inversify';
import {UsersType} from "../types/usersType";

@injectable()
export class BloggersService {
	constructor(
		@inject(BloggersRepository) protected bloggersRepository: BloggersRepository,
		@inject(PostsService) protected postsService: PostsService,
	) {}

	async findAllBloggers(query: PaginationTypeQuery): Promise<PaginationType<BloggersType[]>> {
		const searchNameTerm = query.searchNameTerm;

		const totalCount: number = await this.bloggersRepository.getTotalCount(searchNameTerm);
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		const items: BloggersTypeDb[] = await this.bloggersRepository.findAllBloggers(
			data.skip,
			data.pageSize,
			data.sortBy,
			searchNameTerm,
		);

		const newItems: BloggersType[] = items.map((item) => {
			const { _id, name, youtubeUrl } = item;
			return { id: _id, name, youtubeUrl };
		});

		return {
			pagesCount: data.pagesCount,
			page: data.pageNumber,
			pageSize: data.pageSize,
			totalCount: data.totalCount,
			items: newItems,
		};
	}

	async findAllPostsBlogger(
		query: PaginationTypeQuery,
		id: ObjectId | null = null,
		authUser?: UsersType | null,
	): Promise<PaginationType<PostsType[]>> {
		return this.postsService.findAllPosts(query, id, authUser);
	}

	async findBloggerById(id: ObjectId): Promise<BloggersType> {
		const blogger: BloggersTypeDb | null = await this.bloggersRepository.findBloggerById(id);
		if (!blogger) throw new NotFoundError(BLOGGER_NOT_FOUND);

		const { _id, name, youtubeUrl } = blogger;
		return { id: _id, name, youtubeUrl };
	}

	async deleteBlogger(id: ObjectId): Promise<void> {
		const result: boolean = await this.bloggersRepository.deleteBlogger(id);
		if (!result) throw new NotFoundError(BLOGGER_NOT_FOUND);
	}

	async updateBlogger(id: ObjectId, name: string, youtubeUrl: string): Promise<void> {
		const blogger: BloggersType = await this.findBloggerById(id);

		if (!blogger) throw new NotFoundError(BLOGGER_NOT_FOUND);

		const result = await this.bloggersRepository.updateBlogger(id, name, youtubeUrl);
		if (!result) throw new Error(ERROR_DB);
	}

	async createBlogger(name: string, youtubeUrl: string): Promise<BloggersType> {
		const newBlogger: BloggersTypeDb = { _id: idCreator(), name, youtubeUrl };

		const createdId: ObjectId | null = await this.bloggersRepository.createBlogger(newBlogger);

		if (!createdId) throw new Error(ERROR_DB);

		return { id: createdId, name, youtubeUrl };
	}

	async createBloggerPost(
		id: ObjectId,
		title: string,
		shortDescription: string,
		content: string,
	): Promise<PostsType> {
		return this.postsService.createPost(title, shortDescription, content, id);
	}
}
