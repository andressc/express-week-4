import { runDb } from './db/db';
import { app } from './init';

export const startApp = async (port: number | string) => {
	await runDb();
	app.listen(port, () => {
		console.log(`Example app listening  on port ${port}`);
	});
};
