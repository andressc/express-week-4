export class TooManyRequestsError extends Error {
	constructor(message: string) {
		super(message);
	}
}
