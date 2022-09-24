import { CommentsService } from '../application/comments-service';
import { Request, Response } from 'express';
import { CommentsType } from '../types/commentsType';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { HttpStatusCode } from '../types/StatusCode';
import { inject, injectable } from 'inversify';
import { LikesService } from '../application/likes-service';
import { ItemLike } from '../types/LikeType';

@injectable()
export class CommentController {
	constructor(
		@inject(CommentsService) protected commentsService: CommentsService,
		@inject(LikesService) protected likesService: LikesService,
	) {}

	async findCommentById(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			const comment: CommentsType = await this.commentsService.findCommentById(
				stringToObjectId(req.params.id),
				req.user,
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
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async leaveLikeComment(
		req: Request<{ id: string }, {}, { likeStatus: string }, {}>,
		res: Response,
	) {
		try {
			await this.likesService.leaveLike(
				ItemLike.comment,
				req.user,
				req.body.likeStatus,
				stringToObjectId(req.params.id),
			);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}
