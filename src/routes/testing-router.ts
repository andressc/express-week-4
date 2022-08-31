import { Request, Response, Router } from 'express';
import { testingService } from '../domain/testing-service';
import { HttpStatusCode } from '../types/StatusCode';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
	await testingService.deleteAllData();

	return res.sendStatus(HttpStatusCode.NO_CONTENT);
});
