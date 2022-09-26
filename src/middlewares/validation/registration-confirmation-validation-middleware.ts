import { body } from 'express-validator';
import { UsersType } from '../../types/usersType';
import { UsersService } from '../../application/users-service';
import { container } from '../../psevdoIoc';

const usersService = container.resolve(UsersService);

export const registrationConfirmationValidationMiddleware = [
	body('code')
		.trim()
		.notEmpty()
		.withMessage('must not be empty')
		.isString()
		.withMessage('must to be string')
		.custom(async (value) => {
			const user: UsersType = await usersService.findUserByConfirmationCode(value);
			//if (!user) throw new Error('user not found');
			if (user.emailConfirmation.isConfirmed) throw new Error('already confirmed');
			if (user.emailConfirmation.expirationDate < new Date())
				throw new Error('confirmed code date expired');

			return true;
		}),
];
