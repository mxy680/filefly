import e, { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';
const { randomBytes } = require('crypto');

// Define JWT secret and expiration time
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string;
const JWT_ACCESS_TOKEN_EXPIRATION = '1h';
const JWT_REFRESH_TOKEN_EXPIRATION = '7d';

// --------------- POST ---------------

// Controller function to create a new user and generate a JWT token for them
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username } = req.body;

        if (!username) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }

        let usernameID = username + randomBytes(8).toString('hex');
        let existingUser = true;

        while (existingUser) {
            // Check if a user with the same username already exists
            existingUser = await prisma.user.findUnique({
                where: { usernameID },
            }) ? true : false;
        }

        // Create a new user in the database
        const newUser = await prisma.user.create({
            data: { username, usernameID },
        });

        // Generate a JWT access token for the new user
        const accessToken = jwt.sign(
            { id: newUser.id, username: newUser.username }, // Payload
            JWT_ACCESS_TOKEN_SECRET, // Secret key
            { expiresIn: JWT_ACCESS_TOKEN_EXPIRATION } // Token expiration time
        );

        // Generate a JWT refresh token for the new user
        const refreshToken = jwt.sign(
            { id: newUser.id, username: newUser.username }, // Payload
            JWT_REFRESH_TOKEN_SECRET, // Secret key
            { expiresIn: JWT_REFRESH_TOKEN_EXPIRATION } // Token expiration time
        );

        // Store the refresh token in the Session table
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.session.create({
            data: {
                userId: newUser.id,
                jwtRefreshToken: refreshToken as string,
                expiresAt: expiresAt,
            },
        });

        // Save as cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: expiresAt.getTime(),
        });

        // Respond with the newly created user and the JWT token
        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            usernameID: newUser.usernameID,
            accessToken, // Include the token in the response
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}