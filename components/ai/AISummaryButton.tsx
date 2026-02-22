// components/ai/AISummaryButton.tsx
// Button to generate AI analysis of a series
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AISummaryButtonProps {
  seriesName: string;
  overview: string;
  genres?: string[];
  rating?: number;
  year?: string;
}

export default function AISummaryButton({ seriesName, overview, genres, rating, year }: AISummaryButtonProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);

  const generateSummary = async () => {
    if (summary) {
      setExpanded(!expanded);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesName, overview, genres, rating, year }),
      });
      const data = await res.json();
      if (data.success && typeof data.summary === 'string') {
        setSummary(data.summary);
        setError('');
      } else {
        setError(data.summary || 'Unable to generate summary');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={generateSummary}
        disabled={loading}
        className="neon-button neon-button-blue flex items-center gap-2"
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-neon-blue/30 border-t-neon-blue rounded-full"
            />
            <span>Analyzing...</span>
          </>
        ) : summary ? (
          <>
            <span>🧠</span>
            <span>{expanded ? 'Hide' : 'Show'} AI Analysis</span>
          </>
        ) : (
          <>
            <span>🧠</span>
            <span>Generate AI Analysis</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {summary && expanded && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 rounded-xl space-y-2"
              style={{
                background: 'rgba(0, 217, 255, 0.05)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-neon-blue text-sm font-display font-bold">🧠 AI Analysis</span>
                <span className="text-xs text-gray-500 font-body">Powered by Groq</span>
              </div>
              <p className="text-gray-200 font-body text-sm leading-relaxed">{summary}</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm font-body px-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
