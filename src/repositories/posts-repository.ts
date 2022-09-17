import { PostsTypeDb, PostsTypeMap, PostsTypeUpdate } from '../types/postsType';
import { PostModel } from '../db/db';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { LikeStatus, LikeTypeDb } from '../types/LikeType';

@injectable()
export class PostsRepository {
	async findAllPosts(
		skip: number,
		pageSize: number,
		sortBy: {},
		id: ObjectId | null,
		authUserId?: ObjectId,
	): Promise<PostsTypeDb[]> {
		const searchString = id ? { bloggerId: id } : {};

		const post: PostsTypeMap[] = await PostModel.aggregate([
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
			.skip(skip)
			.limit(pageSize)
			.sort(sortBy);
		return this.mapPosts(post, authUserId);

		//return PostModel.find(searchString).skip(skip).limit(pageSize).sort(sortBy).lean();
	}

	async findPostById(id: ObjectId, authUserId?: ObjectId): Promise<PostsTypeDb | null> {
		const post: PostsTypeMap[] = await PostModel.aggregate([
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

		if (!post) return null;

		const newPost = this.mapPosts(post, authUserId);

		return newPost[0];

		/*const post: PostsTypeDb | null = await PostModel.findOne({ _id: id }).lean();

		if (!post) return null;
		return post;*/
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

	async updatePost(id: ObjectId, updateData: PostsTypeUpdate): Promise<boolean> {
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

	private mapPosts(posts: PostsTypeMap[], authUserId?: ObjectId): PostsTypeDb[] {
		return posts.map((item: PostsTypeMap) => {
			let like = 0;
			let dislike = 0;
			let myStatus = 'None';

			let newestLikes = [...item.likes]
				.filter((v: LikeTypeDb) => v.likeStatus === LikeStatus.Like)
				.sort((a: LikeTypeDb, b: LikeTypeDb) => (a.addedAt > b.addedAt ? -1 : 1))
				.slice(0, 3)
				.map((v: LikeTypeDb) => ({
					addedAt: v.addedAt,
					userId: v.userId.toString(),
					login: v.login,
				}))

			item.likes.forEach((it: LikeTypeDb) => {
				it.likeStatus === LikeStatus.Like && like++;
				it.likeStatus === LikeStatus.Dislike && dislike++;

				if (authUserId && it.userId.equals(authUserId)) myStatus = it.likeStatus;
			});

			return {
				_id: item._id,
				title: item.title,
				shortDescription: item.shortDescription,
				content: item.content,
				bloggerId: item.bloggerId,
				bloggerName: item.bloggerName,
				addedAt: item.addedAt,
				extendedLikesInfo: {
					likesCount: like,
					dislikesCount: dislike,
					myStatus,
					newestLikes,
				},
			};
		});
	}
}
