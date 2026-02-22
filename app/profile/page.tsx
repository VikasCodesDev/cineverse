// app/profile/page.tsx
// User profile: username, avatar, watchlist, recently watched
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useWatchlist } from '@/context/WatchlistContext';
import { WatchlistStatus, WatchlistEntry } from '@/types';
import { getPosterUrl } from '@/lib/tmdb';
import { Series } from '@/lib/tmdb';

const STATUS_CONFIG: Record<WatchlistStatus, { label: string; emoji: string; color: string; bgColor: string }> = {
  watching: { label: 'Watching', emoji: '▶️', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  completed: { label: 'Completed', emoji: '✅', color: 'var(--color-neon-blue)', bgColor: 'rgba(0, 217, 255, 0.1)' },
  plan_to_watch: { label: 'Plan to Watch', emoji: '📋', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  dropped: { label: 'Dropped', emoji: '❌', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  rewatch: { label: 'Rewatch', emoji: '🔄', color: 'var(--color-neon-pink)', bgColor: 'rgba(255, 0, 110, 0.1)' },
};

const ALL_STATUSES: WatchlistStatus[] = ['watching', 'completed', 'plan_to_watch', 'dropped', 'rewatch'];

export default function ProfilePage() {
  const { user } = useAuth();
  const { watchlist, updateStatus, removeFromWatchlist } = useWatchlist();
  const [activeFilter, setActiveFilter] = useState<WatchlistStatus | 'all'>('all');
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [editProgress, setEditProgress] = useState(0);
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [recentSeries, setRecentSeries] = useState<Series[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/user/recent', { credentials: 'include' });
      const data = await res.json();
      if (cancelled || !data.success || !Array.isArray(data.data)) return;
      setRecentIds(data.data);
      if (data.data.length === 0) return;
      const first = data.data.slice(0, 10);
      const results = await Promise.all(
        first.map((id: number) =>
          fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`).then(r => r.json()).catch(() => null)
        )
      );
      if (!cancelled) setRecentSeries(results.filter(Boolean));
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = activeFilter === 'all' 
    ? watchlist 
    : watchlist.filter(e => e.status === activeFilter);

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = watchlist.filter(e => e.status === s).length;
    return acc;
  }, {} as Record<WatchlistStatus, number>);

  const totalHoursWatched = watchlist.filter(e => e.status === 'completed').length * 10; // rough estimate

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-red to-neon-blue flex items-center justify-center text-4xl font-display font-black"
                style={{ boxShadow: '0 0 30px rgba(255, 0, 85, 0.4)' }}>
                🎬
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-black" />
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-display font-black text-white">{user?.name || 'CineVerse User'}</h1>
              <p className="text-gray-400 font-body mt-1">{user?.email || 'AI-powered series explorer'}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-4 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-display font-black text-glow-red">{watchlist.length}</div>
                  <div className="text-xs text-gray-400 font-body">In Watchlist</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-display font-black text-glow-blue">{counts.completed}</div>
                  <div className="text-xs text-gray-400 font-body">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-display font-black" style={{ color: '#22c55e' }}>{counts.watching}</div>
                  <div className="text-xs text-gray-400 font-body">Watching Now</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-display font-black text-neon-pink">{totalHoursWatched}+</div>
                  <div className="text-xs text-gray-400 font-body">Est. Hours</div>
                </div>
              </div>
            </div>

            <Link href="/explore">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="neon-button"
              >
                Explore More
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Recently Watched */}
        {recentSeries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-display font-bold text-neon-blue">Recently Watched</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {recentSeries.map((s) => (
                <Link key={s.id} href={`/series/${s.id}`}>
                  <div className="flex-shrink-0 w-32 glass-card overflow-hidden hover:border-neon-blue/50 transition-all cursor-pointer group">
                    <div className="relative aspect-[2/3]">
                      {s.poster_path ? (
                        <Image src={getPosterUrl(s.poster_path, 'w185')} alt={s.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-neon-blue/20 flex items-center justify-center font-display text-neon-blue text-sm">CV</div>
                      )}
                    </div>
                    <p className="p-2 text-xs font-display font-bold text-white line-clamp-2">{s.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Status Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-display text-sm font-bold transition-all border-2 ${
              activeFilter === 'all'
                ? 'border-white text-white bg-white/10'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            All ({watchlist.length})
          </button>
          {ALL_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-2 rounded-lg font-display text-sm font-bold transition-all border-2 flex items-center gap-2 ${
                activeFilter === status
                  ? 'text-white bg-white/10'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
              style={activeFilter === status ? {
                borderColor: STATUS_CONFIG[status].color,
                background: STATUS_CONFIG[status].bgColor,
                color: STATUS_CONFIG[status].color,
              } : {}}
            >
              <span>{STATUS_CONFIG[status].emoji}</span>
              <span>{STATUS_CONFIG[status].label}</span>
              {counts[status] > 0 && <span className="text-xs opacity-70">({counts[status]})</span>}
            </button>
          ))}
        </motion.div>

        {/* Watchlist Grid */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-16 text-center space-y-4"
          >
            <div className="text-6xl">📺</div>
            <h3 className="text-2xl font-display font-bold text-white">
              {activeFilter === 'all' ? 'Your Watchlist is Empty' : `No shows ${STATUS_CONFIG[activeFilter as WatchlistStatus]?.label || ''}`}
            </h3>
            <p className="text-gray-400 font-body">
              {activeFilter === 'all' 
                ? 'Start exploring and add series to your watchlist!' 
                : 'Add some shows to this category from the explore page'}
            </p>
            <Link href="/explore">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button mt-4">
                Explore Series
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((entry, i) => (
              <WatchlistCard
                key={entry.seriesId}
                entry={entry}
                index={i}
                onUpdateStatus={updateStatus}
                onRemove={removeFromWatchlist}
                isEditing={editingEntry === entry.seriesId}
                onEditToggle={(id) => setEditingEntry(editingEntry === id ? null : id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function WatchlistCard({
  entry,
  index,
  onUpdateStatus,
  onRemove,
  isEditing,
  onEditToggle,
}: {
  entry: WatchlistEntry;
  index: number;
  onUpdateStatus: (id: number, status: WatchlistStatus, progress?: number) => void;
  onRemove: (id: number) => void;
  isEditing: boolean;
  onEditToggle: (id: number) => void;
}) {
  const config = STATUS_CONFIG[entry.status];
  const [localProgress, setLocalProgress] = useState(entry.progress || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <Link href={`/series/${entry.seriesId}`} className="flex-shrink-0">
          <div className="relative w-16 h-24 rounded-lg overflow-hidden">
            {entry.posterPath ? (
              <Image
                src={getPosterUrl(entry.posterPath, 'w185')}
                alt={entry.seriesName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neon-red/20 flex items-center justify-center font-display text-sm text-neon-red">CV</div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <Link href={`/series/${entry.seriesId}`}>
            <h3 className="font-display font-bold text-white hover:text-neon-red transition-colors line-clamp-2 text-sm cursor-pointer">
              {entry.seriesName}
            </h3>
          </Link>

          {/* Status Badge */}
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-display font-bold"
            style={{ color: config.color, background: config.bgColor, border: `1px solid ${config.color}40` }}
          >
            {config.emoji} {config.label}
          </span>

          {/* Progress Bar (for watching) */}
          {entry.status === 'watching' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400 font-body">
                <span>Progress</span>
                <span>{localProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-red to-neon-blue transition-all"
                  style={{ width: `${localProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Added date */}
          <p className="text-xs text-gray-600 font-body">
            Added {new Date(entry.addedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onEditToggle(entry.seriesId)}
          className="text-xs text-gray-500 hover:text-neon-blue transition-colors font-body"
        >
          {isEditing ? '▲ Less options' : '▼ Edit status'}
        </button>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 space-y-3"
            >
              {/* Status buttons */}
              <div className="flex flex-wrap gap-1">
                {ALL_STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => onUpdateStatus(entry.seriesId, status)}
                    className="text-xs px-2 py-1 rounded-lg border transition-all font-body"
                    style={
                      entry.status === status
                        ? { borderColor: STATUS_CONFIG[status].color, color: STATUS_CONFIG[status].color, background: STATUS_CONFIG[status].bgColor }
                        : { borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }
                    }
                  >
                    {STATUS_CONFIG[status].emoji} {STATUS_CONFIG[status].label}
                  </button>
                ))}
              </div>

              {/* Progress slider */}
              {entry.status === 'watching' && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-body">Progress: {localProgress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localProgress}
                    onChange={e => setLocalProgress(Number(e.target.value))}
                    onMouseUp={() => onUpdateStatus(entry.seriesId, entry.status, localProgress)}
                    className="w-full accent-neon-red"
                  />
                </div>
              )}

              {/* Remove */}
              <button
                onClick={() => onRemove(entry.seriesId)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors font-body"
              >
                🗑️ Remove from watchlist
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
