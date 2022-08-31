import { Request, Response, Router } from 'express';
import { jwtService } from '../application/jwt-service';
import { authValidationMiddleware } from '../middlewares/validation/auth-validation-middleware';
import { errorValidationMiddleware } from '../middlewares/validation/error-validation-middleware';
import { authService } from '../domain/auth-service';
import { HttpStatusCode } from '../types/StatusCode';
import { emailValidationMiddleware } from '../middlewares/validation/email-validation-middleware';
import { registrationConfirmationValidationMiddleware } from '../middlewares/validation/registration-confirmation-validation-middleware';
import { rateLimitMiddleware } from '../middlewares/security/rale-limit-middleware';

export const authRouter = Router({});

authRouter.post(
	'/login',
	rateLimitMiddleware,
	...authValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const token = await authService.login(req.body.login, req.body.password);

		if (token) return res.status(HttpStatusCode.OK).send({ token });
		return res.sendStatus(HttpStatusCode.UNAUTHORIZED);
	},
);

authRouter.post(
	'/registration',
	rateLimitMiddleware,
	...authValidationMiddleware,
	...emailValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const isRegister = await authService.registration(
			req.body.login,
			req.body.email,
			req.body.password,
		);

		if (isRegister) return res.sendStatus(HttpStatusCode.NO_CONTENT);
		return res.sendStatus(HttpStatusCode.NOT_FOUND);
	},
);

authRouter.post(
	'/registration-confirmation',
	rateLimitMiddleware,
	...registrationConfirmationValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const isConfirm = await authService.registrationConfirmation(req.body.code);

		if (isConfirm) return res.sendStatus(HttpStatusCode.NO_CONTENT);
		return res.sendStatus(HttpStatusCode.BAD_REQUEST);
	},
);

authRouter.post(
	'/registration-email-resending',
	rateLimitMiddleware,
	...emailValidationMiddleware,
	errorValidationMiddleware,
	async (req: Request, res: Response) => {
		const isSend = await authService.registrationEmailResending(req.body.email);

		if (isSend) return res.sendStatus(HttpStatusCode.NO_CONTENT);
		return res.sendStatus(HttpStatusCode.BAD_REQUEST);
	},
);

authRouter.post('/test', async (req: Request, res: Response) => {
	const test = await jwtService.getUserAuthByToken(req.body.token);

	if (test) return res.send(test);
	return res.sendStatus(HttpStatusCode.UNAUTHORIZED);
});
