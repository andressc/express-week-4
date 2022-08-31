import { body } from 'express-validator';

export const authValidationMiddleware = [
	body('login')
		.trim()
		.notEmpty()
		.withMessage('must not be empty')
		.isString()
		.withMessage('must to be string')
		.isLength({ min: 3, max: 10 })
		.withMessage('minimum 3 maximum 10 characters'),

	body('password')
		.trim()
		.notEmpty()
		.withMessage('must not be empty')
		.isString()
		.withMessage('must to be string')
		.isLength({ min: 6, max: 20 })
		.withMessage('minimum 6 maximum 20 characters'),
];
