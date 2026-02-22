// app/signup/page.tsx — Sign up page (retro neon theme)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace('/explore');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signup(email.trim(), password, name.trim() || undefined);
    setLoading(false);
    if (result.success) {
      router.push('/explore');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 space-y-6"
      >
        <h1 className="text-3xl font-display font-black text-glow-blue text-center">Create Account</h1>
        <p className="text-gray-400 font-body text-center text-sm">Join CineVerse</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-display text-gray-400 mb-1">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none font-body"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-display text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none font-body"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-display text-gray-400 mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-neon-blue/30 text-white focus:border-neon-blue focus:outline-none font-body"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm font-body">{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full neon-button neon-button-blue py-3"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </motion.button>
        </form>
        <p className="text-center text-gray-400 font-body text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-neon-red hover:text-glow-red transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
