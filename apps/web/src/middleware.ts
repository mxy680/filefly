import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
   const { pathname } = req.nextUrl;
   const token = req.cookies.get('accessToken')?.value;

   // Redirect to login if token is not present
   if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
   }

   // Redirect to /dashboard if the user is authenticated and tries to access /login
   if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
   }

   // If token is present, proceed to the requested page
   return NextResponse.next();
}

// Include all routes
export const config = {
   matcher: ['/dashboard'],
};
