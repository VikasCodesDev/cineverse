// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { getCookieName } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(getCookieName(), '', { maxAge: 0, path: '/' });
  res.cookies.set('cv_user_id', '', { maxAge: 0, path: '/' });
  return res;
}
