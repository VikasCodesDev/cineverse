// app/api/genres/route.ts
// API endpoint for fetching all genres
import { NextResponse } from 'next/server';
import { fetchGenres } from '@/lib/tmdb';

export async function GET() {
  try {
    const genres = await fetchGenres();

    return NextResponse.json({
      success: true,
      data: genres,
    });
  } catch (error) {
    console.error('Error in genres API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch genres',
      },
      { status: 500 }
    );
  }
}
