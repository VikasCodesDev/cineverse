// app/api/watchlist/route.ts
// Watchlist management API (uses MongoDB for persistence, requires auth for write)
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyToken, getCookieName } from '@/lib/jwt';
import { WatchlistStatus } from '@/types';

export const dynamic = 'force-dynamic';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(getCookieName())?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload) return payload.userId;
  }
  const fallback = request.cookies.get('cv_user_id')?.value;
  return fallback || null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: true, data: [] });
    }
    const collection = await getCollection('watchlist');
    const entries = await collection.find({ userId }).toArray();
    const data = entries.map(({ _id, userId: _uid, ...rest }) => rest);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Please log in to manage your watchlist' }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { action, seriesId, status, progress, seriesName, posterPath, rating, notes } = body;

    if (action !== 'remove' && (typeof seriesId !== 'number' || !seriesId)) {
      return NextResponse.json({ success: false, error: 'Invalid series' }, { status: 400 });
    }

    const collection = await getCollection('watchlist');

    if (action === 'add' || action === 'update') {
      const now = new Date().toISOString();
      await collection.updateOne(
        { userId, seriesId },
        {
          $set: {
            userId,
            seriesId,
            seriesName,
            posterPath,
            status: status || 'plan_to_watch',
            progress: progress ?? 0,
            rating,
            notes,
            updatedAt: now,
          },
          $setOnInsert: { addedAt: now },
        },
        { upsert: true }
      );
    } else if (action === 'remove') {
      await collection.deleteOne({ userId, seriesId });
    } else if (action === 'status') {
      await collection.updateOne(
        { userId, seriesId },
        { $set: { status, progress, updatedAt: new Date().toISOString() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watchlist POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update watchlist' }, { status: 500 });
  }
}
