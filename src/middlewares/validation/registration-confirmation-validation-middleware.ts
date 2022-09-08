import { body } from 'express-validator';
import { usersRepository } from '../../index';

export const registrationConfirmationValidationMiddleware = [
	body('code')
		.trim()
		.notEmpty()
		.withMessage('must not be empty')
		.isString()
		.withMessage('must to be string')
		.custom(async (value) => {
			const user = await usersRepository.findUserByConfirmationCode(value);
			if (!user) throw new Error('user not found');
			if (user.emailConfirmation.isConfirmed) throw new Error('already confirmed');
			if (user.emailConfirmation.expirationDate < new Date())
				throw new Error('confirmed code date expired');

			return true;
		}),
];
