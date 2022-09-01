import { idCreator } from '../helpers/idCreator';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import { remoteUserIpRepository } from '../repositories/remote-user-ip-repository';
import add from 'date-fns/add';

export const remoteUserIpService = {
	async createRemoteUserIp(ip: string): Promise<RemoteUserIpType | null> {
		return await remoteUserIpRepository.createRemoteUserIp({
			id: idCreator(),
			ip,
			date: add(new Date(), {
				seconds: 10,
			}),
		});
	},

	async countRemoteUserIp(ip: string): Promise<number> {
		return await remoteUserIpRepository.countRemoteUserIp(ip);
	},
};
