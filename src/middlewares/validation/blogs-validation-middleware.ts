import { body } from 'express-validator';

export const blogsValidationMiddleware = [
	body('name')
		.trim()
		.isLength({ max: 15 })
		.withMessage('maximum 15 characters')
		.notEmpty()
		.withMessage('must not be empty'),

	body('youtubeUrl')
		.isLength({ max: 100 })
		.withMessage('maximum 100 characters')
		.matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
		.withMessage('link is incorrect'),
];
