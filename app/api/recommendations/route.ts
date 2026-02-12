// app/api/recommendations/route.ts
// API endpoint for AI-powered recommendations
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import {
  getRecommendationEngine,
  SeriesFeatures,
  genresToVector,
} from '@/models/recommendation';
import { fetchGenres, fetchSeriesDetails } from '@/lib/tmdb';

// Initialize recommendation engine with cached data
async function initializeEngine() {
  const engine = getRecommendationEngine();
  
  // Check if already initialized
  if (engine.getAllSeries().length > 0) {
    return engine;
  }

  try {
    const seriesCollection = await getCollection('series');
    const genres = await fetchGenres();
    const genreMap = Object.fromEntries(genres.map((g) => [g.id, g.name]));

    // Fetch cached series from database
    const cachedSeries = await seriesCollection
      .find({})
      .limit(500)
      .toArray();

    // Convert to SeriesFeatures format
    const seriesFeatures: SeriesFeatures[] = [];

    for (const series of cachedSeries) {
      const genreNames = (series.genre_ids || [])
        .map((id: number) => genreMap[id])
        .filter(Boolean);

      seriesFeatures.push({
        id: series.id,
        name: series.name,
        genreVector: genresToVector(genreNames),
        keywords: series.overview
          ? series.overview
              .toLowerCase()
              .split(' ')
              .filter((w: string) => w.length > 4)
              .slice(0, 10)
          : [],
        rating: series.vote_average || 0,
        popularity: series.popularity || 0,
      });
    }

    engine.addMultipleSeries(seriesFeatures);
    return engine;
  } catch (error) {
    console.error('Error initializing recommendation engine:', error);
    return engine;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'similar';
    const seriesId = searchParams.get('seriesId');
    const mood = searchParams.get('mood');
    const historyParam = searchParams.get('history');

    const engine = await initializeEngine();

    let recommendations;

    if (type === 'similar' && seriesId) {
      // Get recommendations similar to a specific series
      const id = parseInt(seriesId);
      recommendations = engine.getRecommendations(id, 10);
    } else if (type === 'personalized' && historyParam) {
      // Get personalized recommendations based on watch history
      const history = historyParam.split(',').map((id) => parseInt(id));
      recommendations = engine.getPersonalizedRecommendations(history, 10);
    } else if (type === 'mood' && mood) {
      // Get mood-based recommendations
      const validMoods = ['exciting', 'relaxing', 'mysterious', 'funny', 'dramatic'];
      const selectedMood = validMoods.includes(mood)
        ? (mood as any)
        : 'exciting';
      recommendations = engine.getMoodBasedRecommendations(selectedMood, 10);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
        },
        { status: 400 }
      );
    }

    // Fetch full series details for recommendations
    const seriesCollection = await getCollection('series');
    const seriesIds = recommendations.map((r) => r.seriesId);
    
    const seriesDetails = await seriesCollection
      .find({ id: { $in: seriesIds } })
      .toArray();

    // Combine recommendations with series details
    const enrichedRecommendations = recommendations.map((rec) => {
      const series = seriesDetails.find((s) => s.id === rec.seriesId);
      return {
        ...series,
        recommendationScore: rec.score,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedRecommendations,
      type,
    });
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}
