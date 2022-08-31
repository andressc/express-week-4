import { body } from 'express-validator';

export const registrationConfirmationValidationMiddleware = [
	body('code')
		.trim()
		.notEmpty()
		.withMessage('must not be empty')
		.isString()
		.withMessage('must to be string'),
];
