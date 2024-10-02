import express from 'express';
import { 
    getAllUsers,
    createUser,
} from '../controllers/userController';

import verifyJWT from '../middleware/verifyJWT';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', verifyJWT, getAllUsers);

// POST /api/users - Create a new user
router.post('/', createUser);

export default router;
