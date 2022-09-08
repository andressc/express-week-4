import { Request, Response } from 'express';
import { NextFunction } from 'express';
import { HttpStatusCode } from '../../types/StatusCode';

export const objectIdValidationMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (req.params.id.length !== 24)
		return res.status(HttpStatusCode.BAD_REQUEST).send('Invalid parameter id');
	return next();
};
