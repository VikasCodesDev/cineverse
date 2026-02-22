// components/MagneticButton.tsx
// Subtle magnetic pull toward cursor on hover (pointer devices only), no layout shift
'use client';

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';

const STRENGTH = 0.25;
const DAMPING = 0.7;

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function MagneticButton({
  children,
  className = '',
  style,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    setHasFinePointer(mq.matches);
    const listener = () => setHasFinePointer(mq.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!hasFinePointer || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) * STRENGTH;
      const dy = (e.clientY - centerY) * STRENGTH;
      setOffset((prev) => ({
        x: prev.x * DAMPING + dx * (1 - DAMPING),
        y: prev.y * DAMPING + dy * (1 - DAMPING),
      }));
    },
    [hasFinePointer]
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={
        offset.x === 0 && offset.y === 0
          ? { type: 'spring', stiffness: 300, damping: 20 }
          : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  );
}
