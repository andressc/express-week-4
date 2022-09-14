import { RemoteUserIpModel } from '../db/db';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import sub from 'date-fns/sub';
import { ObjectId } from 'mongodb';

export class RemoteUserIpRepository {
	async createRemoteUserIp(remoteUserIp: RemoteUserIpType): Promise<ObjectId | null> {
		const result = await RemoteUserIpModel.create(remoteUserIp);

		if (!result.id) return null;
		return result.id;
	}

	async countRemoteUserIp(ip: string, url: string): Promise<number> {
		return RemoteUserIpModel.count({
			date: { $gt: sub(new Date(), { seconds: 10 }) },
			ip,
			url,
		});
	}

	async deleteAllRemoteUserIp(): Promise<boolean> {
		const result = await RemoteUserIpModel.deleteMany({});
		return result.deletedCount === 1;
	}
}
