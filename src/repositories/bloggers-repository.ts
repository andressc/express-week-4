import { BloggerModel } from '../db/db';
import { BloggersTypeDb } from '../types/bloggersType';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';

@injectable()
export class BloggersRepository {
	async findAllBloggers(
		skip: number,
		pageSize: number,
		sortBy: {},
		searchNameTerm: string | null | undefined,
	): Promise<BloggersTypeDb[]> {
		const searchString = searchNameTerm ? { name: { $regex: searchNameTerm } } : {};

		return (
			BloggerModel
				//.find(searchString, { projection: { _id: 0 } })
				.find(searchString)
				.skip(skip)
				.limit(pageSize)
				.sort(sortBy)
				.lean()
		);
	}

	async findBloggerById(id: ObjectId): Promise<BloggersTypeDb | null> {
		const blogger: BloggersTypeDb | null = await BloggerModel.findOne({ _id: id });

		if (!blogger) return null;
		return blogger;
	}

	async deleteBlogger(id: ObjectId): Promise<boolean> {
		const result = await BloggerModel.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async deleteAllBloggers(): Promise<boolean> {
		const result = await BloggerModel.deleteMany({});
		return result.deletedCount === 1;
	}

	async updateBlogger(id: ObjectId, name: string, youtubeUrl: string): Promise<boolean> {
		const result = await BloggerModel.updateOne({ _id: id }, { $set: { name, youtubeUrl } });
		return result.acknowledged;
	}

	async createBlogger(newBlogger: BloggersTypeDb): Promise<ObjectId | null> {
		const result = await BloggerModel.create(newBlogger);

		if (!result.id) return null;
		return result.id;
	}

	async getTotalCount(searchNameTerm: string | null | undefined): Promise<number> {
		const searchString = searchNameTerm ? { name: { $regex: searchNameTerm } } : {};
		return BloggerModel.countDocuments(searchString);
	}
}
