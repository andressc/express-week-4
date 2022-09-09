import { idCreator } from '../helpers/idCreator';
import bcrypt from 'bcrypt';
import { generateHash } from '../helpers/generateHash';
import { emailManager } from '../managers/email-manager';
import { jwtService } from '../application/jwt-service';
import { generateConfirmationCode } from '../helpers/generateConfirmationCode';
import { refreshTokensRepository, usersRepository } from '../index';
import { UnauthorizedError } from '../errors/unauthorizedError';
import {
	EMAIL_NOT_CONFIRMED,
	ERROR_DB,
	MESSAGE_NOT_SENT,
	REFRESH_TOKEN_INCORRECT,
	REFRESH_TOKEN_OVERDUE,
	USER_NOT_FOUND,
} from '../errors/errorsMessages';
import { BadRequestError } from '../errors/badRequestError';
import { ObjectId } from 'mongodb';
import { UsersType } from '../types/usersType';
import { usersService } from './users-service';
import { AuthTokenType, RefreshTokenType } from '../types/authTokenType';
import { refreshTokenService } from '../application/refresh-token-service';

export const authService = {
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

		const createdId: ObjectId | null = await usersRepository.createUser(newUser);
		if (!createdId) throw new Error(ERROR_DB);

		try {
			await emailManager.sendEmailRegistrationMessage(email, emailConfirmation.confirmationCode);
		} catch (e) {
			await usersRepository.deleteUser(createdId);
			throw new BadRequestError(MESSAGE_NOT_SENT + ' ' + e);
		}
	},

	async registrationConfirmation(code: string): Promise<void> {
		const user = await usersRepository.findUserByConfirmationCode(code);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		const isUpdated = await usersRepository.updateIsConfirmed(user._id);
		if (!isUpdated) throw new Error(ERROR_DB);
	},

	async registrationEmailResending(email: string): Promise<void> {
		const user = await usersRepository.findUserByEmail(email);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		const emailConfirmation = generateConfirmationCode(false);
		const isUpdated = await usersRepository.updateEmailConfirmation(email, emailConfirmation);
		if (!isUpdated) throw new Error(ERROR_DB);

		try {
			await emailManager.sendEmailRegistrationMessage(email, emailConfirmation.confirmationCode);
		} catch (error) {
			throw new BadRequestError(MESSAGE_NOT_SENT);
		}
	},

	async login(login: string, password: string): Promise<AuthTokenType> {
		const user = await usersRepository.findUserByLogin(login);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		if (!user.emailConfirmation.isConfirmed) throw new UnauthorizedError(EMAIL_NOT_CONFIRMED);

		const passwordHashSalt = user.accountData.passwordHash.split('$');
		const passwordSalt = `$${passwordHashSalt[1]}$${
			passwordHashSalt[2]
		}$${passwordHashSalt[3].slice(0, 22)}`;
		const passwordHash = await generateHash(password, passwordSalt);

		if (user.accountData.passwordHash !== passwordHash) throw new UnauthorizedError(USER_NOT_FOUND);

		const newRefreshToken = await refreshTokenService.createRefreshToken(user);

		const isTokenExists: RefreshTokenType | null =
			await refreshTokensRepository.findRefreshTokenByLogin(user.accountData.login);
		if (!isTokenExists) {
			const createdId: ObjectId | null = await refreshTokensRepository.createRefreshToken(newRefreshToken);
			if (!createdId) throw new Error(ERROR_DB);
		}

		if (isTokenExists) {
			const isUpdate: boolean = await refreshTokensRepository.updateRefreshToken(newRefreshToken);
			if (!isUpdate) throw new Error(ERROR_DB);
		}

		const accessToken = await jwtService.createJWT(user, "10s");
		return { accessToken, refreshToken: newRefreshToken.refreshToken };
	},

	async refreshToken(token: string | null): Promise<AuthTokenType> {
		if (!token) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const refreshToken = await refreshTokensRepository.findRefreshToken(token);
		if (!refreshToken) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const user = await usersRepository.findUserByLogin(refreshToken.login);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		if (refreshToken.expirationDate < new Date())
			throw new UnauthorizedError(REFRESH_TOKEN_OVERDUE);

		const newRefreshToken = await refreshTokenService.createRefreshToken(user);

		const isUpdate: boolean = await refreshTokensRepository.updateRefreshToken(newRefreshToken);
		if (!isUpdate) throw new Error(ERROR_DB);

		const accessToken = await jwtService.createJWT(user, "10s");
		return { accessToken, refreshToken: newRefreshToken.refreshToken };
	},

	async getAuthUser(authUser: null | UsersType): Promise<{
		email: string;
		login: string;
		userId: string;
	}> {
		if (!authUser) throw new UnauthorizedError(USER_NOT_FOUND);

		const user: UsersType = await usersService.findUserById(authUser.id);
		if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

		const {
			accountData: { email, login },
			id,
		} = user;

		return { email, login, userId: id.toString() };
	},

	async deleteRefreshToken(refreshToken: string): Promise<void> {
		if (!refreshToken) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);

		const isDeleted = await refreshTokensRepository.deleteToken(refreshToken);
		if (!isDeleted) throw new UnauthorizedError(REFRESH_TOKEN_INCORRECT);
	},
};
