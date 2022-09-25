import request from 'supertest';
import { HttpStatusCode } from '../../types/StatusCode';
import mongoose from 'mongoose';
import { BlogModel, PostModel } from '../../db/db';
import { app } from '../../init';
import { connectMemoryDb, disconnectMemoryDb } from '../../db/memoryDb';
import { PostsType } from '../../types/postsType';
import { idCreator } from '../../helpers/idCreator';
import add from 'date-fns/add';

jest.setTimeout(30 * 1000);

const sleep = (milliseconds: number) => {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

describe('/posts', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const basicAuth = 'Basic YWRtaW46cXdlcnR5';
	const wrongBasicAuth = 'invalid-basic-auth';
	const name = 'rebrov';
	const randomId = idCreator().toString();
	const youtubeUrl = 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A';
	const postErrorsMessages = {
		errorsMessages: [
			{
				field: 'title',
				message: expect.any(String),
			},
			{
				field: 'shortDescription',
				message: expect.any(String),
			},
			{
				field: 'content',
				message: expect.any(String),
			},
			{
				field: 'blogId',
				message: expect.any(String),
			},
			{
				field: 'blogId',
				message: expect.any(String),
			},
			/*{
				field: 'blogId',
				message: expect.any(String),
			},*/
		],
	};

	describe('add, get, delete new post', () => {
		const blogId = idCreator().toString();
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.create({
				_id: blogId,
				name,
				youtubeUrl,
				createdAt: new Date().toISOString(),
			});
		});

		it('post/get/delete', async () => {
			let post: PostsType;

			const createdPost = await request(app)
				.post('/posts')
				.set('authorization', basicAuth)
				.send({
					title: 'title',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId,
				})
				.expect(HttpStatusCode.CREATED);

			expect(createdPost.body).toEqual({
				id: expect.any(String),
				title: 'title',
				shortDescription: 'Short description',
				content: 'Content',
				blogId: blogId,
				blogName: name,
				createdAt: expect.any(String),
			});

			post = createdPost.body;

			await request(app).get(`/posts/${post.id}`).expect(HttpStatusCode.OK);

			await request(app)
				.delete(`/posts/${post.id}`)
				.set('authorization', basicAuth)
				.expect(HttpStatusCode.NO_CONTENT);

			sleep(1000);

			await request(app).get(`/posts/${post.id}`).expect(HttpStatusCode.NOT_FOUND);
		});
	});

	describe('update post', () => {
		const blogId = idCreator();
		const blogIdNew = idCreator();

		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.insertMany([
				{
					_id: blogId,
					name,
					youtubeUrl,
					createdAt: new Date().toISOString(),
				},
				{
					_id: blogIdNew,
					name: 'newName',
					youtubeUrl,
					createdAt: new Date().toISOString(),
				},
			]);
		});

		it('post/get/put', async () => {
			let post: PostsType;

			const createdPost = await request(app)
				.post('/posts')
				.set('authorization', basicAuth)
				.send({
					title: 'title',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId.toString(),
				})
				.expect(HttpStatusCode.CREATED);

			post = createdPost.body;

			const updatedPost = await request(app)
				.put(`/posts/${post.id}`)
				.set('authorization', basicAuth)
				.send({
					title: 'new title',
					shortDescription: 'new Short description',
					content: 'new Content',
					blogId: blogIdNew.toString(),
				})
				.expect(HttpStatusCode.NO_CONTENT);

			const getUpdatedPost = await request(app).get(`/posts/${post.id}`).expect(HttpStatusCode.OK);

			expect(getUpdatedPost.body).toEqual({
				id: expect.any(String),
				title: 'new title',
				shortDescription: 'new Short description',
				content: 'new Content',
				blogId: blogIdNew.toString(),
				blogName: 'newName',
				createdAt: expect.any(String),
			});
		});
	});

	describe('add, update new post wrong body data', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/put', async () => {
			const addPostError = await request(app)
				.post('/posts')
				.set('authorization', basicAuth)
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(addPostError.body).toEqual(postErrorsMessages);

			const updatePostError = await request(app)
				.put(`/posts/${idCreator().toString()}`)
				.set('authorization', basicAuth)
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(updatePostError.body).toEqual(postErrorsMessages);
		});
	});

	describe('add, delete, update post with not authorized use', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/put/delete', async () => {
			await request(app)
				.post('/posts')
				.set('authorization', wrongBasicAuth)
				.send({
					title: 'title',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: randomId,
				})
				.expect(HttpStatusCode.UNAUTHORIZED);

			await request(app)
				.delete(`/posts/${randomId}`)
				.set('authorization', wrongBasicAuth)
				.expect(HttpStatusCode.UNAUTHORIZED);

			await request(app)
				.put(`/posts/${randomId}`)
				.set('authorization', wrongBasicAuth)
				.send({
					title: 'title',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: randomId,
				})
				.expect(HttpStatusCode.UNAUTHORIZED);
		});
	});

	describe('should return 404 for not existing post', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('get', async () => {
			await request(app).get(`/posts/${randomId}`).expect(HttpStatusCode.NOT_FOUND);
		});
	});

	describe('should return 200 and all posts null', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('get', async () => {
			const response = await request(app).get('/posts').expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});
	});

	describe('create new post for specific blog', () => {
		const blogId = idCreator();

		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.create({
				_id: blogId,
				name,
				youtubeUrl,
				createdAt: new Date(),
			});
		});

		it('posts not Auth', async () => {
			await request(app)
				.post(`/blogs/${blogId}/posts`)
				.set('authorization', wrongBasicAuth)
				.send({
					title: 'title',
					shortDescription: 'Short description',
					content: 'Content',
					blogId,
				})
				.expect(HttpStatusCode.UNAUTHORIZED);
		});

		it('create post from blog', async () => {
			const createdPost = await request(app)
				.post(`/blogs/${blogId}/posts`)
				.set('authorization', basicAuth)
				.send({
					title: 'title',
					shortDescription: 'Short description',
					content: 'Content',
				})
				.expect(HttpStatusCode.CREATED);

			expect(createdPost.body).toEqual({
				id: expect.any(String),
				title: 'title',
				shortDescription: 'Short description',
				content: 'Content',
				blogId: blogId.toString(),
				blogName: name,
				createdAt: expect.any(String),
			});
		});
	});

	describe('get all posts and sorting', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			const blogId = idCreator();
			await BlogModel.create({
				_id: blogId,
				name,
				youtubeUrl,
				createdAt: new Date(),
			});

			await PostModel.insertMany([
				{
					id: idCreator(),
					title: 'aTitle',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId,
					blogName: name,
					createdAt: add(new Date(), {
						hours: 1,
					}),
				},
				{
					id: idCreator(),
					title: 'cTitle',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId,
					blogName: name,
					createdAt: add(new Date(), {
						hours: 2,
					}),
				},
				{
					id: idCreator(),
					title: 'bTitle',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId,
					blogName: name,
					createdAt: add(new Date(), {
						hours: 3,
					}),
				},
			]);
		});

		it('should return 200 and all posts', async () => {
			const response = await request(app).get('/posts').expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						title: 'bTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						title: 'cTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						title: 'aTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
				],
			});
		});

		it('sorting and pages posts', async () => {
			const response = await request(app)
				.get('/posts?sortBy=title&pageSize=2&sortDirection=asc')
				.expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						title: 'aTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						title: 'bTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
				],
			});
		});
	});

	describe('should return all posts for blogger and sorting', () => {
		const blogId = idCreator();
		const blogId2 = idCreator();

		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.insertMany([
				{
					_id: blogId,
					name,
					youtubeUrl,
					createdAt: new Date(),
				},
				{
					_id: blogId2,
					name,
					youtubeUrl,
					createdAt: new Date(),
				},
			]);

			await PostModel.insertMany([
				{
					id: idCreator(),
					title: 'aTitle',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId,
					blogName: name,
					createdAt: add(new Date(), {
						hours: 1,
					}),
				},
				{
					id: idCreator(),
					title: 'cTitle',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId,
					blogName: name,
					createdAt: add(new Date(), {
						hours: 2,
					}),
				},
				{
					id: idCreator(),
					title: 'bTitle',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId,
					blogName: name,
					createdAt: add(new Date(), {
						hours: 3,
					}),
				},
				{
					id: idCreator(),
					title: 'dTitle',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: blogId2,
					blogName: name,
					createdAt: add(new Date(), {
						hours: 4,
					}),
				},
			]);
		});

		it('should return all posts for blogger', async () => {
			const response = await request(app).get(`/blogs/${blogId}/posts`).expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						title: 'bTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						title: 'cTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						title: 'aTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
				],
			});
		});

		it('sorting and pages posts for blogger', async () => {
			const response = await request(app)
				.get(`/blogs/${blogId}/posts?sortBy=title&pageSize=2&sortDirection=asc`)
				.expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						title: 'aTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						title: 'bTitle',
						shortDescription: 'Short description',
						content: 'Content',
						blogId: expect.any(String),
						blogName: name,
						createdAt: expect.any(String),
					},
				],
			});
		});
	});
});
