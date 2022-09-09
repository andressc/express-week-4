import { refreshTokensCollection } from '../db/db';
import { DbRepository } from './db-repository';
import { ObjectId } from 'mongodb';
import { RefreshTokenType } from '../types/authTokenType';

export class RefreshTokensRepository extends DbRepository {
	async createRefreshToken(newRefreshToken: RefreshTokenType): Promise<ObjectId | null> {
		const result = await refreshTokensCollection.insertOne(newRefreshToken);

		if (!result.acknowledged) return null;
		return result.insertedId;
	}

	async findRefreshToken(token: string): Promise<RefreshTokenType | null> {
		const refreshToken: RefreshTokenType | null = await refreshTokensCollection.findOne({ token });

		if (!refreshToken) return null;
		return refreshToken;
	}

	async findRefreshTokenByLogin(login: string): Promise<RefreshTokenType | null> {
		return refreshTokensCollection.findOne({ login });
	}

	async updateRefreshToken({
		login,
		refreshToken,
		expirationDate,
	}: RefreshTokenType): Promise<boolean> {
		const result = await refreshTokensCollection.updateOne(
			{ login },
			{ $set: { refreshToken, expirationDate } },
		);
		return result.matchedCount === 1;
	}

	async deleteAllTokens(): Promise<boolean> {
		const result = await refreshTokensCollection.deleteMany({});
		return result.deletedCount === 1;
	}
}
