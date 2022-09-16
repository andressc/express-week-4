import { idCreator } from '../helpers/idCreator';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import { ObjectId } from 'mongodb';
import { ERROR_DB } from '../errors/errorsMessages';
import { RemoteUserIpRepository } from '../repositories/remote-user-ip-repository';
import { inject, injectable } from 'inversify';

@injectable()
export class RemoteUserIpService {
	constructor(
		@inject(RemoteUserIpRepository) protected remoteUserIpRepository: RemoteUserIpRepository,
	) {}

	async createRemoteUserIp(ip: string, url: string): Promise<RemoteUserIpType> {
		const newIp = {
			_id: idCreator(),
			ip,
			url,
			date: new Date(),
		};

		const createdId: ObjectId | null = await this.remoteUserIpRepository.createRemoteUserIp(newIp);
		if (!createdId) throw new Error(ERROR_DB);

		return { _id: createdId, ip, url, date: newIp.date };
	}

	async countRemoteUserIp(ip: string, url: string): Promise<number> {
		return await this.remoteUserIpRepository.countRemoteUserIp(ip, url);
	}
}
