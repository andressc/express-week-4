import { emailAdapter } from '../adapters/email-adapter';

export const emailManager = {
	async sendEmailRegistrationMessage(email: string, confirmationCode: string) {
		return emailAdapter.sendEmail(
			email,
			'Confirm email',
			`https://somesite.com/confirm-email?code=${confirmationCode}`,
		);
	},
};
