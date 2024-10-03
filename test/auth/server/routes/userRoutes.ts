import express from 'express';
import {
    deleteAllUsers,
} from '../controllers/userController';

const router = express.Router();

// DELETE /api/users
router.delete('/', deleteAllUsers);

export default router;