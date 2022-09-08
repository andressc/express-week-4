import { remoteUserIpCollection } from '../db/db';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import sub from 'date-fns/sub';
import { DbRepository } from './db-repository';
import { ObjectId } from 'mongodb';

export class RemoteUserIpRepository extends DbRepository {
	async createRemoteUserIp(remoteUserIp: RemoteUserIpType): Promise<ObjectId | null> {
		const result = await remoteUserIpCollection.insertOne(remoteUserIp);

		if (!result.acknowledged) return null;
		return result.insertedId;
	}

	async countRemoteUserIp(ip: string, url: string): Promise<number> {
		return await remoteUserIpCollection.count({
			date: { $gt: sub(new Date(), { seconds: 10 }) },
			ip,
			url,
		});
	}

	async deleteAllRemoteUserIp(): Promise<boolean> {
		const result = await remoteUserIpCollection.deleteMany({});
		return result.deletedCount === 1;
	}
}
