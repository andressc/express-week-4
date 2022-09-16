import { PostsService } from '../application/posts-service';
import { Request, Response } from 'express';
import {
	PaginationType,
	PaginationTypeQuery,
	PaginationTypeQueryRequest,
} from '../types/paginationType';
import { PostsType, PostsTypeReq } from '../types/postsType';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { CommentsType } from '../types/commentsType';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { HttpStatusCode } from '../types/StatusCode';
import { inject, injectable } from 'inversify';

@injectable()
export class PostController {
	constructor(@inject(PostsService) protected postsService: PostsService) {}

	async findAllPosts(req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) {
		try {
			const posts: PaginationType<PostsType[]> = await this.postsService.findAllPosts(req.query);
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
			);

			return res.send(posts);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findPostById(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			const post: PostsType = await this.postsService.findPostById(stringToObjectId(req.params.id));

			return res.send(post);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async deletePost(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			await this.postsService.deletePost(stringToObjectId(req.params.id));
			return res.send(HttpStatusCode.NO_CONTENT);
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
				stringToObjectId(req.body.bloggerId),
			);

			return res.status(HttpStatusCode.CREATED).send(post);
		} catch (error) {
			console.log(error);
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
}
