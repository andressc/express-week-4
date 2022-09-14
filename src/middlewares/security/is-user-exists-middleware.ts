import { body } from 'express-validator';
import { usersService } from '../../application/users-service';

export const isUserExistsMiddleware = [
	body('email').custom(async (value) => {
		const user = await usersService.findUserByEmail(value);

		if (user) throw new Error('user already exists');
		return true;
	}),
	body('login').custom(async (value) => {
		const user = await usersService.findUserByLogin(value);

		if (user) throw new Error('user already exists');
		return true;
	}),
];
