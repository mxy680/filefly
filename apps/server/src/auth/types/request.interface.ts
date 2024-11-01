import { Request } from 'express';

export interface AuthenticatedUser {
  providerId: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}