import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';

export const generateConfirmationCode = (isConfirmed: boolean) => {
	const confirmationCode = uuidv4();
	return {
		confirmationCode,
		expirationDate: add(new Date(), {
			hours: 1,
			minutes: 30,
		}),
		isConfirmed,
	};
};
