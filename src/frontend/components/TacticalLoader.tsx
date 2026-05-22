'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const SEQUENCES = [
  { label: 'UPLINK ESTABLISHED', pct: 8 },
  { label: 'INITIALIZING NEURAL ENGINE', pct: 20 },
  { label: 'EXTRACTING TARGET SIGNATURES', pct: 35 },
  { label: 'ANALYZING HEURISTIC ANOMALIES', pct: 50 },
  { label: 'QUERYING THREAT INTELLIGENCE', pct: 65 },
  { label: 'DEEP THREAT REASONING', pct: 80 },
  { label: 'COMPILING INTELLIGENCE REPORT', pct: 95 },
];

export default function TacticalLoader() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setStage(s => (s < SEQUENCES.length - 1 ? s + 1 : s));
    }, 900);
    return () => clearInterval(iv);
  }, []);

  // Smooth progress interpolation
  useEffect(() => {
    const target = SEQUENCES[stage].pct;
    const step = setInterval(() => {
      setProgress(p => {
        if (p >= target) { clearInterval(step); return target; }
        return Math.min(p + 1, target);
      });
    }, 18);
    return () => clearInterval(step);
  }, [stage]);

  const current = SEQUENCES[stage];

  return (
    <motion.div
      key="working"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-12 w-full max-w-2xl text-center font-mono py-10"
    >
      {/* Cinematic Ring Loader */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Static base ring */}
        <div className="absolute inset-0 rounded-full border border-white/5" />

        {/* Outer scanning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 70%, rgba(102,51,238,0.8) 100%)',
            borderRadius: '50%',
          }}
        />
        {/* Ring mask */}
        <div className="absolute inset-[2px] rounded-full bg-black" />

        {/* Inner counter-ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
          className="absolute inset-5 rounded-full border border-white/[0.08] border-t-white/40 border-r-white/20"
        />

        {/* Pulsing glow core */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          className="absolute inset-8 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(102,51,238,0.6), transparent)' }}
        />

        {/* Center dot */}
        <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.8)]" />

        {/* Progress arc label */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white/30 tabular-nums">
          {progress.toString().padStart(2, '0')}%
        </div>
      </div>

      {/* Stage label */}
      <div className="flex flex-col items-center gap-5">
        <div className="h-5 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.35 }}
              className="text-[11px] tracking-[0.45em] text-white/70 uppercase"
            >
              {current.label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="relative w-64 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, rgba(102,51,238,0.6), rgba(255,255,255,0.9))' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
          {/* Shimmer */}
          <motion.div
            className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: [-40, 280] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Stage dots */}
        <div className="flex gap-1.5 items-center">
          {SEQUENCES.map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: i <= stage ? 1 : 0.15, scale: i === stage ? 1.4 : 1 }}
              transition={{ duration: 0.3 }}
              className={`rounded-full ${i <= stage ? 'bg-white' : 'bg-white/20'}`}
              style={{ width: i === stage ? 6 : 4, height: i === stage ? 6 : 4 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
