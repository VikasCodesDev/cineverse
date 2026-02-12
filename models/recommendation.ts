// models/recommendation.ts
// AI-powered recommendation engine using TensorFlow.js
// Implements content-based filtering with cosine similarity
import * as tf from '@tensorflow/tfjs';

export interface SeriesFeatures {
  id: number;
  name: string;
  genreVector: number[];
  keywords: string[];
  rating: number;
  popularity: number;
}

export interface RecommendationResult {
  seriesId: number;
  score: number;
}

// Genre mapping for vectorization
const GENRE_MAP: { [key: string]: number } = {
  'Action & Adventure': 0,
  'Animation': 1,
  'Comedy': 2,
  'Crime': 3,
  'Documentary': 4,
  'Drama': 5,
  'Family': 6,
  'Kids': 7,
  'Mystery': 8,
  'News': 9,
  'Reality': 10,
  'Sci-Fi & Fantasy': 11,
  'Soap': 12,
  'Talk': 13,
  'War & Politics': 14,
  'Western': 15,
};

// Convert genres to one-hot encoded vector
export function genresToVector(genres: string[]): number[] {
  const vector = new Array(Object.keys(GENRE_MAP).length).fill(0);
  genres.forEach(genre => {
    const index = GENRE_MAP[genre];
    if (index !== undefined) {
      vector[index] = 1;
    }
  });
  return vector;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Calculate keyword similarity using Jaccard similarity
function keywordSimilarity(keywordsA: string[], keywordsB: string[]): number {
  if (keywordsA.length === 0 || keywordsB.length === 0) {
    return 0;
  }

  const setA = new Set(keywordsA.map(k => k.toLowerCase()));
  const setB = new Set(keywordsB.map(k => k.toLowerCase()));

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

// Content-based recommendation engine
export class RecommendationEngine {
  private seriesDatabase: SeriesFeatures[] = [];

  // Add series to the database
  addSeries(series: SeriesFeatures): void {
    this.seriesDatabase.push(series);
  }

  // Add multiple series
  addMultipleSeries(seriesList: SeriesFeatures[]): void {
    this.seriesDatabase.push(...seriesList);
  }

  // Clear the database
  clearDatabase(): void {
    this.seriesDatabase = [];
  }

  // Get recommendations based on a single series
  getRecommendations(
    targetSeriesId: number,
    topN: number = 10,
    excludeIds: number[] = []
  ): RecommendationResult[] {
    const targetSeries = this.seriesDatabase.find(s => s.id === targetSeriesId);
    if (!targetSeries) {
      return [];
    }

    const scores: RecommendationResult[] = [];

    for (const series of this.seriesDatabase) {
      // Skip the target series and excluded series
      if (series.id === targetSeriesId || excludeIds.includes(series.id)) {
        continue;
      }

      // Calculate genre similarity
      const genreSim = cosineSimilarity(targetSeries.genreVector, series.genreVector);

      // Calculate keyword similarity
      const keywordSim = keywordSimilarity(targetSeries.keywords, series.keywords);

      // Calculate rating similarity (normalized)
      const ratingDiff = Math.abs(targetSeries.rating - series.rating);
      const ratingSim = 1 - (ratingDiff / 10); // Normalize to 0-1

      // Weighted combination of similarities
      const score = (
        genreSim * 0.5 +        // Genre is most important
        keywordSim * 0.3 +       // Keywords are secondary
        ratingSim * 0.2          // Rating preference
      );

      scores.push({ seriesId: series.id, score });
    }

    // Sort by score and return top N
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  // Get recommendations based on user watch history
  getPersonalizedRecommendations(
    watchedSeriesIds: number[],
    topN: number = 10
  ): RecommendationResult[] {
    if (watchedSeriesIds.length === 0) {
      // Return popular series if no history
      return this.seriesDatabase
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, topN)
        .map(s => ({ seriesId: s.id, score: s.popularity / 1000 }));
    }

    // Get watched series
    const watchedSeries = this.seriesDatabase.filter(s =>
      watchedSeriesIds.includes(s.id)
    );

    if (watchedSeries.length === 0) {
      return [];
    }

    // Create user profile by averaging genre vectors
    const userGenreVector = new Array(Object.keys(GENRE_MAP).length).fill(0);
    const allKeywords = new Set<string>();

    watchedSeries.forEach(series => {
      series.genreVector.forEach((val, idx) => {
        userGenreVector[idx] += val;
      });
      series.keywords.forEach(kw => allKeywords.add(kw.toLowerCase()));
    });

    // Normalize user genre vector
    const vectorSum = userGenreVector.reduce((a, b) => a + b, 0);
    if (vectorSum > 0) {
      userGenreVector.forEach((val, idx) => {
        userGenreVector[idx] = val / vectorSum;
      });
    }

    const userKeywords = Array.from(allKeywords);
    const scores: RecommendationResult[] = [];

    for (const series of this.seriesDatabase) {
      // Skip already watched series
      if (watchedSeriesIds.includes(series.id)) {
        continue;
      }

      // Calculate similarity to user profile
      const genreSim = cosineSimilarity(userGenreVector, series.genreVector);
      const keywordSim = keywordSimilarity(userKeywords, series.keywords);

      // Boost score with popularity
      const popularityBoost = Math.log10(series.popularity + 1) / 10;

      const score = (
        genreSim * 0.5 +
        keywordSim * 0.3 +
        popularityBoost * 0.2
      );

      scores.push({ seriesId: series.id, score });
    }

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  // Get mood-based recommendations
  getMoodBasedRecommendations(
    mood: 'exciting' | 'relaxing' | 'mysterious' | 'funny' | 'dramatic',
    topN: number = 10
  ): RecommendationResult[] {
    // Define mood-to-genre mappings
    const moodGenreMap: { [key: string]: string[] } = {
      exciting: ['Action & Adventure', 'Sci-Fi & Fantasy', 'Crime'],
      relaxing: ['Documentary', 'Reality', 'Family'],
      mysterious: ['Mystery', 'Crime', 'Sci-Fi & Fantasy'],
      funny: ['Comedy', 'Animation', 'Family'],
      dramatic: ['Drama', 'War & Politics', 'Crime'],
    };

    const preferredGenres = moodGenreMap[mood] || [];
    const moodVector = genresToVector(preferredGenres);

    const scores: RecommendationResult[] = [];

    for (const series of this.seriesDatabase) {
      const similarity = cosineSimilarity(moodVector, series.genreVector);
      const popularityBoost = Math.log10(series.popularity + 1) / 10;
      const score = similarity * 0.7 + popularityBoost * 0.3;

      scores.push({ seriesId: series.id, score });
    }

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  // Get series by ID
  getSeries(seriesId: number): SeriesFeatures | undefined {
    return this.seriesDatabase.find(s => s.id === seriesId);
  }

  // Get all series
  getAllSeries(): SeriesFeatures[] {
    return this.seriesDatabase;
  }
}

// Singleton instance
let recommendationEngine: RecommendationEngine | null = null;

export function getRecommendationEngine(): RecommendationEngine {
  if (!recommendationEngine) {
    recommendationEngine = new RecommendationEngine();
  }
  return recommendationEngine;
}
