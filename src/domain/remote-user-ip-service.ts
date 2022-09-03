import { idCreator } from '../helpers/idCreator';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import { remoteUserIpRepository } from '../repositories/remote-user-ip-repository';

export const remoteUserIpService = {
	async createRemoteUserIp(ip: string, url: string): Promise<RemoteUserIpType | null> {
		return await remoteUserIpRepository.createRemoteUserIp({
			id: idCreator(),
			ip,
			url,
			date: new Date(),
		});
	},

	async countRemoteUserIp(ip: string, url: string): Promise<number> {
		return await remoteUserIpRepository.countRemoteUserIp(ip, url);
	},

	async deleteRemoteUserIp(ip: string): Promise<number> {
		return await remoteUserIpRepository.deleteRemoteUserIp(ip);
	},
};
