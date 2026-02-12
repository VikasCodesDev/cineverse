// components/SeriesCard.tsx
// Glassmorphism card component for displaying series
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Series } from '@/lib/tmdb';
import { getPosterUrl } from '@/lib/tmdb';

interface SeriesCardProps {
  series: Series;
  index?: number;
}

export default function SeriesCard({ series, index = 0 }: SeriesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
    >
      <Link href={`/series/${series.id}`}>
        <div className="glass-card overflow-hidden group cursor-pointer h-full">
          {/* Poster Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {series.poster_path ? (
              <Image
                src={getPosterUrl(series.poster_path, 'w500')}
                alt={series.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neon-red/20 to-neon-blue/20 flex items-center justify-center">
                <span className="text-4xl font-display text-neon-red">CV</span>
              </div>
            )}
            
            {/* Rating Badge */}
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-neon-red/50">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-neon-red"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-bold font-display text-white">
                  {series.vote_average.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-display font-bold text-white line-clamp-2 group-hover:text-glow-red transition-all">
              {series.name}
            </h3>
            
            <p className="text-sm text-gray-400 line-clamp-3 font-body">
              {series.overview || 'No description available.'}
            </p>

            {/* Release Year */}
            {series.first_air_date && (
              <div className="flex items-center space-x-2 text-xs text-neon-blue">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-display font-semibold">
                  {new Date(series.first_air_date).getFullYear()}
                </span>
              </div>
            )}
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-neon-red/20 via-transparent to-transparent" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
