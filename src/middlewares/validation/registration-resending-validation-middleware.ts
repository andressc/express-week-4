import { body } from 'express-validator';
import { UsersService } from '../../application/users-service';
import { UsersTypeDb } from '../../types/usersType';
import { container } from '../../psevdoIoc';

const usersService = container.resolve(UsersService);

export const registrationResendingValidationMiddleware = [
	body('email').custom(async (value) => {
		const user: UsersTypeDb | null = await usersService.findUserByEmail(value);
		if (!user) throw new Error('user not found');
		if (user.emailConfirmation.isConfirmed) throw new Error('already confirmed');
		if (user.emailConfirmation.expirationDate < new Date())
			throw new Error('confirmed code date expired');

		return true;
	}),
];
