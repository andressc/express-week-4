import { usersCollection } from '../db/db';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { paginationCalc } from '../helpers/paginationCalc';
import { UsersType } from '../types/usersType';

export const usersRepository = {
	async findAllUsers(query: PaginationTypeQuery): Promise<PaginationType<UsersType[]>> {
		const totalCount = await usersCollection.countDocuments({});

		const {
			pagesCount: pagesCount,
			page,
			pageSize,
			skip,
		} = paginationCalc({ ...query, totalCount });

		const items: UsersType[] = await usersCollection
			.find(
				{},
				{
					projection: {
						_id: 0,
						'accountData.passwordHash': 0,
						'accountData.email': 0,
						emailConfirmation: 0,
					},
				},
			)
			.skip(skip)
			.limit(pageSize)
			.toArray();

		return { pagesCount, page, pageSize, totalCount, items };
	},

	async findUserById(id: string): Promise<UsersType | null> {
		const user: UsersType | null = await usersCollection.findOne(
			{ id },
			{ projection: { _id: 0 } },
		);

		if (user) return user;
		return null;
	},

	async findUserByLogin(login: string): Promise<UsersType | null> {
		return await usersCollection.findOne({ 'accountData.login': login });
	},

	async findUserByEmail(email: string): Promise<UsersType | null> {
		return await usersCollection.findOne({ 'accountData.email': email });
	},

	async findUserByConfirmationCode(code: string): Promise<UsersType | null> {
		return await usersCollection.findOne({ 'emailConfirmation.confirmationCode': code });
	},

	async isUserExists(email: string, login: string): Promise<boolean> {
		const findUserByEmail = await usersCollection.findOne({ 'accountData.email': email });
		const findUserByLogin = await usersCollection.findOne({ 'accountData.login': login });

		return findUserByEmail !== null || findUserByLogin !== null;
	},

	async updateIsConfirmed(id: string): Promise<boolean> {
		const result = await usersCollection.updateOne(
			{ id },
			{ $set: { 'emailConfirmation.isConfirmed': true } },
		);
		return result.matchedCount === 1;
	},

	async deleteUser(id: string): Promise<boolean> {
		const result = await usersCollection.deleteOne({ id });
		return result.deletedCount === 1;
	},

	async deleteAllUsers(): Promise<boolean> {
		const result = await usersCollection.deleteMany({});
		return result.deletedCount === 1;
	},

	async createUser(newUser: UsersType): Promise<{ id: string; login: string }> {
		await usersCollection.insertOne({ ...newUser });

		const {
			id,
			accountData: { login },
		} = newUser;

		return { id, login };
	},
};
