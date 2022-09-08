import { ObjectId } from 'mongodb';

export type CommentsType = {
	id: ObjectId;
	content: string;
	userId: ObjectId;
	userLogin: string;
	postId?: ObjectId;
	addedAt: string;
};

export type CommentsTypeDb = {
	_id: ObjectId;
	content: string;
	userId: ObjectId;
	userLogin: string;
	postId?: ObjectId;
	addedAt: string;
};
