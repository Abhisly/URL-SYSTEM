'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// Hardcoded initial threats for cinematic feel before live scans happen
const INITIAL_THREATS = [
  { id: 1, text: '[ GLOBAL ] NEW PHISHING CAMPAIGN DETECTED IN EMEA', time: '12s ago', type: 'critical' },
  { id: 2, text: '[ MEMORY ] RECURRING PAYPAL SPOOFING IDENTIFIED', time: '45s ago', type: 'warning' },
  { id: 3, text: '[ AI_CORE ] NEURAL CONFIDENCE INCREASED ON TARGET A', time: '2m ago', type: 'info' }
];

export default function LiveThreatFeed() {
  const [feed, setFeed] = useState(INITIAL_THREATS);

  // Simulate incoming live threat reports
  useEffect(() => {
    const threats = [
      '[ SCAN ] SUSPICIOUS DOMAIN FLAGGED BY HEURISTICS',
      '[ MEMORY ] THREAT VECTOR MATCHED WITH HISTORICAL RECORD',
      '[ AI_CORE ] AUTONOMOUS AGENT ADJUSTED RISK SCORE',
      '[ GLOBAL ] CREDENTIAL HARVESTING ATTEMPT BLOCKED',
      '[ MEMORY ] AI CONFIDENCE UPDATED BASED ON RECURRING PATTERN'
    ];

    const iv = setInterval(() => {
      const newThreat = {
        id: Date.now(),
        text: threats[Math.floor(Math.random() * threats.length)],
        time: 'just now',
        type: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'warning' : 'info'
      };
      
      setFeed(prev => [newThreat, ...prev].slice(0, 5));
    }, 12000); // New event every 12 seconds

    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed top-8 right-8 md:top-12 md:right-12 z-40 w-64 md:w-80 font-mono hidden sm:block">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <span className="text-[10px] tracking-[0.4em] text-white/50 uppercase">LIVE THREAT FEED</span>
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      </div>
      
      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {feed.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex flex-col gap-1"
            >
              <div className={`text-[9px] tracking-[0.2em] leading-relaxed uppercase ${
                item.type === 'critical' ? 'text-red-400' : item.type === 'warning' ? 'text-orange-400' : 'text-white/40'
              }`}>
                {item.text}
              </div>
              <div className="text-[8px] tracking-[0.3em] text-white/20 uppercase">
                {item.time}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
