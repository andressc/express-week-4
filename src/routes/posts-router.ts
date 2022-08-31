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

export const postsRouter = Router({});

postsRouter.get('/', async (req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) => {
	const posts = await postsService.findAllPosts(req.query);

	return res.send(posts);
});

postsRouter.get(
	'/:id/comments',
	async (req: Request<{ id: string }, {}, {}, PaginationTypeQuery>, res: Response) => {
		const commentsOnPost: PaginationType<CommentsType[]> | boolean =
			await postsService.findAllCommentsOfPost(req.query, req.params.id);

		if (commentsOnPost) return res.send(commentsOnPost);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);

postsRouter.get('/:id', async (req: Request, res: Response) => {
	const post = await postsService.findPostById(req.params.id);

	if (post) return res.send(post);
	return res.sendStatus(HttpStatusCode.NOT_FOUND);
});

postsRouter.delete('/:id', basicAuthorizationMiddleware, async (req: Request, res: Response) => {
	const isDeleted = await postsService.deletePost(req.params.id);

	if (isDeleted) return res.sendStatus(HttpStatusCode.NO_CONTENT);
	return res.sendStatus(HttpStatusCode.NOT_FOUND);
});

postsRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	...bloggerIdValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const newPost = await postsService.createPost(req.body);

		if (newPost) return res.status(HttpStatusCode.CREATED).send(newPost);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);

postsRouter.post(
	'/:id/comments',
	bearerAuthorizationMiddleware,
	...commentsValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const newComment = await postsService.createCommentPost(
			req.body.content,
			req!.user,
			req.params.id,
		);

		if (newComment) return res.status(HttpStatusCode.CREATED).send(newComment);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);

postsRouter.put(
	'/:id',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	...bloggerIdValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const isUpdated = await postsService.updatePost(req.params.id, req.body);

		if (isUpdated) return res.sendStatus(HttpStatusCode.NO_CONTENT);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);
