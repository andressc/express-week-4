import { Request, Response } from 'express';
import { NextFunction } from 'express';
import { remoteUserIpService } from '../../domain/remote-user-ip-service';
import { HttpStatusCode } from '../../types/StatusCode';

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	await remoteUserIpService.createRemoteUserIp(req.ip, req.url);

	const countRequests = await remoteUserIpService.countRemoteUserIp(req.ip, req.url);
	if (countRequests > 5) {
		return res.sendStatus(HttpStatusCode.TOO_MANY_REQUESTS);
	}

	return next();
};
