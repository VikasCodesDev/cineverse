// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { createToken } from '@/lib/jwt';
import { getSessionCookieConfig } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : email.split('@')[0] || 'User';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const users = await getCollection('users');
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = new ObjectId().toString();
    await users.insertOne({
      _id: new ObjectId(),
      userId,
      email,
      name,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      savedSeries: [],
      watchHistory: [],
      recentIds: [],
    });

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
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: 'Signup failed' }, { status: 500 });
  }
}
