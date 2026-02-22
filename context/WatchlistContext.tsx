// context/WatchlistContext.tsx — Global watchlist with API persistence (per-user)
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { WatchlistEntry, WatchlistStatus } from '@/types';

interface WatchlistContextType {
  watchlist: WatchlistEntry[];
  loading: boolean;
  addToWatchlist: (entry: Omit<WatchlistEntry, 'addedAt' | 'updatedAt'>) => Promise<boolean>;
  updateStatus: (seriesId: number, status: WatchlistStatus, progress?: number) => Promise<boolean>;
  removeFromWatchlist: (seriesId: number) => Promise<boolean>;
  getEntry: (seriesId: number) => WatchlistEntry | undefined;
  isInWatchlist: (seriesId: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

function normalizeEntry(raw: Record<string, unknown>): WatchlistEntry {
  return {
    seriesId: Number(raw.seriesId),
    seriesName: String(raw.seriesName ?? ''),
    posterPath: raw.posterPath != null ? String(raw.posterPath) : null,
    status: (raw.status as WatchlistStatus) || 'plan_to_watch',
    progress: raw.progress != null ? Number(raw.progress) : undefined,
    rating: raw.rating != null ? Number(raw.rating) : undefined,
    notes: raw.notes != null ? String(raw.notes) : undefined,
    addedAt: String(raw.addedAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  };
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setWatchlist(data.data.map((e: Record<string, unknown>) => normalizeEntry(e)));
      } else {
        setWatchlist([]);
      }
    } catch {
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
      setLoading(false);
    }
  }, [user, fetchWatchlist]);

  const addToWatchlist = useCallback(async (entry: Omit<WatchlistEntry, 'addedAt' | 'updatedAt'>) => {
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'add',
        seriesId: entry.seriesId,
        seriesName: entry.seriesName,
        posterPath: entry.posterPath,
        status: entry.status || 'plan_to_watch',
      }),
    });
    const data = await res.json();
    if (!data.success) return false;
    const now = new Date().toISOString();
    setWatchlist(prev => {
      const exists = prev.find(e => e.seriesId === entry.seriesId);
      if (exists) {
        return prev.map(e =>
          e.seriesId === entry.seriesId
            ? { ...e, ...entry, updatedAt: now }
            : e
        );
      }
      return [...prev, { ...entry, addedAt: now, updatedAt: now }];
    });
    return true;
  }, []);

  const updateStatus = useCallback(async (seriesId: number, status: WatchlistStatus, progress?: number) => {
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'status', seriesId, status, progress }),
    });
    const data = await res.json();
    if (!data.success) return false;
    setWatchlist(prev =>
      prev.map(e =>
        e.seriesId === seriesId
          ? { ...e, status, progress: progress ?? e.progress, updatedAt: new Date().toISOString() }
          : e
      )
    );
    return true;
  }, []);

  const removeFromWatchlist = useCallback(async (seriesId: number) => {
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'remove', seriesId }),
    });
    const data = await res.json();
    if (!data.success) return false;
    setWatchlist(prev => prev.filter(e => e.seriesId !== seriesId));
    return true;
  }, []);

  const getEntry = useCallback((seriesId: number) => watchlist.find(e => e.seriesId === seriesId), [watchlist]);
  const isInWatchlist = useCallback((seriesId: number) => watchlist.some(e => e.seriesId === seriesId), [watchlist]);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        addToWatchlist,
        updateStatus,
        removeFromWatchlist,
        getEntry,
        isInWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
