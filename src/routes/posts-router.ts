import { Request, Response, Router } from 'express';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { postsValidationMiddleware } from '../middlewares/validation/posts-validation-middleware';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { postsService } from '../domain/posts-service';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { bloggerIdValidationMiddleware } from '../middlewares/validation/blogger-id-validation-middleware';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { commentsValidationMiddleware } from '../middlewares/validation/comments-validation-middleware';
import { CommentsType } from '../types/commentsType';
import { HttpStatusCode } from '../types/StatusCode';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { PostsType, PostsTypeReq } from '../types/postsType';

export const postsRouter = Router({});

postsRouter.get('/', async (req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) => {
	try {
		const posts: PaginationType<PostsType[]> = await postsService.findAllPosts(req.query);
		return res.send(posts);
	} catch (error) {
		const err = generateErrorCode(error);
		return res.status(err.status).send(err.message);
	}
});

postsRouter.get(
	'/:id/comments',
	//objectIdValidationMiddleware,
	async (req: Request<{ id: string }, {}, {}, PaginationTypeQuery>, res: Response) => {
		try {
			const posts: PaginationType<CommentsType[]> = await postsService.findAllCommentsOfPost(
				stringToObjectId(req.params.id),
				req.query,
			);

			return res.send(posts);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

postsRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
		try {
			const post: PostsType = await postsService.findPostById(stringToObjectId(req.params.id));

			return res.send(post);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

postsRouter.delete(
	'/:id',
	basicAuthorizationMiddleware,
	objectIdValidationMiddleware,
	async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
		try {
			await postsService.deletePost(stringToObjectId(req.params.id));
			return res.send(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

postsRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	...bloggerIdValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{}, {}, PostsTypeReq, {}>, res: Response) => {
		try {
			const post: PostsType = await postsService.createPost(
				req.body.title,
				req.body.shortDescription,
				req.body.content,
				stringToObjectId(req.body.bloggerId),
			);

			return res.status(HttpStatusCode.CREATED).send(post);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

postsRouter.post(
	'/:id/comments',
	bearerAuthorizationMiddleware,
	...commentsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{ id: string }, {}, { content: string }, {}>, res: Response) => {
		try {
			const comment: CommentsType = await postsService.createCommentPost(
				req.body.content,
				req.user,
				stringToObjectId(req.params.id),
			);

			return res.status(HttpStatusCode.CREATED).send(comment);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

postsRouter.put(
	'/:id',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	...bloggerIdValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{ id: string }, {}, PostsTypeReq, {}>, res: Response) => {
		try {
			await postsService.updatePost(stringToObjectId(req.params.id), req.body);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);
