import { PostsType, PostsTypeDb, PostsTypeReq } from '../types/postsType';
import { bloggersService } from './bloggers-service';
import { idCreator } from '../helpers/idCreator';
import { postBodyFilter } from '../helpers/postBodyFilter';
import { PaginationCalc, PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { UsersType } from '../types/usersType';
import { usersService } from './users-service';
import { CommentsType, CommentsTypeDb } from '../types/commentsType';
import { commentsRepository, postsRepository } from '../index';
import { ObjectId } from 'mongodb';
import {
	BLOGGER_NOT_FOUND,
	ERROR_DB,
	POST_NOT_FOUND,
	USER_NOT_FOUND,
} from '../errors/errorsMessages';
import { NotFoundError } from '../errors/notFoundError';
import { paginationCalc } from '../helpers/paginationCalc';
import { commentsService } from './comments-service';

export const postsService = {
	async findAllPosts(
		query: PaginationTypeQuery,
		id: ObjectId | null = null,
	): Promise<PaginationType<PostsType[]>> {
		const totalCount: number = await postsRepository.getTotalCount(id);
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		const items: PostsTypeDb[] = await postsRepository.findAllPosts(
			data.skip,
			data.pageSize,
			data.sortBy,
			id,
		);

		const newItems: PostsType[] = items.map((item) => {
			const { _id, content, bloggerId, bloggerName, shortDescription, title } = item;
			return { id: _id, content, bloggerId, bloggerName, shortDescription, title };
		});

		return {
			pagesCount: data.pagesCount,
			page: data.pageNumber,
			pageSize: data.pageSize,
			totalCount: data.totalCount,
			items: newItems,
		};
	},

	async findAllCommentsOfPost(
		id: ObjectId,
		query: PaginationTypeQuery,
	): Promise<PaginationType<CommentsType[]>> {
		const post = await postsService.findPostById(id);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		return commentsService.findAllComments(query, id);
	},

	async findPostById(id: ObjectId): Promise<PostsType> {
		const post: PostsTypeDb | null = await postsRepository.findPostById(id);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		const { _id, content, bloggerId, bloggerName, shortDescription, title } = post;
		return { id: _id, content, bloggerId, bloggerName, shortDescription, title };
	},

	async deletePost(id: ObjectId): Promise<void> {
		const result: boolean = await postsRepository.deletePost(id);
		if (!result) throw new NotFoundError(POST_NOT_FOUND);
	},

	async updatePost(id: ObjectId, body: PostsType): Promise<void> {
		const blogger = await bloggersService.findBloggerById(body.bloggerId);
		if (!blogger) throw new NotFoundError(BLOGGER_NOT_FOUND);

		const result = await postsRepository.updatePost(id, {
			id,
			...postBodyFilter(body),
			bloggerName: blogger.name,
		});
		if (!result) throw new Error(ERROR_DB);
	},

	async createPost({
		title,
		shortDescription,
		content,
		bloggerId,
	}: PostsTypeReq): Promise<PostsType> {
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

		const createdId: ObjectId | null = await postsRepository.createPost(newPost);
		if (!createdId) throw new Error(ERROR_DB);

		return {
			id: createdId,
			title,
			shortDescription,
			content,
			bloggerId,
			bloggerName: blogger.name,
		};
	},

	async createCommentPost(
		content: string,
		authUser: null | UsersType,
		postId: ObjectId,
	): Promise<CommentsType> {
		if (!authUser) throw new NotFoundError(USER_NOT_FOUND);

		const user: UsersType = await usersService.findUserById(authUser.id);
		if (!user) throw new NotFoundError(USER_NOT_FOUND);

		const post: PostsType = await postsService.findPostById(postId);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		const newComment: CommentsTypeDb = {
			_id: idCreator(),
			content,
			userId: user.id,
			userLogin: user.accountData.login,
			postId: post.id,
			addedAt: new Date().toISOString(),
		};

		const createdId: ObjectId | null = await commentsRepository.createComment(newComment);
		if (!createdId) throw new Error(ERROR_DB);

		return {
			id: createdId,
			content,
			userId: user.id,
			userLogin: user.accountData.login,
			addedAt: new Date().toISOString(),
		};
	},
};
