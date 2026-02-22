// app/api/watchlist/route.ts
// Watchlist management API (uses MongoDB for persistence)
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getCollection } from '@/lib/mongodb';
import { WatchlistEntry, WatchlistStatus } from '@/types';

function getUserId(request: NextRequest): string {
  // Simple session-based user identification using cookies
  const userId = request.cookies.get('cv_user_id')?.value;
  return userId || 'anonymous';
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const collection = await getCollection('watchlist');
    const entries = await collection.find({ userId }).toArray();
    
    return NextResponse.json({
      success: true,
      data: entries.map(({ _id, userId: uid, ...rest }) => rest),
    });
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const { action, seriesId, status, progress, seriesName, posterPath, rating, notes } = body;

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
