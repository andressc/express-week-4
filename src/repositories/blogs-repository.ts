import {BlogModel} from '../db/db';
import {BlogsTypeDb} from '../types/blogsType';
import {ObjectId} from 'mongodb';
import {injectable} from 'inversify';

@injectable()
export class BlogsRepository {
	async findAllBlogs(
		skip: number,
		pageSize: number,
		sortBy: {},
		searchNameTerm: string | undefined,
	): Promise<BlogsTypeDb[]> {
		const searchString = this.searchTerm(searchNameTerm)

		return (
			BlogModel
				.find(searchString)
				.skip(skip)
				.limit(pageSize)
				.sort(sortBy)
				.lean()
		);
	}

	async findBlogById(id: ObjectId): Promise<BlogsTypeDb | null> {
		const blog: BlogsTypeDb | null = await BlogModel.findOne({ _id: id });

		if (!blog) return null;
		return blog;
	}

	async deleteBlog(id: ObjectId): Promise<boolean> {
		const result = await BlogModel.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async deleteAllBlogs(): Promise<boolean> {
		const result = await BlogModel.deleteMany({});
		return result.deletedCount === 1;
	}

	async updateBlog(id: ObjectId, name: string, youtubeUrl: string): Promise<boolean> {
		const result = await BlogModel.updateOne({ _id: id }, { $set: { name, youtubeUrl } });
		return result.acknowledged;
	}

	async createBlog(newBlog: BlogsTypeDb): Promise<ObjectId | null> {
		const result = await BlogModel.create(newBlog);

		if (!result.id) return null;
		return result.id;
	}

	async getTotalCount(searchNameTerm: string | undefined): Promise<number> {
		const searchString = this.searchTerm(searchNameTerm);
		return BlogModel.countDocuments(searchString);
	}

	private searchTerm = (searchNameTerm: string | undefined): {} => {
		return searchNameTerm ? {name: {$regex: searchNameTerm}} : {}
	}
}
