import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';

// Define JWT secret and expiration time
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Use a secure key in production
const JWT_ACCESS_TOKEN_EXPIRATION = '1h'; // Set the token expiration time
const JWT_REFRESH_TOKEN_EXPIRATION = '7d';

// --------------- GET ---------------

// Controller function to get all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Retrieve all users from the database
    const users = await prisma.user.findMany();

    // Respond with the list of users (excluding passwords)
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// --------------- POST ---------------

// Controller function to create a new user and generate a JWT token
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.body;

    // Check if username is provided
    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    // Check if a user with the same username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this username already exists' });
      return;
    }

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: { username },
    });

    // Generate a JWT access token for the new user
    const accessToken = jwt.sign(
      { id: newUser.id, username: newUser.username }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: JWT_ACCESS_TOKEN_EXPIRATION } // Token expiration time
    );

    // Generate a JWT refresh token for the new user
    const refreshToken = jwt.sign(
      { id: newUser.id, username: newUser.username }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: JWT_REFRESH_TOKEN_EXPIRATION } 
    );

    // Store the token in the Session table
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 
    await prisma.session.create({
      data: {
        userId: newUser.id,
        jwtRefreshToken: refreshToken,
        expiresAt: expiresAt,
      },
    });

    // Save as cookie
    res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });

    // Respond with the newly created user and the JWT token
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      accessToken, // Include the token in the response
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// --------------- DELETE ----------------