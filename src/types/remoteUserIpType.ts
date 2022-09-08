import { ObjectId } from 'mongodb';

export type RemoteUserIpType = {
	_id: ObjectId;
	ip: string;
	url: string;
	date: Date;
};
