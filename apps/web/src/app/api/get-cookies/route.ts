// app/api/get-cookies/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies(); // Access cookies from the request
  const allCookies = cookieStore.getAll(); // Get all cookies as an array of key-value pairs

  // Convert cookies to a key-value object
  const cookiesObject = allCookies.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {} as Record<string, any>);

  return NextResponse.json({ cookies: cookiesObject });
}
