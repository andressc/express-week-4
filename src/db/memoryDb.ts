import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const connectMemoryDb = async () => {
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = mongoServer.getUri();
	await mongoose.connect(mongoUri);
	await mongoose.connection.db.dropDatabase();
};

export const disconnectMemoryDb = async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
};
