import { CommentModel } from '../db/db';
import { CommentsTypeDb, CommentsTypeMap } from '../types/commentsType';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';

@injectable()
export class CommentsRepository {
	async findAllComments(
		skip: number,
		pageSize: number,
		sortBy: {},
		id: ObjectId | null,
		authUserId?: ObjectId,
	): Promise<CommentsTypeDb[]> {
		const searchString = id ? { postId: id } : {};

		const comment: CommentsTypeMap[] = await CommentModel.aggregate([
			{ $match: searchString },
			{
				$graphLookup: {
					from: 'likes',
					startWith: '$_id',
					connectFromField: '_id',
					connectToField: 'itemId',
					as: 'likes',
				},
			},
		])
			.sort(sortBy)
			.skip(skip)
			.limit(pageSize);

		return this.mapComments(comment, authUserId);
	}

	async findCommentById(id: ObjectId, authUserId?: ObjectId): Promise<CommentsTypeDb | null> {
		const comment: CommentsTypeMap[] = await CommentModel.aggregate([
			{ $match: { _id: id } },
			{
				$graphLookup: {
					from: 'likes',
					startWith: '$_id',
					connectFromField: '_id',
					connectToField: 'itemId',
					as: 'likes',
				},
			},
		]);

		if (!comment) return null;
		const newComment = this.mapComments(comment, authUserId);

		return newComment[0];
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

	private mapComments(comments: CommentsTypeMap[], authUserId?: ObjectId): CommentsTypeDb[] {
		return comments.map((item: CommentsTypeMap) => {
			/*let like = 0;
			let dislike = 0;
			let myStatus = 'None';
			item.likes.forEach((it: LikeTypeDb) => {
				it.likeStatus === LikeStatus.Like && like++;
				it.likeStatus === LikeStatus.Dislike && dislike++;

				if (authUserId && it.userId.equals(authUserId)) myStatus = it.likeStatus;
			});*/

			return {
				_id: item._id,
				content: item.content,
				userId: item.userId,
				userLogin: item.userLogin,
				postId: item.postId,
				createdAt: item.createdAt,
				/*likesInfo: {
					likesCount: like,
					dislikesCount: dislike,
					myStatus,
				},*/
			};
		});
	}
}
