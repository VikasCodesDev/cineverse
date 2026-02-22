// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyPassword, getSessionCookieConfig } from '@/lib/auth';
import { createToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const users = await getCollection('users');
    const user = await users.findOne({ email });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const userId = String(user.userId ?? user._id);
    const name = String(user.name ?? email.split('@')[0]);
    const token = await createToken({ userId, email, name });
    const config = getSessionCookieConfig();
    const res = NextResponse.json({ success: true, user: { userId, email, name } });
    res.cookies.set(config.name, token, {
      maxAge: config.maxAge,
      path: config.path,
      httpOnly: config.httpOnly,
      secure: config.secure,
      sameSite: config.sameSite,
    });
    res.cookies.set('cv_user_id', userId, { maxAge: config.maxAge, path: '/' });
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
