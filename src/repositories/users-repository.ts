import { UserModel } from '../db/db';
import { EmailConfirmation, UsersTypeDb } from '../types/usersType';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';

@injectable()
export class UsersRepository {
	async findAllUsers(
		skip: number,
		pageSize: number,
		sortBy: {},
		searchLoginTerm: string | undefined,
		searchEmailTerm: string | undefined,
	): Promise<UsersTypeDb[]> {
		const searchString = this.searchTerm(searchLoginTerm, searchEmailTerm);
		return UserModel.find(searchString).sort(sortBy).skip(skip).limit(pageSize).lean();
	}

	async findUserById(id: ObjectId): Promise<UsersTypeDb | null> {
		const user: UsersTypeDb | null = await UserModel.findOne({ _id: id });

		if (!user) return null;
		return user;
	}

	async findUserByLogin(login: string): Promise<UsersTypeDb | null> {
		return UserModel.findOne({ 'accountData.login': login });
	}

	async findUserByEmail(email: string): Promise<UsersTypeDb | null> {
		return UserModel.findOne({ 'accountData.email': email });
	}

	async findUserByConfirmationCode(code: string): Promise<UsersTypeDb | null> {
		return UserModel.findOne({ 'emailConfirmation.confirmationCode': code });
	}

	async updateIsConfirmed(id: ObjectId): Promise<boolean> {
		const result = await UserModel.updateOne(
			{ _id: id },
			{ $set: { 'emailConfirmation.isConfirmed': true } },
		);
		return result.matchedCount === 1;
	}

	async updateEmailConfirmation(
		email: string,
		emailConfirmation: EmailConfirmation,
	): Promise<boolean> {
		const result = await UserModel.updateOne(
			{ 'accountData.email': email },
			{ $set: { emailConfirmation } },
		);
		return result.matchedCount === 1;
	}

	async deleteUser(id: ObjectId): Promise<boolean> {
		const result = await UserModel.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async deleteAllUsers(): Promise<boolean> {
		const result = await UserModel.deleteMany({});
		return result.deletedCount === 1;
	}

	async createUser(newUser: UsersTypeDb): Promise<ObjectId | null> {
		const result = await UserModel.create(newUser);

		if (!result._id) return null;
		return result._id;
	}

	async getTotalCount(
		searchLoginTerm: string | undefined,
		searchEmailTerm: string | undefined,
	): Promise<number> {
		const searchString = this.searchTerm(searchLoginTerm, searchEmailTerm);
		return UserModel.countDocuments(searchString);
	}

	private searchTerm = (login: string | undefined, email: string | undefined): {} => {
		let searchString = {};

		const searchLoginTerm = login ? { login: { $regex: login, $options: 'i' } } : null;
		const searchEmailTerm = email ? { email: { $regex: email, $options: 'i' } } : null;

		if (searchLoginTerm) searchString = searchLoginTerm;
		if (searchEmailTerm) searchString = searchEmailTerm;

		if (searchLoginTerm && searchEmailTerm)
			searchString = { $or: [searchLoginTerm, searchEmailTerm] };

		return searchString;
	};
}
