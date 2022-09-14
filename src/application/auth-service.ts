import { idCreator } from '../helpers/idCreator';
import bcrypt from 'bcrypt';
import { generateHash } from '../helpers/generateHash';
import { emailManager } from '../managers/email-manager';
import { generateConfirmationCode } from '../helpers/generateConfirmationCode';
import { UnauthorizedError } from '../errors/unauthorizedError';
import {
	EMAIL_NOT_CONFIRMED,
	ERROR_DB,
	MESSAGE_NOT_SENT,
	REFRESH_TOKEN_INCORRECT,
	USER_NOT_FOUND,
} from '../errors/errorsMessages';
import { BadRequestError } from '../errors/badRequestError';
import { ObjectId } from 'mongodb';
import { UsersType, UsersTypeDb } from '../types/usersType';
import { AuthTokenType } from '../types/authTokenType';
import { stringToObjectId } from '../helpers/stringToObjectId';
import { UsersRepository } from '../repositories/users-repository';
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository';
import { JwtService } from './jwt-service';

export class AuthService {
	usersRepository: UsersRepository;
	refreshTokensRepository: RefreshTokensRepository;
	jwtService: JwtService;
	constructor() {
		this.usersRepository = new UsersRepository();
		this.refreshTokensRepository = new RefreshTokensRepository();
		this.jwtService = new JwtService();
	}

	/**
	 * Registration method
	 * @param login - login user
	 * @param email - email user
	 * @param password - password user
	 * @return void
	 */
	async registration(login: string, email: string, password: string): Promise<void> {
		const passwordSalt = await bcrypt.genSalt(10);
		const passwordHash = await generateHash(password, passwordSalt);

		const emailConfirmation = generateConfirmationCode(false);

		const newUser = {
			_id: idCreator(),
			accountData: {
				login,
				email,
				passwordHash,
			},
			emailConfirmation,
		};

		const createdId: ObjectId | null = await this.usersRepository.createUser(newUser);
		if (!createdId) throw new Error(ERROR_DB);

		try {
			await emailManager.sendEmailRegistrationMessage(email, emailConfirmation.confirmationCode);
		} catch (e) {
			await this.usersRepository.deleteUser(createdId);
			throw new BadRequestError(MESSAGE_NOT_SENT + ' ' + e);
		}
	}

	async registrationConfirmation(code: string): Promise<void> {
		const user = await this.usersRepository.findUserByConfirmationCode(code);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		const isUpdated = await this.usersRepository.updateIsConfirmed(user._id);
		if (!isUpdated) throw new Error(ERROR_DB);
	}

	async registrationEmailResending(email: string): Promise<void> {
		const user = await this.usersRepository.findUserByEmail(email);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		const emailConfirmation = generateConfirmationCode(false);
		const isUpdated = await this.usersRepository.updateEmailConfirmation(email, emailConfirmation);
		if (!isUpdated) throw new Error(ERROR_DB);

		try {
			await emailManager.sendEmailRegistrationMessage(email, emailConfirmation.confirmationCode);
		} catch (error) {
			throw new BadRequestError(MESSAGE_NOT_SENT);
		}
	}

	async login(login: string, password: string): Promise<AuthTokenType> {
		const user = await this.usersRepository.findUserByLogin(login);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		if (!user.emailConfirmation.isConfirmed) throw new UnauthorizedError(EMAIL_NOT_CONFIRMED);

		const passwordHashSalt = user.accountData.passwordHash.split('$');
		const passwordSalt = `$${passwordHashSalt[1]}$${
			passwordHashSalt[2]
		}$${passwordHashSalt[3].slice(0, 22)}`;
		const passwordHash = await generateHash(password, passwordSalt);

		if (user.accountData.passwordHash !== passwordHash) throw new UnauthorizedError(USER_NOT_FOUND);

		const tokens = await this._createTokens(user);
		return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
	}

	async refreshToken(token: string | null): Promise<AuthTokenType> {
		if (!token) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const tokenValidation = await this.refreshTokensRepository.findRefreshToken(token);
		if (tokenValidation) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const authUserId = await this.jwtService.getUserAuthByToken(token);
		if (!authUserId) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const oldRefreshToken = await this.refreshTokensRepository.createRefreshToken(token);
		if (!oldRefreshToken) throw new Error(ERROR_DB);

		const user = await this.usersRepository.findUserById(stringToObjectId(authUserId.userId));
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		const tokens = await this._createTokens(user);
		return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
	}

	async getAuthUser(authUser: null | UsersType): Promise<{
		email: string;
		login: string;
		userId: string;
	}> {
		if (!authUser) throw new UnauthorizedError(USER_NOT_FOUND);

		const user: UsersTypeDb | null = await this.usersRepository.findUserById(authUser.id);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		const {
			accountData: { email, login },
			_id,
		} = user;

		return { email, login, userId: _id.toString() };
	}

	async deleteRefreshToken(token: string | null): Promise<void> {
		if (!token) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const tokenValidation = await this.refreshTokensRepository.findRefreshToken(token);
		if (tokenValidation) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const authUserId = await this.jwtService.getUserAuthByToken(token);
		if (!authUserId) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const oldRefreshToken = await this.refreshTokensRepository.createRefreshToken(token);
		if (!oldRefreshToken) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);
	}

	async _createTokens(user: UsersTypeDb): Promise<{ refreshToken: string; accessToken: string }> {
		const refreshToken = await this.jwtService.createJWT(user, '20s');
		const accessToken = await this.jwtService.createJWT(user, '10s');

		return { refreshToken, accessToken };
	}

	/*async _testRefreshToken(token: string): Promise<string> {
		if (!token) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const tokenValidation = await refreshTokensRepository.findRefreshToken(token);
		if (tokenValidation) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const authUserId = await jwtService.getUserAuthByToken(token);
		if (!authUserId) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		return authUserId.userId
	}*/
}
