// app/api/user/recent/route.ts — Recently watched series (per user)
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyToken, getCookieName } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

const MAX_RECENT = 20;

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ success: true, data: [] });
    const users = await getCollection('users');
    const user = await users.findOne({ userId });
    const recentIds = Array.isArray(user?.recentIds) ? user.recentIds.slice(0, MAX_RECENT) : [];
    return NextResponse.json({ success: true, data: recentIds });
  } catch (error) {
    console.error('Recent GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch recent' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ success: true });
    const body = await request.json().catch(() => ({}));
    const seriesId = typeof body.seriesId === 'number' ? body.seriesId : null;
    if (seriesId == null) return NextResponse.json({ success: false, error: 'seriesId required' }, { status: 400 });
    const users = await getCollection('users');
    const user = await users.findOne({ userId });
    const current = Array.isArray(user?.recentIds) ? user.recentIds : [];
    const filtered = current.filter((id: number) => id !== seriesId);
    const recentIds = [seriesId, ...filtered].slice(0, MAX_RECENT);
    await users.updateOne(
      { userId },
      { $set: { recentIds, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recent POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update recent' }, { status: 500 });
  }
}
