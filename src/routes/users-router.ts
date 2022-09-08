import { Request, Response, Router } from 'express';
import { usersService } from '../domain/users-service';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { HttpStatusCode } from '../types/StatusCode';
import { authValidationMiddleware } from '../middlewares/validation/auth-validation-middleware';
import { emailValidationMiddleware } from '../middlewares/validation/email-validation-middleware';
import { isUserExistsMiddleware } from '../middlewares/security/is-user-exists-middleware';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { UsersType } from '../types/usersType';
import { ObjectId } from 'mongodb';

export const usersRouter = Router({});

usersRouter.get('/', async (req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) => {
	try {
		const users: PaginationType<Array<{ id: ObjectId; login: string }>> =
			await usersService.findAllUsers(req.query);
		return res.send(users);
	} catch (error) {
		const err = generateErrorCode(error);
		return res.status(err.status).send(err.message);
	}
});

usersRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
		try {
			const user: UsersType = await usersService.findUserById(stringToObjectId(req.params.id));
			return res.send(user);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

usersRouter.delete(
	'/:id',
	basicAuthorizationMiddleware,
	objectIdValidationMiddleware,
	async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
		try {
			await usersService.deleteUser(stringToObjectId(req.params.id));
			return res.send(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

usersRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...authValidationMiddleware,
	...emailValidationMiddleware,
	...isUserExistsMiddleware,
	errorValidationMiddleware,
	async (
		req: Request<{}, {}, { login: string; email: string; password: string }, {}>,
		res: Response,
	) => {
		try {
			const user = await usersService.createUser(req.body.login, req.body.email, req.body.password);

			return res.status(HttpStatusCode.CREATED).send(user);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);
