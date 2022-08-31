import { Request, Response } from 'express';
import { NextFunction } from 'express';
import { HttpStatusCode } from '../../types/StatusCode';

export const basicAuthorizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const auth = req.header('authorization');
	if (!auth) return res.send(HttpStatusCode.UNAUTHORIZED);

	const [name, base64] = auth.split(' ');
	if (name !== 'Basic') return res.send(HttpStatusCode.UNAUTHORIZED);

	const [login, password] = Buffer.from(base64, 'base64').toString('ascii').split(':');
	if (login === 'admin' && password === 'qwerty') return next();

	return res.send(HttpStatusCode.UNAUTHORIZED);
};
