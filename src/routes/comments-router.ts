import { Request, Response, Router } from 'express';
import { commentsService } from '../domain/comments-service';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { commentsValidationMiddleware } from '../middlewares/validation/comments-validation-middleware';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { CommentsType } from '../types/commentsType';
import { HttpStatusCode } from '../types/StatusCode';

export const commentsRouter = Router({});

commentsRouter.get('/:id', async (req: Request, res: Response) => {
	const comment = await commentsService.findCommentById(req.params.id);

	if (comment) return res.send(comment);
	return res.sendStatus(HttpStatusCode.NOT_FOUND);
});

commentsRouter.put(
	'/:id',
	bearerAuthorizationMiddleware,
	...commentsValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{ id: string }, {}, CommentsType, {}>, res: Response) => {
		const isUpdated = await commentsService.updateComment(req.params.id, req.body, req!.user);

		if (isUpdated === HttpStatusCode.FORBIDDEN) return res.sendStatus(HttpStatusCode.FORBIDDEN);
		if (isUpdated) return res.sendStatus(HttpStatusCode.NO_CONTENT);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);

commentsRouter.delete(
	'/:id',
	bearerAuthorizationMiddleware,
	async (req: Request, res: Response) => {
		const isDeleted = await commentsService.deleteComment(req.params.id, req!.user);

		if (isDeleted === HttpStatusCode.FORBIDDEN) return res.sendStatus(HttpStatusCode.FORBIDDEN);
		if (isDeleted) return res.sendStatus(HttpStatusCode.NO_CONTENT);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);
