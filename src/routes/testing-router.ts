import { Request, Response, Router } from 'express';
import { TestingService } from '../application/testing-service';
import { HttpStatusCode } from '../types/StatusCode';
import { generateErrorCode } from '../helpers/generateErrorCode';

export const testingRouter = Router({});

class TestingController {
	testingService: TestingService;
	constructor() {
		this.testingService = new TestingService();
	}

	async deleteAllData(req: Request, res: Response) {
		try {
			await this.testingService.deleteAllData();
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}

const testingController = new TestingController();

testingRouter.delete('/all-data', testingController.deleteAllData.bind(testingController));
