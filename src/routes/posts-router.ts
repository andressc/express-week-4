import { Router } from 'express';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { postsValidationMiddleware } from '../middlewares/validation/posts-validation-middleware';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { bloggerIdValidationMiddleware } from '../middlewares/validation/blogger-id-validation-middleware';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { commentsValidationMiddleware } from '../middlewares/validation/comments-validation-middleware';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { container } from '../psevdoIoc';
import { PostController } from '../controllers/post-controller';

export const postsRouter = Router({});

const postController = container.resolve(PostController);

postsRouter.get('/', postController.findAllPosts.bind(postController));

postsRouter.get(
	'/:id/comments',
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	postController.findAllCommentsOfPost.bind(postController),
);

postsRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	postController.findPostById.bind(postController),
);

postsRouter.delete(
	'/:id',
	basicAuthorizationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	postController.deletePost.bind(postController),
);

postsRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	...bloggerIdValidationMiddleware,
	errorValidationMiddleware,
	postController.createPost.bind(postController),
);

postsRouter.post(
	'/:id/comments',
	bearerAuthorizationMiddleware,
	...commentsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	postController.createCommentPost.bind(postController),
);

postsRouter.put(
	'/:id',
	basicAuthorizationMiddleware,
	...postsValidationMiddleware,
	...bloggerIdValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	postController.updatePost.bind(postController),
);
