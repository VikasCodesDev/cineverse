// components/SeriesCard.tsx
// Enhanced glassmorphism card component for displaying series with watchlist integration
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Series } from '@/lib/tmdb';
import { getPosterUrl } from '@/lib/tmdb';
import WatchlistButton from '@/components/ai/WatchlistButton';
import MagneticButton from '@/components/MagneticButton';

interface SeriesCardProps {
  series: Series;
  index?: number;
}

export default function SeriesCard({ series, index = 0 }: SeriesCardProps) {
  return (
    <MagneticButton className="relative block">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <Link href={`/series/${series.id}`}>
        <div className="glass-card overflow-hidden cursor-pointer h-full">
          {/* Poster Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {series.poster_path ? (
              <Image
                src={getPosterUrl(series.poster_path, 'w500')}
                alt={series.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neon-red/20 to-neon-blue/20 flex items-center justify-center">
                <span className="text-4xl font-display text-neon-red">CV</span>
              </div>
            )}
            
            {/* Rating Badge */}
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-neon-red/50">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-neon-red" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-bold font-display text-white">
                  {series.vote_average.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-3 space-y-1">
            <h3 className="text-sm font-display font-bold text-white line-clamp-2 group-hover:text-glow-red transition-all">
              {series.name}
            </h3>
            
            {series.first_air_date && (
              <div className="text-xs text-neon-blue font-display font-semibold">
                {new Date(series.first_air_date).getFullYear()}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Watchlist button - absolute positioned over card */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.stopPropagation()}>
        <WatchlistButton
          seriesId={series.id}
          seriesName={series.name}
          posterPath={series.poster_path}
          compact={true}
        />
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
        style={{ boxShadow: '0 0 30px rgba(255, 0, 85, 0.3), 0 0 60px rgba(0, 217, 255, 0.1)' }} />
    </motion.div>
    </MagneticButton>
  );
}
