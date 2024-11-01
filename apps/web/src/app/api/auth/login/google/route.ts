// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const googleLoginUrl = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL;
  return NextResponse.redirect(googleLoginUrl || "http://localhost:4000/auth/google/login");
}
