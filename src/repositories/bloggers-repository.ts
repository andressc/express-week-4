import { bloggersCollection } from '../db/db';
import { BloggersTypeDb } from '../types/bloggersType';
import { DbRepository } from './db-repository';
import { ObjectId } from 'mongodb';

export class BloggersRepository extends DbRepository {
	async findAllBloggers(
		skip: number,
		pageSize: number,
		sortBy: {},
		searchNameTerm: string | null | undefined,
	): Promise<BloggersTypeDb[]> {
		const searchString = searchNameTerm ? { name: { $regex: searchNameTerm } } : {};

		return (
			bloggersCollection
				//.find(searchString, { projection: { _id: 0 } })
				.find(searchString)
				.skip(skip)
				.limit(pageSize)
				.sort(sortBy)
				.toArray()
		);
	}

	async findBloggerById(id: ObjectId): Promise<BloggersTypeDb | null> {
		const blogger: BloggersTypeDb | null = await bloggersCollection.findOne({ _id: id });

		if (!blogger) return null;
		return blogger;
	}

	async deleteBlogger(id: ObjectId): Promise<boolean> {
		const result = await bloggersCollection.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async deleteAllBloggers(): Promise<boolean> {
		const result = await bloggersCollection.deleteMany({});
		return result.deletedCount === 1;
	}

	async updateBlogger(id: ObjectId, name: string, youtubeUrl: string): Promise<boolean> {
		const result = await bloggersCollection.updateOne({ _id: id }, { $set: { name, youtubeUrl } });
		return result.acknowledged;
	}

	async createBlogger(newBlogger: BloggersTypeDb): Promise<ObjectId | null> {
		const result = await bloggersCollection.insertOne(newBlogger);

		if (!result.acknowledged) return null;
		return result.insertedId;
	}

	async getTotalCount(searchNameTerm: string | null | undefined): Promise<number> {
		const searchString = searchNameTerm ? { name: { $regex: searchNameTerm } } : {};
		return await bloggersCollection.countDocuments(searchString);
	}
}
