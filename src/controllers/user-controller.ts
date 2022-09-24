import { UsersService } from '../application/users-service';
import { Request, Response } from 'express';
import { PaginationType, PaginationTypeQuery } from '../types/paginationType';
import { ObjectId } from 'mongodb';
import { generateErrorCode } from '../helpers/generateErrorCode';
import { UsersType } from '../types/usersType';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { HttpStatusCode } from '../types/StatusCode';
import { inject, injectable } from 'inversify';

@injectable()
export class UserController {
	constructor(@inject(UsersService) protected usersService: UsersService) {}

	async findAllUsers(req: Request<{}, {}, {}, PaginationTypeQuery>, res: Response) {
		try {
			const users: PaginationType<Array<{ id: ObjectId; login: string }>> =
				await this.usersService.findAllUsers(req.query);
			return res.send(users);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async findUserById(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			const user: UsersType = await this.usersService.findUserById(stringToObjectId(req.params.id));
			return res.send(user);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async deleteUser(req: Request<{ id: string }, {}, {}, {}>, res: Response) {
		try {
			await this.usersService.deleteUser(stringToObjectId(req.params.id));
			return res.sendStatus(HttpStatusCode.NO_CONTENT);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}

	async createUser(
		req: Request<{}, {}, { login: string; email: string; password: string }, {}>,
		res: Response,
	) {
		try {
			const user = await this.usersService.createUser(
				req.body.login,
				req.body.email,
				req.body.password,
			);

			return res.status(HttpStatusCode.CREATED).send(user);
		} catch (error) {
			const err = generateErrorCode(error);
			return res.status(err.status).send(err.message);
		}
	}
}
