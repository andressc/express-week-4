import { PostsType, PostsTypeDb } from '../types/postsType';
import { bloggersCollection, postsCollection } from '../db/db';
import { DbRepository } from './db-repository';
import { ObjectId } from 'mongodb';

export class PostsRepository extends DbRepository {
	async findAllPosts(
		skip: number,
		pageSize: number,
		sortBy: {},
		id: ObjectId | null,
	): Promise<PostsTypeDb[]> {
		const searchString = id ? { bloggerId: id } : {};

		return postsCollection.find(searchString).skip(skip).limit(pageSize).sort(sortBy).toArray();
	}

	async findPostById(id: ObjectId): Promise<PostsTypeDb | null> {
		const post: PostsTypeDb | null = await postsCollection.findOne({ _id: id });

		if (!post) return null;
		return post;
	}

	async deletePost(id: ObjectId): Promise<boolean> {
		const result = await postsCollection.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async deleteAllPosts(): Promise<boolean> {
		const result = await postsCollection.deleteMany({});
		return result.deletedCount === 1;
	}

	async updatePost(id: ObjectId, updateData: PostsType): Promise<boolean> {
		const result = await postsCollection.updateOne({ _id: id }, { $set: updateData });
		return result.acknowledged;
	}

	async createPost(newPost: PostsTypeDb): Promise<ObjectId | null> {
		const result = await postsCollection.insertOne(newPost);

		if (!result.acknowledged) return null;
		return result.insertedId;
	}

	async getTotalCount(id: ObjectId | null): Promise<number> {
		const searchString = id ? { bloggerId: id } : {};
		return await bloggersCollection.countDocuments(searchString);
	}
}
