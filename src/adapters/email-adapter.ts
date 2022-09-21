import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

export const emailAdapter = {
	async sendEmail(email: string, subject: string, message: string) {
		let transporter = nodemailer.createTransport({
			/*host: 'smtp.mail.ru',
			port: 465,
			secure: true,*/
			service: 'gmail',
			auth: {
				user: process.env.emailLogin, // generated ethereal user
				pass: process.env.emailPass, // generated ethereal password
			},
		});

		return await transporter.sendMail({
			from: process.env.emailLogin,
			to: email,
			subject,
			html: message,
		});
	},
};
