import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Utility function to generate a secure admin password hash
export const generateAdminPasswordHash = async (password: string) => {
  const hash = await hashPassword(password);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  return hash;
};