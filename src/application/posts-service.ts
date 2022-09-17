import { PostsType, PostsTypeDb, PostsTypeReq } from '../types/postsType';
import { idCreator } from '../helpers/idCreator';
import { PaginationCalc, PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { UsersType, UsersTypeDb } from '../types/usersType';
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
import { CommentsService } from './comments-service';
import { inject, injectable } from 'inversify';
import { BloggersTypeDb } from '../types/bloggersType';
import { BloggersRepository } from '../repositories/bloggers-repository';
import { UsersRepository } from '../repositories/users-repository';
import { LikeStatus } from '../types/LikeType';

@injectable()
export class PostsService {
	constructor(
		@inject(PostsRepository) protected postsRepository: PostsRepository,
		@inject(CommentsRepository) protected commentsRepository: CommentsRepository,
		@inject(BloggersRepository) protected bloggersRepository: BloggersRepository,
		@inject(UsersRepository) protected usersRepository: UsersRepository,
		@inject(CommentsService) protected commentsService: CommentsService,
	) {}

	async findAllPosts(
		query: PaginationTypeQuery,
		id: ObjectId | null = null,
		authUser?: UsersType | null,
	): Promise<PaginationType<PostsType[]>> {
		const totalCount: number = await this.postsRepository.getTotalCount(id);
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		let authUserId;
		if (authUser) authUserId = authUser.id;

		const items: PostsTypeDb[] = await this.postsRepository.findAllPosts(
			data.skip,
			data.pageSize,
			data.sortBy,
			id,
			authUserId,
		);

		const newItems: PostsType[] = items.map((item) => {
			const { _id, title, shortDescription, content, bloggerId, bloggerName, addedAt, extendedLikesInfo } = item;
			return { id: _id, title, shortDescription, content, bloggerId, bloggerName, addedAt, extendedLikesInfo };
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
		authUser?: UsersType | null,
	): Promise<PaginationType<CommentsType[]>> {
		const post = await this.findPostById(id);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		return this.commentsService.findAllComments(query, id, authUser);
	}

	async findPostById(id: ObjectId, authUser?: UsersType | null): Promise<PostsType> {
		let authUserId;
		if (authUser) authUserId = authUser.id;

		const post: PostsTypeDb | null = await this.postsRepository.findPostById(id, authUserId);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		const { _id, title, shortDescription, content, bloggerId, bloggerName, addedAt, extendedLikesInfo } = post;
		return { id: _id, title, shortDescription, content, bloggerId, bloggerName, addedAt, extendedLikesInfo };
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

		const blogger: BloggersTypeDb | null = await this.bloggersRepository.findBloggerById(id);
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
		const blogger: BloggersTypeDb | null = await this.bloggersRepository.findBloggerById(bloggerId);
		if (!blogger) throw new NotFoundError(BLOGGER_NOT_FOUND);

		const addedAt = new Date().toISOString()
		const newPost: PostsTypeDb = {
			_id: idCreator(),
			title,
			shortDescription,
			content,
			bloggerId,
			bloggerName: blogger.name,
			addedAt,
			extendedLikesInfo: {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: LikeStatus.None,
				newestLikes: [],
			},
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
			addedAt,
			extendedLikesInfo: {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: LikeStatus.None,
				newestLikes: [],
			},
		};
	}

	async createCommentPost(
		content: string,
		authUser: null | UsersType,
		postId: ObjectId,
	): Promise<CommentsType> {
		if (!authUser) throw new NotFoundError(USER_NOT_FOUND);

		const user: UsersTypeDb | null = await this.usersRepository.findUserById(authUser.id);
		if (!user) throw new NotFoundError(USER_NOT_FOUND);

		const post: PostsType = await this.findPostById(postId);
		if (!post) throw new NotFoundError(POST_NOT_FOUND);

		const addedAt = new Date().toISOString()
		const newComment: CommentsTypeDb = {
			_id: idCreator(),
			content,
			userId: user._id,
			userLogin: user.accountData.login,
			postId: post.id,
			addedAt,
			likesInfo: {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: LikeStatus.None,
			},
		};

		const createdId: ObjectId | null = await this.commentsRepository.createComment(newComment);
		if (!createdId) throw new Error(ERROR_DB);

		return {
			id: createdId,
			content,
			userId: user._id,
			userLogin: user.accountData.login,
			addedAt,
			likesInfo: {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: LikeStatus.None,
			},
		};
	}
}
