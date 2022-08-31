import { Request, Response, Router } from 'express';
import { usersService } from '../domain/users-service';
import { PaginationTypeQuery } from '../types/paginationType';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { HttpStatusCode } from '../types/StatusCode';
import { authValidationMiddleware } from '../middlewares/validation/auth-validation-middleware';
import { emailValidationMiddleware } from '../middlewares/validation/email-validation-middleware';

export const usersRouter = Router({});

usersRouter.get('/', async (req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) => {
	const bloggers = await usersService.findAllUsers(req.query);

	return res.send(bloggers);
});

usersRouter.get('/:id', async (req: Request, res: Response) => {
	const user = await usersService.findUserById(req.params.id);

	if (user) return res.send(user);
	res.sendStatus(HttpStatusCode.NOT_FOUND);
});

usersRouter.delete('/:id', basicAuthorizationMiddleware, async (req: Request, res: Response) => {
	const isDeleted = await usersService.deleteUser(req.params.id);

	if (isDeleted) return res.send(HttpStatusCode.NO_CONTENT);
	return res.sendStatus(HttpStatusCode.NOT_FOUND);
});

usersRouter.post(
	'/',
	basicAuthorizationMiddleware,
	...authValidationMiddleware,
	...emailValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const user = await usersService.createUser(req.body.login, req.body.email, req.body.password);

		if (user) return res.status(HttpStatusCode.CREATED).send(user);
		return res.sendStatus(HttpStatusCode.BAD_REQUEST);
	},
);
