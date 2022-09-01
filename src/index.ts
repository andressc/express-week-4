import express from 'express';
import bodyParser from 'body-parser';
import { bloggersRouter } from './routes/bloggers-router';
import { postsRouter } from './routes/posts-router';
import { runDb } from './db/db';
import { config } from 'dotenv';
import { testingRouter } from './routes/testing-router';
import { usersRouter } from './routes/users-router';
import { authRouter } from './routes/auth-router';
import { commentsRouter } from './routes/comments-router';
import { emailRouter } from './routes/email-router';

config();
export const app = express();

const port = process.env.PORT || 3000;
app.set('trust proxy', true);
//const parserMiddleware = bodyParser({});
//app.use(parserMiddleware);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(ipMiddleware)
app.use('/bloggers', bloggersRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/testing', testingRouter);
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);
app.use('/email', emailRouter);

const startApp = async () => {
	await runDb();
	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`);
	});
};

startApp();
