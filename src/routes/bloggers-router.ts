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
import { generateErrorCode } from '../helpers/generateErrorCode';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';

export const bloggersRouter = Router({});

bloggersRouter.get('/', async (req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) => {
	try {
		const bloggers: PaginationType<BloggersType[]> = await bloggersService.findAllBloggers(
			req.query,
		);
		return res.send(bloggers);
	} catch (error) {
		const err = generateErrorCode(error);
		return res.status(err.status).send(err.message);
	}
});

bloggersRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
		try {
			const blogger: BloggersType = await bloggersService.findBloggerById(
				stringToObjectId(req.params.id),
			);

			return res.send(blogger);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

bloggersRouter.get(
	'/:id/posts',
	//objectIdValidationMiddleware,
	async (req: Request<{ id: string }, {}, {}, PaginationTypeQuery>, res: Response) => {
		try {
			const bloggerPosts: PaginationType<PostsType[]> = await bloggersService.findAllPostsBlogger(
				req.query,
				stringToObjectId(req.params.id),
			);
			return res.send(bloggerPosts);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

bloggersRouter.delete(
	'/:id',
	basicAuthorizationMiddleware,
	objectIdValidationMiddleware,
	async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
		try {
			await bloggersService.deleteBlogger(stringToObjectId(req.params.id));
			return res.send(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

bloggersRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...bloggersValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{}, {}, { name: string; youtubeUrl: string }, {}>, res: Response) => {
		try {
			const blogger: BloggersType = await bloggersService.createBlogger(
				req.body.name,
				req.body.youtubeUrl,
			);

			return res.status(HttpStatusCode.CREATED).send(blogger);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

bloggersRouter.post(
	'/:id/posts',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{ id: string }, {}, PostsType, {}>, res: Response) => {
		try {
			const bloggersPost: PostsType = await bloggersService.createBloggerPost(
				stringToObjectId(req.params.id),
				req.body.title,
				req.body.shortDescription,
				req.body.content,
			);

			return res.status(HttpStatusCode.CREATED).send(bloggersPost);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

bloggersRouter.put(
	'/:id',
	basicAuthorizationMiddleware,
	...bloggersValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	async (
		req: Request<{ id: string }, {}, { name: string; youtubeUrl: string }, {}>,
		res: Response,
	) => {
		try {
			await bloggersService.updateBlogger(
				stringToObjectId(req.params.id),
				req.body.name,
				req.body.youtubeUrl,
			);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);
