import { bloggersCollection } from '../db/db';
import { BloggersType } from '../types/bloggersType';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { paginationCalc } from '../helpers/paginationCalc';

export const bloggersRepository = {
	async findAllBloggers(query: PaginationTypeQuery): Promise<PaginationType<BloggersType[]>> {
		const searchString = query.SearchNameTerm
			? { name: { $regex: query.SearchNameTerm.toString() } }
			: {};
		const totalCount = await bloggersCollection.countDocuments(searchString);

		const {
			pagesCount: pagesCount,
			page,
			pageSize,
			skip,
		} = paginationCalc({ ...query, totalCount });

		const items: BloggersType[] = await bloggersCollection
			.find(searchString, { projection: { _id: 0 } })
			.skip(skip)
			.limit(pageSize)
			.toArray();

		return { pagesCount, page, pageSize, totalCount, items };
	},

	async findBloggerById(id: string): Promise<BloggersType | null> {
		const blogger: BloggersType | null = await bloggersCollection.findOne(
			{ id },
			{ projection: { _id: 0 } },
		);

		if (blogger) return blogger;
		return null;
	},

	async deleteBlogger(id: string): Promise<boolean> {
		const result = await bloggersCollection.deleteOne({ id });
		return result.deletedCount === 1;
	},

	async deleteAllBloggers(): Promise<boolean> {
		const result = await bloggersCollection.deleteMany({});
		return result.deletedCount === 1;
	},

	async updateBlogger(id: string, name: string, youtubeUrl: string): Promise<boolean> {
		const result = await bloggersCollection.updateOne({ id }, { $set: { name, youtubeUrl } });
		return result.matchedCount === 1;
	},

	async createBlogger(newBlogger: BloggersType): Promise<BloggersType> {
		await bloggersCollection.insertOne({ ...newBlogger });
		return newBlogger;
	},

	async getTotalCount(search: string): Promise<number> {
		const searchString = search ? { name: { $regex: search.toString() } } : {};
		return await bloggersCollection.countDocuments(searchString);
	},
};
