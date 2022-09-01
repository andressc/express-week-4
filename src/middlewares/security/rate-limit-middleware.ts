import { Request, Response } from 'express';
import { NextFunction } from 'express';
import { remoteUserIpService } from '../../domain/remote-user-ip-service';
import { HttpStatusCode } from '../../types/StatusCode';

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	await remoteUserIpService.createRemoteUserIp(req.ip);

	const countRequests = await remoteUserIpService.countRemoteUserIp(req.ip);
	if (countRequests > 5) {
		await remoteUserIpService.deleteRemoteUserIp(req.ip);
		return res.sendStatus(HttpStatusCode.TOO_MANY_REQUESTS);
	}

	return next();
};