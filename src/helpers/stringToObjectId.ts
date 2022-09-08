import { ObjectId } from 'mongodb';

export const stringToObjectId = (id: string) => {
	return new ObjectId(id);
};
