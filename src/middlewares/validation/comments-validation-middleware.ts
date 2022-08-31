import { body } from 'express-validator';

export const commentsValidationMiddleware = [
	body('content')
		.trim()
		.notEmpty()
		.withMessage('must not be empty')
		.isString()
		.withMessage('must to be string')
		.isLength({ min: 20, max: 300 })
		.withMessage('minimum 20 maximum 300 characters'),
];
