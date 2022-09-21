import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { blogsRouter } from './routes/blogs-router';
import { postsRouter } from './routes/posts-router';
import { runDb } from './db/db';
import { config } from 'dotenv';
import { testingRouter } from './routes/testing-router';
import { usersRouter } from './routes/users-router';
import { authRouter } from './routes/auth-router';
import { commentsRouter } from './routes/comments-router';

config();
export const app = express();

const port = process.env.PORT || 3000;
app.set('trust proxy', true);
//const parserMiddleware = bodyParser({});
//app.use(parserMiddleware);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/testing', testingRouter);
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);

const startApp = async () => {
	await runDb();
	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`);
	});
};

startApp();
