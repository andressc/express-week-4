import {commentsCollection} from '../db/db';
import {CommentsTypeDb} from '../types/commentsType';
import {DbRepository} from './db-repository';
import {ObjectId} from 'mongodb';

export class CommentsRepository extends DbRepository {
	async findAllComments(
		skip: number,
		pageSize: number,
		sortBy: {},
		id: ObjectId | null,
	): Promise<CommentsTypeDb[]> {
		const searchString = id ? { bloggerId: id } : {};

		return commentsCollection
			.find(searchString)
			.skip(skip)
			.limit(pageSize)
			.sort(sortBy)
			.toArray();
	}

	async findCommentById(id: ObjectId): Promise<CommentsTypeDb | null> {
		const comment: CommentsTypeDb | null = await commentsCollection.findOne({ _id: id });

		if (!comment) return null;
		return comment;
	}

	async deleteComment(id: ObjectId): Promise<boolean> {
		const result = await commentsCollection.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async deleteAllComments(): Promise<boolean> {
		const result = await commentsCollection.deleteMany({});
		return result.deletedCount === 1;
	}

	async updateComment(id: ObjectId, content: string): Promise<boolean> {
		const result = await commentsCollection.updateOne({ _id: id }, { $set: { content } });
		return result.acknowledged;
	}

	async createComment(newComment: CommentsTypeDb): Promise<ObjectId | null> {
		const result = await commentsCollection.insertOne(newComment);

		if (!result.acknowledged) return null;
		return result.insertedId;
	}

	async getTotalCount(id: ObjectId | null): Promise<number> {
		const searchString = id ? { postId: id } : {};
		return await commentsCollection.countDocuments(searchString);
	}
}
