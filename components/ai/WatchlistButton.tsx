// components/ai/WatchlistButton.tsx
// Smart watchlist button with status selector
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchlist } from '@/context/WatchlistContext';
import { WatchlistStatus } from '@/types';

interface WatchlistButtonProps {
  seriesId: number;
  seriesName: string;
  posterPath: string | null;
  compact?: boolean;
}

const STATUS_CONFIG: Record<WatchlistStatus, { label: string; emoji: string; color: string }> = {
  watching: { label: 'Watching', emoji: '▶️', color: 'text-green-400 border-green-400' },
  completed: { label: 'Completed', emoji: '✅', color: 'text-neon-blue border-neon-blue' },
  plan_to_watch: { label: 'Plan to Watch', emoji: '📋', color: 'text-yellow-400 border-yellow-400' },
  dropped: { label: 'Dropped', emoji: '❌', color: 'text-red-500 border-red-500' },
  rewatch: { label: 'Rewatch', emoji: '🔄', color: 'text-neon-pink border-neon-pink' },
};

export default function WatchlistButton({ seriesId, seriesName, posterPath, compact = false }: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, getEntry, isInWatchlist } = useWatchlist();
  const [showMenu, setShowMenu] = useState(false);
  const [showSuccess, setShowSuccess] = useState('');

  const entry = getEntry(seriesId);
  const inList = isInWatchlist(seriesId);

  const handleStatus = (status: WatchlistStatus) => {
    addToWatchlist({ seriesId, seriesName, posterPath, status });
    setShowMenu(false);
    setShowSuccess(STATUS_CONFIG[status].label);
    setTimeout(() => setShowSuccess(''), 2000);
  };

  const handleRemove = () => {
    removeFromWatchlist(seriesId);
    setShowMenu(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMenu(!showMenu)}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
            inList
              ? 'bg-neon-red/20 border-neon-red text-neon-red'
              : 'bg-black/50 border-white/30 text-gray-400 hover:border-neon-red hover:text-neon-red'
          }`}
        >
          {inList ? '★' : '☆'}
        </motion.button>
        
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-10 z-50 bg-black/95 border border-neon-red/30 rounded-xl p-2 min-w-[180px] shadow-xl"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              {(Object.entries(STATUS_CONFIG) as [WatchlistStatus, typeof STATUS_CONFIG[WatchlistStatus]][]).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => handleStatus(status)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-white/5 transition-colors flex items-center gap-2 ${
                    entry?.status === status ? 'text-neon-red' : 'text-gray-300'
                  }`}
                >
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                </button>
              ))}
              {inList && (
                <button
                  onClick={handleRemove}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2 mt-1 border-t border-white/10 pt-2"
                >
                  <span>🗑️</span>
                  <span>Remove</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neon-red/90 text-white text-xs px-3 py-1 rounded-full font-display whitespace-nowrap"
          >
            Added to {showSuccess}!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        className={`neon-button flex items-center gap-2 ${inList ? 'bg-neon-red/20' : ''}`}
      >
        <span>{inList ? '★' : '☆'}</span>
        <span>{inList ? (STATUS_CONFIG[entry!.status]?.label || 'Watchlist') : 'Add to Watchlist'}</span>
        <span className="text-xs">▾</span>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 top-full mt-2 z-50 bg-black/95 border border-neon-red/30 rounded-xl p-2 min-w-[200px] shadow-2xl"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <p className="text-xs text-gray-500 font-display uppercase tracking-wider px-3 py-1 mb-1">Set Status</p>
            {(Object.entries(STATUS_CONFIG) as [WatchlistStatus, typeof STATUS_CONFIG[WatchlistStatus]][]).map(([status, config]) => (
              <button
                key={status}
                onClick={() => handleStatus(status)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-body hover:bg-white/5 transition-colors flex items-center gap-3 ${
                  entry?.status === status ? 'text-neon-red bg-neon-red/10' : 'text-gray-300'
                }`}
              >
                <span className="text-base">{config.emoji}</span>
                <span>{config.label}</span>
                {entry?.status === status && <span className="ml-auto text-neon-red">✓</span>}
              </button>
            ))}
            {inList && (
              <button
                onClick={handleRemove}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-3 mt-1 border-t border-white/10 pt-2"
              >
                <span className="text-base">🗑️</span>
                <span>Remove from List</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
