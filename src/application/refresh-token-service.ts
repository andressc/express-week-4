import { UsersTypeDb } from '../types/usersType';
import { idCreator } from '../helpers/idCreator';
import add from 'date-fns/add';

export const refreshTokenService = {
	async createRefreshToken(user: UsersTypeDb) {
		const refreshToken = idCreator().toString();
		return {
			refreshToken,
			login: user.accountData.login,
			expirationDate: add(new Date(), {
				seconds: 20,
			}),
		};
	},
};
