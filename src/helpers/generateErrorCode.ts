import { HttpStatusCode } from '../types/StatusCode';
import { BadRequestError } from '../errors/badRequestError';
import { UnauthorizedError } from '../errors/unauthorizedError';
import { ForbiddenError } from '../errors/forbiddenError';
import { NotFoundError } from '../errors/notFoundError';
import { TooManyRequestsError } from '../errors/tooManyRequestsError';
import { IErrorHandler } from '../types/iErrorHandler';

export const generateErrorCode = (error: unknown): IErrorHandler => {
	if (error instanceof BadRequestError)
		return { status: HttpStatusCode.BAD_REQUEST, message: error.message };

	if (error instanceof UnauthorizedError)
		return { status: HttpStatusCode.UNAUTHORIZED, message: error.message };

	if (error instanceof ForbiddenError)
		return { status: HttpStatusCode.FORBIDDEN, message: error.message };

	if (error instanceof NotFoundError)
		return { status: HttpStatusCode.NOT_FOUND, message: error.message };

	if (error instanceof TooManyRequestsError)
		return { status: HttpStatusCode.TOO_MANY_REQUESTS, message: error.message };

	return { status: HttpStatusCode.INTERNAL_SERVER_ERROR, message: 'Server Error' };
};
