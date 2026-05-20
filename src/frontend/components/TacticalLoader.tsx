'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const SEQUENCES = [
  '[ INITIALIZING NEURAL ENGINE ]',
  '[ EXTRACTING TARGET FEATURES ]',
  '[ ANALYZING HEURISTIC ANOMALIES ]',
  '[ QUERYING OLLAMA RUNTIME ]',
  '[ DEEP THREAT REASONING IN PROGRESS ]',
  '[ COMPILING TACTICAL INTELLIGENCE ]'
];

export default function TacticalLoader() {
  const [stage, setStage] = useState(0);
  const [stream, setStream] = useState('');

  // Hex stream effect
  useEffect(() => {
    const chars = '0123456789ABCDEF01010101';
    const iv = setInterval(() => {
      let s = '';
      for (let i = 0; i < 48; i++) s += chars[Math.floor(Math.random() * chars.length)];
      setStream(s);
    }, 40);
    return () => clearInterval(iv);
  }, []);

  // Sequence progression
  useEffect(() => {
    const iv = setInterval(() => {
      setStage(s => (s < SEQUENCES.length - 1 ? s + 1 : s));
    }, 800);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div 
      key="working" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="flex flex-col items-center gap-4 w-full max-w-2xl text-center font-mono"
    >
      <div className="relative w-full h-[2px] bg-white/10 overflow-hidden mb-2">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 h-full w-1/3 bg-white"
        />
      </div>

      <div className="h-6 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[11px] tracking-[0.4em] text-white font-bold uppercase"
          >
            {SEQUENCES[stage]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-[9px] tracking-[0.6em] text-white/30 break-all leading-[1.8]">
        {stream}
      </div>
    </motion.div>
  );
}
