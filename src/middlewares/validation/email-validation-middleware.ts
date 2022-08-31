import { body } from 'express-validator';

export const emailValidationMiddleware = [
	body('email')
		.matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
		.withMessage('email is incorrect'),
];
