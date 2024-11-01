// src/auth/services/cookie.service.ts
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
    // Set a cookie with specific options
    setCookie(
        res: Response,
        name: string,
        value: string,
        options: {
            httpOnly?: boolean;
            secure?: boolean;
            maxAge?: number;
            sameSite?: 'lax' | 'strict' | 'none';
            path?: string;
        } = {}
    ) {
        res.cookie(name, value, {
            httpOnly: options.httpOnly ?? true,
            secure: options.secure ?? process.env.NODE_ENV === 'production',
            maxAge: options.maxAge,
            sameSite: options.sameSite ?? 'lax',
            path: options.path ?? '/',
        });
    }

    // Clear a cookie by setting it to expire immediately
    clearCookie(
        res: Response,
        name: string,
        options: {
            path?: string;
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: 'lax' | 'strict' | 'none';
        } = {}
    ) {
        res.clearCookie(name, {
            path: options.path ?? '/',
            httpOnly: options.httpOnly ?? true,
            secure: options.secure ?? process.env.NODE_ENV === 'production',
            sameSite: options.sameSite ?? 'lax',
        });
    }
}
