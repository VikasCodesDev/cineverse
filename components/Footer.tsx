// components/Footer.tsx — Sci-fi themed footer matching CineVerse neon aesthetic
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaInstagram, FaXTwitter, FaLinkedin, FaGithub } from 'react-icons/fa6';

const socialLinks = [
  {
    icon: FaInstagram,
    href: 'https://www.instagram.com/vikas01/?hl=en#',
    label: 'Instagram',
    hoverColor: 'hover:text-pink-400 hover:border-pink-400/50 hover:shadow-[0_0_12px_rgba(244,114,182,0.4)]',
  },
  {
    icon: FaXTwitter,
    href: 'https://x.com/MishraVika46260',
    label: 'X (Twitter)',
    hoverColor: 'hover:text-neon-blue hover:border-neon-blue/50 hover:shadow-[0_0_12px_rgba(0,217,255,0.4)]',
  },
  {
    icon: FaLinkedin,
    href: 'https://www.linkedin.com/in/vikas-mishra0106',
    label: 'LinkedIn',
    hoverColor: 'hover:text-blue-400 hover:border-blue-400/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)]',
  },
  {
    icon: FaGithub,
    href: 'https://github.com/VikasCodesDev',
    label: 'GitHub',
    hoverColor: 'hover:text-gray-200 hover:border-gray-400/50 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]',
  },
];

const quickLinks = [
  { name: 'Home',      path: '/'          },
  { name: 'Explore',   path: '/explore'   },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Profile',   path: '/profile'   },
];

export default function Footer() {
  return (
    <footer className="relative w-full mt-12 overflow-hidden">
      {/* Top neon border with glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-60" />
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-neon-red/10 to-transparent pointer-events-none" />

      <div
        className="relative z-10 px-6 py-10"
        style={{ background: 'rgba(5, 0, 10, 0.92)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto">

          {/* ── Main row ── */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">

            {/* Left — Logo + tagline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center md:items-start gap-3"
            >
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <Image
                    src="/favicon.png"
                    alt="CineVerse"
                    fill
                    className="object-contain drop-shadow-[0_0_8px_rgba(255,0,85,0.6)] group-hover:drop-shadow-[0_0_14px_rgba(255,0,85,0.9)] transition-all duration-300"
                  />
                </div>
                <span className="text-xl font-display font-black text-glow-red group-hover:tracking-widest transition-all duration-300">
                  CineVerse
                </span>
              </Link>
              <p className="text-xs text-gray-500 font-body max-w-[200px] text-center md:text-left leading-relaxed tracking-wider uppercase">
                AI-Powered Series Discovery in a Retro Sci-Fi Universe
              </p>

              {/* Tiny status indicator */}
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-gray-600 font-body uppercase tracking-widest">Systems Online</span>
              </div>
            </motion.div>

            {/* Centre — Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-[10px] text-gray-600 font-display uppercase tracking-[0.2em]">Navigate</p>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="text-xs text-gray-400 font-display uppercase tracking-wider hover:text-neon-red transition-colors duration-200 relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neon-red group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Right — Social icons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-[10px] text-gray-600 font-display uppercase tracking-[0.2em]">Connect</p>
              <div className="flex items-center gap-3">
                {socialLinks.map(({ icon: Icon, href, label, hoverColor }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      w-9 h-9 rounded-lg flex items-center justify-center
                      text-gray-500 border border-white/10
                      transition-all duration-300 cursor-pointer
                      ${hoverColor}
                    `}
                  >
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Divider ── */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-neon-red/20 to-transparent" />

          {/* ── Bottom bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center"
          >
            <p className="text-[11px] text-gray-600 font-body tracking-wider">
              © {new Date().getFullYear()} CineVerse. All rights reserved.
            </p>

            <p className="text-[11px] text-gray-600 font-body tracking-wider">
              Crafted with{' '}
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-neon-red"
              >
                ♥
              </motion.span>
              {' '}by{' '}
              <a
                href="https://www.linkedin.com/in/vikas-mishra0106"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-neon-blue transition-colors duration-200 font-semibold"
              >
                Vikas
              </a>
            </p>

            <p className="text-[11px] text-gray-700 font-body tracking-wider uppercase">
              Powered by{' '}
              <span className="text-neon-red/60">TMDB</span>
              {' · '}
              <span className="text-neon-blue/60">Groq AI</span>
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
