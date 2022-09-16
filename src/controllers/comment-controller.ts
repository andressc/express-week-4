import { CommentsService } from '../application/comments-service';
import { Request, Response } from 'express';
import { CommentsType } from '../types/commentsType';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { HttpStatusCode } from '../types/StatusCode';
import { inject, injectable } from 'inversify';

@injectable()
export class CommentController {
	constructor(@inject(CommentsService) protected commentsService: CommentsService) {}

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
