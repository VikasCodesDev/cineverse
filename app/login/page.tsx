// app/login/page.tsx — Login page (retro neon theme)
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/explore';
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace(redirect);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 space-y-6"
      >
        <h1 className="text-3xl font-display font-black text-glow-red text-center">Sign In</h1>
        <p className="text-gray-400 font-body text-center text-sm">Enter the CineVerse</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-display text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-neon-red/30 text-white focus:border-neon-red focus:outline-none font-body"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-display text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-neon-red/30 text-white focus:border-neon-red focus:outline-none font-body"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm font-body">{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full neon-button py-3"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>
        <p className="text-center text-gray-400 font-body text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-neon-blue hover:text-glow-blue transition-colors">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
