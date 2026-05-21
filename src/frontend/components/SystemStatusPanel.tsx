'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SystemStatusPanel() {
  const [aiStatus, setAiStatus] = useState<string>('initializing...');

  useEffect(() => {
    fetch('/api/system-status')
      .then(res => res.json())
      .then(data => setAiStatus(data.services?.ai_orchestrator || 'offline'))
      .catch(() => setAiStatus('offline'));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="fixed bottom-8 left-8 md:bottom-12 md:left-12 z-50 flex flex-col gap-2 font-mono"
    >
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
          aiStatus === 'online' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
          : aiStatus.includes('simulated') ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' 
          : 'bg-red-500'
        }`} />
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/60">
          AI ENGINE: {aiStatus.split(' ')[0]}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-white/20" />
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/30">
          UPLINK: ACTIVE
        </span>
      </div>
      
      <div className="mt-2 text-[8px] tracking-[0.5em] text-white/10 uppercase">
        X: 47.9234 Y: -12.449
      </div>
    </motion.div>
  );
}
