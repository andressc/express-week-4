import { idCreator } from '../helpers/idCreator';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import { remoteUserIpRepository } from '../repositories/remote-user-ip-repository';

export const remoteUserIpService = {
	async createRemoteUserIp(ip: string): Promise<RemoteUserIpType | null> {
		return await remoteUserIpRepository.createRemoteUserIp({
			id: idCreator(),
			ip,
			date: new Date(),
		});
	},

	async countRemoteUserIp(ip: string): Promise<number> {
		return await remoteUserIpRepository.countRemoteUserIp(ip);
	},

	async deleteRemoteUserIp(ip: string): Promise<number> {
		return await remoteUserIpRepository.deleteRemoteUserIp(ip);
	},
};
