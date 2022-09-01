import {idCreator} from "../helpers/idCreator";
import {RemoteUserIpType} from "../types/remoteUserIpType";
import {remoteUserIpRepository} from "../repositories/remote-user-ip-repository";

export const remoteUserIpService = {
	async createRemoteUserIp(ip: string): Promise<RemoteUserIpType | null> {
		return await remoteUserIpRepository.createRemoteUserIp({
			id: idCreator(),
			ip,
			date: new Date()
		});
	},
};
