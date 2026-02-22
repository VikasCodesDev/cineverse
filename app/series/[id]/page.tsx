// app/series/[id]/page.tsx
// Enhanced series detail page with AI features
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { SeriesDetail } from '@/lib/tmdb';
import { getPosterUrl, getBackdropUrl, getProfileUrl } from '@/lib/tmdb';
import SeriesCard from '@/components/SeriesCard';
import { DetailsSkeleton, SeriesGridSkeleton } from '@/components/LoadingSkeleton';
import { Series } from '@/lib/tmdb';
import WatchlistButton from '@/components/ai/WatchlistButton';
import AISummaryButton from '@/components/ai/AISummaryButton';
import SeriesDNA from '@/components/ai/SeriesDNA';
import StreamingAvailability from '@/components/ai/StreamingAvailability';

export default function SeriesDetailPage({ params }: { params: { id: string } }) {
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [recommendations, setRecommendations] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeriesDetails();
    fetchRecommendations();
    // Add to watch history
    try {
      const hist = JSON.parse(localStorage.getItem('cv_watch_history') || '[]');
      if (!hist.includes(parseInt(params.id))) {
        hist.unshift(parseInt(params.id));
        localStorage.setItem('cv_watch_history', JSON.stringify(hist.slice(0, 50)));
      }
    } catch {}
  }, [params.id]);

  const fetchSeriesDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${params.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits,videos,keywords`
      );
      const data = await res.json();
      setSeries(data);
    } catch {}
    setLoading(false);
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`/api/recommendations?type=similar&seriesId=${params.id}`);
      const data = await res.json();
      if (data.success) setRecommendations(data.data);
    } catch {}
  };

  if (loading) return <div className="min-h-screen pt-24 pb-12 px-4"><div className="max-w-7xl mx-auto"><DetailsSkeleton /></div></div>;
  if (!series) return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-display font-bold text-neon-red">Series Not Found</h1>
      </div>
    </div>
  );

  const trailer = series.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const genreNames = series.genres?.map(g => g.name) || [];
  const genreIds = series.genres?.map(g => g.id) || [];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {series.backdrop_path && (
          <div className="absolute inset-0">
            <Image src={getBackdropUrl(series.backdrop_path)} alt={series.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
          </div>
        )}
        <div className="relative h-full flex items-end pb-12 px-4">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-display font-black text-glow-red">{series.name}</h1>
              {series.tagline && <p className="text-xl md:text-2xl text-neon-blue font-body italic">"{series.tagline}"</p>}
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                <div className="flex items-center space-x-2 glass-card px-3 py-1">
                  <svg className="w-5 h-5 text-neon-red" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-display font-bold">{series.vote_average.toFixed(1)}/10</span>
                </div>
                {series.first_air_date && <span className="glass-card px-3 py-1 font-body">{new Date(series.first_air_date).getFullYear()}</span>}
                <span className="glass-card px-3 py-1 font-body">{series.number_of_seasons} Season{series.number_of_seasons !== 1 ? 's' : ''}</span>
                <span className="glass-card px-3 py-1 font-body">{series.number_of_episodes} Episodes</span>
              </div>
              <WatchlistButton
                seriesId={parseInt(params.id)}
                seriesName={series.name}
                posterPath={series.poster_path}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Overview and Poster */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative aspect-[2/3] glass-card overflow-hidden">
            {series.poster_path && <Image src={getPosterUrl(series.poster_path)} alt={series.name} fill className="object-cover" />}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-neon-red mb-4">Overview</h2>
              <p className="text-gray-300 font-body text-lg leading-relaxed">{series.overview}</p>
            </div>

            {/* AI Summary Button */}
            <AISummaryButton
              seriesName={series.name}
              overview={series.overview}
              genres={genreNames}
              rating={series.vote_average}
              year={series.first_air_date?.slice(0, 4)}
            />

            <div>
              <h3 className="text-xl font-display font-bold text-neon-blue mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {series.genres?.map(genre => (
                  <span key={genre.id} className="glass-card px-3 py-1 text-sm font-body">{genre.name}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-display font-bold text-gray-400 mb-1">Status</h4>
                <p className="text-white font-body">{series.status}</p>
              </div>
              <div>
                <h4 className="text-sm font-display font-bold text-gray-400 mb-1">Type</h4>
                <p className="text-white font-body">{series.type}</p>
              </div>
            </div>

            {/* Streaming Availability */}
            <div className="glass-card p-4">
              <StreamingAvailability seriesId={parseInt(params.id)} />
            </div>
          </motion.div>
        </div>

        {/* Series DNA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6">
          <SeriesDNA seriesId={parseInt(params.id)} seriesName={series.name} genres={genreIds} />
        </motion.div>

        {/* Cast */}
        {series.credits && series.credits.cast.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-display font-bold text-neon-red mb-6">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {series.credits.cast.slice(0, 12).map(actor => (
                <div key={actor.id} className="glass-card overflow-hidden">
                  <div className="relative aspect-[2/3]">
                    {actor.profile_path ? (
                      <Image src={getProfileUrl(actor.profile_path)} alt={actor.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neon-red/20 to-neon-blue/20 flex items-center justify-center">
                        <span className="text-4xl">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="font-display font-bold text-sm text-white line-clamp-1">{actor.name}</p>
                    <p className="text-xs text-gray-400 font-body line-clamp-1">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trailer */}
        {trailer && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-display font-bold text-neon-red mb-6">Trailer</h2>
            <div className="glass-card overflow-hidden">
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Similar Series */}
        {recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-neon-red">Similar Series</h2>
              <Link href="/explore">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-neon-blue font-display font-semibold hover:text-glow-blue">
                  View More →
                </motion.button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recommendations.slice(0, 5).map((s, index) => (
                <SeriesCard key={s.id} series={s} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
