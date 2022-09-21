import { body } from 'express-validator';
import { BlogsService } from '../../application/blogs-service';
import { stringToObjectId } from '../../helpers/stringToObjectId';
import { container } from '../../psevdoIoc';

const bloggersService = container.resolve(BlogsService);

export const blogIdValidationMiddleware = [
	body('bloggerId')
		.notEmpty()
		.withMessage('must not be empty')
		.custom(async (value) => {
			if (value.length !== 24) throw new Error('Invalid parameter id');

			const blogger = await bloggersService.findBloggerById(stringToObjectId(value));
			if (!blogger) {
				throw new Error('Blogger with that ID is not exists!');
			}
			return true;
		}),
];
