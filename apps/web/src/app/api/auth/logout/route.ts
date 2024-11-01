import { NextRequest, NextResponse } from 'next/server';
import { serverRequest } from '@/src/utils/serverRequest';

export async function POST(req: NextRequest) {
  try {
    const response = await serverRequest('post', '/auth/logout', req);

    // Capture the Set-Cookie headers from NestJS response and forward them to the client
    const setCookieHeaders = response.headers['set-cookie'];
    const res = NextResponse.json({ message: 'Logout successful' });

    if (setCookieHeaders) {
      // Attach each Set-Cookie header individually to the response
      setCookieHeaders.forEach((cookie) => {
        res.headers.append('Set-Cookie', cookie);
      });
    }

    return res;
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred during logout' }, { status: 500 });
  }
}
