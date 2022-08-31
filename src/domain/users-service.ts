import { idCreator } from '../helpers/idCreator';
import { usersRepository } from '../repositories/users-repository';
import bcrypt from 'bcrypt';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { UsersType } from '../types/usersType';
import { generateHash } from '../helpers/generateHash';

export const usersService = {
	async findAllUsers(query: PaginationTypeQuery): Promise<PaginationType<UsersType[]>> {
		return usersRepository.findAllUsers(query);
	},

	async findUserById(id: string): Promise<UsersType | null> {
		return usersRepository.findUserById(id);
	},

	async createUser(
		login: string,
		email: string,
		password: string,
	): Promise<{ id: string; login: string } | null> {
		const isUserExists = await usersRepository.isUserExists(email, login);
		if (isUserExists) return null;

		const passwordSalt = await bcrypt.genSalt(10);
		const passwordHash = await generateHash(password, passwordSalt);

		const newUser = {
			id: idCreator(),
			accountData: {
				login,
				email,
				passwordHash,
			},
			emailConfirmation: {
				confirmationCode: '',
				expirationDate: new Date(),
				isConfirmed: true,
			},
		};
		return await usersRepository.createUser(newUser);
	},

	async deleteUser(id: string): Promise<boolean> {
		return await usersRepository.deleteUser(id);
	},
};
