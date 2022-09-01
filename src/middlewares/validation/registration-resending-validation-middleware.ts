import { body } from 'express-validator';
import {usersRepository} from "../../repositories/users-repository";

export const registrationResendingValidationMiddleware = [
	body('email')
		.custom(async (value) => {
			const user = await usersRepository.findUserByEmail(value);
			if (!user) throw new Error('user not found');
			if (user.emailConfirmation.isConfirmed) throw new Error('already confirmed');
			if (user.emailConfirmation.expirationDate < new Date()) throw new Error('confirmed code date expired');

			return true;
	})

];
