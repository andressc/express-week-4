import { ObjectId } from 'mongodb';

export const idCreator = () => {
	return new ObjectId();
};
