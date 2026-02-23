// components/Navigation.tsx — Logo: favicon.png | Animation synced with hero h1 (delay 0.2)
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWatchlist } from '@/context/WatchlistContext';
import MagneticButton from '@/components/MagneticButton';

const NAV_BTN_BASE =
  'inline-block px-5 py-2 rounded-lg font-display font-semibold uppercase text-sm tracking-wider border-2 transition-all';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { watchlist } = useWatchlist();

  const navItems = [
    { name: 'Home',      path: '/'          },
    { name: 'Explore',   path: '/explore'   },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile',   path: '/profile'   },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b-2 border-neon-red/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo + Name — delay 0.2 matches hero h1 exactly ── */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2.5 -ml-10"
            >
              {/* New favicon.png logo — replaces old "CV" gradient box */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/favicon.png"
                  alt="CineVerse"
                  fill
                  className="object-contain drop-shadow-[0_0_10px_rgba(255,0,85,0.65)]"
                  priority
                />
              </div>

              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-2xl font-display font-black text-glow-red hidden sm:block"
              >
                CineVerse
              </motion.span>
            </motion.div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {navItems.map((item) => (
                  <MagneticButton key={item.path} className="inline-block">
                    <Link href={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-5 py-2 rounded-lg font-display font-semibold uppercase text-sm tracking-wider border-2 transition-all ${
                          pathname === item.path
                            ? 'text-neon-red border-neon-red bg-neon-red/10'
                            : 'text-gray-300 border-transparent hover:text-neon-blue hover:border-neon-blue/50'
                        }`}
                      >
                        {item.name}
                        {item.path === '/profile' && watchlist.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red rounded-full text-white text-xs flex items-center justify-center font-display">
                            {watchlist.length > 9 ? '9+' : watchlist.length}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  </MagneticButton>
                ))}
                <MagneticButton className="inline-block">
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="px-5 py-2 rounded-lg font-display font-semibold uppercase text-sm tracking-wider border-2 border-transparent text-gray-400 hover:text-neon-red hover:border-neon-red/50 transition-all"
                  >
                    Logout
                  </button>
                </MagneticButton>
              </>
            ) : (
              <>
                <MagneticButton className="inline-block">
                  <Link href="/">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`${NAV_BTN_BASE} ${pathname === '/' ? 'text-neon-red border-neon-red bg-neon-red/10' : 'text-gray-300 border-neon-red/60 hover:bg-neon-red/10 hover:text-neon-red'}`}>
                      Home
                    </motion.span>
                  </Link>
                </MagneticButton>
                <MagneticButton className="inline-block">
                  <Link href="/login">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`${NAV_BTN_BASE} text-neon-blue border-neon-blue/60 hover:bg-neon-blue/10`}>
                      Login
                    </motion.span>
                  </Link>
                </MagneticButton>
                <MagneticButton className="inline-block">
                  <Link href="/signup">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`${NAV_BTN_BASE} text-neon-red border-neon-red/60 hover:bg-neon-red/10`}>
                      Sign Up
                    </motion.span>
                  </Link>
                </MagneticButton>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg border-2 border-neon-red text-neon-red"
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </motion.button>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 space-y-2 overflow-hidden"
            >
              {user ? (
                <>
                  {navItems.map((item) => (
                    <Link key={item.path} href={item.path} onClick={() => setIsMenuOpen(false)}>
                      <div className={`flex items-center justify-between px-4 py-3 rounded-lg font-display font-semibold uppercase text-sm tracking-wider transition-all ${
                        pathname === item.path
                          ? 'text-neon-red border-2 border-neon-red bg-neon-red/10'
                          : 'text-gray-300 hover:text-neon-blue hover:bg-neon-blue/10'
                      }`}>
                        {item.name}
                        {item.path === '/profile' && watchlist.length > 0 && (
                          <span className="text-xs bg-neon-red/20 border border-neon-red/50 rounded-full px-2 py-0.5 text-neon-red">
                            {watchlist.length}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <button type="button" onClick={() => { setIsMenuOpen(false); logout(); }}
                    className="w-full text-left px-4 py-3 rounded-lg font-display font-semibold uppercase text-sm text-gray-400 hover:text-neon-red">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <div className="px-4 py-3 rounded-lg font-display font-semibold text-neon-red">Home</div>
                  </Link>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <div className="px-4 py-3 rounded-lg font-display font-semibold text-neon-blue">Login</div>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <div className="px-4 py-3 rounded-lg font-display font-semibold text-neon-red">Sign Up</div>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
