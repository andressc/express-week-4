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
	id: string;
	emailConfirmation: EmailConfirmation;
	accountData: AccountData;
};
