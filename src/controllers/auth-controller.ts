import { inject, injectable } from 'inversify';
import { AuthService } from '../application/auth-service';
import { Request, Response } from 'express';
import { AuthTokenType } from '../types/authTokenType';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { HttpStatusCode } from '../types/StatusCode';

@injectable()
export class AuthController {
	constructor(@inject(AuthService) protected authService: AuthService) {}

	async login(req: Request<{}, {}, { login: string; password: string }, {}>, res: Response) {
		try {
			const token: AuthTokenType = await this.authService.login(req.body.login, req.body.password);

			res.cookie('refreshToken', token.refreshToken, {
				httpOnly: true,
				secure: true,
				maxAge: (60 * 1000) * 10,
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
				maxAge: (60 * 1000) * 10,
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
