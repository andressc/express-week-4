import { ObjectId } from 'mongodb';

export type PostsType = {
	id: ObjectId;
	title: string;
	shortDescription: string;
	content: string;
	bloggerId: ObjectId;
	bloggerName: string;
};

export type PostsTypeDb = {
	_id: ObjectId;
	title: string;
	shortDescription: string;
	content: string;
	bloggerId: ObjectId;
	bloggerName: string;
};

export type PostsTypeReq = {
	title: string;
	shortDescription: string;
	content: string;
	bloggerId: ObjectId;
};
