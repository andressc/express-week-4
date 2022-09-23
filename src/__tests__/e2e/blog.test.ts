import request from 'supertest';
import { app } from '../../index';
import { BlogsType } from '../../types/blogsType';
import { HttpStatusCode } from '../../types/StatusCode';
import { config } from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { BlogModel } from '../../db/db';
import add from 'date-fns/add';

config();

jest.setTimeout(30 * 1000);

describe('/blogs', () => {
	let mongoServer: MongoMemoryServer;
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		await mongoose.connect(mongoUri);
		await mongoose.connection.db.dropDatabase();
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await mongoServer.stop();
	});

	const basicAuth = 'Basic YWRtaW46cXdlcnR5';
	const wrongBasicAuth = 'invalid-basic-auth';
	const name = 'rebrov';
	const youtubeUrl = 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A';
	const wrongYoutubeUrl = 'invalid-url';
	const randomId = new ObjectId();
	const blogErrorsMessages = {
		errorsMessages: [
			{
				field: 'name',
				message: expect.any(String),
			},
			{
				field: 'youtubeUrl',
				message: expect.any(String),
			},
		],
	};

	describe('add, get, delete new blog', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/get/delete', async () => {
			let blog: BlogsType;

			const createdBlog = await request(app)
				.post('/blogs')
				.set('authorization', basicAuth)
				.send({
					name,
					youtubeUrl,
				})
				.expect(HttpStatusCode.CREATED);

			expect(createdBlog.body).toEqual({
				id: expect.any(String),
				name,
				youtubeUrl,
				createdAt: expect.any(String),
			});

			blog = createdBlog.body;

			await request(app)
				.get(`/blogs/${blog.id}`)
				.send({
					name,
					youtubeUrl,
				})
				.expect(HttpStatusCode.OK);

			await request(app)
				.delete(`/blogs/${blog.id}`)
				.set('authorization', basicAuth)
				.expect(HttpStatusCode.NO_CONTENT);
		});
	});

	describe('update blog', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/get/put', async () => {
			let blog: BlogsType;

			const createdBlog = await request(app)
				.post('/blogs')
				.set('authorization', basicAuth)
				.send({
					name,
					youtubeUrl,
				})
				.expect(HttpStatusCode.CREATED);

			blog = createdBlog.body;

			const updatedBlog = await request(app)
				.put(`/blogs/${blog.id}`)
				.set('authorization', basicAuth)
				.send({
					name: 'newName',
					youtubeUrl: 'https://www.youtube.com/channel/aaaaaaaaaaaaaaaaaaaa',
				})
				.expect(HttpStatusCode.NO_CONTENT);

			const getUpdatedBlog = await request(app)
				.get(`/blogs/${blog.id}`)
				.send({
					name,
					youtubeUrl,
				})
				.expect(HttpStatusCode.OK);

			expect(getUpdatedBlog.body).toEqual({
				id: expect.any(String),
				name: 'newName',
				youtubeUrl: 'https://www.youtube.com/channel/aaaaaaaaaaaaaaaaaaaa',
				createdAt: expect.any(String),
			});
		});
	});

	describe('add, update new blog wrong body data', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/put', async () => {
			const addBlogError = await request(app)
				.post('/blogs')
				.set('authorization', basicAuth)
				.send({
					youtubeUrl: wrongYoutubeUrl,
				})
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(addBlogError.body).toEqual(blogErrorsMessages);

			const updateBlogError = await request(app)
				.put(`/blogs/${randomId}`)
				.set('authorization', basicAuth)
				.send({
					youtubeUrl: wrongYoutubeUrl,
				})
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(updateBlogError.body).toEqual(blogErrorsMessages);
		});
	});

	describe('add, delete, update blog with not authorized use', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/put/delete', async () => {
			await request(app)
				.post('/blogs')
				.set('authorization', wrongBasicAuth)
				.send({
					name,
					youtubeUrl,
				})
				.expect(HttpStatusCode.UNAUTHORIZED);

			await request(app)
				.delete(`/blogs/${randomId}`)
				.set('authorization', wrongBasicAuth)
				.send({
					name,
					youtubeUrl,
				})
				.expect(HttpStatusCode.UNAUTHORIZED);

			await request(app)
				.put(`/blogs/${randomId}`)
				.set('authorization', wrongBasicAuth)
				.send({
					name,
					youtubeUrl,
				})
				.expect(HttpStatusCode.UNAUTHORIZED);
		});
	});

	describe('should return 404 for not existing blog', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('get', async () => {
			await request(app).get(`/blogs/${randomId}`).expect(HttpStatusCode.NOT_FOUND);
		});
	});

	describe('should return 200 and all blogs null', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('get', async () => {
			const response = await request(app).get('/blogs').expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: expect.any(Number),
				page: expect.any(Number),
				pageSize: expect.any(Number),
				totalCount: expect.any(Number),
				items: [],
			});
		});
	});

	describe('get all blogs and sorting', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.insertMany([
				{
					id: new ObjectId(),
					name: 'aName',
					youtubeUrl: 'https://www.youtube.com/channel/1',
					createdAt: add(new Date(), {
						hours: 1,
					}),
				},
				{
					id: new ObjectId(),
					name: 'cName',
					youtubeUrl: 'https://www.youtube.com/channel/3',
					createdAt: add(new Date(), {
						hours: 2,
					}),
				},
				{
					id: new ObjectId(),
					name: 'bName',
					youtubeUrl: 'https://www.youtube.com/channel/2',
					createdAt: add(new Date(), {
						hours: 3,
					}),
				},
			]);
		});

		it('should return 200 and all blogs', async () => {
			const response = await request(app).get('/blogs').expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						name: 'bName',
						youtubeUrl: 'https://www.youtube.com/channel/2',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						name: 'cName',
						youtubeUrl: 'https://www.youtube.com/channel/3',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						name: 'aName',
						youtubeUrl: 'https://www.youtube.com/channel/1',
						createdAt: expect.any(String),
					},
				],
			});
		});

		it('sorting and pages blogs', async () => {
			const response = await request(app)
				.get('/blogs?sortBy=name&pageSize=2&sortDirection=asc')
				.expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						name: 'aName',
						youtubeUrl: 'https://www.youtube.com/channel/1',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						name: 'bName',
						youtubeUrl: 'https://www.youtube.com/channel/2',
						createdAt: expect.any(String),
					},
				],
			});
		});
	});
});
