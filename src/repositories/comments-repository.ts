import { CommentModel } from '../db/db';
import { CommentsTypeDb } from '../types/commentsType';
import { ObjectId } from 'mongodb';

export class CommentsRepository {
	async findAllComments(
		skip: number,
		pageSize: number,
		sortBy: {},
		id: ObjectId | null,
	): Promise<CommentsTypeDb[]> {
		const searchString = id ? { postId: id } : {};

		return CommentModel.find(searchString).skip(skip).limit(pageSize).sort(sortBy).lean();
	}

	async findCommentById(id: ObjectId): Promise<CommentsTypeDb | null> {
		const comment: CommentsTypeDb | null = await CommentModel.findOne({ _id: id });

		if (!comment) return null;
		return comment;
	}

	async deleteComment(id: ObjectId): Promise<boolean> {
		const result = await CommentModel.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async deleteAllComments(): Promise<boolean> {
		const result = await CommentModel.deleteMany({});
		return result.deletedCount === 1;
	}

	async updateComment(id: ObjectId, content: string): Promise<boolean> {
		const result = await CommentModel.updateOne({ _id: id }, { $set: { content } });
		return result.acknowledged;
	}

	async createComment(newComment: CommentsTypeDb): Promise<ObjectId | null> {
		const result = await CommentModel.create(newComment);

		if (!result.id) return null;
		return result.id;
	}

	async getTotalCount(id: ObjectId | null): Promise<number> {
		const searchString = id ? { postId: id } : {};
		return CommentModel.countDocuments(searchString);
	}
}
