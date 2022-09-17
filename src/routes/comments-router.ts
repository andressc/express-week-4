import { Router } from 'express';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { commentsValidationMiddleware } from '../middlewares/validation/comments-validation-middleware';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { container } from '../psevdoIoc';
import { CommentController } from '../controllers/comment-controller';
import { likesValidationMiddleware } from '../middlewares/validation/likes-validation-middleware';
import { getAuthUserMiddleware } from '../middlewares/security/get-auth-user-middleware';

export const commentsRouter = Router({});

const commentController = container.resolve(CommentController);

commentsRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	getAuthUserMiddleware,
	errorValidationMiddleware,
	commentController.findCommentById.bind(commentController),
);

commentsRouter.put(
	'/:id',
	bearerAuthorizationMiddleware,
	...commentsValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	commentController.updateComment.bind(commentController),
);

commentsRouter.put(
	'/:id/like-status',
	bearerAuthorizationMiddleware,
	...likesValidationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	commentController.leaveLikeComment.bind(commentController),
);

commentsRouter.delete(
	'/:id',
	bearerAuthorizationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	commentController.deleteComment.bind(commentController),
);
