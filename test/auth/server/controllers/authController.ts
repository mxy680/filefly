import { Request, Response, NextFunction } from 'express';
import prismaClient from '../prisma/client';
const { google } = require('googleapis');
import { encryptToken, decryptToken } from '../utils/encryption';

require('dotenv').config()

// Initiate Google OAuth flow
export const connectToGoogleDrive = (req: Request, res: Response) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_URL}/api/auth/google-drive/callback`
  );

  const scopes = ['https://www.googleapis.com/auth/drive'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Always ask the user for permission to refresh the token
  });

  res.redirect(url); // Redirect the user to Google for consent
};

// Handle OAuth callback and obtain access & refresh tokens
export const googleOAuthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { code } = req.query;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_URL}/api/auth/google-drive/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code as string);

    if (!tokens.access_token || !tokens.refresh_token) {
      res.status(400).json({ error: 'Missing access or refresh token' });
      return;
    }

    if (!tokens.expiry_date) {
      res.status(400).json({ error: 'Missing expiry date' });
      return;
    }

    // Encrypt tokens before saving
    const { encryptedToken: encryptedAccessToken, initVector: accessInitVector } = encryptToken(tokens.access_token);
    const { encryptedToken: encryptedRefreshToken, initVector: refreshInitVector } = encryptToken(tokens.refresh_token);

    // Saving Access Token to database
    await prismaClient.accessToken.create({
      data: {
        userId: req.user.id, // Assuming `req.user` is populated by auth middleware
        providerId: 1, // Assuming 1 is the Google Drive provider ID
        tokenEncrypted: encryptedAccessToken,
        tokenInitVector: accessInitVector,
        expiresAt: new Date(tokens.expiry_date),
      },
    });

    // Save refresh token to database
    await prismaClient.refreshToken.create({
      data: {
        userId: req.user.id,
        providerId: 1,
        tokenEncrypted: encryptedRefreshToken,
        tokenInitVector: refreshInitVector,
        expiresAt: new Date(tokens.expiry_date),
      },
    });

    res.status(200).json({ message: 'Google Drive connected successfully', tokens });
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to Google Drive', details: err });
  }
};