// app/api/series/route.ts
// API endpoint for fetching series with caching
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import {
  fetchPopularSeries,
  fetchTopRatedSeries,
  fetchSeriesByGenre,
  searchSeries,
} from '@/lib/tmdb';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const genre = searchParams.get('genre');
    const query = searchParams.get('query');

    let series;

    if (query) {
      series = await searchSeries(query, page);
    } else if (genre) {
      series = await fetchSeriesByGenre(parseInt(genre), page);
    } else if (type === 'top_rated') {
      series = await fetchTopRatedSeries(page);
    } else {
      series = await fetchPopularSeries(page);
    }

    // Cache series in MongoDB for recommendation engine
    if (series && series.length > 0) {
      try {
        const seriesCollection = await getCollection('series');
        const bulkOps = series.map((s) => ({
          updateOne: {
            filter: { id: s.id },
            update: { $set: { ...s, updatedAt: new Date() } },
            upsert: true,
          },
        }));
        await seriesCollection.bulkWrite(bulkOps);
      } catch (dbError) {
        console.error('Database caching error:', dbError);
        // Continue even if caching fails
      }
    }

    return NextResponse.json({
      success: true,
      data: series,
      page,
    });
  } catch (error) {
    console.error('Error in series API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch series',
      },
      { status: 500 }
    );
  }
}
