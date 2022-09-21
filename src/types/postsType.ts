import { ObjectId } from 'mongodb';

export type NewestLikesPostsType = {
	addedAt: string;
	userId: string;
	login: string;
};

export type LikesPostsInfoType = {
	likesCount: number;
	dislikesCount: number;
	myStatus: string;
	newestLikes: NewestLikesPostsType[];
};

export type PostsType = {
	id: ObjectId;
	title: string;
	shortDescription: string;
	content: string;
	blogId: ObjectId;
	blogName: string;
	createdAt: string
	//extendedLikesInfo: LikesPostsInfoType;
};

export type PostsTypeUpdate = {
	id: ObjectId;
	title: string;
	shortDescription: string;
	content: string;
	blogId: ObjectId;
	blogName: string;
};

export type PostsTypeDb = {
	_id: ObjectId;
	title: string;
	shortDescription: string;
	content: string;
	blogId: ObjectId;
	blogName: string;
	createdAt: string
	//extendedLikesInfo: LikesPostsInfoType;
};

export type PostsTypeMap = {
	_id: ObjectId;
	title: string;
	shortDescription: string;
	content: string;
	blogId: ObjectId;
	blogName: string;
	createdAt: string
	//likes: [];
};

export type PostsTypeReq = {
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
};
