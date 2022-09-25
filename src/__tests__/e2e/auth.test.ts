import request from 'supertest';
import { HttpStatusCode } from '../../types/StatusCode';
import mongoose from 'mongoose';
import { app } from '../../init';
import { connectMemoryDb, disconnectMemoryDb } from '../../db/memoryDb';

jest.setTimeout(30 * 1000);

describe('/auth', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const basicAuth = 'Basic YWRtaW46cXdlcnR5';
	const loginErrorsMessages = {
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
		],
	};

	const registrationErrorsMessages = {
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

	describe('login', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('login User', async () => {
			await request(app)
				.post('/users')
				.set('authorization', basicAuth)
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: '123456',
				})
				.expect(HttpStatusCode.CREATED);

			const accessToken = await request(app)
				.post('/auth/login')
				.send({
					login: 'login',
					password: '123456',
				})
				.expect(HttpStatusCode.OK);

			expect(accessToken.body).toEqual({
				accessToken: expect.any(String)
			})
		});
	});

	describe('login wrong body data', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('wrong body data', async () => {
			const login = await request(app)
				.post('/auth/login')
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(login.body).toEqual(loginErrorsMessages);
		});
	});

	/*describe('registration and find user', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('registration and find User and test user exists', async () => {
			const createdUser = await request(app)
				.post('/auth/registration')
				.send({
					login: 'login',
					email: 'andressc@mail.ru',
					password: '123456',
				})
				.expect(HttpStatusCode.NO_CONTENT);

			const user = createdUser.body
			await request(app).get(`/users/${user.id}`).expect(HttpStatusCode.OK);

			const userError = await request(app)
				.post('/auth/registration')
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: '123456',
				})
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(userError.body).toEqual({
				errorMessages: [
					{
						field: 'login',
						message: expect.any(String),
					},
					{
						field: 'email',
						message: expect.any(String),
					},
				]
			});
		});
	});*/

	describe('registration wrong body data', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('wrong body data', async () => {
			const user = await request(app)
				.post('/auth/registration')
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(user.body).toEqual(registrationErrorsMessages);
		});
	});

	describe('too many requests', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('login', async () => {
			for(let i = 0; i < 5; i++) {
				await request(app)
					.post('/auth/login')
					.expect(HttpStatusCode.BAD_REQUEST);
			}
			await request(app)
				.post('/auth/login')
				.expect(HttpStatusCode.TOO_MANY_REQUESTS);
		});

		it('registration', async () => {
			for(let i = 0; i < 5; i++) {
				await request(app)
					.post('/auth/registration')
					.expect(HttpStatusCode.BAD_REQUEST);
			}
			await request(app)
				.post('/auth/registration')
				.expect(HttpStatusCode.TOO_MANY_REQUESTS);
		});

		it('registration-confirmation', async () => {
			for(let i = 0; i < 5; i++) {
				await request(app)
					.post('/auth/registration-confirmation')
					.expect(HttpStatusCode.BAD_REQUEST);
			}
			await request(app)
				.post('/auth/registration-confirmation')
				.expect(HttpStatusCode.TOO_MANY_REQUESTS);
		});

		it('registration-email-resending', async () => {
			for(let i = 0; i < 5; i++) {
				await request(app)
					.post('/auth/registration-email-resending')
					.expect(HttpStatusCode.BAD_REQUEST);
			}
			await request(app)
				.post('/auth/registration-email-resending')
				.expect(HttpStatusCode.TOO_MANY_REQUESTS);
		});

		it('me', async () => {
			for(let i = 0; i < 5; i++) {
				await request(app)
					.get('/auth/me')
					.expect(HttpStatusCode.UNAUTHORIZED);
			}
			await request(app)
				.get('/auth/me')
				.expect(HttpStatusCode.TOO_MANY_REQUESTS);
		});
	});
});
