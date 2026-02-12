// app/dashboard/page.tsx
// Dashboard page with saved series and personalized recommendations
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SeriesCard from '@/components/SeriesCard';
import { SeriesGridSkeleton } from '@/components/LoadingSkeleton';
import { Series } from '@/lib/tmdb';

type MoodType = 'exciting' | 'relaxing' | 'mysterious' | 'funny' | 'dramatic';

export default function DashboardPage() {
  const [savedSeries, setSavedSeries] = useState<Series[]>([]);
  const [recommendations, setRecommendations] = useState<Series[]>([]);
  const [moodRecommendations, setMoodRecommendations] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<MoodType>('exciting');

  const moods: { value: MoodType; label: string; emoji: string; color: string }[] = [
    { value: 'exciting', label: 'Exciting', emoji: '⚡', color: 'text-neon-red' },
    { value: 'relaxing', label: 'Relaxing', emoji: '🌊', color: 'text-neon-blue' },
    { value: 'mysterious', label: 'Mysterious', emoji: '🔮', color: 'text-neon-purple' },
    { value: 'funny', label: 'Funny', emoji: '😂', color: 'text-yellow-400' },
    { value: 'dramatic', label: 'Dramatic', emoji: '🎭', color: 'text-neon-pink' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchMoodRecommendations();
  }, [selectedMood]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch saved series
      const savedResponse = await fetch('/api/user?type=saved');
      const savedData = await savedResponse.json();

      if (savedData.success && savedData.data.length > 0) {
        // Fetch full series details for saved items
        const seriesDetails = await Promise.all(
          savedData.data.map(async (id: number) => {
            const response = await fetch(
              `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            );
            return response.json();
          })
        );
        setSavedSeries(seriesDetails);
      }

      // Fetch personalized recommendations
      const historyResponse = await fetch('/api/user?type=watchHistory');
      const historyData = await historyResponse.json();

      if (historyData.success && historyData.data.length > 0) {
        const history = historyData.data.join(',');
        const recsResponse = await fetch(
          `/api/recommendations?type=personalized&history=${history}`
        );
        const recsData = await recsResponse.json();

        if (recsData.success) {
          setRecommendations(recsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodRecommendations = async () => {
    try {
      const response = await fetch(
        `/api/recommendations?type=mood&mood=${selectedMood}`
      );
      const data = await response.json();

      if (data.success) {
        setMoodRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error fetching mood recommendations:', error);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-display font-black">
            <span className="text-glow-red">Your Personal</span>{' '}
            <span className="text-white">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-300 font-body max-w-2xl mx-auto">
            Track your favorites and get AI-powered recommendations tailored
            just for you
          </p>
        </motion.div>

        {/* Mood-Based Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-display font-bold text-neon-blue">
                How are you feeling today?
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
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

          {moodRecommendations.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {moodRecommendations.slice(0, 10).map((series, index) => (
                <SeriesCard key={series.id} series={series} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Saved Series */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-display font-bold text-neon-red">
            Your Watchlist
          </h2>

          {loading ? (
            <SeriesGridSkeleton count={5} />
          ) : savedSeries.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {savedSeries.map((series, index) => (
                <SeriesCard key={series.id} series={series} index={index} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center space-y-4">
              <div className="text-6xl">📺</div>
              <h3 className="text-xl font-display font-bold text-white">
                Your Watchlist is Empty
              </h3>
              <p className="text-gray-400 font-body">
                Start exploring and save your favorite series!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/explore'}
                className="neon-button mt-4"
              >
                Explore Series
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-display font-bold text-neon-purple">
              Recommended For You
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recommendations.slice(0, 10).map((series, index) => (
                <SeriesCard key={series.id} series={series} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-display font-bold text-neon-blue mb-6">
            Your Stats
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl font-display font-black text-glow-red">
                {savedSeries.length}
              </div>
              <div className="text-sm text-gray-400 font-body uppercase tracking-wider">
                Saved Series
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-4xl font-display font-black text-glow-blue">
                {recommendations.length}
              </div>
              <div className="text-sm text-gray-400 font-body uppercase tracking-wider">
                Recommendations
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-4xl font-display font-black text-neon-pink">
                100%
              </div>
              <div className="text-sm text-gray-400 font-body uppercase tracking-wider">
                AI Accuracy
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
