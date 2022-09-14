import { Request, Response, Router } from 'express';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { bloggersValidationMiddleware } from '../middlewares/validation/bloggers-validation-middleware';
import { BloggersType } from '../types/bloggersType';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { PostsType } from '../types/postsType';
import {
	PaginationType,
	PaginationTypeQuery,
	PaginationTypeQueryRequest,
} from '../types/paginationType';
import { postsValidationMiddleware } from '../middlewares/validation/posts-validation-middleware';
import { HttpStatusCode } from '../types/StatusCode';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { BloggersService } from '../application/bloggers-service';

export const bloggersRouter = Router({});

class BloggerController {
	bloggersService: BloggersService;
	constructor() {
		this.bloggersService = new BloggersService();
	}

	async findAllBloggers(req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) {
		try {
			const bloggers: PaginationType<BloggersType[]> = await this.bloggersService.findAllBloggers(
				req.query,
			);
			return res.send(bloggers);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findBloggerById(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			const blogger: BloggersType = await this.bloggersService.findBloggerById(
				stringToObjectId(req.params.id),
			);

			return res.send(blogger);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findPostsBlogger(
		req: Request<{ id: string }, {}, {}, PaginationTypeQueryRequest>,
		res: Response,
	) {
		try {
			const bloggerPosts: PaginationType<PostsType[]> =
				await this.bloggersService.findAllPostsBlogger(req.query, stringToObjectId(req.params.id));
			return res.send(bloggerPosts);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async deleteBlogger(req: Request<{ id: string }, {}, {}, { name: string }>, res: Response) {
		try {
			await this.bloggersService.deleteBlogger(stringToObjectId(req.params.id));
			return res.send(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async createBlogger(
		req: Request<{}, {}, { name: string; youtubeUrl: string }, {}>,
		res: Response,
	) {
		try {
			const blogger: BloggersType = await this.bloggersService.createBlogger(
				req.body.name,
				req.body.youtubeUrl,
			);

			return res.status(HttpStatusCode.CREATED).send(blogger);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async createBloggerPost(req: Request<{ id: string }, {}, PostsType, {}>, res: Response) {
		try {
			const bloggersPost: PostsType = await this.bloggersService.createBloggerPost(
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
	}

	async updateBlogger(
		req: Request<{ id: string }, {}, { name: string; youtubeUrl: string }, {}>,
		res: Response,
	) {
		try {
			await this.bloggersService.updateBlogger(
				stringToObjectId(req.params.id),
				req.body.name,
				req.body.youtubeUrl,
			);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}

const bloggerController = new BloggerController();

bloggersRouter.get('/', bloggerController.findAllBloggers.bind(bloggerController));

bloggersRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.findBloggerById.bind(bloggerController),
);

bloggersRouter.get(
	'/:id/posts',
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.findPostsBlogger.bind(bloggerController),
);

bloggersRouter.delete(
	'/:id',
	basicAuthorizationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.deleteBlogger.bind(bloggerController),
);

bloggersRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...bloggersValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.createBlogger.bind(bloggerController),
);

bloggersRouter.post(
	'/:id/posts',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.createBloggerPost.bind(bloggerController),
);

bloggersRouter.put(
	'/:id',
	basicAuthorizationMiddleware,
	...bloggersValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.updateBlogger.bind(bloggerController),
);
