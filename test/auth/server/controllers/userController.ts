import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

// --------------- DELETE ---------------

// Delete all users and associated sessions from the database
export const deleteAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Delete all users from the database
        await prisma.user.deleteMany();

        // Delete all sessions from the database
        await prisma.session.deleteMany();

        res.status(200).json({ message: 'All users and sessions have been deleted' });
    } catch (error) {
        next(error);
    }
}