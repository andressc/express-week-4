import { ObjectId } from 'mongodb';

export type BloggersType = {
	id: ObjectId;
	name: string;
	youtubeUrl: string;
};

export type BloggersTypeDb = {
	_id: ObjectId;
	name: string;
	youtubeUrl: string;
};
