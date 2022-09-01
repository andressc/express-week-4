import { body } from 'express-validator';
import {usersRepository} from "../../repositories/users-repository";

export const isUserExistsMiddleware = [
	body('email')
		.custom(async (value) => {
			const user = await usersRepository.findUserByEmail(value);

			if (user) throw new Error('user already exists');
			return true;
		}),
	body('login')
		.custom(async (value) => {
			const user = await usersRepository.findUserByLogin(value);

			if (user) throw new Error('user already exists');
			return true;
		}),
];
