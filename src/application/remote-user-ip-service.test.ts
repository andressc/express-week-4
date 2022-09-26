import { container } from '../psevdoIoc';
import mongoose from 'mongoose';
import { RemoteUserIpModel } from '../db/db';
import { idCreator } from '../helpers/idCreator';
import { connectMemoryDb, disconnectMemoryDb } from '../db/memoryDb';
import { RemoteUserIpService } from './remote-user-ip-service';
import { RemoteUserIpType } from '../types/remoteUserIpType';

describe('Integration test for remote-user-ip-service', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const ip = '192.168.1.1';
	const url = 'auth/login';

	const remoteUserIpCreator = (ip: string, url: string) => {
		return {
			_id: idCreator(),
			ip,
			url,
			date: new Date(),
		};
	};

	const remoteUserIpService = container.resolve(RemoteUserIpService);

	describe('createRemoteUserIp', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
		});

		it('remoteUserIp test add ip to database', async () => {
			const result = await remoteUserIpService.createRemoteUserIp(ip, url);
			expect(result).toEqual({
				_id: expect.any(String),
				ip: '192.168.1.1',
				url: 'auth/login',
				date: expect.any(Date),
			});

			const remoteUserIpModel: RemoteUserIpType | null = await RemoteUserIpModel.findById({
				_id: result._id,
			});

			expect(remoteUserIpModel).not.toBeNull();
		});
	});

	describe('countRemoteUserIp', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();
			await RemoteUserIpModel.insertMany([
				remoteUserIpCreator(ip, url),
				remoteUserIpCreator(ip, url),
				remoteUserIpCreator(ip, url),
				remoteUserIpCreator('129.544.34.1', 'auth/registration'),
			]);
		});

		it('remoteUserIp test count', async () => {
			const quantity = await remoteUserIpService.countRemoteUserIp(ip, url);
			expect(quantity).toBe(3);
		});
	});
});
