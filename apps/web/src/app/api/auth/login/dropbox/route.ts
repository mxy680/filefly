import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(process.env.API_URL + "/auth/dropbox/login");
}