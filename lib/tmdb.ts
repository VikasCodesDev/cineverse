// lib/tmdb.ts
// TMDB API utilities for fetching web series data
import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface Genre {
  id: number;
  name: string;
}

export interface Series {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  popularity: number;
  origin_country: string[];
}

export interface SeriesDetail extends Series {
  created_by: Array<{ id: number; name: string }>;
  episode_run_time: number[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: Array<any>;
  status: string;
  tagline: string;
  type: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
  keywords?: {
    results: Array<{
      id: number;
      name: string;
    }>;
  };
}

// Create axios instance with default config
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Fetch popular TV series
export async function fetchPopularSeries(page: number = 1): Promise<Series[]> {
  try {
    const response = await tmdbApi.get('/tv/popular', {
      params: { page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular series:', error);
    return [];
  }
}

// Fetch top rated TV series
export async function fetchTopRatedSeries(page: number = 1): Promise<Series[]> {
  try {
    const response = await tmdbApi.get('/tv/top_rated', {
      params: { page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated series:', error);
    return [];
  }
}

// Fetch series by genre
export async function fetchSeriesByGenre(genreId: number, page: number = 1): Promise<Series[]> {
  try {
    const response = await tmdbApi.get('/discover/tv', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching series by genre:', error);
    return [];
  }
}

// Search series
export async function searchSeries(query: string, page: number = 1): Promise<Series[]> {
  try {
    const response = await tmdbApi.get('/search/tv', {
      params: { query, page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching series:', error);
    return [];
  }
}

// Fetch series details
export async function fetchSeriesDetails(seriesId: number): Promise<SeriesDetail | null> {
  try {
    const response = await tmdbApi.get(`/tv/${seriesId}`, {
      params: {
        append_to_response: 'credits,videos,keywords,recommendations,similar',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching series details:', error);
    return null;
  }
}

// Fetch similar series
export async function fetchSimilarSeries(seriesId: number): Promise<Series[]> {
  try {
    const response = await tmdbApi.get(`/tv/${seriesId}/similar`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching similar series:', error);
    return [];
  }
}

// Fetch recommended series
export async function fetchRecommendedSeries(seriesId: number): Promise<Series[]> {
  try {
    const response = await tmdbApi.get(`/tv/${seriesId}/recommendations`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching recommended series:', error);
    return [];
  }
}

// Fetch all genres
export async function fetchGenres(): Promise<Genre[]> {
  try {
    const response = await tmdbApi.get('/genre/tv/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

// Get image URL
export function getImageUrl(path: string | null, size: string = 'original'): string {
  if (!path) return '/placeholder-poster.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

// Get poster URL
export function getPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  return getImageUrl(path, size);
}

// Get backdrop URL
export function getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'original'): string {
  return getImageUrl(path, size);
}

// Get profile URL for cast
export function getProfileUrl(path: string | null, size: 'w185' | 'h632' | 'original' = 'w185'): string {
  return getImageUrl(path, size);
}
