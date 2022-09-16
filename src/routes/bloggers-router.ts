import { Router } from 'express';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { bloggersValidationMiddleware } from '../middlewares/validation/bloggers-validation-middleware';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { postsValidationMiddleware } from '../middlewares/validation/posts-validation-middleware';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { container } from '../psevdoIoc';
import { BloggerController } from '../controllers/blogger-controller';

export const bloggersRouter = Router({});

const bloggerController = container.resolve(BloggerController);

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
