import { idCreator } from '../helpers/idCreator';
import bcrypt from 'bcrypt';
import { PaginationCalc, PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { UsersType, UsersTypeDb } from '../types/usersType';
import { generateHash } from '../helpers/generateHash';
import { generateConfirmationCode } from '../helpers/generateConfirmationCode';
import { usersRepository } from '../index';
import { NotFoundError } from '../errors/notFoundError';
import { ERROR_DB, USER_NOT_FOUND } from '../errors/errorsMessages';
import { ObjectId } from 'mongodb';
import { paginationCalc } from '../helpers/paginationCalc';

export const usersService = {
	async findAllUsers(
		query: PaginationTypeQuery,
	): Promise<PaginationType<Array<{ id: ObjectId; login: string }>>> {
		const totalCount: number = await usersRepository.getTotalCount();
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		const items: UsersTypeDb[] = await usersRepository.findAllUsers(
			data.skip,
			data.pageSize,
			data.sortBy,
		);

		const newItems: Array<{ id: ObjectId; login: string }> = items.map((item) => {
			const {
				_id,
				accountData: { login },
			} = item;
			return { id: _id, login };
		});

		return {
			pagesCount: data.pagesCount,
			page: data.pageNumber,
			pageSize: data.pageSize,
			totalCount: data.totalCount,
			items: newItems,
		};
	},

	async findUserById(id: ObjectId): Promise<UsersType> {
		const user: UsersTypeDb | null = await usersRepository.findUserById(id);
		if (!user) throw new NotFoundError(USER_NOT_FOUND);

		const { _id, emailConfirmation, accountData } = user;
		return { id: _id, emailConfirmation, accountData };
	},

	async createUser(
		login: string,
		email: string,
		password: string,
	): Promise<{ id: ObjectId; login: string }> {
		const passwordSalt = await bcrypt.genSalt(10);
		const passwordHash = await generateHash(password, passwordSalt);

		const newUser: UsersTypeDb = {
			_id: idCreator(),
			accountData: {
				login,
				email,
				passwordHash,
			},
			emailConfirmation: generateConfirmationCode(true),
		};

		const createdId: ObjectId | null = await usersRepository.createUser(newUser);
		if (!createdId) throw new Error(ERROR_DB);

		return { id: createdId, login };
	},

	async deleteUser(id: ObjectId): Promise<void> {
		const result: boolean = await usersRepository.deleteUser(id);
		if (!result) throw new NotFoundError(USER_NOT_FOUND);
	},
};
