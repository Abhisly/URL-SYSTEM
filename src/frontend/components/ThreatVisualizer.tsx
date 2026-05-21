'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Typing effect hook
function useTypingEffect(text: string, speed = 12) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);

  return displayed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ThreatVisualizer({ result }: { result: any }) {
  const isSafe = result?.status === 'SAFE' || result?.status === 'GENUINE';
  const explanation = useTypingEffect((result?.aiExplanation as string) || 'Target verified. No threats detected.', 10);
  const patterns = Array.isArray(result?.detectedPatterns) ? result?.detectedPatterns : [];

  return (
    <motion.div key="complete" 
      initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} 
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }}
      className="flex flex-col items-center gap-8 w-full max-w-4xl mt-8 font-mono"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex flex-col md:flex-row items-center justify-between w-full gap-6 px-8 py-6 bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] ${isSafe ? 'bg-gradient-to-r from-transparent via-white/50 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'bg-gradient-to-r from-transparent via-red-500/80 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.8)]'}`} />
        
        <div className="flex items-center gap-6 z-10">
          {/* Radar/Scan indicator */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 6, ease: "linear", repeat: Infinity }}
              className={`absolute inset-0 rounded-full border border-dashed opacity-40 ${isSafe ? 'border-white' : 'border-red-500'}`}
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              className={`absolute inset-2 rounded-full border-t-2 opacity-80 ${isSafe ? 'border-white' : 'border-red-500'}`}
            />
            <div className={`w-3 h-3 rounded-full ${isSafe ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,1)]' : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse'}`} />
          </div>

          <div className="flex flex-col">
             <span className="text-[10px] tracking-[0.4em] text-white/40 uppercase mb-1">ANALYSIS RESULT</span>
             <span className={`text-[18px] md:text-[22px] tracking-[0.3em] font-bold uppercase ${isSafe ? 'text-white' : 'text-red-500'}`}>
                {isSafe ? 'TARGET SECURE' : (result?.status as string) || 'UNKNOWN THREAT'}
             </span>
          </div>
        </div>

        {/* Confidence Score */}
        {result?.confidence && (
          <div className="flex flex-col items-center md:items-end gap-1 z-10 border-l border-white/10 pl-8">
            <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase">CONFIDENCE</span>
            <span className="text-white font-mono text-3xl font-light tracking-tighter">{result.confidence}%</span>
          </div>
        )}
      </motion.div>

      {/* AI Explanation Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className={`relative w-full p-8 md:p-10 rounded-xl border ${isSafe ? 'border-white/10 bg-white/[0.01]' : 'border-red-500/20 bg-red-500/[0.02]'} backdrop-blur-sm overflow-hidden`}
      >
        <div className={`absolute top-0 left-0 w-1 h-full ${isSafe ? 'bg-white/20' : 'bg-red-500/50'}`} />
        <div className={`text-[13px] md:text-[15px] leading-[2.2] tracking-[0.05em] font-sans font-light ${isSafe ? 'text-white/80' : 'text-red-100/90'}`}>
          {explanation}
          <motion.span 
            animate={{ opacity: [1, 0] }} 
            transition={{ duration: 0.8, repeat: Infinity }}
            className={`inline-block w-2 h-4 ml-2 align-middle ${isSafe ? 'bg-white/50' : 'bg-red-500/80'}`}
          />
        </div>
      </motion.div>

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 w-full"
        >
          {patterns.map((pattern: unknown, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + (idx * 0.1), type: 'spring' }}
              className={`text-[9px] tracking-[0.2em] px-4 py-2 rounded-full border uppercase backdrop-blur-sm ${
                isSafe ? 'border-white/10 text-white/50 bg-white/5' : 'border-red-500/30 text-red-400 bg-red-500/10'
              }`}
            >
              {(pattern as string).replace(/_/g, ' ')}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
