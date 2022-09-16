import { Router } from 'express';
import { basicAuthorizationMiddleware } from '../middlewares/auth/basic-authorization-middleware';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { authValidationMiddleware } from '../middlewares/validation/auth-validation-middleware';
import { emailValidationMiddleware } from '../middlewares/validation/email-validation-middleware';
import { isUserExistsMiddleware } from '../middlewares/security/is-user-exists-middleware';
import { objectIdValidationMiddleware } from '../middlewares/validation/object-id-validation-middleware';
import { container } from '../psevdoIoc';
import { UserController } from '../controllers/user-controller';

export const usersRouter = Router({});

const userController = container.resolve(UserController);

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
