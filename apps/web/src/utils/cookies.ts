import { NextRequest, NextResponse } from 'next/server';

export function getCookiesFromRequest(req: NextRequest): string {
  return req.headers.get('cookie') || '';
}

export function appendCookies(serverResponse: any, clientResponse: NextResponse): NextResponse {
  const setCookieHeaders = serverResponse.headers['set-cookie'];
  
  if (setCookieHeaders) {
    setCookieHeaders.forEach((cookie: string) => {
      clientResponse.headers.append('Set-Cookie', cookie);
    });
  }
  
  return clientResponse;
}