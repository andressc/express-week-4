import { CommentsType, CommentsTypeDb } from '../types/commentsType';
import { UsersType } from '../types/usersType';
import { commentsRepository } from '../index';
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

export const commentsService = {
	async findAllComments(
		query: PaginationTypeQuery,
		id: ObjectId | null = null,
	): Promise<PaginationType<CommentsType[]>> {
		const totalCount: number = await commentsRepository.getTotalCount(id);
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		const items: CommentsTypeDb[] = await commentsRepository.findAllComments(
			data.skip,
			data.pageSize,
			data.sortBy,
			id,
		);

		const newItems: CommentsType[] = items.map((item) => {
			const { _id, content, userId, userLogin, postId, addedAt } = item;
			return { id: _id, content, userId, userLogin, postId, addedAt };
		});

		return {
			pagesCount: data.pagesCount,
			page: data.pageNumber,
			pageSize: data.pageSize,
			totalCount: data.totalCount,
			items: newItems,
		};
	},

	async findCommentById(id: ObjectId): Promise<CommentsType> {
		const comment: CommentsTypeDb | null = await commentsRepository.findCommentById(id);
		if (!comment) throw new NotFoundError(COMMENT_NOT_FOUND);

		const { _id, content, userId, userLogin, addedAt } = comment;
		return { id: _id, content, userId, userLogin, addedAt };
	},

	async deleteComment(id: ObjectId, authUser: null | UsersType): Promise<void> {
		const comment: CommentsTypeDb | null = await commentsRepository.findCommentById(id);

		if (!comment) throw new NotFoundError(COMMENT_NOT_FOUND);
		if (!authUser) throw new NotFoundError(USER_NOT_FOUND);

		if (comment.userId !== authUser.id) throw new ForbiddenError(COMMENT_FORBIDDEN_DELETE);

		const result = await commentsRepository.deleteComment(id);
		if (!result) throw new NotFoundError(BLOGGER_NOT_FOUND);
	},

	async updateComment(id: ObjectId, content: string, authUser: null | UsersType): Promise<void> {
		const comment: CommentsType = await commentsService.findCommentById(id);

		if (!comment) throw new NotFoundError(COMMENT_NOT_FOUND);
		if (!authUser) throw new NotFoundError(USER_NOT_FOUND);

		if (comment.userId !== authUser.id) throw new ForbiddenError(COMMENT_FORBIDDEN_EDIT);

		const result = await commentsRepository.updateComment(id, content);
		if (!result) throw new Error(ERROR_DB);
	},
};
