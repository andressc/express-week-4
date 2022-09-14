import { Request, Response, Router } from 'express';
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
import { UsersService } from '../application/users-service';

export const usersRouter = Router({});

class UserController {
	usersService: UsersService;
	constructor() {
		this.usersService = new UsersService();
	}

	async findAllUsers(req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) {
		try {
			const users: PaginationType<Array<{ id: ObjectId; login: string }>> =
				await this.usersService.findAllUsers(req.query);
			return res.send(users);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findUserById(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			const user: UsersType = await this.usersService.findUserById(stringToObjectId(req.params.id));
			return res.send(user);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async deleteUser(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			await this.usersService.deleteUser(stringToObjectId(req.params.id));
			return res.send(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async createUser(
		req: Request<{}, {}, { login: string; email: string; password: string }, {}>,
		res: Response,
	) {
		try {
			const user = await this.usersService.createUser(
				req.body.login,
				req.body.email,
				req.body.password,
			);

			return res.status(HttpStatusCode.CREATED).send(user);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}

const userController = new UserController();

usersRouter.get('/', userController.findAllUsers.bind(userController));

usersRouter.get(
	'/:id',
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	userController.findUserById.bind(userController),
);

usersRouter.delete(
	'/:id',
	basicAuthorizationMiddleware,
	objectIdValidationMiddleware,
	errorValidationMiddleware,
	userController.deleteUser.bind(userController),
);

usersRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...authValidationMiddleware,
	...emailValidationMiddleware,
	...isUserExistsMiddleware,
	errorValidationMiddleware,
	userController.createUser.bind(userController),
);
