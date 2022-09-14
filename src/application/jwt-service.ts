import jwt from 'jsonwebtoken';
import { UsersTypeDb } from '../types/usersType';

export class JwtService {
	async createJWT(user: UsersTypeDb, expiresIn: string) {
		return jwt.sign({ userId: user._id }, '56ytuhbvcw4rhe6rtcvjuoiporeesfh', {
			expiresIn,
		});
	}

	async getUserAuthByToken(token: string) {
		try {
			const result: any = jwt.verify(token, '56ytuhbvcw4rhe6rtcvjuoiporeesfh');
			return result;
		} catch (e) {
			return null;
		}
	}
}

export const jwtService = new JwtService();
