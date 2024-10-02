import express from 'express';
import { handleGoogleDriveWebhook } from '../controllers/webhookController';
import { authMiddleware } from '../middleware/verifyJWT';

const router = express.Router();

// POST /api/webhooks/google-drive - Handle Google Drive webhooks
router.post('/google-drive', authMiddleware, handleGoogleDriveWebhook);

export default router;
