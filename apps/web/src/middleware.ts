import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
   const token = req.cookies.get('accessToken')?.value;

   // Redirect to login if token is not present
   if (!token) {
     return NextResponse.redirect(new URL('/login', req.url));
   }

   // If token is present, proceed to the requested page
   return NextResponse.next();
}

export const config = {
   matcher: ['/protected/:path*'], // Paths that require authentication
};
