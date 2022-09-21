import { BlogsType, BlogsTypeDb } from '../types/blogsType';
import { PaginationCalc, PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { PostsType } from '../types/postsType';
import { idCreator } from '../helpers/idCreator';
import { ObjectId } from 'mongodb';
import { paginationCalc } from '../helpers/paginationCalc';
import { BLOG_NOT_FOUND, ERROR_DB } from '../errors/errorsMessages';
import { NotFoundError } from '../errors/notFoundError';
import { BlogsRepository } from '../repositories/blogs-repository';
import { PostsService } from './posts-service';
import { inject, injectable } from 'inversify';
import { UsersType } from '../types/usersType';
import {dateCreator} from "../helpers/dateCreator";

@injectable()
export class BlogsService {
	constructor(
		@inject(BlogsRepository) protected blogsRepository: BlogsRepository,
		@inject(PostsService) protected postsService: PostsService,
	) {}

	async findAllBlogs(query: PaginationTypeQuery): Promise<PaginationType<BlogsType[]>> {
		const searchNameTerm = query.searchNameTerm;

		const totalCount: number = await this.blogsRepository.getTotalCount(searchNameTerm);
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		const items: BlogsTypeDb[] = await this.blogsRepository.findAllBlogs(
			data.skip,
			data.pageSize,
			data.sortBy,
			searchNameTerm,
		);

		const newItems: BlogsType[] = items.map((item) => {
			return this.blogMap(item);
		});

		return {
			pagesCount: data.pagesCount,
			page: data.pageNumber,
			pageSize: data.pageSize,
			totalCount: data.totalCount,
			items: newItems,
		};
	}

	async findAllPostsBlog(
		query: PaginationTypeQuery,
		id: ObjectId | null = null,
		authUser?: UsersType | null,
	): Promise<PaginationType<PostsType[]>> {
		return this.postsService.findAllPosts(query, id, authUser);
	}

	async findBlogById(id: ObjectId): Promise<BlogsType> {
		const blog: BlogsTypeDb | null = await this.blogsRepository.findBlogById(id);
		if (!blog) throw new NotFoundError(BLOG_NOT_FOUND);

		return this.blogMap(blog);
	}

	async deleteBlog(id: ObjectId): Promise<void> {
		const result: boolean = await this.blogsRepository.deleteBlog(id);
		if (!result) throw new NotFoundError(BLOG_NOT_FOUND);
	}

	async updateBlog(id: ObjectId, name: string, youtubeUrl: string): Promise<void> {
		const blog: BlogsType = await this.findBlogById(id);

		if (!blog) throw new NotFoundError(BLOG_NOT_FOUND);

		const result = await this.blogsRepository.updateBlog(id, name, youtubeUrl);
		if (!result) throw new Error(ERROR_DB);
	}

	async createBlog(name: string, youtubeUrl: string): Promise<BlogsType> {
		const newBlog: BlogsTypeDb = { _id: idCreator(), name, youtubeUrl, createdAt: dateCreator() };

		const createdId: ObjectId | null = await this.blogsRepository.createBlog(newBlog);

		if (!createdId) throw new Error(ERROR_DB);

		return {
			id: createdId,
			name: newBlog.name,
			youtubeUrl: newBlog.youtubeUrl,
			createdAt: newBlog.createdAt
		};
	}

	async createBlogPost(
		id: ObjectId,
		title: string,
		shortDescription: string,
		content: string,
	): Promise<PostsType> {
		return this.postsService.createPost(title, shortDescription, content, id);
	}

	private blogMap(item: BlogsTypeDb): BlogsType {
		const { _id, name, youtubeUrl, createdAt } = item;
		return { id: _id, name, youtubeUrl, createdAt };
	}
}
