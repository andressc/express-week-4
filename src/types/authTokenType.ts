export type AuthTokenType = {
	accessToken: string;
	refreshToken: string;
};

export type RefreshTokenType = {
	refreshToken: string;
	login: string;
	expirationDate: Date;
};
