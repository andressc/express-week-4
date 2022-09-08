import {bloggersCollection, usersCollection} from '../db/db';
import {EmailConfirmation, UsersTypeDb} from '../types/usersType';
import {DbRepository} from './db-repository';
import {ObjectId} from 'mongodb';

export class UsersRepository extends DbRepository {
	async findAllUsers(skip: number, pageSize: number, sortBy: {}): Promise<UsersTypeDb[]> {
		return usersCollection
			.find({})
			.skip(skip)
			.limit(pageSize)
			.sort(sortBy)
			.toArray();
	}

	async findUserById(id: ObjectId): Promise<UsersTypeDb | null> {
		const user: UsersTypeDb | null = await usersCollection.findOne({ _id: id });

		if (!user) return null;
		return user;
	}

	async findUserByLogin(login: string): Promise<UsersTypeDb | null> {
		return await usersCollection.findOne({ 'accountData.login': login });
	}

	async findUserByEmail(email: string): Promise<UsersTypeDb | null> {
		return await usersCollection.findOne({ 'accountData.email': email });
	}

	async findUserByConfirmationCode(code: string): Promise<UsersTypeDb | null> {
		return await usersCollection.findOne({ 'emailConfirmation.confirmationCode': code });
	}

	async updateIsConfirmed(id: ObjectId): Promise<boolean> {
		const result = await usersCollection.updateOne(
			{ _id: id },
			{ $set: { 'emailConfirmation.isConfirmed': true } },
		);
		return result.matchedCount === 1;
	}

	async updateEmailConfirmation(
		email: string,
		emailConfirmation: EmailConfirmation,
	): Promise<boolean> {
		const result = await usersCollection.updateOne(
			{ 'accountData.email': email },
			{ $set: { emailConfirmation } },
		);
		return result.matchedCount === 1;
	}

	async deleteUser(id: ObjectId): Promise<boolean> {
		const result = await usersCollection.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async deleteAllUsers(): Promise<boolean> {
		const result = await usersCollection.deleteMany({});
		return result.deletedCount === 1;
	}

	async createUser(newUser: UsersTypeDb): Promise<ObjectId | null> {
		const result = await usersCollection.insertOne(newUser);

		if (!result.acknowledged) return null;
		return result.insertedId;
	}

	async getTotalCount(): Promise<number> {
		return await bloggersCollection.countDocuments({});
	}
}
