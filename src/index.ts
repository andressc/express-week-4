import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { bloggersRouter } from './routes/bloggers-router';
import { postsRouter } from './routes/posts-router';
import { runDb } from './db/db';
import { config } from 'dotenv';
import { testingRouter } from './routes/testing-router';
import { usersRouter } from './routes/users-router';
import { authRouter } from './routes/auth-router';
import { commentsRouter } from './routes/comments-router';
import { BloggersRepository } from './repositories/bloggers-repository';
import { UsersRepository } from './repositories/users-repository';
import { PostsRepository } from './repositories/posts-repository';
import { CommentsRepository } from './repositories/comments-repository';
import { RemoteUserIpRepository } from './repositories/remote-user-ip-repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens-repository';

config();
export const app = express();

export const bloggersRepository = new BloggersRepository();
export const usersRepository = new UsersRepository();
export const postsRepository = new PostsRepository();
export const commentsRepository = new CommentsRepository();
export const remoteUserIpRepository = new RemoteUserIpRepository();
export const refreshTokensRepository = new RefreshTokensRepository();

const port = process.env.PORT || 3000;
app.set('trust proxy', true);
//const parserMiddleware = bodyParser({});
//app.use(parserMiddleware);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(ipMiddleware)
app.use('/bloggers', bloggersRouter);
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
