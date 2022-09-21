//import request from 'supertest';
//import { app } from '../index';
//import { BlogsType } from '../types/blogsType';
//import { testingService } from '../application/testing-service';

/*describe('/blogs', () => {
	beforeAll(async () => {
		await testingService.deleteAllData();
	});

	it('add new blog', async () => {
		let blog: BlogsType;

		////TEST 1
		const responseBlog = await request(app)
			.post('/blogs')
			.set('authorization', 'Basic YWRtaW46cXdlcnR5')
			.send({
				name: 'reybov',
				youtubeUrl: 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A',
			})
			.expect(201);

		blog = responseBlog.body;

		await request(app)
			.get('/blogs/' + blog.id)
			.send({
				name: 'reybov',
				youtubeUrl: 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A',
			})
			.expect(200);

		await request(app)
			.delete('/blogs/' + blog.id)
			.set('authorization', 'Basic YWRtaW46cXdlcnR5')
			.send({
				name: 'reybov',
				youtubeUrl: 'https://www.youtube.com/channel/UCkUFua6WbuKcmMDrcxRpH7A',
			})
			.expect(204);

		////TEST 2
		const responseBlogError = await request(app)
			.post('/blogs')
			.set('authorization', 'Basic YWRtaW46cXdlcnR5')
			.send({
				name: 'reybov',
				youtubeUrl: 'fvdfvdfvdfvdfvdvdfv',
			})
			.expect(400);

		expect(responseBlogError.body).toEqual({
			errorsMessages: [
				{
					field: 'youtubeUrl',
					message: expect.any(String),
				},
			],
		});
	});*/

/*it('should return 200 and all blogs', async () => {
		const response = await request(app).get('/blogs').expect(200);

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

	it('should return 404 for not existing blog', async () => {
		await request(app).get('/blogs/42352453253').expect(404);
	});*/
//});

/*test('get blog by id', async () => {
	await expect(blogsService.findBlogById(16612946958578)).resolves.toEqual({
		id: expect.any(Number),
		name: expect.any(String),
		youtubeUrl: expect.stringMatching(
			/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
		),
	});
});*/
