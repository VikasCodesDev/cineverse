// components/ai/StreamingAvailability.tsx
// Show streaming availability from TMDB watch providers
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface StreamingAvailabilityProps {
  seriesId: number;
}

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProviders {
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
  free?: Provider[];
}

export default function StreamingAvailability({ seriesId }: StreamingAvailabilityProps) {
  const [providers, setProviders] = useState<WatchProviders | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('US');

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}/watch/providers?api_key=${TMDB_KEY}`
        );
        const data = await res.json();
        const regionData = data.results?.[region] || data.results?.['US'] || null;
        setProviders(regionData);
      } catch {
        setProviders(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [seriesId, region]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-5 w-32 skeleton rounded" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-10 h-10 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const hasAny = providers && (
    providers.flatrate?.length ||
    providers.free?.length ||
    providers.rent?.length ||
    providers.buy?.length
  );

  if (!hasAny) {
    return (
      <div className="p-3 rounded-xl bg-white/3 border border-white/10">
        <p className="text-sm text-gray-500 font-body">Streaming availability not found for your region</p>
      </div>
    );
  }

  const ProviderList = ({ list, label, color }: { list?: Provider[]; label: string; color: string }) => {
    if (!list?.length) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-display uppercase tracking-wider" style={{ color }}>{label}</p>
        <div className="flex flex-wrap gap-2">
          {list.map(p => (
            <div
              key={p.provider_id}
              title={p.provider_name}
              className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/20 hover:border-white/50 transition-all"
            >
              <Image
                src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                alt={p.provider_name}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>📡</span>
          <h4 className="font-display font-bold text-white text-sm">Where to Watch</h4>
        </div>
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="text-xs bg-black/50 border border-white/20 rounded px-2 py-1 text-gray-400 focus:outline-none focus:border-neon-blue"
        >
          <option value="US">US</option>
          <option value="GB">UK</option>
          <option value="IN">India</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="CA">Canada</option>
          <option value="AU">Australia</option>
        </select>
      </div>

      <ProviderList list={providers?.flatrate} label="Stream" color="var(--color-neon-blue)" />
      <ProviderList list={providers?.free} label="Free" color="var(--color-neon-red)" />
      <ProviderList list={providers?.rent} label="Rent" color="#f59e0b" />
      <ProviderList list={providers?.buy} label="Buy" color="#6b7280" />

      <p className="text-xs text-gray-600 font-body">Data provided by JustWatch via TMDB</p>
    </div>
  );
}
