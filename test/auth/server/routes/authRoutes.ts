import express from 'express';

import { connectToGoogleDrive, googleOAuthCallback } from '../controllers/authController';
import { authMiddleware } from '../middleware/verifyJWT';

const router = express.Router();

// Middleware to check if the user is authenticated
router.use(authMiddleware);

// GET /api/auth/google-drive - Initiate Google OAuth flow
router.get('/google-drive', connectToGoogleDrive);

// GET /api/auth/google-drive/callback - Handle OAuth callback
router.get('/google-drive/callback', googleOAuthCallback);

export default router;