// components/AudioToggle.tsx
// Continuous looping sci-fi thriller ambient — Web Audio API only, no external URL
// Position: fixed bottom-6 right-6 (below AICopilot at bottom-28)
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'cineverse_audio_preference';

export default function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted]     = useState(false);

  const ctxRef       = useRef<AudioContext | null>(null);
  const masterRef    = useRef<GainNode | null>(null);
  const builtRef     = useRef(false);
  const pingTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { return () => { ctxRef.current?.close(); }; }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6 CONTINUOUS LOOPING LAYERS  (all nodes stay alive — suspend/resume only)
  //
  //  L1  38 Hz  sine            — sub rumble, deep space foundation
  //  L2  76 Hz  sine ×2 detune  — reactor core hum, chorus effect
  //  L3  220 Hz triangle + LFO  — slow tremolo eerie pulse
  //  L4  1200 Hz bandpass sweep — alien metallic shimmer
  //  L5  brown noise low-pass   — continuous space static hiss
  //  L6  116+174 Hz 5th pad     — ominous open fifth tension
  //  +   periodic pings         — computer alerts (never stop)
  // ─────────────────────────────────────────────────────────────────────────────
  const buildSoundscape = useCallback((ctx: AudioContext, master: GainNode) => {

    const makeOsc = (freq: number, type: OscillatorType, vol: number, detune = 0) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value    = detune;
      g.gain.value      = vol;
      o.connect(g);
      g.connect(master);
      o.start();
    };

    // L1 sub rumble
    makeOsc(38, 'sine', 0.22);

    // L2 reactor hum (two detuned voices)
    makeOsc(76,   'sine', 0.13,  0);
    makeOsc(76.6, 'sine', 0.10, 12);

    // L3 tension pulse: 220 Hz triangle + LFO tremolo (0.08 Hz = 12 s cycle)
    {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = 220;

      const g = ctx.createGain();
      g.gain.value = 0.07;

      const lfo  = ctx.createOscillator();
      lfo.type   = 'sine';
      lfo.frequency.value = 0.08;

      const lg   = ctx.createGain();
      lg.gain.value = 0.04;

      lfo.connect(lg);
      lg.connect(g.gain);
      o.connect(g);
      g.connect(master);
      o.start();
      lfo.start();
    }

    // L4 metallic shimmer: bandpass swept by 0.05 Hz LFO (20 s sweep)
    {
      const o  = ctx.createOscillator();
      o.type   = 'sine';
      o.frequency.value = 1200;

      const bf = ctx.createBiquadFilter();
      bf.type  = 'bandpass';
      bf.frequency.value = 1200;
      bf.Q.value = 14;

      const lfo  = ctx.createOscillator();
      lfo.type   = 'sine';
      lfo.frequency.value = 0.05;

      const lg   = ctx.createGain();
      lg.gain.value = 400;          // ±400 Hz sweep

      const g    = ctx.createGain();
      g.gain.value = 0.03;

      lfo.connect(lg);
      lg.connect(bf.frequency);
      o.connect(bf);
      bf.connect(g);
      g.connect(master);
      o.start();
      lfo.start();
    }

    // L5 Brown noise — 4 s looping buffer, low-passed at 200 Hz
    {
      const SR  = ctx.sampleRate;
      const buf = ctx.createBuffer(1, SR * 4, SR);
      const d   = buf.getChannelData(0);
      let last  = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        d[i]    = (last + 0.02 * w) / 1.02;
        last    = d[i];
        d[i]   *= 3.5;
      }
      const src  = ctx.createBufferSource();
      src.buffer = buf;
      src.loop   = true;

      const lp   = ctx.createBiquadFilter();
      lp.type    = 'lowpass';
      lp.frequency.value = 200;

      const g    = ctx.createGain();
      g.gain.value = 0.10;

      src.connect(lp);
      lp.connect(g);
      g.connect(master);
      src.start();
    }

    // L6 ominous open fifth (116 + 174 Hz triangles)
    makeOsc(116, 'triangle', 0.06,  0);
    makeOsc(174, 'triangle', 0.05, -5);

    // PINGS — runs forever via recursion
    const schedulePing = () => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return;
      const c = ctxRef.current;
      const m = masterRef.current;
      if (!m) return;

      const isHigh = Math.random() > 0.38;
      const freq   = isHigh
        ? 900  + Math.random() * 700   // 900–1600 Hz
        : 180  + Math.random() * 140;  // 180–320 Hz
      const dur  = isHigh ? 0.4 : 0.65;
      const vol  = isHigh ? 0.06 : 0.05;

      const po = c.createOscillator();
      const pg = c.createGain();
      po.type            = isHigh ? 'sine' : 'triangle';
      po.frequency.value = freq;

      if (isHigh) {
        po.frequency.setValueAtTime(freq, c.currentTime);
        po.frequency.exponentialRampToValueAtTime(freq * 0.65, c.currentTime + dur);
      }

      pg.gain.setValueAtTime(0, c.currentTime);
      pg.gain.linearRampToValueAtTime(vol, c.currentTime + 0.012);
      pg.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);

      po.connect(pg);
      pg.connect(m);
      po.start(c.currentTime);
      po.stop(c.currentTime + dur + 0.05);

      pingTimer.current = setTimeout(schedulePing, 2200 + Math.random() * 4800);
    };

    pingTimer.current = setTimeout(schedulePing, 2500);

  }, []);

  // ── Restart pings after resume ───────────────────────────────────────────────
  const restartPings = useCallback(() => {
    const schedulePing = () => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return;
      const c = ctxRef.current;
      const m = masterRef.current;
      if (!m) return;
      const freq = 900 + Math.random() * 700;
      const dur  = 0.4;
      const po   = c.createOscillator();
      const pg   = c.createGain();
      po.type            = 'sine';
      po.frequency.value = freq;
      po.frequency.setValueAtTime(freq, c.currentTime);
      po.frequency.exponentialRampToValueAtTime(freq * 0.65, c.currentTime + dur);
      pg.gain.setValueAtTime(0, c.currentTime);
      pg.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.012);
      pg.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      po.connect(pg);
      pg.connect(m);
      po.start(c.currentTime);
      po.stop(c.currentTime + dur + 0.05);
      pingTimer.current = setTimeout(schedulePing, 2200 + Math.random() * 4800);
    };
    pingTimer.current = setTimeout(schedulePing, 1500);
  }, []);

  // ── Toggle ───────────────────────────────────────────────────────────────────
  const toggleAudio = () => {
    if (isPlaying) {
      // Smooth fade-out 1.5 s → suspend (all nodes stay alive)
      const m = masterRef.current!;
      const c = ctxRef.current!;
      m.gain.cancelScheduledValues(c.currentTime);
      m.gain.setValueAtTime(m.gain.value, c.currentTime);
      m.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
      if (pingTimer.current) clearTimeout(pingTimer.current);
      setTimeout(() => c.suspend(), 1600);
      setIsPlaying(false);
      localStorage.setItem(STORAGE_KEY, 'off');

    } else {
      if (!builtRef.current) {
        // First click — build context + all layers
        const c = new (window.AudioContext || (window as any).webkitAudioContext)();
        const m = c.createGain();
        m.gain.value = 0;
        m.connect(c.destination);
        ctxRef.current   = c;
        masterRef.current = m;
        buildSoundscape(c, m);
        builtRef.current = true;
      } else {
        // Resume — all 6 drones resume automatically
        ctxRef.current!.resume();
        restartPings();
      }

      // Fade in 2.5 s — cinematic swell
      const m = masterRef.current!;
      const c = ctxRef.current!;
      m.gain.cancelScheduledValues(c.currentTime);
      m.gain.setValueAtTime(0, c.currentTime);
      m.gain.linearRampToValueAtTime(0.58, c.currentTime + 2.5);

      setIsPlaying(true);
      localStorage.setItem(STORAGE_KEY, 'on');
    }
  };

  if (!mounted) return null;

  return (
    // bottom-6 right-6 → directly below AICopilot (bottom-28 right-6)
    <motion.div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2.5, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        onClick={toggleAudio}
        className="relative w-14 h-14 rounded-full glass-card flex items-center justify-center group overflow-hidden"
        style={{
          border: isPlaying
            ? '1px solid rgba(255,0,85,0.65)'
            : '1px solid rgba(255,255,255,0.12)',
          boxShadow: isPlaying
            ? '0 0 18px rgba(255,0,85,0.45), 0 0 36px rgba(0,217,255,0.12)'
            : 'none',
          transition: 'border 0.5s ease, box-shadow 0.5s ease',
        }}
        title={isPlaying ? 'Mute ambient' : 'Play sci-fi ambient'}
      >
        {/* Pulsing ring when playing */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(255,0,85,0.5)' }}
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.7, 0, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* Equalizer bars when playing / muted icon when off */}
        {isPlaying ? (
          <div className="flex items-center gap-[3px]">
            {[0.3, 0.65, 1, 0.65, 0.3].map((base, i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full"
                style={{
                  height: 20,
                  transformOrigin: 'center',
                  background: 'linear-gradient(to top, #ff0055, #00d9ff)',
                }}
                animate={{ scaleY: [base, 1, base * 0.75, 1, base] }}
                transition={{
                  duration: 0.85 + i * 0.08,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        ) : (
          <svg
            className="w-6 h-6 text-gray-500 group-hover:text-neon-red transition-colors duration-200"
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

      <span className="text-[10px] text-gray-600 font-body select-none tracking-wider uppercase">
        {isPlaying ? 'Ambient' : 'Sound'}
      </span>
    </motion.div>
  );
}
