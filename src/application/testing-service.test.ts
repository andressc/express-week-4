import { container } from '../psevdoIoc';
import mongoose from 'mongoose';
import {
	BlogModel,
	CommentModel,
	LikeModel,
	PostModel,
	RefreshTokenModel,
	RemoteUserIpModel,
	UserModel,
} from '../db/db';
import { idCreator } from '../helpers/idCreator';
import { connectMemoryDb, disconnectMemoryDb } from '../db/memoryDb';
import { TestingService } from './testing-service';

describe('Integration test for testing-service', () => {
	beforeAll(connectMemoryDb);
	afterAll(disconnectMemoryDb);

	const testingService = container.resolve(TestingService);

	describe('deleteAllData', () => {
		beforeAll(async () => {
			await mongoose.connection.db.dropDatabase();

			await PostModel.create({
				_id: idCreator(),
				title: 'title',
				shortDescription: 'shortDescription',
				content: 'content',
				blogId: idCreator(),
				blogName: 'blogName',
				createdAt: new Date().toISOString(),
			});

			await BlogModel.create({
				_id: idCreator(),
				name: 'name',
				youtubeUrl: 'youtubeUrl',
				createdAt: new Date().toISOString(),
			});

			await UserModel.create({
				_id: idCreator(),
				emailConfirmation: {
					confirmationCode: 'confirmationCode',
					expirationDate: new Date().toISOString(),
					isConfirmed: true,
				},
				accountData: {
					login: 'login',
					email: 'email@email',
					passwordHash: 'passwordHash',
				},
				createdAt: new Date().toISOString(),
			});

			await CommentModel.create({
				_id: idCreator(),
				content: 'content',
				userId: idCreator(),
				userLogin: 'userLogin',
				postId: idCreator(),
				createdAt: new Date().toISOString(),
			});

			await RemoteUserIpModel.create({
				_id: idCreator(),
				ip: 'ip',
				url: 'url',
				date: new Date().toISOString(),
			});

			await RefreshTokenModel.create({
				refreshToken: 'refreshToken',
			});

			await LikeModel.create({
				_id: idCreator(),
				type: 'type',
				login: 'login',
				userId: idCreator(),
				itemId: idCreator(),
				likeStatus: 'likeStatus',
				addedAt: new Date().toISOString(),
			});
		});

		it('delete all data', async () => {
			const result = await testingService.deleteAllData();
			expect(result).toBe(void 0);
		});

		it('find after deleting', async () => {
			const postCount = await PostModel.countDocuments({});
			const blogCount = await BlogModel.countDocuments({});
			const userCount = await UserModel.countDocuments({});
			const commentCount = await CommentModel.countDocuments({});
			const remoteUserIpCount = await RemoteUserIpModel.countDocuments({});
			const refreshToken = await RefreshTokenModel.countDocuments({});
			const likeCount = await LikeModel.countDocuments({});

			expect(postCount).toBe(0);
			expect(blogCount).toBe(0);
			expect(userCount).toBe(0);
			expect(commentCount).toBe(0);
			expect(remoteUserIpCount).toBe(0);
			expect(refreshToken).toBe(0);
			expect(likeCount).toBe(0);
		});
	});
});
