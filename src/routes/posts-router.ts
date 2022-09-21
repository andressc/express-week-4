import { Router } from 'express';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { postsValidationMiddleware } from '../middlewares/validation/posts-validation-middleware';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { blogIdValidationMiddleware } from '../middlewares/validation/blog-id-validation-middleware';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { commentsValidationMiddleware } from '../middlewares/validation/comments-validation-middleware';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { container } from '../psevdoIoc';
import { PostController } from '../controllers/post-controller';
import { likesValidationMiddleware } from '../middlewares/validation/likes-validation-middleware';
import { getAuthUserMiddleware } from '../middlewares/security/get-auth-user-middleware';

export const postsRouter = Router({});

const postController = container.resolve(PostController);

postsRouter.get('/', getAuthUserMiddleware, postController.findAllPosts.bind(postController));

postsRouter.get(
	'/:id/comments',
	objectIdValidationMiddleware,
	getAuthUserMiddleware,
	errorValidationMiddleware,
	postController.findAllCommentsOfPost.bind(postController),
);

postsRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	getAuthUserMiddleware,
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
	...blogIdValidationMiddleware,
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
	...blogIdValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	postController.updatePost.bind(postController),
);

postsRouter.put(
	'/:id/like-status',
	bearerAuthorizationMiddleware,
	...likesValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	postController.leaveLikePost.bind(postController),
);
