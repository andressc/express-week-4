import bcrypt from 'bcrypt';

export const generateHash = async (password: string, salt: string) => {
	return await bcrypt.hash(password, salt);
};
