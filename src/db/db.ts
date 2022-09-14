import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { BloggersTypeDb } from '../types/bloggersType';
import { PostsTypeDb } from '../types/postsType';
import { UsersTypeDb } from '../types/usersType';
import { CommentsTypeDb } from '../types/commentsType';
import { config } from 'dotenv';
import { RemoteUserIpType } from '../types/remoteUserIpType';
import { RefreshTokenType } from '../types/authTokenType';

config();
const mongoUri = process.env.mongoURI || 'mongodb://0.0.0.0:19017';
const dbName = process.env.mongoDbName || 'learning';

/*const client = new MongoClient(mongoUri);
const db = client.db('learning');
export const bloggersCollection = db.collection<BloggersTypeDb>('bloggers');
export const postsCollection = db.collection<PostsTypeDb>('posts');
export const usersCollection = db.collection<UsersTypeDb>('users');
export const commentsCollection = db.collection<CommentsTypeDb>('comments');
export const remoteUserIpCollection = db.collection<RemoteUserIpType>('ip');
export const refreshTokensCollection = db.collection<RefreshTokenType>('refreshTokens');*/

const postSchema = new mongoose.Schema<PostsTypeDb>({
	_id: ObjectId,
	title: { type: String, required: true },
	shortDescription: { type: String, required: true },
	content: String,
	bloggerId: { type: ObjectId, required: true },
	bloggerName: { type: String, required: true },
});

const bloggerSchema = new mongoose.Schema<BloggersTypeDb>({
	_id: ObjectId,
	name: { type: String, required: true },
	youtubeUrl: { type: String, required: true },
});

const userSchema = new mongoose.Schema<UsersTypeDb>({
	_id: ObjectId,
	emailConfirmation: {
		confirmationCode: String,
		expirationDate: Date,
		isConfirmed: Boolean,
	},
	accountData: {
		login: String,
		email: String,
		passwordHash: String,
	},
});

const commentSchema = new mongoose.Schema<CommentsTypeDb>({
	_id: ObjectId,
	content: String,
	userId: ObjectId,
	userLogin: String,
	postId: ObjectId,
	addedAt: String,
});

const remoteUserIpSchema = new mongoose.Schema<RemoteUserIpType>({
	_id: ObjectId,
	ip: String,
	url: String,
	date: Date,
});

const refreshTokenSchema = new mongoose.Schema<RefreshTokenType>({
	refreshToken: String,
});

export const PostModelClass = mongoose.model('posts', postSchema);
export const BloggerModel = mongoose.model('bloggers', bloggerSchema);
export const UserModel = mongoose.model('users', userSchema);
export const CommentModel = mongoose.model('comments', commentSchema);
export const RemoteUserIpModel = mongoose.model('ip', remoteUserIpSchema);
export const RefreshTokenModel = mongoose.model('refreshTokens', refreshTokenSchema);

export const runDb = async () => {
	try {
		/*await client.connect();
		await db.command({ ping: 1 });*/
		await mongoose.connect(`${mongoUri}/${dbName}?retryWrites=true`);
		console.log('connected successfully to mongo server');
	} catch (e) {
		console.log("Can't connect to db");
		//await client.close();
		await mongoose.disconnect();
	}
};
