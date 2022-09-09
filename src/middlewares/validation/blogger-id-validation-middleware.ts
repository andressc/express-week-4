import { body } from 'express-validator';
import { bloggersService } from '../../domain/bloggers-service';
import { stringToObjectId } from '../../helpers/stringToObjectId';

export const bloggerIdValidationMiddleware = [
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
