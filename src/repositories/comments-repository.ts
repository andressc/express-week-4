import { commentsCollection } from '../db/db';
import { CommentsType } from '../types/commentsType';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { paginationCalc } from '../helpers/paginationCalc';

export const commentsRepository = {
	async findAllComments(
		query: PaginationTypeQuery,
		id: string | null,
	): Promise<PaginationType<CommentsType[]>> {
		const searchString = id ? { postId: id } : {};

		const totalCount = await commentsCollection.countDocuments(searchString);

		const { pagesCount, page, pageSize, skip } = paginationCalc({ ...query, totalCount });

		const items: CommentsType[] = await commentsCollection
			.find(searchString, { projection: { _id: 0, postId: 0 } })
			.skip(skip)
			.limit(pageSize)
			.toArray();

		return {
			pagesCount,
			page,
			pageSize,
			totalCount,
			items,
		};
	},

	async findCommentById(id: string): Promise<CommentsType | null> {
		const comment: CommentsType | null = await commentsCollection.findOne(
			{ id },
			{ projection: { _id: 0, postId: 0 } },
		);

		if (comment) return comment;
		return null;
	},

	async deleteComment(id: string): Promise<boolean> {
		const result = await commentsCollection.deleteOne({ id });
		return result.deletedCount === 1;
	},

	async deleteAllComments(): Promise<boolean> {
		const result = await commentsCollection.deleteMany({});
		return result.deletedCount === 1;
	},

	async updateComment(id: string, content: string): Promise<boolean> {
		const result = await commentsCollection.updateOne({ id }, { $set: { content } });
		return result.matchedCount === 1;
	},

	async createComment(newComment: CommentsType): Promise<CommentsType | null> {
		await commentsCollection.insertOne({ ...newComment });

		const { id, content, userId, userLogin, addedAt } = newComment;

		return { id, content, userId, userLogin, addedAt };
	},
};
