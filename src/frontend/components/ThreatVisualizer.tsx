'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Typing effect hook
function useTypingEffect(text: string, speed = 15) {
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
export default function ThreatVisualizer({ result }: { result: Record<string, any> | undefined }) {
  const isSafe = result?.status === 'SAFE' || result?.status === 'GENUINE';
  const explanation = useTypingEffect(result?.aiExplanation || 'Target verified. No threats detected.', 10);

  return (
    <motion.div key="complete" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.15 }}
      className="flex flex-col items-center gap-8 w-full max-w-4xl mt-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col md:flex-row items-center justify-center gap-6 w-full"
      >
        {/* Radar/Scan indicator */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            className={`absolute inset-0 rounded-full border-t-2 border-r-2 opacity-50 ${isSafe ? 'border-white' : 'border-red-500'}`}
          />
          <div className={`w-2 h-2 rounded-full ${isSafe ? 'bg-white' : 'bg-red-500 animate-pulse'}`} />
        </div>

        {/* Status Badge */}
        <div className={`px-6 py-3 border flex items-center gap-4 transition-colors duration-1000 ${
          isSafe 
            ? 'border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.03)]' 
            : 'border-red-500/50 text-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
        }`}>
          <span className="text-[14px] tracking-[0.5em] font-bold uppercase">
            {isSafe ? 'TARGET SECURE' : result?.status || 'UNKNOWN THREAT'}
          </span>
        </div>

        {/* Confidence Score */}
        {result?.confidence && (
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase">NEURAL CONFIDENCE</span>
            <span className="text-white font-mono text-lg">{result.confidence}%</span>
          </div>
        )}
      </motion.div>

      {/* AI Explanation Terminal */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`relative w-full p-6 border ${isSafe ? 'border-white/10 bg-white/[0.02] before:border-white/40 after:border-white/40' : 'border-red-500/20 bg-red-500/[0.05] before:border-red-500/60 after:border-red-500/60'} before:content-[''] before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t before:border-l after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:border-b after:border-r`}
      >
        <div className="absolute -top-2 left-4 px-2 bg-black text-[9px] tracking-[0.3em] text-white/40 uppercase">
          AI_TACTICAL_OUTPUT
        </div>
        <div className={`text-[13px] md:text-[14px] leading-[2] tracking-[0.05em] font-sans font-light ${
            isSafe ? 'text-white/70' : 'text-red-200/90'
        }`}>
          {explanation}
          <motion.span 
            animate={{ opacity: [1, 0] }} 
            transition={{ duration: 0.8, repeat: Infinity }}
            className={`inline-block w-1.5 h-3 ml-1 align-middle ${isSafe ? 'bg-white/50' : 'bg-red-500/50'}`}
          />
        </div>
      </motion.div>

      {/* Detected Patterns */}
      {result?.detectedPatterns && result.detectedPatterns.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mt-2"
        >
          {result.detectedPatterns.map((pattern: string, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + (idx * 0.1) }}
              className={`text-[9px] tracking-[0.25em] px-4 py-1.5 border uppercase ${
                isSafe ? 'border-white/10 text-white/40 bg-white/5' : 'border-red-500/30 text-red-400 bg-red-500/10'
              }`}
            >
              [ {pattern.replace(/_/g, ' ')} ]
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
