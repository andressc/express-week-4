import { Request, Response } from 'express';
import { NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpStatusCode } from '../../types/StatusCode';

export const errorValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorArr = errors.array().map((v) => {
			return { message: v.msg, field: v.param };
		});

		res.status(HttpStatusCode.BAD_REQUEST).json({ errorsMessages: errorArr });
	} else {
		next();
	}
};
