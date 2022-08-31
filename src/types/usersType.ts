export type accountData = {
	login: string;
	email: string;
	passwordHash: string;
};

export type emailConfirmation = {
	confirmationCode: string;
	expirationDate: Date;
	isConfirmed: boolean;
};

export type UsersType = {
	id: string;
	emailConfirmation: emailConfirmation;
	accountData: accountData;
};
