import { MongoClient } from 'mongodb';
import { BloggersType } from '../types/bloggersType';
import { PostsType } from '../types/postsType';
import { UsersType } from '../types/usersType';
import { CommentsType } from '../types/commentsType';
import { config } from 'dotenv';
import { RemoteUserIpType } from '../types/remoteUserIpType';

config();
const mongoUri = process.env.mongoURI || 'mongodb://0.0.0.0:19017';

const client = new MongoClient(mongoUri);
const db = client.db('learning');

export const bloggersCollection = db.collection<BloggersType>('bloggers');
export const postsCollection = db.collection<PostsType>('posts');
export const usersCollection = db.collection<UsersType>('users');
export const commentsCollection = db.collection<CommentsType>('comments');
export const remoteUserIpCollection = db.collection<RemoteUserIpType>('ip');

export const runDb = async () => {
	try {
		await client.connect();
		await db.command({ ping: 1 });
		console.log('connected successfully to mongo server');
	} catch (e) {
		console.log("Can't connect to db");
		await client.close();
	}
};
