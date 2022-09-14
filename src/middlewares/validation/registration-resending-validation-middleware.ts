import { body } from 'express-validator';
import { usersService } from '../../application/users-service';
import { UsersTypeDb } from '../../types/usersType';

export const registrationResendingValidationMiddleware = [
	body('email').custom(async (value) => {
		const user: UsersTypeDb = await usersService.findUserByEmail(value);
		//if (!user) throw new Error('user not found');
		if (user.emailConfirmation.isConfirmed) throw new Error('already confirmed');
		if (user.emailConfirmation.expirationDate < new Date())
			throw new Error('confirmed code date expired');

		return true;
	}),
];
