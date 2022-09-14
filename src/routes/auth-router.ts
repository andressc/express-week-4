import { Request, Response, Router } from 'express';
import { authValidationMiddleware } from '../middlewares/validation/auth-validation-middleware';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { HttpStatusCode } from '../types/StatusCode';
import { emailValidationMiddleware } from '../middlewares/validation/email-validation-middleware';
import { registrationConfirmationValidationMiddleware } from '../middlewares/validation/registration-confirmation-validation-middleware';
import { isUserExistsMiddleware } from '../middlewares/security/is-user-exists-middleware';
import { registrationResendingValidationMiddleware } from '../middlewares/validation/registration-resending-validation-middleware';
import { rateLimitMiddleware } from '../middlewares/security/rate-limit-middleware';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { AuthTokenType } from '../types/authTokenType';
import { AuthService } from '../application/auth-service';

export const authRouter = Router({});

class AuthController {
	authService: AuthService;
	constructor() {
		this.authService = new AuthService();
	}

	async login(req: Request<{}, {}, { login: string; password: string }, {}>, res: Response) {
		try {
			const token: AuthTokenType = await this.authService.login(req.body.login, req.body.password);

			res.cookie('refreshToken', token.refreshToken, {
				httpOnly: true,
				secure: true,
				maxAge: 20000,
			});

			return res.send({ accessToken: token.accessToken });
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async registration(
		req: Request<{}, {}, { login: string; email: string; password: string }, {}>,
		res: Response,
	) {
		try {
			await this.authService.registration(req.body.login, req.body.email, req.body.password);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async registrationConfirmation(req: Request<{}, {}, { code: string }, {}>, res: Response) {
		try {
			await this.authService.registrationConfirmation(req.body.code);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async registrationEmailResending(req: Request<{}, {}, { email: string }, {}>, res: Response) {
		try {
			await this.authService.registrationEmailResending(req.body.email);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async getMe(req: Request<{}, {}, {}, {}>, res: Response) {
		try {
			const authUser: {
				email: string;
				login: string;
				userId: string;
			} = await this.authService.getAuthUser(req.user);

			return res.send(authUser);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async refreshToken(req: Request<{}, {}, {}, {}>, res: Response) {
		try {
			const token: AuthTokenType = await this.authService.refreshToken(req.cookies?.refreshToken);

			res.cookie('refreshToken', token.refreshToken, {
				httpOnly: true,
				secure: true,
				maxAge: 20000,
			});

			return res.send({ accessToken: token.accessToken });
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async logout(req: Request<{}, {}, {}, {}>, res: Response) {
		try {
			await this.authService.deleteRefreshToken(req.cookies?.refreshToken);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}

const authController = new AuthController();

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
