import { ObjectId } from 'mongodb';

export type AccountData = {
	login: string;
	email: string;
	passwordHash: string;
};

export type EmailConfirmation = {
	confirmationCode: string;
	expirationDate: Date;
	isConfirmed: boolean;
};

export type UsersType = {
	id: ObjectId;
	emailConfirmation: EmailConfirmation;
	accountData: AccountData;
	createdAt: string
};

export type UsersTypeDb = {
	_id: ObjectId;
	emailConfirmation: EmailConfirmation;
	accountData: AccountData;
	createdAt: string
};
