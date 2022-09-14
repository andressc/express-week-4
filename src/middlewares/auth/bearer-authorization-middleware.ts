import { Request, Response } from 'express';
import { NextFunction } from 'express';
import { jwtService } from '../../application/jwt-service';
import { usersService } from '../../application/users-service';
import { HttpStatusCode } from '../../types/StatusCode';
import { stringToObjectId } from '../../helpers/stringToObjectId';

export const bearerAuthorizationMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const auth = req.header('authorization');
	if (!auth) return res.sendStatus(HttpStatusCode.UNAUTHORIZED);

	const [name, token] = auth.split(' ');
	if (name !== 'Bearer') return res.sendStatus(HttpStatusCode.UNAUTHORIZED);

	const authUserId = await jwtService.getUserAuthByToken(token);
	if (authUserId) {
		req.user = await usersService.findUserById(stringToObjectId(authUserId.userId));
		return next();
	}

	return res.sendStatus(HttpStatusCode.UNAUTHORIZED);
};
