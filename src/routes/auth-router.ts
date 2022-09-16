import { authValidationMiddleware } from '../middlewares/validation/auth-validation-middleware';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { emailValidationMiddleware } from '../middlewares/validation/email-validation-middleware';
import { registrationConfirmationValidationMiddleware } from '../middlewares/validation/registration-confirmation-validation-middleware';
import { isUserExistsMiddleware } from '../middlewares/security/is-user-exists-middleware';
import { registrationResendingValidationMiddleware } from '../middlewares/validation/registration-resending-validation-middleware';
import { rateLimitMiddleware } from '../middlewares/security/rate-limit-middleware';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { container } from '../psevdoIoc';
import { AuthController } from '../controllers/auth-controller';
import { Router } from 'express';

export const authRouter = Router({});

const authController = container.resolve(AuthController);

authRouter.post(
	'/login',
	rateLimitMiddleware,
	...authValidationMiddleware,
	errorValidationMiddleware,
	authController.login.bind(authController),
);

authRouter.post(
	'/registration',
	rateLimitMiddleware,
	...authValidationMiddleware,
	...emailValidationMiddleware,
	...isUserExistsMiddleware,
	errorValidationMiddleware,
	authController.registration.bind(authController),
);

authRouter.post(
	'/registration-confirmation',
	rateLimitMiddleware,
	...registrationConfirmationValidationMiddleware,
	errorValidationMiddleware,
	authController.registrationConfirmation.bind(authController),
);

authRouter.post(
	'/registration-email-resending',
	rateLimitMiddleware,
	...emailValidationMiddleware,
	...registrationResendingValidationMiddleware,
	errorValidationMiddleware,
	authController.registrationEmailResending.bind(authController),
);

authRouter.get(
	'/me',
	rateLimitMiddleware,
	bearerAuthorizationMiddleware,
	errorValidationMiddleware,
	authController.getMe.bind(authController),
);

authRouter.post(
	'/refresh-token',
	errorValidationMiddleware,
	authController.refreshToken.bind(authController),
);

authRouter.post('/logout', errorValidationMiddleware, authController.logout.bind(authController));

/*authRouter.post('/test', async (req: Request, res: Response) => {
	const test = await jwtService.getUserAuthByToken(req.body.token);

	if (test) return res.send(test);
	return res.sendStatus(HttpStatusCode.UNAUTHORIZED);
});*/
