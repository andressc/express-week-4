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

export const authRouter = Router({});

authRouter.post(
	'/login',
	rateLimitMiddleware,
	...authValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request<{}, {}, { login: string; password: string }, {}>, res: Response) => {
		try {
			const token: { token: string } = await authService.login(req.body.login, req.body.password);
			return res.send(token);
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

/*authRouter.post('/test', async (req: Request, res: Response) => {
	const test = await jwtService.getUserAuthByToken(req.body.token);

	if (test) return res.send(test);
	return res.sendStatus(HttpStatusCode.UNAUTHORIZED);
});*/
