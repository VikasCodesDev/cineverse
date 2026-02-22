// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCookieName } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (!token) {
      return NextResponse.json({ success: true, user: null });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: true, user: null });
    }
    return NextResponse.json({
      success: true,
      user: { userId: payload.userId, email: payload.email, name: payload.name },
    });
  } catch {
    return NextResponse.json({ success: true, user: null });
  }
}
