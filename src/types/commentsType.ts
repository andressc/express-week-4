import { ObjectId } from 'mongodb';

export type likesCommentsInfoType = {
	likesCount: number;
	dislikesCount: number;
	myStatus: string;
};

export type CommentsType = {
	id: ObjectId;
	content: string;
	userId: ObjectId;
	userLogin: string;
	postId?: ObjectId;
	addedAt: string;
	likesInfo: likesCommentsInfoType;
};

export type CommentsTypeDb = {
	_id: ObjectId;
	content: string;
	userId: ObjectId;
	userLogin: string;
	postId?: ObjectId;
	addedAt: string;
	likesInfo: likesCommentsInfoType;
};

export type CommentsTypeMap = {
	_id: ObjectId;
	content: string;
	userId: ObjectId;
	userLogin: string;
	postId?: ObjectId;
	addedAt: string;
	likes: [];
};
