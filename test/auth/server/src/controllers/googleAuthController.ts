import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { generateNonce, hashNonce, verifyNonce, generateAccessToken, verifyAccessToken, generateRefreshToken } from '../utils/tokens';
import { googleCredentials } from '../config/oauth/credentials';
import { GoogleIdToken } from '../types/google';

import prisma from '../config/prisma';
import { google } from 'googleapis';

// GET /auth/google
export const googleController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    // Check if access token is already present 
    const bearerToken = req.headers.authorization?.split(' ')[1];

    let user;

    if (bearerToken) {
        // User has already connected an oauth provider
        try {
            // Verify access token
            const { id: userId } = verifyAccessToken(bearerToken) as jwt.JwtPayload;

            // Get user from database
            user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                res.status(400).send('User not found');
                return;
            }

        } catch {
            res.status(400).send('Invalid access token');
            return;
        }

    } else {
        // Create a new user in the database
        user = await prisma.user.create({
            data: {}
        });
    }

    // Generate nonce/hashed nonce   
    const nonce = generateNonce();
    const hashedNonce = hashNonce(nonce);

    // Store nonce in db
    await prisma.nonce.upsert({
        where: {
            userId: user.id,
            provider: 'GOOGLE',
        },
        update: {
            nonce
        },
        create: {
            nonce,
            provider: 'GOOGLE',
            userId: user.id
        }
    });

    const googleClient = new google.auth.OAuth2(
        googleCredentials.client_id,
        googleCredentials.client_secret,
        googleCredentials.redirect_uri,
    );

    const url = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: googleCredentials.scopes,
        nonce: hashedNonce,
    });

    res.status(200).send({ redirectUrl: url });
}

// GET /auth/google/callback
export const googleCallbackController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Get authorization code
    const { code } = req.query;

    if (!code) {
        res.status(400).send('No code provided');
        return;
    }

    const googleClient = new google.auth.OAuth2(
        googleCredentials.client_id,
        googleCredentials.client_secret,
        googleCredentials.redirect_uri,
    );

    // Get tokens
    const { tokens } = await googleClient.getToken(code as string);
    const { access_token: googleAccessToken, refresh_token: googleRefreshToken, id_token: googleIdToken, expiry_date: googleTokenExpiryDate } = tokens;

    if (!googleAccessToken || !googleRefreshToken || !googleIdToken || !googleTokenExpiryDate) {
        res.status(400).send('No tokens provided');
        return;
    }

    // Validate googleIdToken
    const { nonce } = jwt.decode(googleIdToken) as GoogleIdToken;

    if (!nonce) {
        res.status(400).send('No nonce provided');
        return;
    }

    // Verify nonce
    const { nonce: verifiedNonce } = verifyNonce(nonce) as { nonce: string };

    if (!verifiedNonce) {
        res.status(400).send('Nonce could not be verified');
        return;
    }

    // Get nonce from database
    const dbNonce = await prisma.nonce.findFirst({
        where: {
            nonce: verifiedNonce
        }
    });

    if (!dbNonce) {
        res.status(400).send('Nonce not found');
        return;
    }

    // Create access/refresh token for user
    const accessToken = generateAccessToken({ id: dbNonce.userId });
    const refreshToken = generateRefreshToken({ id: dbNonce.userId });

    // Save refresh token to cookies
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    // Return access token
    res.redirect(`http://localhost:3000?token=${googleAccessToken}`);
}

