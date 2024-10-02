import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.SECRET_ENCRYPTION_KEY || 'defaultencryptionkeydefaultencryptionkey'; // Must be 32 characters
const ALGORITHM = 'aes-256-cbc';

// Function to encrypt a token
export const encryptToken = (token: string): { encryptedToken: string, initVector: string } => {
    const initVector = crypto.randomBytes(16); // Generate a random initialization vector
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), initVector);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return { encryptedToken: encrypted, initVector: initVector.toString('hex') };
};

// Function to decrypt a token
export const decryptToken = (encryptedToken: string, initVector: string): string => {
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(initVector, 'hex'));

    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};
