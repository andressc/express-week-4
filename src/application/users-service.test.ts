import { container } from '../psevdoIoc';
import { UsersService } from './users-service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { UserModel } from '../db/db';
import { UsersTypeDb } from '../types/usersType';

describe('Integration test for users-service', () => {
	let mongoServer: MongoMemoryServer;
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		await mongoose.connect(mongoUri);
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await mongoServer.stop();
	});

	const usersService = container.resolve(UsersService);

	describe('createUser', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('user test add to database', async () => {
			let login = 'andressc';
			let email = 'andressc@mail.ru';
			let password = '123456';

			const result = await usersService.createUser(login, email, password);
			expect(result).toEqual({
				id: expect.any(String),
				login,
			});

			const userModel: UsersTypeDb | null = await UserModel.findById({ _id: result.id });

			expect(userModel).not.toBeNull();
			//expect(userModel?._id).toStrictEqual(result.id)
		});
	});
});
