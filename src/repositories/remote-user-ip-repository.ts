import { remoteUserIpCollection } from '../db/db';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import sub from 'date-fns/sub';

export const remoteUserIpRepository = {
	async createRemoteUserIp(remoteUserIp: RemoteUserIpType): Promise<RemoteUserIpType> {
		await remoteUserIpCollection.insertOne(remoteUserIp);

		const { id, ip, date } = remoteUserIp;

		return { id, ip, date };
	},

	async countRemoteUserIp(ip: string): Promise<number> {
		return await remoteUserIpCollection.count({
			date: { $gt: sub(new Date(), { seconds: 10 }) },
			ip,
		});
	},

	async deleteRemoteUserIp(ip: string): Promise<number> {
		const result = await remoteUserIpCollection.deleteMany({ ip });
		return result.deletedCount;
	},
};
