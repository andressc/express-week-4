import { Request, Response } from 'express';
import { NextFunction } from 'express';
import {remoteUserIpService} from "../../domain/remote-user-ip-service";

export const ipMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
		console.log(req.ip)
		await remoteUserIpService.createRemoteUserIp(req.ip)
		return next();
};
