//import request from 'supertest';
//import { app } from '../index';
//import { BloggersType } from '../types/bloggersType';
//import { testingService } from '../application/testing-service';

/*describe('/bloggers', () => {
	beforeAll(async () => {
		await testingService.deleteAllData();
	});

	it('add new blogger', async () => {
		let blogger: BloggersType;

		////TEST 1
		const responseBlogger = await request(app)
			.post('/bloggers')
			.set('authorization', 'Basic YWRtaW46cXdlcnR5')
			.send({
				name: 'reybov',
				youtubeUrl: 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A',
			})
			.expect(201);

		blogger = responseBlogger.body;

		await request(app)
			.get('/bloggers/' + blogger.id)
			.send({
				name: 'reybov',
				youtubeUrl: 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A',
			})
			.expect(200);

		await request(app)
			.delete('/bloggers/' + blogger.id)
			.set('authorization', 'Basic YWRtaW46cXdlcnR5')
			.send({
				name: 'reybov',
				youtubeUrl: 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A',
			})
			.expect(204);

		////TEST 2
		const responseBloggerError = await request(app)
			.post('/bloggers')
			.set('authorization', 'Basic YWRtaW46cXdlcnR5')
			.send({
				name: 'reybov',
				youtubeUrl: 'fvdfvdfvdfvdfvdvdfv',
			})
			.expect(400);

		expect(responseBloggerError.body).toEqual({
			errorsMessages: [
				{
					field: 'youtubeUrl',
					message: expect.any(String),
				},
			],
		});
	});*/

/*it('should return 200 and all bloggers', async () => {
		const response = await request(app).get('/bloggers').expect(200);

		expect(response.body).toEqual({
			pagesCount: expect.any(Number),
			page: expect.any(Number),
			pageSize: expect.any(Number),
			totalCount: expect.any(Number),
			items: [
				{
					id: expect.any(Number),
					name: expect.any(String),
					youtubeUrl: expect.stringMatching(
						/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
					),
				},
			],
		});
	});

	it('should return 404 for not existing blogger', async () => {
		await request(app).get('/bloggers/42352453253').expect(404);
	});*/
//});

/*test('get blogger by id', async () => {
	await expect(bloggersService.findBloggerById(16612946958578)).resolves.toEqual({
		id: expect.any(Number),
		name: expect.any(String),
		youtubeUrl: expect.stringMatching(
			/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
		),
	});
});*/
