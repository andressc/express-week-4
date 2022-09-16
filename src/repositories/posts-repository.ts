import { PostsType, PostsTypeDb } from '../types/postsType';
import { PostModel } from '../db/db';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';

@injectable()
export class PostsRepository {
	async findAllPosts(
		skip: number,
		pageSize: number,
		sortBy: {},
		id: ObjectId | null,
	): Promise<PostsTypeDb[]> {
		const searchString = id ? { bloggerId: id } : {};

		return PostModel.find(searchString).skip(skip).limit(pageSize).sort(sortBy).lean();
	}

	async findPostById(id: ObjectId): Promise<PostsTypeDb | null> {
		const post: PostsTypeDb | null = await PostModel.findOne({ _id: id }).lean();

		if (!post) return null;
		return post;
	}

	async deletePost(id: ObjectId): Promise<boolean> {
		const postInstance = await PostModel.findOne({ _id: id });
		if (!postInstance) return false;

		postInstance.deleteOne();

		return true;

		/*const result = await PostModelClass.deleteOne({ _id: id });
		return result.deletedCount === 1;*/
	}

	async deleteAllPosts(): Promise<boolean> {
		const result = await PostModel.deleteMany({});
		return result.deletedCount === 1;
	}

	async updatePost(id: ObjectId, updateData: PostsType): Promise<boolean> {
		const postInstance = await PostModel.findOne({ _id: id });
		if (!postInstance) return false;

		postInstance.title = updateData.title;
		postInstance.shortDescription = updateData.shortDescription;
		postInstance.content = updateData.content;
		postInstance.bloggerId = updateData.bloggerId;
		postInstance.bloggerName = updateData.bloggerName;
		await postInstance.save();

		return true;

		/*const result = await PostModelClass.updateOne({ _id: id }, { $set: updateData });
		return result.acknowledged;*/
	}

	async createPost(newPost: PostsTypeDb): Promise<ObjectId | null> {
		const postInstance = new PostModel(newPost);
		await postInstance.save();
		return postInstance.id;

		/*const result = await PostModelClass.create(newPost);
		if (!result.id) return null;
		return result.id;*/
	}

	async getTotalCount(id: ObjectId | null): Promise<number> {
		const searchString = id ? { bloggerId: id } : {};
		return PostModel.countDocuments(searchString);
	}
}
