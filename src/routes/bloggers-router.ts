import { Request, Response, Router } from 'express';
import { bloggersService } from '../domain/bloggers-service';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { bloggersValidationMiddleware } from '../middlewares/validation/bloggers-validation-middleware';
import { BloggersType } from '../types/bloggersType';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { PostsType } from '../types/postsType';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { postsValidationMiddleware } from '../middlewares/validation/posts-validation-middleware';
import { HttpStatusCode } from '../types/StatusCode';

export const bloggersRouter = Router({});

bloggersRouter.get('/', async (req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) => {
	const bloggers: PaginationType<BloggersType[]> = await bloggersService.findAllBloggers(req.query);
	res.send(bloggers);
});

bloggersRouter.get('/:id', async (req: Request, res: Response) => {
	const blogger: BloggersType | null = await bloggersService.findBloggerById(req.params.id);

	if (blogger) return res.send(blogger);
	return res.sendStatus(HttpStatusCode.NOT_FOUND);
});

bloggersRouter.get(
	'/:id/posts',
	async (req: Request<{ id: string }, {}, {}, PaginationTypeQuery>, res: Response) => {
		const bloggerPosts: PaginationType<PostsType[]> = await bloggersService.findAllPostsBlogger(
			req.query,
			req.params.id,
		);

		if (bloggerPosts.totalCount > 0) return res.send(bloggerPosts);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);

bloggersRouter.delete('/:id', basicAuthorizationMiddleware, async (req: Request, res: Response) => {
	const isDeleted: boolean = await bloggersService.deleteBlogger(req.params.id);

	if (isDeleted) return res.send(HttpStatusCode.NO_CONTENT);
	return res.sendStatus(HttpStatusCode.NOT_FOUND);
});

bloggersRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...bloggersValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const blogger: BloggersType = await bloggersService.createBlogger(
			req.body.name,
			req.body.youtubeUrl,
		);

		if (blogger) return res.status(HttpStatusCode.CREATED).send(blogger);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);

bloggersRouter.post(
	'/:id/posts',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const bloggersPost: PostsType | null = await bloggersService.createBloggerPost(
			req.params.id,
			req.body,
		);

		if (bloggersPost) return res.status(HttpStatusCode.CREATED).send(bloggersPost);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);

bloggersRouter.put(
	'/:id',
	basicAuthorizationMiddleware,
	...bloggersValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const isUpdated: boolean = await bloggersService.updateBlogger(
			req.params.id,
			req.body.name,
			req.body.youtubeUrl,
		);

		if (isUpdated) return res.send(HttpStatusCode.NO_CONTENT);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);
