import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { blogsRouter } from './routes/blogs-router';
import { postsRouter } from './routes/posts-router';
import { usersRouter } from './routes/users-router';
import { testingRouter } from './routes/testing-router';
import { authRouter } from './routes/auth-router';
import { commentsRouter } from './routes/comments-router';

export const app = express();

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
