import { idCreator } from '../helpers/idCreator';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import { remoteUserIpRepository } from '../index';
import { ObjectId } from 'mongodb';
import { ERROR_DB } from '../errors/errorsMessages';

export const remoteUserIpService = {
	async createRemoteUserIp(ip: string, url: string): Promise<RemoteUserIpType> {
		const newIp = {
			_id: idCreator(),
			ip,
			url,
			date: new Date(),
		};

		const createdId: ObjectId | null = await remoteUserIpRepository.createRemoteUserIp(newIp);
		if (!createdId) throw new Error(ERROR_DB);

		return { _id: createdId, ip, url, date: newIp.date };
	},

	async countRemoteUserIp(ip: string, url: string): Promise<number> {
		return await remoteUserIpRepository.countRemoteUserIp(ip, url);
	},
};
