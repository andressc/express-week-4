import { container } from '../psevdoIoc';
import mongoose from 'mongoose';
import { CommentModel, PostModel, UserModel } from '../db/db';
import { idCreator } from '../helpers/idCreator';
import add from 'date-fns/add';
import { ObjectId } from 'mongodb';
import { USER_NOT_FOUND } from '../errors/errorsMessages';
import { NotFoundError } from '../errors/notFoundError';
import { HttpStatusCode } from '../types/StatusCode';
import { connectMemoryDb, disconnectMemoryDb } from '../db/memoryDb';
import { PostsService } from './posts-service';
import { CommentsService } from './comments-service';

describe('Integration test for comments-service', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const idPost = idCreator();
	const idBlog = idCreator();
	const idComment = idCreator();
	const nameBlog = 'nameBlog';
	const contentPost = 'contentPost';
	const idUser = idCreator();
	const nameUser = 'nameUser';
	const loginUser = 'login';
	const emailUser = 'email@email.ru';

	const postCreator = (title: string, hours: number, id?: ObjectId) => {
		return {
			_id: !id ? idCreator() : id,
			title,
			shortDescription: 'shortDescription',
			content: 'content content content content content',
			blogId: idBlog,
			blogName: nameBlog,
			createdAt: add(new Date(), {
				hours: hours,
			}),
		};
	};

	const commentCreator = (postId: ObjectId, content: string, hours: number, id?: ObjectId) => {
		return {
			_id: !id ? idCreator() : id,
			content,
			userId: idUser,
			userLogin: nameUser,
			postId,
			createdAt: add(new Date(), {
				hours: hours,
			}),
		};
	};

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

	const postCommentsResultCreator = (content: string) => {
		return {
			id: expect.any(Object),
			content,
			userId: expect.any(Object),
			userLogin: expect.any(String),
			createdAt: expect.any(String),
		};
	};

	const userCreator2 = (login: string, email: string, id: ObjectId, confirmationCode?: string) => {
		return {
			id: id,
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
			createdAt: new Date().toISOString(),
		};
	};

	const postsService = container.resolve(PostsService);
	const commentsService = container.resolve(CommentsService);

	describe('findAllComments', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await PostModel.create(postCreator('aTitle', 1, idPost));
			await CommentModel.insertMany([
				commentCreator(idPost, 'aContent', 1),
				commentCreator(idPost, 'cContent', 2),
				commentCreator(idPost, 'bContent', 3),
			]);
		});

		it('comments test select all comments of post', async () => {
			const result = await postsService.findAllCommentsOfPost(idPost, {
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
					postCommentsResultCreator('bContent'),
					postCommentsResultCreator('cContent'),
					postCommentsResultCreator('aContent'),
				],
			});
		});

		it('comments test select all comments of post and sort', async () => {
			const result = await postsService.findAllCommentsOfPost(idPost, {
				pageNumber: '1',
				pageSize: '2',
				totalCount: '',
				sortBy: 'content',
				sortDirection: 'asc',
			});
			expect(result).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [postCommentsResultCreator('aContent'), postCommentsResultCreator('bContent')],
			});
		});

		/*it('comments test find comments of post by non existing post id', async () => {
			expect.assertions(1);
			try {
				await await postsService.findPostById(idCreator());
			} catch (e: unknown) {
				expect(e).toBe(new NotFoundError(POST_NOT_FOUND).name);
			}
		});*/

		/*it('comments test find comments of post but comments not found', async () => {
			expect.assertions(1);
			try {
				await await postsService.findPostById(idCreator());
			} catch (e: unknown) {
				expect(e).toBe(new NotFoundError(POST_NOT_FOUND).name);
			}
		});*/
	});

	describe('findCommentById', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await CommentModel.create(commentCreator(idPost, contentPost, 1, idComment));
		});

		it('comments test find comment by id', async () => {
			const result = await commentsService.findCommentById(idComment);
			expect(result).toEqual(postCommentsResultCreator(contentPost));
		});

		/*it('comments test find comment by non existing id', async () => {
			expect.assertions(1);
			try {
				await await postsService.findPostById(idCreator());
			} catch (e: unknown) {
				expect(e).toBe(new NotFoundError(POST_NOT_FOUND).name);
			}
		});*/
	});

	describe('deleteComment', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await UserModel.create(userCreator(loginUser, emailUser, 1, idUser));
			await CommentModel.create(commentCreator(idPost, contentPost, 1, idComment));
		});

		it('comments test delete comment by id', async () => {
			const result = await commentsService.deleteComment(
				idComment,
				userCreator2(loginUser, emailUser, idUser),
			);
			expect(result).toBe(void 0);
		});

		/*it('find comment after deleting', async () => {
			const result = await PostModel.findOne({ _id: idPost });
			expect(result).toBeNull();
		});

		it('delete non exists comment', async () => {
			const result = await PostModel.findOne({ _id: idPost });
			expect(result).toBeNull();
		});

		it('delete alien comment', async () => {
			const result = await PostModel.findOne({ _id: idPost });
			expect(result).toBeNull();
		});*/
	});

	describe('updateComment', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await UserModel.create(userCreator(loginUser, emailUser, 1, idUser));
			await CommentModel.create(commentCreator(idPost, contentPost, 1, idComment));
		});

		it('comments test update post', async () => {
			const result = await commentsService.updateComment(
				idComment,
				'new Content',
				userCreator2(loginUser, emailUser, idUser),
			);
			expect(result).toBe(void 0);

			const comment = await commentsService.findCommentById(idComment);
			expect(comment).toEqual(postCommentsResultCreator('new Content'));
		});

		/*it('comments test update post by non existing id', async () => {
			expect.assertions(1);
			try {
				await await postsService.findPostById(idCreator());
			} catch (e: unknown) {
				expect(e).toBe(new NotFoundError(POST_NOT_FOUND).name);
			}
		});*/

		/*it('delete alien comment', async () => {
			const result = await PostModel.findOne({ _id: idPost });
			expect(result).toBeNull();
		})*/
	});
});
