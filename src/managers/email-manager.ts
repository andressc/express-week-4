import { emailAdapter } from '../adapters/email-adapter';

export const emailManager = {
	async sendEmailRegistrationMessage(email: string, confirmationCode: string) {
		return emailAdapter.sendEmail(
			email,
			'Confirm email',
			`<a href="https://some-front.com/confirm-registration?code=${confirmationCode}">Click on confirm email</a>`,
		);
	},
};
