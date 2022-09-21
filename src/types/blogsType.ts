import { ObjectId } from 'mongodb';

export type BlogsType = {
	id: ObjectId;
	name: string;
	youtubeUrl: string;
	createdAt: string;
};

export type BlogsTypeDb = {
	_id: ObjectId;
	name: string;
	youtubeUrl: string;
	createdAt: string;
};
