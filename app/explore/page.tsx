// app/explore/page.tsx
// Explore page with AI Vibe Search, filters, and recommendations
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SeriesCard from '@/components/SeriesCard';
import { SeriesGridSkeleton } from '@/components/LoadingSkeleton';
import VibeSearch from '@/components/ai/VibeSearch';
import WatchNow from '@/components/ai/WatchNow';
import MagneticButton from '@/components/MagneticButton';
import { Series, Genre } from '@/lib/tmdb';

type SearchMode = 'browse' | 'vibe' | 'watch-now';

export default function ExplorePage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [filterType, setFilterType] = useState<'popular' | 'top_rated'>('popular');
  const [searchMode, setSearchMode] = useState<SearchMode>('browse');

  const fetchGenres = useCallback(async () => {
    try {
      const res = await fetch('/api/genres');
      const data = await res.json();
      if (data.success) setGenres(data.data);
    } catch {
      // ignore
    }
  }, []);

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('query', searchQuery);
      } else {
        params.append('type', filterType);
        if (selectedGenre) params.append('genre', selectedGenre);
      }
      const res = await fetch(`/api/series?${params}`);
      const data = await res.json();
      if (data.success) setSeries(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGenre, filterType]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    if (searchMode === 'browse') fetchSeries();
  }, [searchMode, fetchSeries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSeries();
  };

  const MODE_CONFIG: Record<SearchMode, { label: string; emoji: string; desc: string }> = {
    browse: { label: 'Browse', emoji: '🔍', desc: 'Search & filter series' },
    vibe: { label: 'AI Vibe Search', emoji: '🧠', desc: 'Natural language AI search' },
    'watch-now': { label: 'Watch Now', emoji: '⏱️', desc: 'Find what to watch right now' },
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-display font-black">
            <span className="text-glow-red">Explore</span>{' '}
            <span className="text-white">The Universe</span>
          </h1>
          <p className="text-xl text-gray-300 font-body max-w-2xl mx-auto">
            Search thousands of series or let AI find your perfect match
          </p>
        </motion.div>

        {/* Mode Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {(Object.entries(MODE_CONFIG) as [SearchMode, typeof MODE_CONFIG[SearchMode]][]).map(([mode, config]) => (
            <MagneticButton key={mode} className="inline-block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchMode(mode)}
                className={`px-6 py-3 rounded-xl font-display font-bold transition-all flex items-center gap-2 border-2 ${
                  searchMode === mode
                    ? 'border-neon-red bg-neon-red/20 text-neon-red'
                    : 'border-gray-700 text-gray-400 hover:border-neon-red/50 hover:text-gray-200'
                }`}
              >
                <span className="text-lg">{config.emoji}</span>
                <div className="text-left">
                  <div className="text-sm">{config.label}</div>
                  <div className="text-xs opacity-60 font-body font-normal hidden sm:block">{config.desc}</div>
                </div>
              </motion.button>
            </MagneticButton>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {searchMode === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <div className="glass-card p-6 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for web series..."
                    className="flex-1 px-4 py-3 rounded-lg bg-black/50 border-2 border-neon-red/30 text-white placeholder-gray-500 focus:border-neon-red focus:outline-none font-body"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="neon-button"
                  >
                    Search
                  </motion.button>
                </form>

                <div className="flex flex-wrap gap-4">
                  <select
                    value={selectedGenre}
                    onChange={(e) => { setSelectedGenre(e.target.value); setSearchQuery(''); }}
                    className="px-4 py-2 rounded-lg bg-black/50 border-2 border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none font-body cursor-pointer"
                  >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value as 'popular' | 'top_rated'); setSearchQuery(''); }}
                    className="px-4 py-2 rounded-lg bg-black/50 border-2 border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none font-body cursor-pointer"
                  >
                    <option value="popular">Popular</option>
                    <option value="top_rated">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Series Grid */}
              {loading ? (
                <SeriesGridSkeleton />
              ) : series.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                >
                  {series.map((s, index) => (
                    <SeriesCard key={s.id} series={s} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 glass-card"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-display font-bold text-neon-red mb-2">No Results Found</h3>
                  <p className="text-gray-400 font-body">Try adjusting your search or filters</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {searchMode === 'vibe' && (
            <motion.div
              key="vibe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VibeSearch />
            </motion.div>
          )}

          {searchMode === 'watch-now' && (
            <motion.div
              key="watch-now"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WatchNow />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
