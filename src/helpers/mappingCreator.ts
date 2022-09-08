import { ObjectId } from 'mongodb';

export const mappingCreator = (data: any, id?: ObjectId) => {
	let oldId = id;

	if (!id) {
		oldId = data['_id'];
	}

	delete data['_id'];

	return { id: oldId, ...data };
};
