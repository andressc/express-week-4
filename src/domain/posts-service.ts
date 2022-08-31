import { PostsType } from '../types/postsType';
import { postsRepository } from '../repositories/posts-repository';
import { bloggersService } from './bloggers-service';
import { idCreator } from '../helpers/idCreator';
import { postBodyFilter } from '../helpers/postBodyFilter';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { UsersType } from '../types/usersType';
import { usersService } from './users-service';
import { CommentsType } from '../types/commentsType';
import { commentsRepository } from '../repositories/comments-repository';

export const postsService = {
	async findAllPosts(
		query: PaginationTypeQuery,
		id: string | null = null,
	): Promise<PaginationType<PostsType[]>> {
		return postsRepository.findAllPosts(query, id);
	},

	async findAllCommentsOfPost(
		query: PaginationTypeQuery,
		id: string,
	): Promise<PaginationType<CommentsType[]> | boolean> {
		const post = await postsService.findPostById(id);
		if (!post) return false;

		return commentsRepository.findAllComments(query, id);
	},

	async findPostById(id: string): Promise<PostsType | null> {
		return postsRepository.findPostById(id);
	},

	async deletePost(id: string): Promise<boolean> {
		return await postsRepository.deletePost(id);
	},

	async updatePost(id: string, body: PostsType): Promise<boolean> {
		const blogger = await bloggersService.findBloggerById(body.bloggerId);
		if (!blogger) return false;

		return await postsRepository.updatePost(id, {
			id, //подумать
			...postBodyFilter(body),
			bloggerName: blogger.name,
		});
	},

	async createPost(body: PostsType): Promise<PostsType | null> {
		const blogger = await bloggersService.findBloggerById(body.bloggerId);
		if (!blogger) return null;

		return await postsRepository.createPost({
			id: idCreator(),
			...postBodyFilter(body),
			bloggerName: blogger.name,
		});
	},

	async createCommentPost(content: string, authUser: null | UsersType, postId: string) {
		if (!authUser) return null;

		const user = await usersService.findUserById(authUser.id);
		if (!user) return null;

		const post = await postsService.findPostById(postId);
		if (!post) return null;

		const newComment: CommentsType = {
			id: idCreator(),
			content,
			userId: user.id,
			userLogin: user.accountData.login,
			postId: post.id,
			addedAt: new Date().toISOString(),
		};

		return await commentsRepository.createComment(newComment);
	},
};
