import { RefreshTokenModel } from '../db/db';
import { ObjectId } from 'mongodb';
import { RefreshTokenType } from '../types/authTokenType';

export class RefreshTokensRepository {
	async createRefreshToken(refreshToken: string): Promise<ObjectId | null> {
		const result = await RefreshTokenModel.create({ refreshToken });

		if (!result.id) return null;
		return result.id;
	}

	async findRefreshToken(token: string): Promise<RefreshTokenType | null> {
		const refreshToken: RefreshTokenType | null = await RefreshTokenModel.findOne({
			refreshToken: token,
		});

		if (!refreshToken) return null;
		return refreshToken;
	}

	async deleteAllTokens(): Promise<boolean> {
		const result = await RefreshTokenModel.deleteMany({});
		return result.deletedCount === 1;
	}
}
