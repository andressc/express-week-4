import { LikeModel } from '../db/db';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { LikeTypeDb } from '../types/LikeType';

@injectable()
export class LikesRepository {
	async findUserLike(userId: ObjectId, itemId: ObjectId, type: string): Promise<LikeTypeDb | null> {
		const searchString = { userId, itemId, type };
		return LikeModel.findOne(searchString).lean();
	}

	async updateLike(id: ObjectId, likeStatus: string): Promise<boolean> {
		const result = await LikeModel.updateOne({ _id: id }, { $set: { likeStatus } });
		return result.acknowledged;
	}

	async createLike(newLike: LikeTypeDb): Promise<ObjectId | null> {
		const result = await LikeModel.create(newLike);

		if (!result.id) return null;
		return result.id;
	}

	async deleteAllLikes(): Promise<boolean> {
		const result = await LikeModel.deleteMany({});
		return result.deletedCount === 1;
	}
}
