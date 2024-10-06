import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

import dotenv from 'dotenv';
dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_NONCE_SECRET = process.env.JWT_NONCE_SECRET as string;

export const generateNonce = (): string => {
    return randomBytes(16).toString('hex');
}

export const hashNonce = (nonce: string): string => {
    return jwt.sign({ nonce }, JWT_NONCE_SECRET, { expiresIn: '1h' });
}

export const verifyNonce = (hashedNonce: string): string | jwt.JwtPayload => {
    return jwt.verify(hashedNonce, JWT_NONCE_SECRET);
}

export const generateAccessToken = (payload: jwt.JwtPayload): string => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export const verifyAccessToken = (accessToken: string): string | jwt.JwtPayload => {
    return jwt.verify(accessToken, JWT_ACCESS_SECRET);
}

export const generateRefreshToken = (payload: jwt.JwtPayload): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}