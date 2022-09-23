import { BlogsService } from '../application/blogs-service';
import { Request, Response } from 'express';
import {
	PaginationType,
	PaginationTypeQuery,
	PaginationTypeQueryRequest,
} from '../types/paginationType';
import { BlogsType } from '../types/blogsType';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { PostsType } from '../types/postsType';
import { HttpStatusCode } from '../types/StatusCode';
import { inject, injectable } from 'inversify';

@injectable()
export class BlogController {
	constructor(@inject(BlogsService) protected blogsService: BlogsService) {}

	async findAllBlogs(req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) {
		try {
			const blogs: PaginationType<BlogsType[]> = await this.blogsService.findAllBlogs(req.query);
			return res.send(blogs);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findBlogById(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			const blog: BlogsType = await this.blogsService.findBlogById(stringToObjectId(req.params.id));

			return res.send(blog);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findPostsBlog(
		req: Request<{ id: string }, {}, {}, PaginationTypeQueryRequest>,
		res: Response,
	) {
		try {
			const blogPosts: PaginationType<PostsType[]> = await this.blogsService.findAllPostsBlog(
				req.query,
				stringToObjectId(req.params.id),
				req.user,
			);
			return res.send(blogPosts);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async deleteBlog(req: Request<{ id: string }, {}, {}, { name: string }>, res: Response) {
		try {
			await this.blogsService.deleteBlog(stringToObjectId(req.params.id));
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async createBlog(req: Request<{}, {}, { name: string; youtubeUrl: string }, {}>, res: Response) {
		try {
			const blog: BlogsType = await this.blogsService.createBlog(
				req.body.name,
				req.body.youtubeUrl,
			);

			return res.status(HttpStatusCode.CREATED).send(blog);
		} catch (error) {
			console.log(error);
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async createBlogPost(req: Request<{ id: string }, {}, PostsType, {}>, res: Response) {
		try {
			const blogsPost: PostsType = await this.blogsService.createBlogPost(
				stringToObjectId(req.params.id),
				req.body.title,
				req.body.shortDescription,
				req.body.content,
			);

			return res.status(HttpStatusCode.CREATED).send(blogsPost);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async updateBlog(
		req: Request<{ id: string }, {}, { name: string; youtubeUrl: string }, {}>,
		res: Response,
	) {
		try {
			await this.blogsService.updateBlog(
				stringToObjectId(req.params.id),
				req.body.name,
				req.body.youtubeUrl,
			);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}
