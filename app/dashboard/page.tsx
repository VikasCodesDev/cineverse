// app/dashboard/page.tsx
// Enhanced Dashboard with personalized welcome and mood-based UI glow
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SeriesCard from '@/components/SeriesCard';
import { SeriesGridSkeleton } from '@/components/LoadingSkeleton';
import { Series } from '@/lib/tmdb';
import { useWatchlist } from '@/context/WatchlistContext';
import Link from 'next/link';
import Image from 'next/image';
import { getPosterUrl } from '@/lib/tmdb';

type MoodType = 'exciting' | 'relaxing' | 'mysterious' | 'funny' | 'dramatic';

const moods: { value: MoodType; label: string; emoji: string; color: string; glowColor: string }[] = [
  { value: 'exciting', label: 'Exciting', emoji: '⚡', color: 'text-neon-red', glowColor: 'rgba(255, 0, 85, 0.3)' },
  { value: 'relaxing', label: 'Relaxing', emoji: '🌊', color: 'text-neon-blue', glowColor: 'rgba(0, 217, 255, 0.3)' },
  { value: 'mysterious', label: 'Mysterious', emoji: '🔮', color: 'text-purple-400', glowColor: 'rgba(139, 0, 255, 0.3)' },
  { value: 'funny', label: 'Funny', emoji: '😂', color: 'text-yellow-400', glowColor: 'rgba(251, 191, 36, 0.3)' },
  { value: 'dramatic', label: 'Dramatic', emoji: '🎭', color: 'text-neon-pink', glowColor: 'rgba(255, 0, 110, 0.3)' },
];

export default function DashboardPage() {
  const [moodRecommendations, setMoodRecommendations] = useState<Series[]>([]);
  const [trendingShows, setTrendingShows] = useState<Series[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<MoodType>('exciting');
  const [timeOfDay, setTimeOfDay] = useState('');
  const { watchlist } = useWatchlist();

  const currentMood = moods.find(m => m.value === selectedMood)!;
  const watching = watchlist.filter(e => e.status === 'watching');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 17) setTimeOfDay('Afternoon');
    else if (hour < 21) setTimeOfDay('Evening');
    else setTimeOfDay('Night');
    
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchMoodRecommendations();
  }, [selectedMood]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [trendRes, hiddenRes] = await Promise.all([
        fetch('/api/series?type=popular'),
        fetch('/api/series?type=top_rated'),
      ]);
      const trendData = await trendRes.json();
      const hiddenData = await hiddenRes.json();
      
      if (trendData.success) setTrendingShows(trendData.data.slice(0, 5));
      if (hiddenData.success) {
        // Filter hidden gems: high rating but lower popularity
        const gems = hiddenData.data
          .filter((s: Series) => s.vote_average > 7.5 && s.popularity < 50)
          .slice(0, 5);
        setHiddenGems(gems.length > 0 ? gems : hiddenData.data.slice(5, 10));
      }
    } catch {}
    setLoading(false);
  };

  const fetchMoodRecommendations = async () => {
    try {
      const res = await fetch(`/api/recommendations?type=mood&mood=${selectedMood}`);
      const data = await res.json();
      if (data.success) setMoodRecommendations(data.data);
    } catch {}
  };

  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4 transition-all duration-1000"
      style={{
        background: `linear-gradient(180deg, #0a0a0a 0%, ${currentMood.glowColor.replace('0.3', '0.05')} 50%, #0a0a0a 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Personalized Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 relative overflow-hidden"
        >
          {/* Background glow for mood */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000"
            style={{ background: `radial-gradient(circle at 30% 50%, ${currentMood.glowColor} 0%, transparent 70%)` }}
          />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-gray-400 font-body text-sm uppercase tracking-wider mb-1">Good {timeOfDay}</p>
              <h1 className="text-3xl md:text-4xl font-display font-black text-white">
                Welcome back to <span className="text-glow-red">CineVerse</span>
              </h1>
              <p className="text-gray-300 font-body mt-2">
                {watchlist.length > 0
                  ? `You have ${watchlist.length} shows in your watchlist${watching.length > 0 ? `, ${watching.length} in progress` : ''}`
                  : 'Your personalized AI-powered series hub'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/explore?mode=vibe">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button neon-button-blue flex items-center gap-2">
                  <span>🧠</span> AI Search
                </motion.button>
              </Link>
              <Link href="/profile">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button flex items-center gap-2">
                  <span>★</span> Watchlist ({watchlist.length})
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Continue Watching */}
        {watching.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <span>▶️</span> Continue Watching
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {watching.map(entry => (
                <Link key={entry.seriesId} href={`/series/${entry.seriesId}`}>
                  <div className="flex-shrink-0 w-40 glass-card overflow-hidden hover:border-neon-red/50 transition-all cursor-pointer group">
                    <div className="relative aspect-[2/3]">
                      {entry.posterPath ? (
                        <Image src={getPosterUrl(entry.posterPath, 'w185')} alt={entry.seriesName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-neon-red/20 flex items-center justify-center font-display text-neon-red">CV</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-display font-bold text-white line-clamp-2">{entry.seriesName}</p>
                      {entry.progress !== undefined && entry.progress > 0 && (
                        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-neon-red rounded-full" style={{ width: `${entry.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mood-Based Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div
            className="glass-card p-6 space-y-4 transition-all duration-500"
            style={{ boxShadow: `0 0 30px ${currentMood.glowColor}, 0 0 60px ${currentMood.glowColor.replace('0.3', '0.1')}` }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-display font-bold text-neon-blue">How are you feeling today?</h2>
              <div className="flex flex-wrap gap-2">
                {moods.map(mood => (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`px-4 py-2 rounded-lg font-display font-semibold border-2 transition-all ${
                      selectedMood === mood.value
                        ? 'border-neon-red bg-neon-red/20 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-neon-blue'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMood}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {moodRecommendations.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {moodRecommendations.slice(0, 10).map((series, index) => (
                    <SeriesCard key={series.id} series={series} index={index} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Hidden Gems */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-display font-bold text-neon-red">💎 Hidden Gems</h2>
            <span className="text-xs text-gray-500 font-body">Highly rated but under the radar</span>
          </div>
          {loading ? (
            <SeriesGridSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {hiddenGems.map((series, index) => (
                <SeriesCard key={series.id} series={series} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Trending Now */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-neon-blue">🔥 Trending For You</h2>
          {loading ? (
            <SeriesGridSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {trendingShows.map((series, index) => (
                <SeriesCard key={series.id} series={series} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-display font-bold text-neon-blue mb-6">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl font-display font-black text-glow-red">{watchlist.length}</div>
              <div className="text-sm text-gray-400 font-body uppercase tracking-wider">In Watchlist</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-display font-black text-glow-blue">{watchlist.filter(e => e.status === 'completed').length}</div>
              <div className="text-sm text-gray-400 font-body uppercase tracking-wider">Completed</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-display font-black" style={{ color: '#22c55e' }}>{watching.length}</div>
              <div className="text-sm text-gray-400 font-body uppercase tracking-wider">Watching Now</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-display font-black text-neon-pink">AI</div>
              <div className="text-sm text-gray-400 font-body uppercase tracking-wider">Powered</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
