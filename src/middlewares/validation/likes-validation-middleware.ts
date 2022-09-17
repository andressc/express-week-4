import { body } from 'express-validator';
import { LikeStatus } from '../../types/LikeType';

export const likesValidationMiddleware = [
	body('likeStatus')
		.isIn([LikeStatus.Like, LikeStatus.Dislike, LikeStatus.None])
		.withMessage('use Like, Dislike, None'),
];
