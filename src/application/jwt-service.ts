import jwt from 'jsonwebtoken';
import { UsersTypeDb } from '../types/usersType';

export const jwtService = {
	async createJWT(user: UsersTypeDb) {
		return jwt.sign({ userId: user._id }, '56ytuhbvcw4rhe6rtcvjuoiporeesfh', {
			expiresIn: '10s',
		});
	},

	async getUserAuthByToken(token: string) {
		try {
			const result: any = jwt.verify(token, '56ytuhbvcw4rhe6rtcvjuoiporeesfh');
			return result;
		} catch (e) {
			return null;
		}
	},
};
