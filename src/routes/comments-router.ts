import { Request, Response, Router } from 'express';
import { CommentsService } from '../application/comments-service';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { commentsValidationMiddleware } from '../middlewares/validation/comments-validation-middleware';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { CommentsType } from '../types/commentsType';
import { HttpStatusCode } from '../types/StatusCode';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { generateErrorCode } from '../helpers/generateErrorCode';

export const commentsRouter = Router({});

class CommentController {
	commentsService: CommentsService;
	constructor() {
		this.commentsService = new CommentsService();
	}

	async findCommentById(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			const comment: CommentsType = await this.commentsService.findCommentById(
				stringToObjectId(req.params.id),
			);

			return res.send(comment);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async updateComment(req: Request<{ id: string }, {}, CommentsType, {}>, res: Response) {
		try {
			await this.commentsService.updateComment(
				stringToObjectId(req.params.id),
				req.body.content,
				req.user,
			);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async deleteComment(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			await this.commentsService.deleteComment(stringToObjectId(req.params.id), req.user);
			return res.send(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}

const commentController = new CommentController();

commentsRouter.get(
	'/:id',
	objectIdValidationMiddleware,
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

commentsRouter.delete(
	'/:id',
	bearerAuthorizationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	commentController.deleteComment.bind(commentController),
);
