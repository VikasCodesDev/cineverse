// components/Navigation.tsx — Main nav with auth (Login/Signup vs Profile/Logout)
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWatchlist } from '@/context/WatchlistContext';
import MagneticButton from '@/components/MagneticButton';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { watchlist } = useWatchlist();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b-2 border-neon-red/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-red to-neon-blue flex items-center justify-center">
                <span className="text-2xl font-display font-black">CV</span>
              </div>
              <span className="text-2xl font-display font-black text-glow-red hidden sm:block">
                CineVerse
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {navItems.map((item) => (
                  <MagneticButton key={item.path} className="inline-block">
                    <Link href={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-4 py-2 rounded-lg font-display font-semibold uppercase text-sm tracking-wider transition-all ${
                          pathname === item.path
                            ? 'text-neon-red border-2 border-neon-red bg-neon-red/10'
                            : 'text-gray-300 hover:text-neon-blue hover:border-2 hover:border-neon-blue/50'
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
                    className="px-4 py-2 rounded-lg font-display font-semibold uppercase text-sm tracking-wider text-gray-400 hover:text-neon-red hover:border-2 hover:border-neon-red/50 border-2 border-transparent transition-all"
                  >
                    Logout
                  </button>
                </MagneticButton>
              </>
            ) : (
              <>
                <MagneticButton className="inline-block">
                  <Link href="/">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`inline-block px-4 py-2 rounded-lg font-display font-semibold uppercase text-sm transition-all ${pathname === '/' ? 'text-neon-red border-2 border-neon-red bg-neon-red/10' : 'text-gray-300 hover:text-neon-blue hover:border-2 hover:border-neon-blue/50'}`}>
                      Home
                    </motion.span>
                  </Link>
                </MagneticButton>
                <MagneticButton className="inline-block">
                  <Link href="/login">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block px-4 py-2 rounded-lg font-display font-semibold uppercase text-sm text-neon-blue border-2 border-neon-blue/50 hover:bg-neon-blue/10 transition-all">
                      Login
                    </motion.span>
                  </Link>
                </MagneticButton>
                <MagneticButton className="inline-block">
                  <Link href="/signup">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block px-4 py-2 rounded-lg font-display font-semibold uppercase text-sm neon-button">
                      Sign Up
                    </motion.span>
                  </Link>
                </MagneticButton>
              </>
            )}
          </div>

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
                      <div
                        className={`flex items-center justify-between px-4 py-3 rounded-lg font-display font-semibold uppercase text-sm tracking-wider transition-all ${
                          pathname === item.path
                            ? 'text-neon-red border-2 border-neon-red bg-neon-red/10'
                            : 'text-gray-300 hover:text-neon-blue hover:bg-neon-blue/10'
                        }`}
                      >
                        {item.name}
                        {item.path === '/profile' && watchlist.length > 0 && (
                          <span className="text-xs bg-neon-red/20 border border-neon-red/50 rounded-full px-2 py-0.5 text-neon-red">
                            {watchlist.length}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setIsMenuOpen(false); logout(); }}
                    className="w-full text-left px-4 py-3 rounded-lg font-display font-semibold uppercase text-sm text-gray-400 hover:text-neon-red"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
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
