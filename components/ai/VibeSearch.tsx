// components/ai/VibeSearch.tsx
// "Describe your vibe" natural language search powered by Groq + TMDB
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SeriesCard from '@/components/SeriesCard';

const EXAMPLE_VIBES = [
  "Mind-bending shows like Dark",
  "Cozy British mystery series",
  "Fast-paced heist drama",
  "Supernatural teen horror",
  "Political thriller with twists",
  "Slow burn psychological drama",
];

interface VibeSearchProps {
  onResults?: (results: any[]) => void;
}

export default function VibeSearch({ onResults }: VibeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      
      if (data.success) {
        setResults(data.data || []);
        setExplanation(data.queryExplanation || '');
        onResults?.(data.data || []);
      } else {
        setError('AI search failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vibe Search Input */}
      <div className="glass-card p-6 space-y-4" style={{ border: '1px solid rgba(0, 217, 255, 0.3)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm">
            🧠
          </div>
          <div>
            <h3 className="font-display font-bold text-neon-blue">Describe Your Vibe</h3>
            <p className="text-xs text-gray-400 font-body">Natural language AI-powered search</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-neon-blue/60 font-body">
            <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse" />
            Groq AI
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 'mind-bending shows like Dark' or 'cozy mystery series'..."
            className="flex-1 px-4 py-3 rounded-lg bg-black/50 border-2 border-neon-blue/30 text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none font-body text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="neon-button neon-button-blue disabled:opacity-40 whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-neon-blue/30 border-t-neon-blue rounded-full"
                />
                Thinking...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🔮</span>
                AI Search
              </span>
            )}
          </motion.button>
        </div>

        {/* Example vibes */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_VIBES.map((vibe, i) => (
            <button
              key={i}
              onClick={() => { setQuery(vibe); handleSearch(vibe); }}
              className="text-xs px-3 py-1 rounded-full border border-neon-blue/20 text-gray-400 hover:border-neon-blue hover:text-neon-blue transition-all font-body"
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-4 text-center text-red-400 font-body"
          >
            {error}
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-neon-blue/20 border-t-neon-blue rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-display text-neon-blue">AI is analyzing your vibe...</p>
              <p className="text-sm text-gray-400 font-body">Parsing intent · Searching TMDB · Ranking matches</p>
            </div>
          </motion.div>
        )}

        {!loading && hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {explanation && (
              <div className="glass-card p-4 flex items-start gap-3" style={{ border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                <span className="text-xl">🎯</span>
                <div>
                  <p className="text-xs text-gray-400 font-body mb-1">AI Understood:</p>
                  <p className="text-white font-body">{explanation}</p>
                </div>
              </div>
            )}

            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((s, i) => (
                  <div key={s.id} className="relative">
                    <SeriesCard series={s} index={i} />
                    {/* AI explanation overlay */}
                    {s.aiExplanation && (
                      <div className="mt-2 px-2">
                        <div className="text-xs text-neon-blue/80 font-body leading-relaxed">
                          <span className="text-neon-blue font-semibold">Why: </span>
                          {s.aiExplanation}
                        </div>
                        {s.matchScore && (
                          <div className="mt-1 flex items-center gap-1">
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-neon-red to-neon-blue rounded-full"
                                style={{ width: `${s.matchScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{s.matchScore}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center space-y-3">
                <div className="text-5xl">🔭</div>
                <h3 className="font-display font-bold text-neon-red">No Matches Found</h3>
                <p className="text-gray-400 font-body">Try a different description or be more specific</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
