// components/CursorGlow.tsx
// Premium cursor glow: GPU-accelerated, smooth trailing effect, neon theme, disabled on touch
'use client';

import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const glow = glowRef.current;
    if (!cursor || !glow) return;

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    const lerp = 0.08; // smooth follow (lower = smoother, more lag)

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    };

    const animate = () => {
      glowX += (mouseX - glowX) * lerp;
      glowY += (mouseY - glowY) * lerp;
      glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    const onMouseDown = (e: MouseEvent) => {
      const ripple = document.createElement('div');
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX - 20}px;
        top: ${e.clientY - 20}px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid rgba(255, 0, 85, 0.8);
        pointer-events: none;
        z-index: 99999;
        animation: cv-ripple 0.6s ease-out forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a');
      if (interactive) {
        cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        cursor.style.borderColor = 'rgba(0, 217, 255, 0.8)';
      } else {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.borderColor = 'rgba(255, 0, 85, 0.6)';
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseover', onMouseOver);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseover', onMouseOver);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[99998] hidden md:block"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          border: '2px solid rgba(255, 0, 85, 0.6)',
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.15s ease, border-color 0.2s ease',
          mixBlendMode: 'screen',
          willChange: 'transform',
        }}
      />
      <div
        ref={glowRef}
        className="fixed pointer-events-none z-[99997] hidden md:block"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255, 0, 85, 0.08) 0%, rgba(0, 217, 255, 0.03) 40%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'screen',
          willChange: 'transform',
        }}
      />
      <style jsx global>{`
        @keyframes cv-ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
        @media (pointer: coarse) {
          * { cursor: auto !important; }
        }
      `}</style>
    </>
  );
}
