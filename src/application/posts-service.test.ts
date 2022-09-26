import { container } from '../psevdoIoc';
import mongoose from 'mongoose';
import { BlogModel, CommentModel, PostModel, UserModel } from '../db/db';
import { idCreator } from '../helpers/idCreator';
import add from 'date-fns/add';
import { ObjectId } from 'mongodb';
import { connectMemoryDb, disconnectMemoryDb } from '../db/memoryDb';
import { PostsService } from './posts-service';
import { PostsTypeDb } from '../types/postsType';
import { CommentsTypeDb } from '../types/commentsType';
import { BLOG_NOT_FOUND, POST_NOT_FOUND } from '../errors/errorsMessages';

describe('Integration test for posts-service', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const idPost = idCreator();
	const idPost2 = idCreator();
	const idBlog = idCreator();
	const nameBlog = 'nameBlog';
	const titlePost = 'titlePost';
	const shortDescriptionPost = 'shortDescriptionPost';
	const contentPost = 'contentPost';
	const idUser = idCreator();
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

	const blogCreator = (id: ObjectId, name: string) => {
		return {
			_id: id,
			name,
			youtubeUrl: 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A',
			createdAt: new Date(),
		};
	};

	const commentCreator = (postId: ObjectId, content: string, hours: number) => {
		return {
			_id: idCreator(),
			content,
			userId: idCreator(),
			userLogin: 'userLogin',
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

	const postResultCreator = (title: string) => {
		return {
			id: expect.any(Object),
			title,
			shortDescription: expect.any(String),
			content: expect.any(String),
			blogId: expect.any(Object),
			blogName: expect.any(String),
			createdAt: expect.any(Date),
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

	describe('findAllPosts', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await PostModel.insertMany([
				postCreator('aTitle', 1),
				postCreator('cTitle', 2),
				postCreator('bTitle', 3),
			]);
		});

		it('post test select all posts', async () => {
			const result = await postsService.findAllPosts({
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
					postResultCreator('bTitle'),
					postResultCreator('cTitle'),
					postResultCreator('aTitle'),
				],
			});
		});

		it('post test select all posts and sort', async () => {
			const result = await postsService.findAllPosts({
				pageNumber: '1',
				pageSize: '2',
				totalCount: '',
				sortBy: 'title',
				sortDirection: 'asc',
			});
			expect(result).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [postResultCreator('aTitle'), postResultCreator('bTitle')],
			});
		});
	});

	describe('findAllCommentsOfPost', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await PostModel.insertMany([
				postCreator('aTitle', 1, idPost),
				postCreator('aTitle', 1, idPost2),
			]);
			await CommentModel.insertMany([
				commentCreator(idPost, 'aContent', 1),
				commentCreator(idPost, 'cContent', 2),
				commentCreator(idPost, 'bContent', 3),
			]);
		});

		it('post test select all comments of post', async () => {
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

		it('post test select all comments of post and sort', async () => {
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

		it('post test find comments of post by non existing post id', async () => {
			await expect(
				postsService.findAllCommentsOfPost(idCreator(), {
					pageNumber: '1',
					pageSize: '2',
					totalCount: '',
					sortBy: null,
					sortDirection: null,
				}),
			).rejects.toThrow(POST_NOT_FOUND);
		});

		it('post test find comments of post but comments not found', async () => {
			const result = await postsService.findAllCommentsOfPost(idPost2, {
				pageNumber: '1',
				pageSize: '10',
				totalCount: '',
				sortBy: null,
				sortDirection: null,
			});
			expect(result).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});
	});

	describe('findPostById', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await PostModel.create(postCreator(titlePost, 1, idPost));
		});

		it('post test find post by id', async () => {
			const result = await postsService.findPostById(idPost);
			expect(result).toEqual(postResultCreator(titlePost));
		});

		it('post test find post by non existing id', async () => {
			await expect(postsService.findPostById(idCreator())).rejects.toThrow(POST_NOT_FOUND);
		});
	});

	describe('deletePost', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await PostModel.create(postCreator(titlePost, 1, idPost));
		});

		it('post test delete post by id', async () => {
			const result = await postsService.deletePost(idPost);
			expect(result).toBe(void 0);
		});

		/*it('find post after deleting', async () => {
			const result = await PostModel.findOne({ _id: idPost });
			expect(result).toBeNull();
		})*/

		it('delete non exists post', async () => {
			await expect(postsService.deletePost(idCreator())).rejects.toThrow(POST_NOT_FOUND);
		});
	});

	describe('updatePost', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await BlogModel.create(blogCreator(idBlog, nameBlog));
			await PostModel.create(postCreator(titlePost, 1, idPost));
		});

		it('post test update post', async () => {
			const result = await postsService.updatePost(idPost, {
				title: 'updatedTitle',
				shortDescription: 'updatedShortDescription',
				content: 'updatedContent',
				blogId: idBlog.toString(),
			});
			expect(result).toBe(void 0);

			const post = await postsService.findPostById(idPost);
			expect(post).toEqual({
				id: expect.any(Object),
				title: 'updatedTitle',
				shortDescription: 'updatedShortDescription',
				content: 'updatedContent',
				blogId: idBlog,
				blogName: nameBlog,
				createdAt: expect.any(Date),
			});
		});

		it('post test update post by non existing id', async () => {
			await expect(
				postsService.updatePost(idCreator(), {
					title: 'updatedTitle',
					shortDescription: 'updatedShortDescription',
					content: 'updatedContent',
					blogId: idBlog.toString(),
				}),
			).rejects.toThrow(POST_NOT_FOUND);
		});

		it('post test update post by non existing blog', async () => {
			await expect(
				postsService.updatePost(idCreator(), {
					title: 'updatedTitle',
					shortDescription: 'updatedShortDescription',
					content: 'updatedContent',
					blogId: idCreator().toString(),
				}),
			).rejects.toThrow(BLOG_NOT_FOUND);
		});
	});

	describe('createPost', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await BlogModel.create(blogCreator(idBlog, nameBlog));
		});

		it('post test add to database', async () => {
			const result = await postsService.createPost(
				titlePost,
				shortDescriptionPost,
				contentPost,
				idBlog,
			);
			expect(result).toEqual({
				id: expect.any(String),
				title: titlePost,
				shortDescription: shortDescriptionPost,
				content: contentPost,
				blogId: idBlog,
				blogName: nameBlog,
				createdAt: expect.any(String),
			});

			const postModel: PostsTypeDb | null = await PostModel.findById({ _id: result.id });
			expect(postModel).not.toBeNull();
		});

		it('post test create post by non existing blog', async () => {
			await expect(
				postsService.createPost(titlePost, shortDescriptionPost, contentPost, idCreator()),
			).rejects.toThrow(BLOG_NOT_FOUND);
		});
	});

	describe('createCommentPost', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await UserModel.create(userCreator(loginUser, emailUser, 1, idUser));
			await PostModel.create(postCreator(titlePost, 1, idPost));
		});

		it('post test create new comment of post', async () => {
			const result = await postsService.createCommentPost(
				contentPost,
				userCreator2(loginUser, emailUser, idUser),
				idPost,
			);
			expect(result).toEqual(postCommentsResultCreator(contentPost));

			const commentsModel: CommentsTypeDb | null = await CommentModel.findById({ _id: result.id });
			expect(commentsModel).not.toBeNull();
		});

		it('post test create new comment by non existing post', async () => {
			await expect(
				postsService.createCommentPost(
					contentPost,
					userCreator2(loginUser, emailUser, idUser),
					new ObjectId(idCreator()),
				),
			).rejects.toThrow(POST_NOT_FOUND);
		});
	});
});
