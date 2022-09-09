import { Request, Response, Router } from 'express';
import { authValidationMiddleware } from '../middlewares/validation/auth-validation-middleware';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { authService } from '../domain/auth-service';
import { HttpStatusCode } from '../types/StatusCode';
import { emailValidationMiddleware } from '../middlewares/validation/email-validation-middleware';
import { registrationConfirmationValidationMiddleware } from '../middlewares/validation/registration-confirmation-validation-middleware';
import { isUserExistsMiddleware } from '../middlewares/security/is-user-exists-middleware';
import { registrationResendingValidationMiddleware } from '../middlewares/validation/registration-resending-validation-middleware';
import { rateLimitMiddleware } from '../middlewares/security/rate-limit-middleware';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { bearerAuthorizationMiddleware } from '../middlewares/auth/bearer-authorization-middleware';
import { AuthTokenType } from '../types/authTokenType';

export const authRouter = Router({});

authRouter.post(
	'/login',
	rateLimitMiddleware,
	...authValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{}, {}, { login: string; password: string }, {}>, res: Response) => {
		try {
			const token: AuthTokenType = await authService.login(req.body.login, req.body.password);

			res.cookie('refreshToken', token.refreshToken, {
				httpOnly: true,
				//sameSite: 'None',
				secure: true,
				maxAge: 20000,
			});

			return res.send({ accessToken: token.accessToken });
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

authRouter.post(
	'/registration',
	rateLimitMiddleware,
	...authValidationMiddleware,
	...emailValidationMiddleware,
	...isUserExistsMiddleware,
	errorValidationMiddleware,
	async (
		req: Request<{}, {}, { login: string; email: string; password: string }, {}>,
		res: Response,
	) => {
		try {
			await authService.registration(req.body.login, req.body.email, req.body.password);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

authRouter.post(
	'/registration-confirmation',
	rateLimitMiddleware,
	...registrationConfirmationValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{}, {}, { code: string }, {}>, res: Response) => {
		try {
			await authService.registrationConfirmation(req.body.code);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

authRouter.post(
	'/registration-email-resending',
	rateLimitMiddleware,
	...emailValidationMiddleware,
	...registrationResendingValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{}, {}, { email: string }, {}>, res: Response) => {
		try {
			await authService.registrationEmailResending(req.body.email);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

authRouter.post(
	'/me',
	rateLimitMiddleware,
	bearerAuthorizationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{}, {}, {}, {}>, res: Response) => {
		try {
			const authUser: {
				email: string;
				login: string;
				userId: string;
			} = await authService.getAuthUser(req.user);

			return res.send(authUser);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

authRouter.post(
	'/refresh-token',
	errorValidationMiddleware,
	async (req: Request<{}, {}, {}, {}>, res: Response) => {
		try {
			const token: AuthTokenType = await authService.refreshToken(req.cookies?.refreshToken);

			res.cookie('refreshToken', token.refreshToken, {
				httpOnly: true,
				//sameSite: 'None',
				secure: true,
				maxAge: 20000,
			});

			return res.send({ accessToken: token.accessToken });
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

authRouter.post(
	'/logout',
	errorValidationMiddleware,
	async (req: Request<{}, {}, {}, {}>, res: Response) => {
		try {
			await authService.deleteRefreshToken(req.cookies?.refreshToken);
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	},
);

/*authRouter.post('/test', async (req: Request, res: Response) => {
	const test = await jwtService.getUserAuthByToken(req.body.token);

	if (test) return res.send(test);
	return res.sendStatus(HttpStatusCode.UNAUTHORIZED);
});*/
