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

const blogController = container.resolve(BlogController);

blogsRouter.get('/', blogController.findAllBlogs.bind(blogController));

blogsRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	blogController.findBlogById.bind(blogController),
);

blogsRouter.get(
	'/:id/posts',
	objectIdValidationMiddleware,
	getAuthUserMiddleware,
	errorValidationMiddleware,
	blogController.findPostsBlog.bind(blogController),
);

blogsRouter.delete(
	'/:id',
	basicAuthorizationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	blogController.deleteBlog.bind(blogController),
);

blogsRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...blogsValidationMiddleware,
	errorValidationMiddleware,
	blogController.createBlog.bind(blogController),
);

blogsRouter.post(
	'/:id/posts',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	blogController.createBlogPost.bind(blogController),
);

blogsRouter.put(
	'/:id',
	basicAuthorizationMiddleware,
	...blogsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	blogController.updateBlog.bind(blogController),
);
