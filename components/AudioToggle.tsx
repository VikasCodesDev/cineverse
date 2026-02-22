// components/AudioToggle.tsx — Real ambient audio with localStorage preference (no autoplay)
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'cineverse_audio_preference';
// Royalty-free ambient (Mixkit). Replace with /audio/ambient.mp3 for your own file.
const AMBIENT_URL = 'https://assets.mixkit.co/music/preview/mixkit-space-ambient-578.mp3';

export default function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setReady(true);
    const audio = new Audio(AMBIENT_URL);
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      localStorage.setItem(STORAGE_KEY, 'off');
      setIsPlaying(false);
    } else {
      const play = () => {
        audio.play().then(() => {
          setIsPlaying(true);
          localStorage.setItem(STORAGE_KEY, 'on');
        }).catch(() => {});
      };
      play();
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleAudio}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full glass-card flex items-center justify-center group"
      title={isPlaying ? 'Mute ambient' : 'Play ambient'}
    >
      {isPlaying ? (
        <svg
          className="w-6 h-6 text-neon-red group-hover:text-neon-blue transition-colors"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-neon-red transition-colors"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )}
    </motion.button>
  );
}
