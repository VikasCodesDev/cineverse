// app/explore/page.tsx
// Explore page with search, filters, and AI recommendations
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SeriesCard from '@/components/SeriesCard';
import { SeriesGridSkeleton } from '@/components/LoadingSkeleton';
import { Series, Genre } from '@/lib/tmdb';

export default function ExplorePage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [filterType, setFilterType] = useState<'popular' | 'top_rated'>('popular');

  // Fetch genres on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch series when filters change
  useEffect(() => {
    fetchSeries();
  }, [selectedGenre, filterType, searchQuery]);

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres');
      const data = await response.json();
      if (data.success) {
        setGenres(data.data);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('query', searchQuery);
      } else {
        params.append('type', filterType);
        if (selectedGenre) {
          params.append('genre', selectedGenre);
        }
      }

      const response = await fetch(`/api/series?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSeries(data.data);
      }
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSeries();
  };

  const getAIRecommendations = async () => {
    setLoading(true);
    try {
      // Get user's watch history
      const userResponse = await fetch('/api/user?type=watchHistory');
      const userData = await userResponse.json();
      
      if (userData.success && userData.data.length > 0) {
        const history = userData.data.join(',');
        const response = await fetch(
          `/api/recommendations?type=personalized&history=${history}`
        );
        const data = await response.json();
        
        if (data.success) {
          setSeries(data.data);
        }
      } else {
        // If no history, show mood-based recommendations
        const response = await fetch(
          '/api/recommendations?type=mood&mood=exciting'
        );
        const data = await response.json();
        
        if (data.success) {
          setSeries(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    } finally {
      setLoading(false);
    }
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
            Search through thousands of web series or let our AI find your
            perfect match
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 space-y-4"
        >
          {/* Search Bar */}
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

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Genre Filter */}
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-black/50 border-2 border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none font-body cursor-pointer"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as 'popular' | 'top_rated');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-black/50 border-2 border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none font-body cursor-pointer"
            >
              <option value="popular">Popular</option>
              <option value="top_rated">Top Rated</option>
            </select>

            {/* AI Recommendations Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getAIRecommendations}
              className="neon-button neon-button-blue ml-auto"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Recommendations
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Series Grid */}
        {loading ? (
          <SeriesGridSkeleton />
        ) : series.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
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
            <h3 className="text-2xl font-display font-bold text-neon-red mb-2">
              No Results Found
            </h3>
            <p className="text-gray-400 font-body">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
