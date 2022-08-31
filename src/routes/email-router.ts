import { Request, Response, Router } from 'express';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

export const emailRouter = Router({});

emailRouter.post('/send', async (req: Request, res: Response) => {
	let transporter = nodemailer.createTransport({
		host: 'smtp.mail.ru',
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: process.env.emailLogin, // generated ethereal user
			pass: process.env.emailPass, // generated ethereal password
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: process.env.emailLogin, // sender address
		to: req.body.email, // list of receivers
		subject: req.body.subject,
		html: req.body.message,
	});

	console.log(info);

	return res.send({
		email: req.body.email,
		message: req.body.message,
		subject: req.body.subject,
	});
});
