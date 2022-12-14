import { PostsService } from '../application/posts-service';
import { Request, Response } from 'express';
import { PaginationType, PaginationTypeQueryRequest } from '../types/paginationType';
import { PostsType, PostsTypeReq } from '../types/postsType';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { CommentsType } from '../types/commentsType';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { HttpStatusCode } from '../types/StatusCode';
import { inject, injectable } from 'inversify';
import { ItemLike } from '../types/LikeType';
import { LikesService } from '../application/likes-service';

@injectable()
export class PostController {
	constructor(
		@inject(PostsService) protected postsService: PostsService,
		@inject(LikesService) protected likesService: LikesService,
	) {}

	async findAllPosts(req: Request<{}, {}, {}, PaginationTypeQueryRequest>, res: Response) {
		try {
			const posts: PaginationType<PostsType[]> = await this.postsService.findAllPosts(
				req.query,
				null,
				req.user,
			);
			return res.send(posts);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findAllCommentsOfPost(
		req: Request<{ id: string }, {}, {}, PaginationTypeQueryRequest>,
		res: Response,
	) {
		try {
			const posts: PaginationType<CommentsType[]> = await this.postsService.findAllCommentsOfPost(
				stringToObjectId(req.params.id),
				req.query,
				req.user,
			);

			return res.send(posts);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findPostById(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			const post: PostsType = await this.postsService.findPostById(
				stringToObjectId(req.params.id),
				req.user,
			);

			return res.send(post);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async deletePost(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			await this.postsService.deletePost(stringToObjectId(req.params.id));
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async createPost(req: Request<{}, {}, PostsTypeReq, {}>, res: Response) {
		try {
			const post: PostsType = await this.postsService.createPost(
				req.body.title,
				req.body.shortDescription,
				req.body.content,
				stringToObjectId(req.body.blogId),
			);

			return res.status(HttpStatusCode.CREATED).send(post);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async createCommentPost(
		req: Request<{ id: string }, {}, { content: string }, {}>,
		res: Response,
	) {
		try {
			const comment: CommentsType = await this.postsService.createCommentPost(
				req.body.content,
				req.user,
				stringToObjectId(req.params.id),
			);

			return res.status(HttpStatusCode.CREATED).send(comment);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async updatePost(req: Request<{ id: string }, {}, PostsTypeReq, {}>, res: Response) {
		try {
			await this.postsService.updatePost(stringToObjectId(req.params.id), req.body);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async leaveLikePost(req: Request<{ id: string }, {}, { likeStatus: string }, {}>, res: Response) {
		try {
			await this.likesService.leaveLike(
				ItemLike.post,
				req.user,
				req.body.likeStatus,
				stringToObjectId(req.params.id),
			);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}
