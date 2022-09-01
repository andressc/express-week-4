import rateLimit from 'express-rate-limit';
import { HttpStatusCode } from '../../types/StatusCode';

export const rateLimitMiddleware = rateLimit({
	windowMs: 10 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
});
