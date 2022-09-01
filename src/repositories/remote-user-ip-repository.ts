import {remoteUserIpCollection} from '../db/db';
import {RemoteUserIpType} from '../types/remoteUserIpType';

export const remoteUserIpRepository = {
	async createRemoteUserIp(remoteUserIp: RemoteUserIpType): Promise<RemoteUserIpType> {
		await remoteUserIpCollection.insertOne(remoteUserIp);

		const { id, ip, date } = remoteUserIp;

		return { id, ip, date };
	},

	async countRemoteUserIp(ip: string): Promise<number> {
		return await remoteUserIpCollection.count({date: {$gt: new Date()}, ip});
	},
};
