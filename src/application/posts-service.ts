import { PostsType, PostsTypeDb, PostsTypeReq } from '../types/postsType';
import { idCreator } from '../helpers/idCreator';
import { PaginationCalc, PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { UsersType } from '../types/usersType';
import { CommentsType, CommentsTypeDb } from '../types/commentsType';
import { ObjectId } from 'mongodb';
import {
	BLOGGER_NOT_FOUND,
	ERROR_DB,
	POST_NOT_FOUND,
	USER_NOT_FOUND,
} from '../errors/errorsMessages';
import { NotFoundError } from '../errors/notFoundError';
import { paginationCalc } from '../helpers/paginationCalc';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { PostsRepository } from '../repositories/posts-repository';
import { CommentsRepository } from '../repositories/comments-repository';
import { UsersService } from './users-service';
import { bloggersService } from './bloggers-service';
import { CommentsService } from './comments-service';

export class PostsService {
	postsRepository: PostsRepository;
	commentsRepository: CommentsRepository;
	usersService: UsersService;
	commentsService: CommentsService;
	constructor() {
		this.postsRepository = new PostsRepository();
		this.commentsRepository = new CommentsRepository();
		this.usersService = new UsersService();
		this.commentsService = new CommentsService();
	}

	async findAllPosts(
		query: PaginationTypeQuery,
		id: ObjectId | null = null,
	): Promise<PaginationType<PostsType[]>> {
		const totalCount: number = await this.postsRepository.getTotalCount(id);
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		const items: PostsTypeDb[] = await this.postsRepository.findAllPosts(
			data.skip,
			data.pageSize,
			data.sortBy,
			id,
		);

		const newItems: PostsType[] = items.map((item) => {
			const { _id, title, shortDescription, content, bloggerId, bloggerName } = item;
			return { id: _id, title, shortDescription, content, bloggerId, bloggerName };
		});

		return {
			pagesCount: data.pagesCount,
			page: data.pageNumber,
			pageSize: data.pageSize,
			totalCount: data.totalCount,
			items: newItems,
		};
	}

	async findAllCommentsOfPost(
		id: ObjectId,
		query: PaginationTypeQuery,
	): Promise<PaginationType<CommentsType[]>> {
		const post = await this.findPostById(id);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		return this.commentsService.findAllComments(query, id);
	}

	async findPostById(id: ObjectId): Promise<PostsType> {
		const post: PostsTypeDb | null = await this.postsRepository.findPostById(id);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		const { _id, title, shortDescription, content, bloggerId, bloggerName } = post;
		return { id: _id, title, shortDescription, content, bloggerId, bloggerName };
	}

	async deletePost(id: ObjectId): Promise<void> {
		const result: boolean = await this.postsRepository.deletePost(id);
		if (!result) throw new NotFoundError(POST_NOT_FOUND);
	}

	async updatePost(
		id: ObjectId,
		{ title, shortDescription, content, bloggerId }: PostsTypeReq,
	): Promise<void> {
		const bloggerIdObjectId = stringToObjectId(bloggerId);
		const blogger = await bloggersService.findBloggerById(bloggerIdObjectId);
		if (!blogger) throw new NotFoundError(BLOGGER_NOT_FOUND);

		const result = await this.postsRepository.updatePost(id, {
			id,
			title,
			shortDescription,
			content,
			bloggerId: bloggerIdObjectId,
			bloggerName: blogger.name,
		});
		if (!result) throw new Error(ERROR_DB);
	}

	async createPost(
		title: string,
		shortDescription: string,
		content: string,
		bloggerId: ObjectId,
	): Promise<PostsType> {
		const blogger = await bloggersService.findBloggerById(bloggerId);
		if (!blogger) throw new NotFoundError(BLOGGER_NOT_FOUND);

		const newPost: PostsTypeDb = {
			_id: idCreator(),
			title,
			shortDescription,
			content,
			bloggerId,
			bloggerName: blogger.name,
		};

		const createdId: ObjectId | null = await this.postsRepository.createPost(newPost);
		if (!createdId) throw new Error(ERROR_DB);

		return {
			id: createdId,
			title,
			shortDescription,
			content,
			bloggerId,
			bloggerName: blogger.name,
		};
	}

	async createCommentPost(
		content: string,
		authUser: null | UsersType,
		postId: ObjectId,
	): Promise<CommentsType> {
		if (!authUser) throw new NotFoundError(USER_NOT_FOUND);

		const user: UsersType = await this.usersService.findUserById(authUser.id);
		if (!user) throw new NotFoundError(USER_NOT_FOUND);

		const post: PostsType = await this.findPostById(postId);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		const newComment: CommentsTypeDb = {
			_id: idCreator(),
			content,
			userId: user.id,
			userLogin: user.accountData.login,
			postId: post.id,
			addedAt: new Date().toISOString(),
		};

		const createdId: ObjectId | null = await this.commentsRepository.createComment(newComment);
		if (!createdId) throw new Error(ERROR_DB);

		return {
			id: createdId,
			content,
			userId: user.id,
			userLogin: user.accountData.login,
			addedAt: new Date().toISOString(),
		};
	}
}
