import express from 'express';

import { registerUser } from '../controllers/authController';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

export default router;