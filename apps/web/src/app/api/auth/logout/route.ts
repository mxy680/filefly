import { NextRequest, NextResponse } from 'next/server';
import { serverRequest } from '@/src/utils/serverRequest';
import { appendCookies } from '@/src/utils/cookies';

export async function POST(req: NextRequest) {
  try {
    const response = await serverRequest('post', '/auth/logout', req);

    // Capture the Set-Cookie headers from NestJS response and forward them to the client
    return appendCookies(response, NextResponse.json({ message: 'Logout successful.' }, { status: 200 }));

  } catch (error: any) {
    if (error.status === 401) {
      // Delete Cookies if the user is not authenticated
      const response = await serverRequest('post', '/auth/clear-cookies', req);
      return appendCookies(response, NextResponse.json({ message: 'Logout successful. Deleted Invalid Cookies.' }, { status: 200 }));
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
