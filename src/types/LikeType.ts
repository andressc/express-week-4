import { ObjectId } from 'mongodb';

export enum ItemLike {
	comment = 'COMMENT',
	post = 'POST',
}

export enum LikeStatus {
	None = 'None',
	Like = 'Like',
	Dislike = 'Dislike',
}

export type LikeTypeDb = {
	_id: ObjectId;
	type: string;
	login: string;
	userId: ObjectId;
	itemId: ObjectId;
	likeStatus: string;
	addedAt: string;
};
