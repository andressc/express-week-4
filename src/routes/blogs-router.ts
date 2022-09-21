import { Router } from 'express';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { blogsValidationMiddleware } from '../middlewares/validation/blogs-validation-middleware';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { postsValidationMiddleware } from '../middlewares/validation/posts-validation-middleware';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { container } from '../psevdoIoc';
import { BlogController } from '../controllers/blog-controller';
import { getAuthUserMiddleware } from '../middlewares/security/get-auth-user-middleware';

export const blogsRouter = Router({});

const bloggerController = container.resolve(BlogController);

blogsRouter.get('/', bloggerController.findAllBloggers.bind(bloggerController));

blogsRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.findBloggerById.bind(bloggerController),
);

blogsRouter.get(
	'/:id/posts',
	objectIdValidationMiddleware,
	getAuthUserMiddleware,
	errorValidationMiddleware,
	bloggerController.findPostsBlogger.bind(bloggerController),
);

blogsRouter.delete(
	'/:id',
	basicAuthorizationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.deleteBlogger.bind(bloggerController),
);

blogsRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...blogsValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.createBlogger.bind(bloggerController),
);

blogsRouter.post(
	'/:id/posts',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.createBloggerPost.bind(bloggerController),
);

blogsRouter.put(
	'/:id',
	basicAuthorizationMiddleware,
	...blogsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	bloggerController.updateBlogger.bind(bloggerController),
);
