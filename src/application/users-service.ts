import { idCreator } from '../helpers/idCreator';
import bcrypt from 'bcrypt';
import { PaginationCalc, PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { UsersType, UsersTypeDb } from '../types/usersType';
import { generateHash } from '../helpers/generateHash';
import { generateConfirmationCode } from '../helpers/generateConfirmationCode';
import { NotFoundError } from '../errors/notFoundError';
import { ERROR_DB, USER_NOT_FOUND } from '../errors/errorsMessages';
import { ObjectId } from 'mongodb';
import { paginationCalc } from '../helpers/paginationCalc';
import { UsersRepository } from '../repositories/users-repository';
import { inject, injectable } from 'inversify';
import { dateCreator } from '../helpers/dateCreator';

@injectable()
export class UsersService {
	constructor(@inject(UsersRepository) protected usersRepository: UsersRepository) {}

	async findAllUsers(
		query: PaginationTypeQuery,
	): Promise<PaginationType<Array<{ id: ObjectId; login: string }>>> {
		const searchLoginTerm = query.searchLoginTerm;
		const searchEmailTerm = query.searchEmailTerm;

		const totalCount: number = await this.usersRepository.getTotalCount(
			searchLoginTerm,
			searchEmailTerm,
		);
		const data: PaginationCalc = paginationCalc({ ...query, totalCount });

		const items: UsersTypeDb[] = await this.usersRepository.findAllUsers(
			data.skip,
			data.pageSize,
			data.sortBy,
			searchLoginTerm,
			searchEmailTerm,
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
	}

	async findUserById(id: ObjectId): Promise<UsersType> {
		const user: UsersTypeDb | null = await this.usersRepository.findUserById(id);
		if (!user) throw new NotFoundError(USER_NOT_FOUND);

		const { _id, emailConfirmation, accountData, createdAt } = user;
		return { id: _id, emailConfirmation, accountData, createdAt };
	}

	async createUser(
		login: string,
		email: string,
		password: string,
	): Promise<{ id: string; login: string }> {
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
			createdAt: dateCreator(),
		};

		const createdId: ObjectId | null = await this.usersRepository.createUser(newUser);
		if (!createdId) throw new Error(ERROR_DB);

		return { id: createdId.toString(), login };
	}

	async deleteUser(id: ObjectId): Promise<void> {
		const result: boolean = await this.usersRepository.deleteUser(id);
		if (!result) throw new NotFoundError(USER_NOT_FOUND);
	}

	async findUserByEmail(email: string): Promise<UsersTypeDb | null> {
		return await this.usersRepository.findUserByEmail(email);
	}

	async findUserByConfirmationCode(code: string): Promise<UsersTypeDb> {
		const user: UsersTypeDb | null = await this.usersRepository.findUserByConfirmationCode(code);
		if (!user) throw new NotFoundError(USER_NOT_FOUND);
		return user;
	}

	async findUserByLogin(code: string): Promise<UsersTypeDb | null> {
		return this.usersRepository.findUserByLogin(code);
	}
}
