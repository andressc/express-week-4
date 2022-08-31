import { PostsType } from '../types/postsType';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { postsCollection } from '../db/db';
import { paginationCalc } from '../helpers/paginationCalc';

export const postsRepository = {
	async findAllPosts(
		query: PaginationTypeQuery,
		id: string | null,
	): Promise<PaginationType<PostsType[]>> {
		const searchString = id ? { bloggerId: id } : {};

		const totalCount = await postsCollection.countDocuments(searchString);

		const { pagesCount, page, pageSize, skip } = paginationCalc({ ...query, totalCount });

		const items: PostsType[] = await postsCollection
			.find(searchString, { projection: { _id: 0 } })
			.skip(skip)
			.limit(pageSize)
			.toArray();

		return {
			pagesCount,
			page,
			pageSize,
			totalCount,
			items,
		};
	},

	async findPostById(id: string): Promise<PostsType | null> {
		const post: PostsType | null = await postsCollection.findOne(
			{ id },
			{ projection: { _id: 0 } },
		);

		if (post) return post;
		return null;
	},

	async deletePost(id: string): Promise<boolean> {
		const result = await postsCollection.deleteOne({ id });
		return result.deletedCount === 1;
	},

	async deleteAllPosts(): Promise<boolean> {
		const result = await postsCollection.deleteMany({});
		return result.deletedCount === 1;
	},

	async updatePost(id: string, updateData: PostsType): Promise<boolean> {
		const result = await postsCollection.updateOne({ id }, { $set: updateData });
		return result.matchedCount === 1;
	},

	async createPost(newPost: PostsType): Promise<PostsType | null> {
		await postsCollection.insertOne({ ...newPost });
		return newPost;
	},
};
