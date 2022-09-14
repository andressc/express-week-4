import { param } from 'express-validator';

export const objectIdValidationMiddleware = [
	param('id').isMongoId().withMessage('Invalid parameter id'),
];
