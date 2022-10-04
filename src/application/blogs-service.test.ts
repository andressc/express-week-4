import { container } from '../psevdoIoc';
import mongoose from 'mongoose';
import { BlogModel, PostModel } from '../db/db';
import { idCreator } from '../helpers/idCreator';
import add from 'date-fns/add';
import { ObjectId } from 'mongodb';
import { connectMemoryDb, disconnectMemoryDb } from '../db/memoryDb';
import { PostsTypeDb } from '../types/postsType';
import { BlogsService } from './blogs-service';
import { BlogsTypeDb } from '../types/blogsType';
import { BLOG_NOT_FOUND } from '../errors/errorsMessages';

describe('Integration test for blogs-service', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const idBlog = idCreator();
	const nameBlog = 'nameBlog';
	const youtubeUrlBlog = 'https://www.youtube.com/channel/jmnbvfthmrert54ergbfbf';
	const titlePost = 'titlePost';
	const shortDescriptionPost = 'shortDescriptionPost';
	const contentPost = 'contentPost';

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

	const blogCreator = (name: string, hours: number, id?: ObjectId) => {
		return {
			_id: !id ? idCreator() : id,
			name,
			youtubeUrl: 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A',
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

	const blogResultCreator = (name: string) => {
		return {
			id: expect.any(Object),
			name,
			youtubeUrl: expect.any(String),
			createdAt: expect.any(Date),
		};
	};

	const blogsService = container.resolve(BlogsService);

	describe('findAllBlogs', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await BlogModel.insertMany([
				blogCreator('aName', 1),
				blogCreator('cName', 2),
				blogCreator('bName', 3),
			]);
		});

		it('blog test select all blogs', async () => {
			const result = await blogsService.findAllBlogs({
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
				items: [blogResultCreator('bName'), blogResultCreator('cName'), blogResultCreator('aName')],
			});
		});

		it('blog test select all blogs and sort', async () => {
			const result = await blogsService.findAllBlogs({
				pageNumber: '1',
				pageSize: '2',
				totalCount: '',
				sortBy: 'name',
				sortDirection: 'asc',
			});
			expect(result).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [blogResultCreator('aName'), blogResultCreator('bName')],
			});
		});

		it('blog test select blogs and search name', async () => {
			const result = await blogsService.findAllBlogs({
				pageNumber: '1',
				pageSize: '10',
				totalCount: '',
				sortBy: null,
				sortDirection: null,
				searchNameTerm: "bName"
			});
			expect(result).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [blogResultCreator('bName')],
			});
		});
	});

	describe('findAllPostsBlog', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await BlogModel.create(blogCreator('aName', 1));
			await PostModel.insertMany([
				postCreator('aTitle', 1),
				postCreator('cTitle', 2),
				postCreator('bTitle', 3),
			]);
		});

		it('blog test select all blogs of post', async () => {
			const result = await blogsService.findAllPostsBlog(
				{
					pageNumber: '1',
					pageSize: '10',
					totalCount: '',
					sortBy: null,
					sortDirection: null,
				},
				idBlog,
			);
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

		it('blog test select all blogs of post and sort', async () => {
			const result = await blogsService.findAllPostsBlog(
				{
					pageNumber: '1',
					pageSize: '2',
					totalCount: '',
					sortBy: 'title',
					sortDirection: 'asc',
				},
				idBlog,
			);
			expect(result).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [postResultCreator('aTitle'), postResultCreator('bTitle')],
			});
		});

		/*it('blog test find posts of blogs by non-existing blog id', async () => {
			expect.assertions(1);
			try {
				await await postsService.findPostById(idCreator());
			} catch (e: unknown) {
				expect(e).toBe(new NotFoundError(POST_NOT_FOUND).name);
			}
		});*/

		it('blog test find posts of blogs but posts not found', async () => {
			const result = await blogsService.findAllPostsBlog(
				{
					pageNumber: '1',
					pageSize: '10',
					totalCount: '',
					sortBy: null,
					sortDirection: null,
				},
				idCreator(),
			);
			expect(result).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});
	});

	describe('findBlogById', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await BlogModel.create(blogCreator(nameBlog, 1, idBlog));
		});

		it('blog test find blog by id', async () => {
			const result = await blogsService.findBlogById(idBlog);
			expect(result).toEqual(blogResultCreator(nameBlog));
		});

		it('blog test find blog by non existing id', async () => {
			await expect(blogsService.findBlogById(idCreator())).rejects.toThrow(BLOG_NOT_FOUND);
		});
	});

	describe('deleteBlog', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await BlogModel.create(blogCreator(nameBlog, 1, idBlog));
		});

		it('blog test delete blog by id', async () => {
			const result = await blogsService.deleteBlog(idBlog);
			expect(result).toBe(void 0);
		});

		/*it('find blog after deleting', async () => {
			const result = await PostModel.findOne({ _id: idPost });
			expect(result).toBeNull();
		});*/

		it('delete non exists blog', async () => {
			await expect(blogsService.deleteBlog(idCreator())).rejects.toThrow(BLOG_NOT_FOUND);
		});
	});

	describe('updateBlog', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await BlogModel.create(blogCreator(nameBlog, 1, idBlog));
		});

		it('blog test update blog', async () => {
			const result = await blogsService.updateBlog(idBlog, 'newName', 'newYoutubeUrl');
			expect(result).toBe(void 0);
		});

		it('blog test find blog after update', async () => {
			const blog = await blogsService.findBlogById(idBlog);
			expect(blog).toEqual({
				id: expect.any(Object),
				name: 'newName',
				youtubeUrl: 'newYoutubeUrl',
				createdAt: expect.any(Date),
			});
		});

		it('blog test update blog by non existing id', async () => {
			await expect(
				blogsService.updateBlog(idCreator(), 'newName', 'newYoutubeUrl'),
			).rejects.toThrow(BLOG_NOT_FOUND);
		});
	});

	describe('createBlog', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('blog test add blog to database', async () => {
			const result = await blogsService.createBlog(nameBlog, youtubeUrlBlog);
			expect(result).toEqual({
				id: expect.any(String),
				name: nameBlog,
				youtubeUrl: youtubeUrlBlog,
				createdAt: expect.any(String),
			});

			const blogModel: BlogsTypeDb | null = await BlogModel.findById({ _id: result.id });
			expect(blogModel).not.toBeNull();
		});
	});

	describe('createBlogPost', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await BlogModel.create(blogCreator(nameBlog, 1, idBlog));
		});

		it('blog test create new post of blog', async () => {
			const result = await blogsService.createBlogPost(
				idBlog,
				titlePost,
				shortDescriptionPost,
				contentPost,
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

			const postsModel: PostsTypeDb | null = await PostModel.findById({ _id: result.id });
			expect(postsModel).not.toBeNull();
		});

		it('blog test create new post of non exiting blog', async () => {
			await expect(
				blogsService.createBlogPost(idCreator(), titlePost, shortDescriptionPost, contentPost),
			).rejects.toThrow(BLOG_NOT_FOUND);
		});
	});
});
