import { container } from '../psevdoIoc';
import { UsersService } from './users-service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { UserModel } from '../db/db';
import { UsersTypeDb } from '../types/usersType';
import {idCreator} from "../helpers/idCreator";
import add from "date-fns/add";

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
				email,
				createdAt: expect.any(String),
			});

			const userModel: UsersTypeDb | null = await UserModel.findById({ _id: result.id });

			expect(userModel).not.toBeNull();
		});
	});

	describe('findAllUsers', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await UserModel.insertMany([
				{
					_id: idCreator(),
					emailConfirmation: {
						confirmationCode: 'confirmationCode',
						expirationDate: new Date(),
						isConfirmed: true,
					},
					accountData: {
						login: 'aLogin',
						email: 'aemail@email.ru',
						passwordHash: 'passwordHash',
					},
					createdAt: add(new Date(), {
						hours: 1,
					}),
				},
				{
					_id: idCreator(),
					emailConfirmation: {
						confirmationCode: 'confirmationCode',
						expirationDate: new Date(),
						isConfirmed: true,
					},
					accountData: {
						login: 'cLogin',
						email: 'cemail@email.ru',
						passwordHash: 'passwordHash',
					},
					createdAt: add(new Date(), {
						hours: 2,
					}),
				},
				{
					_id: idCreator(),
					emailConfirmation: {
						confirmationCode: 'confirmationCode',
						expirationDate: new Date(),
						isConfirmed: true,
					},
					accountData: {
						login: 'bLogin',
						email: 'bemail@email.ru',
						passwordHash: 'passwordHash',
					},
					createdAt: add(new Date(), {
						hours: 3,
					}),
				},
			]);
		});

		it('user test select all users', async () => {

			const result = await usersService.findAllUsers({
				pageNumber: "1",
				pageSize: "10",
				totalCount: "",
				sortBy: null,
				sortDirection: null,
			});
			expect(result).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{
						id: expect.any(Object),
						login: 'bLogin',
						email: 'bemail@email.ru',
						createdAt: expect.any(Date),
					},
					{
						id: expect.any(Object),
						login: 'cLogin',
						email: 'cemail@email.ru',
						createdAt: expect.any(Date),
					},
					{
						id: expect.any(Object),
						login: 'aLogin',
						email: 'aemail@email.ru',
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it('user test select all users and sort', async () => {

			const result = await usersService.findAllUsers({
				pageNumber: "1",
				pageSize: "2",
				totalCount: "",
				sortBy: "login",
				sortDirection: "asc",
			});
			expect(result).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{
						id: expect.any(Object),
						login: 'aLogin',
						email: 'aemail@email.ru',
						createdAt: expect.any(Date),
					},
					{
						id: expect.any(Object),
						login: 'bLogin',
						email: 'bemail@email.ru',
						createdAt: expect.any(Date),
					},
				],
			});
		});
	});
});
