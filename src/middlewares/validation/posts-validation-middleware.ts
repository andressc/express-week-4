import { body } from 'express-validator';

export const postsValidationMiddleware = [
	body('title')
		.trim()
		.isLength({ max: 30 })
		.withMessage('maximum 30 characters')
		.notEmpty()
		.withMessage('must not be empty'),

	body('shortDescription')
		.isLength({ max: 100 })
		.withMessage('maximum 100 characters')
		.notEmpty()
		.withMessage('must not be empty'),

	body('content')
		.trim()
		.isLength({ max: 1000 })
		.withMessage('maximum 1000 characters')
		.notEmpty()
		.withMessage('must not be empty'),
];
