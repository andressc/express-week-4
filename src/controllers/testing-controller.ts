import { TestingService } from '../application/testing-service';
import { Request, Response } from 'express';
import { HttpStatusCode } from '../types/StatusCode';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { inject, injectable } from 'inversify';

@injectable()
export class TestingController {
	constructor(@inject(TestingService) protected testingService: TestingService) {}

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
