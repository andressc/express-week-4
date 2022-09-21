import { body } from 'express-validator';
import { BlogsService } from '../../application/blogs-service';
import { stringToObjectId } from '../../helpers/stringToObjectId';
import { container } from '../../psevdoIoc';

const blogsService = container.resolve(BlogsService);

export const blogIdValidationMiddleware = [
	body('blogId')
		.notEmpty()
		.withMessage('must not be empty')
		.custom(async (value) => {
			if (value.length !== 24) throw new Error('Invalid parameter id');

			const blog = await blogsService.findBlogById(stringToObjectId(value));
			if (!blog) {
				throw new Error('Blog with that ID is not exists!');
			}
			return true;
		}),
];
