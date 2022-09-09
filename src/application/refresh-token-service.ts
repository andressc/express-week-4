import { UsersTypeDb } from '../types/usersType';
import add from 'date-fns/add';
import {jwtService} from "./jwt-service";

export const refreshTokenService = {
	async createRefreshToken(user: UsersTypeDb) {
		const refreshToken = await jwtService.createJWT(user, "20s");
		return {
			refreshToken,
			login: user.accountData.login,
			expirationDate: add(new Date(), {
				seconds: 20,
			}),
		};
	},
};
