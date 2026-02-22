// types/index.ts
// Shared TypeScript types for CineVerse

export type WatchlistStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'rewatch';

export interface WatchlistEntry {
  seriesId: number;
  seriesName: string;
  posterPath: string | null;
  status: WatchlistStatus;
  progress?: number; // 0-100 percentage
  rating?: number; // 1-10
  notes?: string;
  addedAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  watchlist: WatchlistEntry[];
  watchHistory: number[];
  preferences: {
    genres: string[];
    moods: string[];
  };
  createdAt: string;
}

export type MoodType = 'exciting' | 'relaxing' | 'mysterious' | 'funny' | 'dramatic';

export interface AIRecommendation {
  series: import('@/lib/tmdb').Series;
  score: number;
  explanation: string;
  matchReasons: string[];
  similarityPercent?: number;
}

export interface WatchNowParams {
  availableTime: number; // in minutes
  mood: MoodType;
  genreId?: string;
}

export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}
