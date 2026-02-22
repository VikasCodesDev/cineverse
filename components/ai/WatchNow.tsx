// components/ai/WatchNow.tsx
// "What to Watch Now" feature based on time, mood, and genre
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getPosterUrl } from '@/lib/tmdb';
import { MoodType } from '@/types';

const MOODS: { value: MoodType; label: string; emoji: string }[] = [
  { value: 'exciting', label: 'Exciting', emoji: '⚡' },
  { value: 'relaxing', label: 'Relaxing', emoji: '🌊' },
  { value: 'mysterious', label: 'Mysterious', emoji: '🔮' },
  { value: 'funny', label: 'Funny', emoji: '😂' },
  { value: 'dramatic', label: 'Dramatic', emoji: '🎭' },
];

const TIME_OPTIONS = [
  { label: '20 min', value: 20 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: 'All night', value: 480 },
];

export default function WatchNow() {
  const [selectedTime, setSelectedTime] = useState(60);
  const [selectedMood, setSelectedMood] = useState<MoodType>('exciting');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const findNow = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/watch-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableTime: selectedTime, mood: selectedMood }),
      });
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⏱️</span>
        <div>
          <h3 className="font-display font-bold text-xl text-white">What to Watch Now</h3>
          <p className="text-sm text-gray-400 font-body">Tell us your time & mood, we'll find the perfect match</p>
        </div>
      </div>

      {/* Time Selection */}
      <div className="space-y-2">
        <label className="text-sm font-display text-gray-400 uppercase tracking-wider">Available Time</label>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedTime(t.value)}
              className={`px-4 py-2 rounded-lg font-display text-sm border-2 transition-all ${
                selectedTime === t.value
                  ? 'border-neon-red bg-neon-red/20 text-white'
                  : 'border-gray-600 text-gray-400 hover:border-neon-red/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Selection */}
      <div className="space-y-2">
        <label className="text-sm font-display text-gray-400 uppercase tracking-wider">Current Mood</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(m.value)}
              className={`px-4 py-2 rounded-lg font-display text-sm border-2 transition-all flex items-center gap-2 ${
                selectedMood === m.value
                  ? 'border-neon-blue bg-neon-blue/20 text-white'
                  : 'border-gray-600 text-gray-400 hover:border-neon-blue/50'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={findNow}
        disabled={loading}
        className="w-full neon-button flex items-center justify-center gap-2 py-4"
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-neon-red/30 border-t-neon-red rounded-full"
            />
            Finding your perfect watch...
          </>
        ) : (
          <>
            <span>🎬</span>
            Find Something to Watch
          </>
        )}
      </motion.button>

      {/* Results */}
      <AnimatePresence>
        {!loading && hasSearched && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="font-display font-bold text-neon-red">Perfect for right now:</h4>
            {results.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/series/${s.id}`}>
                  <div className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-neon-red/30 transition-all cursor-pointer group">
                    <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      {s.poster_path ? (
                        <Image src={getPosterUrl(s.poster_path, 'w185')} alt={s.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neon-red/20 flex items-center justify-center text-xs">CV</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-display font-bold text-white group-hover:text-neon-red transition-colors truncate">{s.name}</h5>
                      <p className="text-xs text-neon-blue font-body mt-0.5">{s.episodeRecommendation}</p>
                      <p className="text-xs text-gray-400 font-body mt-1 line-clamp-2">{s.suggestion}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-display font-bold text-neon-red">{s.vote_average?.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">★</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
