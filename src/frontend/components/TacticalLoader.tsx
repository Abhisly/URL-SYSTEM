'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const SEQUENCES = [
  '[ UPLINK ESTABLISHED ]',
  '[ INITIALIZING NEURAL ENGINE ]',
  '[ EXTRACTING TARGET SIGNATURES ]',
  '[ ANALYZING HEURISTIC ANOMALIES ]',
  '[ QUERYING L-3 RUNTIME ]',
  '[ DEEP THREAT REASONING ]',
  '[ COMPILING INTELLIGENCE ]'
];

export default function TacticalLoader() {
  const [stage, setStage] = useState(0);

  // Sequence progression
  useEffect(() => {
    const iv = setInterval(() => {
      setStage(s => (s < SEQUENCES.length - 1 ? s + 1 : s));
    }, 900);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div 
      key="working" 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }} 
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center gap-10 w-full max-w-2xl text-center font-mono py-12"
    >
      {/* Abstract Neural Core Animation */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          className="absolute inset-0 rounded-full border border-white/5 border-t-white/30 border-r-white/30"
        />
        {/* Inner Ring */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 5, ease: "linear", repeat: Infinity }}
          className="absolute inset-4 rounded-full border border-white/10 border-b-white/50 border-l-white/50"
        />
        {/* Core Pulse */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          className="absolute inset-10 bg-white/20 rounded-full blur-[10px]"
        />
        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="h-6 overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-[12px] tracking-[0.5em] text-white font-bold uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            >
              {SEQUENCES[stage]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-1">
          {[...Array(SEQUENCES.length)].map((_, i) => (
            <motion.div 
              key={i}
              className={`h-1 transition-all duration-500 rounded-full ${i <= stage ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/10'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
