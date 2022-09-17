import { CommentsType, CommentsTypeDb } from '../types/commentsType';
import { UsersType } from '../types/usersType';
import { ObjectId } from 'mongodb';
import { NotFoundError } from '../errors/notFoundError';
import {
	BLOGGER_NOT_FOUND,
	COMMENT_FORBIDDEN_DELETE,
	COMMENT_FORBIDDEN_EDIT,
	COMMENT_NOT_FOUND,
	ERROR_DB,
	USER_NOT_FOUND,
} from '../errors/errorsMessages';
import { ForbiddenError } from '../errors/forbiddenError';
import { PaginationCalc, PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { paginationCalc } from '../helpers/paginationCalc';
import { CommentsRepository } from '../repositories/comments-repository';
import { inject, injectable } from 'inversify';
import { LikesRepository } from '../repositories/likes-repository';

@injectable()
export class CommentsService {
	constructor(
		@inject(CommentsRepository) protected commentsRepository: CommentsRepository,
		@inject(LikesRepository) protected likesRepository: LikesRepository,
	) {}

	async findAllComments(
		query: PaginationTypeQuery,
		id: ObjectId | null = null,
		authUser?: UsersType | null,
	): Promise<PaginationType<CommentsType[]>> {
		const totalCount: number = await this.commentsRepository.getTotalCount(id);
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		let authUserId;
		if (authUser) authUserId = authUser.id;

		const items: CommentsTypeDb[] = await this.commentsRepository.findAllComments(
			data.skip,
			data.pageSize,
			data.sortBy,
			id,
			authUserId,
		);

		const newItems: CommentsType[] = items.map((item: CommentsTypeDb) => {
			return this.commentMap(item);
		});

		return {
			pagesCount: data.pagesCount,
			page: data.pageNumber,
			pageSize: data.pageSize,
			totalCount: data.totalCount,
			items: newItems,
		};
	}

	async findCommentById(id: ObjectId, authUser?: UsersType | null): Promise<CommentsType> {
		let authUserId;
		if (authUser) authUserId = authUser.id;

		const comment: CommentsTypeDb | null = await this.commentsRepository.findCommentById(
			id,
			authUserId,
		);
		if (!comment) throw new NotFoundError(COMMENT_NOT_FOUND);

		return this.commentMap(comment);
	}

	async deleteComment(id: ObjectId, authUser: null | UsersType): Promise<void> {
		const comment: CommentsTypeDb | null = await this.commentsRepository.findCommentById(id);

		if (!comment) throw new NotFoundError(COMMENT_NOT_FOUND);
		if (!authUser) throw new NotFoundError(USER_NOT_FOUND);

		if (comment.userId.toString() !== authUser.id.toString())
			throw new ForbiddenError(COMMENT_FORBIDDEN_DELETE);

		const result = await this.commentsRepository.deleteComment(id);
		if (!result) throw new NotFoundError(BLOGGER_NOT_FOUND);
	}

	async updateComment(id: ObjectId, content: string, authUser: null | UsersType): Promise<void> {
		const comment: CommentsType = await this.findCommentById(id);

		if (!comment) throw new NotFoundError(COMMENT_NOT_FOUND);
		if (!authUser) throw new NotFoundError(USER_NOT_FOUND);

		if (comment.userId.toString() !== authUser.id.toString())
			throw new ForbiddenError(COMMENT_FORBIDDEN_EDIT);

		const result = await this.commentsRepository.updateComment(id, content);
		if (!result) throw new Error(ERROR_DB);
	}

	private commentMap(item: CommentsTypeDb): CommentsType {
		const { _id, content, userId, userLogin, addedAt, likesInfo } = item;
		return { id: _id, content, userId, userLogin, addedAt, likesInfo };
	}
}
