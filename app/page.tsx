// app/page.tsx
// Landing page with hero section and 3D portal animation
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import MagneticButton from '@/components/MagneticButton';

// Dynamically import Portal3D to avoid SSR issues with Three.js
const Portal3D = dynamic(() => import('@/components/Portal3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] md:h-[600px] flex items-center justify-center">
      <div className="text-neon-red text-xl font-display animate-pulse">
        Initializing Portal...
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-red/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 4,
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-blue/20 blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-center lg:text-left"
            >
              {/* Main Heading */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl font-display font-black leading-tight"
                >
                  <span className="text-glow-red">Enter the</span>
                  <br />
                  <span className="text-glow-blue">Algorithmic</span>
                  <br />
                  <span className="text-white">Upside Down</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-gray-300 font-body max-w-xl mx-auto lg:mx-0"
                >
                  Discover your next binge-worthy series powered by advanced AI
                  recommendations in a retro sci-fi universe.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <MagneticButton className="w-full sm:w-auto">
                  <Link href="/explore">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="neon-button w-full sm:w-auto"
                    >
                      <span className="relative z-10">Discover Your Series</span>
                    </motion.button>
                  </Link>
                </MagneticButton>
                <MagneticButton className="w-full sm:w-auto">
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="neon-button neon-button-blue w-full sm:w-auto"
                    >
                      <span className="relative z-10">View Dashboard</span>
                    </motion.button>
                  </Link>
                </MagneticButton>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8"
              >
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-glow-red">
                    10K+
                  </div>
                  <div className="text-sm text-gray-400 font-body">
                    Web Series
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-glow-blue">
                    AI-Powered
                  </div>
                  <div className="text-sm text-gray-400 font-body">
                    Recommendations
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-neon-pink">
                    24/7
                  </div>
                  <div className="text-sm text-gray-400 font-body">
                    Updated
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - 3D Portal */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {mounted && <Portal3D />}
              
              {/* Glow effect around portal */}
              <div className="absolute inset-0 bg-gradient-radial from-neon-red/20 via-transparent to-transparent blur-3xl pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center space-y-2"
          >
            <span className="text-sm text-gray-400 font-display uppercase tracking-wider">
              Scroll to Explore
            </span>
            <svg
              className="w-6 h-6 text-neon-red"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-black text-center mb-16"
          >
            <span className="text-glow-red">Why Choose</span>{' '}
            <span className="text-white">CineVerse?</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered',
                description:
                  'Advanced machine learning algorithms analyze your preferences to suggest perfect matches.',
              },
              {
                icon: '🎬',
                title: 'Vast Library',
                description:
                  'Access thousands of web series from around the world, all in one place.',
              },
              {
                icon: '✨',
                title: 'Personalized',
                description:
                  'Get recommendations tailored to your mood, viewing history, and taste.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="glass-card p-8 text-center space-y-4"
              >
                <div className="text-6xl">{feature.icon}</div>
                <h3 className="text-2xl font-display font-bold text-neon-red">
                  {feature.title}
                </h3>
                <p className="text-gray-300 font-body">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
