import request from 'supertest';
import { HttpStatusCode } from '../../types/StatusCode';
import mongoose from 'mongoose';
import { BlogModel, CommentModel, PostModel } from '../../db/db';
import { app } from '../../init';
import { connectMemoryDb, disconnectMemoryDb } from '../../db/memoryDb';
import { idCreator } from '../../helpers/idCreator';
import add from 'date-fns/add';
import { CommentsType } from '../../types/commentsType';

jest.setTimeout(30 * 1000);

describe('/posts', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const basicAuth = 'Basic YWRtaW46cXdlcnR5';
	const name = 'rebrov';
	const randomId = idCreator().toString();
	const youtubeUrl = 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A';
	const commentsErrorsMessages = {
		errorsMessages: [
			{
				field: 'content',
				message: expect.any(String),
			},
			{
				field: 'content',
				message: expect.any(String),
			},
		],
	};

	describe('add, get, delete, update new comment', () => {
		const postId = idCreator().toString();
		const blogId = idCreator().toString();
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.create({
				_id: blogId,
				name,
				youtubeUrl,
				createdAt: new Date(),
			});

			await PostModel.create({
				_id: postId,
				title: 'aTitle',
				shortDescription: 'Short description',
				content: 'Content',
				blogId: blogId,
				blogName: name,
				createdAt: new Date(),
			});
		});

		it('post/get/delete/update', async () => {
			let comment: CommentsType;

			const createdUser = await request(app)
				.post('/users')
				.set('authorization', basicAuth)
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: '123456',
				})
				.expect(HttpStatusCode.CREATED);

			const authToken = await request(app)
				.post('/auth/login')
				.send({
					login: 'login',
					password: '123456',
				})
				.expect(HttpStatusCode.OK);

			const createdComment = await request(app)
				.post(`/posts/${postId}/comments`)
				.set('authorization', `Bearer ${authToken.body.accessToken}`)
				.send({
					content: 'content content content content content content content content',
				})
				.expect(HttpStatusCode.CREATED);

			expect(createdComment.body).toEqual({
				id: expect.any(String),
				content: 'content content content content content content content content',
				userId: createdUser.body.id,
				userLogin: 'login',
				createdAt: expect.any(String),
			});

			comment = createdComment.body;

			await request(app).get(`/comments/${comment.id}`).expect(HttpStatusCode.OK);

			await request(app)
				.put(`/comments/${comment.id}`)
				.set('authorization', `Bearer ${authToken.body.accessToken}`)
				.send({
					content: 'new content new content new content new content new content',
				})
				.expect(HttpStatusCode.NO_CONTENT);

			const getUpdatedComment = await request(app)
				.get(`/comments/${comment.id}`)
				.expect(HttpStatusCode.OK);
			expect(getUpdatedComment.body).toEqual({
				id: expect.any(String),
				content: 'new content new content new content new content new content',
				userId: createdUser.body.id,
				userLogin: 'login',
				createdAt: expect.any(String),
			});

			await request(app)
				.delete(`/comments/${comment.id}`)
				.set('authorization', `Bearer ${authToken.body.accessToken}`)
				.expect(HttpStatusCode.NO_CONTENT);

			await request(app).get(`/posts/${comment.id}`).expect(HttpStatusCode.NOT_FOUND);
		});
	});

	describe('edit, delete alien comment must be forbidden', () => {
		const postId = idCreator().toString();
		const blogId = idCreator().toString();
		const alienUserId = idCreator().toString();
		const alienCommentId = idCreator().toString();
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.create({
				_id: blogId,
				name,
				youtubeUrl,
				createdAt: new Date(),
			});

			await PostModel.create({
				_id: postId,
				title: 'aTitle',
				shortDescription: 'Short description',
				content: 'Content',
				blogId: blogId,
				blogName: name,
				createdAt: new Date(),
			});

			await CommentModel.create({
				_id: alienCommentId,
				content: 'wgnwdfgefghgerfgh767546',
				userId: alienUserId,
				userLogin: 'userLogin',
				postId: postId,
				createdAt: new Date(),
			});
		});

		it('post/put/delete', async () => {
			const createdUser = await request(app)
				.post('/users')
				.set('authorization', basicAuth)
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: '123456',
				})
				.expect(HttpStatusCode.CREATED);

			const authToken = await request(app)
				.post('/auth/login')
				.send({
					login: 'login',
					password: '123456',
				})
				.expect(HttpStatusCode.OK);

			await request(app)
				.put(`/comments/${alienCommentId}`)
				.set('authorization', `Bearer ${authToken.body.accessToken}`)
				.send({
					content: 'content content content content content content content content',
				})
				.expect(HttpStatusCode.FORBIDDEN);

			await request(app)
				.delete(`/comments/${alienCommentId}`)
				.set('authorization', `Bearer ${authToken.body.accessToken}`)
				.expect(HttpStatusCode.FORBIDDEN);
		});
	});

	describe('add, update new comment wrong body data', () => {
		const postId = idCreator().toString();
		const blogId = idCreator().toString();

		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.create({
				_id: blogId,
				name,
				youtubeUrl,
				createdAt: new Date(),
			});

			await PostModel.create({
				_id: postId,
				title: 'aTitle',
				shortDescription: 'Short description',
				content: 'Content',
				blogId: blogId,
				blogName: name,
				createdAt: new Date(),
			});
		});

		it('post/put', async () => {
			const createdUser = await request(app)
				.post('/users')
				.set('authorization', basicAuth)
				.send({
					login: 'login',
					email: 'email@email.ru',
					password: '123456',
				})
				.expect(HttpStatusCode.CREATED);

			const authToken = await request(app)
				.post('/auth/login')
				.send({
					login: 'login',
					password: '123456',
				})
				.expect(HttpStatusCode.OK);

			const addCommentError = await request(app)
				.post(`/posts/${postId}/comments`)
				.set('authorization', `Bearer ${authToken.body.accessToken}`)
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(addCommentError.body).toEqual(commentsErrorsMessages);

			const updateCommentError = await request(app)
				.put(`/comments/${idCreator().toString()}`)
				.set('authorization', `Bearer ${authToken.body.accessToken}`)
				.expect(HttpStatusCode.BAD_REQUEST);

			expect(updateCommentError.body).toEqual(commentsErrorsMessages);
		});
	});

	describe('add, delete, update comment with not authorized user', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('post/put/delete', async () => {
			await request(app)
				.post(`/posts/${randomId}/comments`)
				.set('authorization', 'wrongAuth')
				.send({
					content: 'content content content content content content content content',
				})
				.expect(HttpStatusCode.UNAUTHORIZED);

			await request(app)
				.delete(`/comments/${randomId}`)
				.set('authorization', 'wrongAuth')
				.expect(HttpStatusCode.UNAUTHORIZED);

			await request(app)
				.put(`/comments/${randomId}`)
				.set('authorization', 'wrongAuth')
				.send({
					title: 'title',
					shortDescription: 'Short description',
					content: 'Content',
					blogId: randomId,
				})
				.expect(HttpStatusCode.UNAUTHORIZED);
		});
	});

	describe('should return 404 for not existing comment', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('get', async () => {
			await request(app).get(`/comments/${randomId}`).expect(HttpStatusCode.NOT_FOUND);
		});
	});

	describe('should return 200 and all posts null', () => {
		const postId = idCreator().toString();
		const blogId = idCreator().toString();

		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.create({
				_id: blogId,
				name,
				youtubeUrl,
				createdAt: new Date(),
			});

			await PostModel.create({
				_id: postId,
				title: 'aTitle',
				shortDescription: 'Short description',
				content: 'Content',
				blogId: blogId,
				blogName: name,
				createdAt: new Date(),
			});
		});

		it('get', async () => {
			const response = await request(app)
				.get(`/posts/${postId}/comments`)
				.expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});
	});

	describe('get all posts and sorting', () => {
		const blogId = idCreator();
		const postId = idCreator();
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.create({
				_id: blogId,
				name,
				youtubeUrl,
				createdAt: new Date(),
			});

			await PostModel.create({
				_id: postId,
				title: 'aTitle',
				shortDescription: 'Short description',
				content: 'Content',
				blogId: blogId,
				blogName: name,
				createdAt: new Date(),
			});

			await CommentModel.insertMany([
				{
					_id: idCreator(),
					content: 'awgnwdfgefghgerfgh767546',
					userId: randomId,
					userLogin: 'userLogin',
					postId: postId,
					createdAt: add(new Date(), {
						hours: 1,
					}),
				},
				{
					_id: idCreator(),
					content: 'cwgnwdfgefghgerfgh767546',
					userId: randomId,
					userLogin: 'userLogin',
					postId: postId,
					createdAt: add(new Date(), {
						hours: 2,
					}),
				},
				{
					_id: idCreator(),
					content: 'bwgnwdfgefghgerfgh767546',
					userId: randomId,
					userLogin: 'userLogin',
					postId: postId,
					createdAt: add(new Date(), {
						hours: 3,
					}),
				},
			]);
		});

		it('should return 200 and all comments', async () => {
			const response = await request(app)
				.get(`/posts/${postId}/comments`)
				.expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						content: 'bwgnwdfgefghgerfgh767546',
						userId: expect.any(String),
						userLogin: 'userLogin',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						content: 'cwgnwdfgefghgerfgh767546',
						userId: expect.any(String),
						userLogin: 'userLogin',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						content: 'awgnwdfgefghgerfgh767546',
						userId: expect.any(String),
						userLogin: 'userLogin',
						createdAt: expect.any(String),
					},
				],
			});
		});

		it('sorting and pages comments', async () => {
			const response = await request(app)
				.get(`/posts/${postId}/comments?sortBy=content&pageSize=2&sortDirection=asc`)
				.expect(HttpStatusCode.OK);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{
						id: expect.any(String),
						content: 'awgnwdfgefghgerfgh767546',
						userId: expect.any(String),
						userLogin: 'userLogin',
						createdAt: expect.any(String),
					},
					{
						id: expect.any(String),
						content: 'bwgnwdfgefghgerfgh767546',
						userId: expect.any(String),
						userLogin: 'userLogin',
						createdAt: expect.any(String),
					},
				],
			});
		});
	});
});
