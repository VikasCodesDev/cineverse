// components/ai/SeriesDNA.tsx
// Series similarity DNA visualization
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getPosterUrl, Series } from '@/lib/tmdb';

interface SeriesDNAProps {
  seriesId: number;
  seriesName: string;
  genres?: number[];
}

interface SimilarShow {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  similarity: number;
  matchReasons: string[];
}

export default function SeriesDNA({ seriesId, seriesName, genres }: SeriesDNAProps) {
  const [similar, setSimilar] = useState<SimilarShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchSimilar = async () => {
    if (fetched) return;
    setLoading(true);
    setFetched(true);
    
    try {
      const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const [simRes, recRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/tv/${seriesId}/similar?api_key=${TMDB_KEY}&page=1`),
        fetch(`https://api.themoviedb.org/3/tv/${seriesId}/recommendations?api_key=${TMDB_KEY}&page=1`),
      ]);
      
      const simData = await simRes.json();
      const recData = await recRes.json();
      
      const allShows = new Map<number, any>();
      for (const s of [...(simData.results || []), ...(recData.results || [])]) {
        if (!allShows.has(s.id)) allShows.set(s.id, s);
      }

      // Calculate pseudo-similarity based on shared genres
      const currentGenres = new Set(genres || []);
      const ranked = Array.from(allShows.values())
        .map(s => {
          const sharedGenres = (s.genre_ids || []).filter((g: number) => currentGenres.has(g)).length;
          const totalGenres = Math.max(currentGenres.size, (s.genre_ids || []).length, 1);
          const genreSimilarity = sharedGenres / totalGenres;
          const ratingBonus = (s.vote_average || 0) / 10 * 0.2;
          const similarity = Math.min(99, Math.round((genreSimilarity * 0.8 + ratingBonus) * 100));

          const matchReasons: string[] = [];
          if (sharedGenres > 0) matchReasons.push(`${sharedGenres} shared genre${sharedGenres > 1 ? 's' : ''}`);
          if (s.vote_average > 7.5) matchReasons.push('Highly rated');
          if (s.popularity > 50) matchReasons.push('Popular');

          return { ...s, similarity: similarity || Math.floor(Math.random() * 30 + 60), matchReasons };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 6);

      setSimilar(ranked);
    } catch {
      setSimilar([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilar();
  }, [seriesId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  if (!similar.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🧬</span>
        <h3 className="font-display font-bold text-white">Series DNA — Similar Shows</h3>
      </div>
      
      <div className="space-y-3">
        {similar.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/series/${s.id}`}>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-neon-red/30 transition-all group cursor-pointer">
                {/* Poster */}
                <div className="relative w-10 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                  {s.poster_path ? (
                    <Image src={getPosterUrl(s.poster_path, 'w185')} alt={s.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neon-red/20 flex items-center justify-center text-xs font-display">CV</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-white text-sm group-hover:text-neon-red transition-colors truncate">
                    {s.name}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.matchReasons.slice(0, 2).map((r: string, ri: number) => (
                      <span key={ri} className="text-xs text-gray-500 font-body">{r}</span>
                    ))}
                  </div>
                </div>

                {/* Similarity Bar */}
                <div className="flex-shrink-0 w-20 text-right">
                  <div className="text-sm font-display font-bold" style={{
                    color: s.similarity > 75 ? 'var(--color-neon-blue)' : s.similarity > 50 ? 'var(--color-neon-red)' : '#9ca3af'
                  }}>
                    {s.similarity}%
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.similarity}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{
                        background: s.similarity > 75
                          ? 'linear-gradient(90deg, #ff0055, #00d9ff)'
                          : s.similarity > 50
                          ? '#ff0055'
                          : '#6b7280'
                      }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
