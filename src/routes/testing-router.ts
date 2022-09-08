import { Request, Response, Router } from 'express';
import { testingService } from '../domain/testing-service';
import { HttpStatusCode } from '../types/StatusCode';
import { generateErrorCode } from '../helpers/generateErrorCode';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
	try {
		await testingService.deleteAllData();
		return res.sendStatus(HttpStatusCode.NO_CONTENT);
	} catch (error) {
		const err = generateErrorCode(error);
		return res.status(err.status).send(err.message);
	}
});
