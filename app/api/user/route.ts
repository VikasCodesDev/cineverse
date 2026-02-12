// app/api/user/route.ts
// API endpoint for managing user data (saved series and watch history)
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from "mongodb";


// For demo purposes, using a fixed user ID
// In production, use proper authentication
const DEMO_USER_ID = 'demo_user';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'saved';

    const usersCollection = await getCollection('users');
    
    let user = await usersCollection.findOne({ userId: DEMO_USER_ID });

    if (!user) {
  // Create default user if not exists
  user = {
    _id: new ObjectId(),
    userId: DEMO_USER_ID,
    savedSeries: [],
    watchHistory: [],
    createdAt: new Date(),
  };

  await usersCollection.insertOne(user);
}


    return NextResponse.json({
      success: true,
      data: type === 'saved' ? user.savedSeries : user.watchHistory,
    });
  } catch (error) {
    console.error('Error in user GET API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user data',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, seriesId, type } = body;

    if (!seriesId || !action || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const field = type === 'saved' ? 'savedSeries' : 'watchHistory';

    let updateOperation;

    if (action === 'add') {
      updateOperation = {
        $addToSet: { [field]: seriesId },
        $set: { updatedAt: new Date() },
      };
    } else if (action === 'remove') {
      updateOperation = {
        $pull: { [field]: seriesId },
        $set: { updatedAt: new Date() },
      };
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action',
        },
        { status: 400 }
      );
    }

    await usersCollection.updateOne(
      { userId: DEMO_USER_ID },
      updateOperation,
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `Series ${action === 'add' ? 'added to' : 'removed from'} ${type}`,
    });
  } catch (error) {
    console.error('Error in user POST API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user data',
      },
      { status: 500 }
    );
  }
}
