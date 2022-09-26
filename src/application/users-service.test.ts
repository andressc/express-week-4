import { container } from '../psevdoIoc';
import { UsersService } from './users-service';
import mongoose from 'mongoose';
import { UserModel } from '../db/db';
import { UsersTypeDb } from '../types/usersType';
import { idCreator } from '../helpers/idCreator';
import add from 'date-fns/add';
import { ObjectId } from 'mongodb';
import { connectMemoryDb, disconnectMemoryDb } from '../db/memoryDb';
import { USER_NOT_FOUND } from '../errors/errorsMessages';

describe('Integration test for users-service', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const idUser = idCreator();
	const loginUser = 'login';
	const emailUser = 'email@email.ru';
	const passwordUser = '123456';
	const confirmationCodeUser = 'new confirmation code';

	const userCreator = (
		login: string,
		email: string,
		hours: number,
		id?: ObjectId,
		confirmationCode?: string,
	) => {
		return {
			_id: !id ? idCreator() : id,
			emailConfirmation: {
				confirmationCode: !confirmationCode ? 'confirmationCode' : confirmationCode,
				expirationDate: new Date(),
				isConfirmed: true,
			},
			accountData: {
				login,
				email,
				passwordHash: 'passwordHash',
			},
			createdAt: add(new Date(), {
				hours: hours,
			}),
		};
	};

	const userResultCreator = (login: string, email: string) => {
		return {
			id: expect.any(Object),
			login,
			email,
			createdAt: expect.any(Date),
		};
	};

	const userResultCreator2 = (id: ObjectId, login: string, email: string) => {
		return {
			id,
			emailConfirmation: {
				confirmationCode: expect.any(String),
				expirationDate: expect.any(Date),
				isConfirmed: true,
			},
			accountData: {
				login,
				email,
				passwordHash: expect.any(String),
			},
			createdAt: expect.any(Date),
		};
	};

	const usersService = container.resolve(UsersService);

	describe('findAllUsers', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await UserModel.insertMany([
				userCreator('aLogin', 'aemail@email.ru', 1),
				userCreator('cLogin', 'cemail@email.ru', 2),
				userCreator('bLogin', 'bemail@email.ru', 3),
			]);
		});

		it('user test select all users', async () => {
			const result = await usersService.findAllUsers({
				pageNumber: '1',
				pageSize: '10',
				totalCount: '',
				sortBy: null,
				sortDirection: null,
			});
			expect(result).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					userResultCreator('bLogin', 'bemail@email.ru'),
					userResultCreator('cLogin', 'cemail@email.ru'),
					userResultCreator('aLogin', 'aemail@email.ru'),
				],
			});
		});

		it('user test select all users and sort', async () => {
			const result = await usersService.findAllUsers({
				pageNumber: '1',
				pageSize: '2',
				totalCount: '',
				sortBy: 'login',
				sortDirection: 'asc',
			});
			expect(result).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					userResultCreator('aLogin', 'aemail@email.ru'),
					userResultCreator('bLogin', 'bemail@email.ru'),
				],
			});
		});

		/*
		it('user test select all users and search login', async () => {
			const result = await usersService.findAllUsers({
				pageNumber: '1',
				pageSize: '2',
				totalCount: '',
				sortBy: 'login',
				sortDirection: 'asc',
			});
			expect(result).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					userResultCreator('aLogin', 'aemail@email.ru'),
					userResultCreator('bLogin', 'bemail@email.ru'),
				],
			});
		});

		it('user test select all users and search email', async () => {
			const result = await usersService.findAllUsers({
				pageNumber: '1',
				pageSize: '2',
				totalCount: '',
				sortBy: 'login',
				sortDirection: 'asc',
			});
			expect(result).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					userResultCreator('aLogin', 'aemail@email.ru'),
					userResultCreator('bLogin', 'bemail@email.ru'),
				],
			});
		});
		 */
	});

	describe('findUserById', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await UserModel.create(userCreator(loginUser, emailUser, 1, idUser));
		});

		it('user test find user by id', async () => {
			const result = await usersService.findUserById(idUser);
			expect(result).toEqual(userResultCreator2(idUser, loginUser, emailUser));
		});

		it('user test find user by non existing id', async () => {
			await expect(usersService.findUserById(idCreator())).rejects.toThrow(USER_NOT_FOUND);
		});
	});

	describe('findUserByEmail', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await UserModel.create(userCreator(loginUser, emailUser, 0, idUser));
		});

		it('user test find user by email', async () => {
			const result = await usersService.findUserByEmail(emailUser);
			expect(result).toEqual(userResultCreator2(idUser, loginUser, emailUser));
		});

		it('user test find user by non existing email', async () => {
			const result = await usersService.findUserByEmail('non_existing');
			expect(result).toBeNull();
		});
	});

	describe('findUserByLogin', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await UserModel.create(userCreator(loginUser, emailUser, 0, idUser));
		});

		it('user test find user by login', async () => {
			const result = await usersService.findUserByLogin(loginUser);
			expect(result).toEqual(userResultCreator2(idUser, loginUser, emailUser));
		});

		it('user test find user by non existing login', async () => {
			const result = await usersService.findUserByLogin('non_existing');
			expect(result).toBeNull();
		});
	});

	describe('findUserByConfirmationCode', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await UserModel.create(userCreator(loginUser, emailUser, 1, idUser, confirmationCodeUser));
		});

		it('user test find user by confirmation code', async () => {
			const result = await usersService.findUserByConfirmationCode(confirmationCodeUser);

			expect(result.emailConfirmation.confirmationCode).toBe(confirmationCodeUser);
			expect(result.accountData.login).toBe(loginUser);
			expect(result.accountData.email).toBe(emailUser);
		});

		it('user test find user by non existing confirmation code', async () => {
			await expect(usersService.findUserByConfirmationCode('conformationCode')).rejects.toThrow(
				USER_NOT_FOUND,
			);
		});
	});

	describe('createUser', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('user test add to database', async () => {
			const result = await usersService.createUser(loginUser, emailUser, passwordUser);
			expect(result).toEqual({
				id: expect.any(String),
				login: loginUser,
				email: emailUser,
				createdAt: expect.any(String),
			});

			const userModel: UsersTypeDb | null = await UserModel.findById({ _id: result.id });

			expect(userModel).not.toBeNull();
		});
	});

	describe('deleteUser', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await UserModel.create(userCreator(loginUser, emailUser, 1, idUser));
		});

		it('user test delete user by id', async () => {
			const result = await usersService.deleteUser(idUser);
			expect(result).toBe(void 0);
		});

		/*it('find user after deleting', async () => {
			sleep(1000);
			const result = await UserModel.findOne({ _id: idUser });
			expect(result).toBeNull();
		});*/

		it('delete non exists user', async () => {
			await expect(usersService.deleteUser(idCreator())).rejects.toThrow(USER_NOT_FOUND);
		});
	});
});
