import request from 'supertest';
import { HttpStatusCode } from '../../types/StatusCode';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { app } from '../../init';
import { connectMemoryDb, disconnectMemoryDb } from '../../db/memoryDb';
import { UsersType } from '../../types/usersType';
import { UserModel } from '../../db/db';
import { idCreator } from '../../helpers/idCreator';
import add from 'date-fns/add';

jest.setTimeout(30 * 1000);

describe('/users', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const basicAuth = 'Basic YWRtaW46cXdlcnR5';
	const wrongBasicAuth = 'invalid-basic-auth';
	const randomId = new ObjectId();
	const userErrorsMessages = {
		errorsMessages: [
			{
				field: 'login',
				message: expect.any(String),
			},
			{
				field: 'login',
				message: expect.any(String),
			},
			{
				field: 'password',
				message: expect.any(String),
			},
			{
				field: 'password',
				message: expect.any(String),
			},
			{
				field: 'email',
				message: expect.any(String),
			},
		],
	};

	describe('add, get, delete new user', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/get/delete', async () => {
			let user: UsersType;

			const createdUser = await request(app)
				.post('/users')
				.set('authorization', basicAuth)
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: 'password',
				})
				.expect(HttpStatusCode.CREATED);

			expect(createdUser.body).toEqual({
				id: expect.any(String),
				login: 'login',
				email: 'email@email.ru',
				createdAt: expect.any(String),
			});

			user = createdUser.body;

			await request(app).get(`/users/${user.id}`).expect(HttpStatusCode.OK);

			await request(app)
				.delete(`/users/${user.id}`)
				.set('authorization', basicAuth)
				.expect(HttpStatusCode.NO_CONTENT);

			await request(app).get(`/users/${user.id}`).expect(HttpStatusCode.NOT_FOUND);
		});
	});

	describe('add new user wrong body data', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post', async () => {
			const addBlogError = await request(app)
				.post('/users')
				.set('authorization', basicAuth)
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(addBlogError.body).toEqual(userErrorsMessages);
		});
	});

	describe('add exiting user', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post', async () => {
			await request(app)
				.post('/users')
				.set('authorization', basicAuth)
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: 'password',
				})
				.expect(HttpStatusCode.CREATED);

			const createdUser = await request(app)
				.post('/users')
				.set('authorization', basicAuth)
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: 'password',
				})
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(createdUser.body).toEqual({
				errorsMessages: [
					{
						field: 'email',
						message: expect.any(String),
					},
					{
						field: 'login',
						message: expect.any(String),
					},
				],
			});
		});
	});

	describe('add, delete user with not authorized user', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/delete', async () => {
			await request(app)
				.post('/users')
				.set('authorization', wrongBasicAuth)
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: 'password',
				})
				.expect(HttpStatusCode.UNAUTHORIZED);

			await request(app)
				.delete(`/users/${randomId}`)
				.set('authorization', wrongBasicAuth)
				.expect(HttpStatusCode.UNAUTHORIZED);
		});
	});

	describe('should return 404 for not existing user', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('get', async () => {
			await request(app).get(`/users/${randomId}`).expect(HttpStatusCode.NOT_FOUND);
		});
	});

	describe('should return 200 and all users null', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('get', async () => {
			const response = await request(app).get('/users').expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});
	});

	describe('get all users and sorting', () => {
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

		it('should return 200 and all users', async () => {
			const response = await request(app).get('/users').expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						login: 'bLogin',
						email: 'bemail@email.ru',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						login: 'cLogin',
						email: 'cemail@email.ru',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						login: 'aLogin',
						email: 'aemail@email.ru',
						createdAt: expect.any(String),
					},
				],
			});
		});

		it('sorting and pages users', async () => {
			const response = await request(app)
				.get('/users?sortBy=login&pageSize=2&sortDirection=asc')
				.expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						login: 'aLogin',
						email: 'aemail@email.ru',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						login: 'bLogin',
						email: 'bemail@email.ru',
						createdAt: expect.any(String),
					},
				],
			});
		});
	});
});
