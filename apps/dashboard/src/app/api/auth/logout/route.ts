import { NextResponse, type NextRequest } from 'next/server';
import { ROLES_COOKIE } from '@/lib/session';

// Sign out of every panel and go back to the sign-in screen. Revoking the API session is added in ACC-DSH-1.
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url), 303);
  res.cookies.delete(ROLES_COOKIE);
  return res;
}
