import { MongoClient } from 'mongodb';
import { BloggersTypeDb } from '../types/bloggersType';
import { PostsTypeDb } from '../types/postsType';
import { UsersTypeDb } from '../types/usersType';
import { CommentsTypeDb } from '../types/commentsType';
import { config } from 'dotenv';
import { RemoteUserIpType } from '../types/remoteUserIpType';

config();
const mongoUri = process.env.mongoURI || 'mongodb://0.0.0.0:19017';

const client = new MongoClient(mongoUri);
const db = client.db('learning');

export const bloggersCollection = db.collection<BloggersTypeDb>('bloggers');
export const postsCollection = db.collection<PostsTypeDb>('posts');
export const usersCollection = db.collection<UsersTypeDb>('users');
export const commentsCollection = db.collection<CommentsTypeDb>('comments');
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
