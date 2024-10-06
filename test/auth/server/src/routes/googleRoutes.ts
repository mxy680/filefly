import { Router } from 'express';
import { googleController, googleCallbackController } from '../controllers/googleAuthController';

const router = Router();

// GET /auth/google
router.get('/', googleController);

// GET /auth/google/callback
router.get('/callback', googleCallbackController);

export default router;
