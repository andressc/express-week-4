import { idCreator } from '../helpers/idCreator';
import { usersRepository } from '../repositories/users-repository';
import bcrypt from 'bcrypt';
import { generateHash } from '../helpers/generateHash';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { emailManager } from '../managers/email-manager';
import { jwtService } from '../application/jwt-service';

export const authService = {
	async registration(login: string, email: string, password: string): Promise<boolean> {
		const passwordSalt = await bcrypt.genSalt(10);
		const passwordHash = await generateHash(password, passwordSalt);

		const confirmationCode = uuidv4();

		const newUser = {
			id: idCreator(),
			accountData: {
				login,
				email,
				passwordHash,
			},
			emailConfirmation: {
				confirmationCode,
				expirationDate: add(new Date(), {
					hours: 1,
					minutes: 30,
				}),
				isConfirmed: false,
			},
		};

		const user = await usersRepository.createUser(newUser);
		if (!user) return false;

		try {
			await emailManager.sendEmailRegistrationMessage(email, confirmationCode);
		} catch (e) {
			console.log(e);
			await usersRepository.deleteUser(user.id);
			return false;
		}

		return true;
	},

	async registrationConfirmation(code: string): Promise<boolean> {
		const user = await usersRepository.findUserByConfirmationCode(code);
		if (!user) return false;

		await usersRepository.updateIsConfirmed(user.id);
		return true;
	},

	async registrationEmailResending(email: string): Promise<boolean> {
		const user = await usersRepository.findUserByEmail(email);
		if (!user) return false;

		try {
			await emailManager.sendEmailRegistrationMessage(
				email,
				user.emailConfirmation.confirmationCode,
			);
		} catch (e) {
			console.log(e);
			return false;
		}
		return true;
	},

	async login(login: string, password: string): Promise<string | null> {
		const user = await usersRepository.findUserByLogin(login);
		if (!user) {
			return null;
		}

		if (!user.emailConfirmation.isConfirmed) return null;

		const passwordHashSalt = user.accountData.passwordHash.split('$');
		const passwordSalt = `$${passwordHashSalt[1]}$${
			passwordHashSalt[2]
		}$${passwordHashSalt[3].slice(0, 22)}`;
		const passwordHash = await generateHash(password, passwordSalt);

		if (user.accountData.passwordHash !== passwordHash) return null;

		return await jwtService.createJWT(user);
	},
};
