import { NextRequest } from 'next/server';

export function getCookiesFromRequest(req: NextRequest): string {
  return req.headers.get('cookie') || '';
}
