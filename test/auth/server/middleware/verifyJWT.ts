import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware to verify the JWT token and attach user data to req.user
export const verifyJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(
    token,
    JWT_SECRET,
    (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      next();
    }
  );
};

export default verifyJWT;