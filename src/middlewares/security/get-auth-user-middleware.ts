import { Request, Response } from 'express';
import { NextFunction } from 'express';
import { UsersService } from '../../application/users-service';
import { HttpStatusCode } from '../../types/StatusCode';
import { stringToObjectId } from '../../helpers/stringToObjectId';
import { container } from '../../psevdoIoc';
import { JwtService } from '../../application/jwt-service';

const usersService = container.resolve(UsersService);
const jwtService = container.resolve(JwtService);

export const getAuthUserMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const auth = req.header('authorization');
	if (!auth) return next();

	const [name, token] = auth.split(' ');
	if (name !== 'Bearer') return res.sendStatus(HttpStatusCode.UNAUTHORIZED);

	const authUserId = await jwtService.getUserAuthByToken(token);
	if (authUserId) {
		req.user = await usersService.findUserById(stringToObjectId(authUserId.userId));
	}
	return next();
};
