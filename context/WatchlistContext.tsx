// context/WatchlistContext.tsx
// Global watchlist state management
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WatchlistEntry, WatchlistStatus } from '@/types';

interface WatchlistContextType {
  watchlist: WatchlistEntry[];
  addToWatchlist: (entry: Omit<WatchlistEntry, 'addedAt' | 'updatedAt'>) => void;
  updateStatus: (seriesId: number, status: WatchlistStatus, progress?: number) => void;
  removeFromWatchlist: (seriesId: number) => void;
  getEntry: (seriesId: number) => WatchlistEntry | undefined;
  isInWatchlist: (seriesId: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const STORAGE_KEY = 'cineverse_watchlist';

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveWatchlist = useCallback((list: WatchlistEntry[]) => {
    setWatchlist(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }, []);

  const addToWatchlist = useCallback((entry: Omit<WatchlistEntry, 'addedAt' | 'updatedAt'>) => {
    setWatchlist(prev => {
      const exists = prev.find(e => e.seriesId === entry.seriesId);
      let newList;
      if (exists) {
        newList = prev.map(e =>
          e.seriesId === entry.seriesId
            ? { ...e, ...entry, updatedAt: new Date().toISOString() }
            : e
        );
      } else {
        newList = [...prev, {
          ...entry,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }];
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newList)); } catch {}
      return newList;
    });
  }, []);

  const updateStatus = useCallback((seriesId: number, status: WatchlistStatus, progress?: number) => {
    setWatchlist(prev => {
      const newList = prev.map(e =>
        e.seriesId === seriesId
          ? { ...e, status, progress: progress ?? e.progress, updatedAt: new Date().toISOString() }
          : e
      );
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newList)); } catch {}
      return newList;
    });
  }, []);

  const removeFromWatchlist = useCallback((seriesId: number) => {
    setWatchlist(prev => {
      const newList = prev.filter(e => e.seriesId !== seriesId);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newList)); } catch {}
      return newList;
    });
  }, []);

  const getEntry = useCallback((seriesId: number) => {
    return watchlist.find(e => e.seriesId === seriesId);
  }, [watchlist]);

  const isInWatchlist = useCallback((seriesId: number) => {
    return watchlist.some(e => e.seriesId === seriesId);
  }, [watchlist]);

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      addToWatchlist,
      updateStatus,
      removeFromWatchlist,
      getEntry,
      isInWatchlist,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
