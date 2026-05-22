'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Smooth animated number counter
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const from = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - pct, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

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

// Animated circular threat score ring
function ThreatRing({ score, isSafe }: { score: number; isSafe: boolean }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const strokeDashoffset = circumference - (animated / 100) * circumference;
  const color = isSafe ? 'rgba(255,255,255,0.9)' : score > 75 ? '#ef4444' : '#f97316';
  const glowColor = isSafe ? 'rgba(255,255,255,0.4)' : score > 75 ? 'rgba(239,68,68,0.5)' : 'rgba(249,115,22,0.5)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        {/* Background track */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        {/* Animated progress arc */}
        <motion.circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        />
      </svg>
      {/* Center content */}
      <div className="flex flex-col items-center z-10">
        <ThreatScoreNumber score={score} isSafe={isSafe} />
        <span className="text-[9px] tracking-[0.35em] text-white/30 uppercase mt-0.5">THREAT</span>
      </div>
    </div>
  );
}

function ThreatScoreNumber({ score, isSafe }: { score: number; isSafe: boolean }) {
  const count = useCountUp(score, 1400);
  const color = isSafe ? 'text-white' : score > 75 ? 'text-red-400' : 'text-orange-400';
  return (
    <span className={`text-3xl font-light font-mono tabular-nums ${color}`}>
      {count}<span className="text-sm opacity-50">%</span>
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ThreatVisualizer({ result }: { result: any }) {
  const isSafe = result?.status === 'SAFE' || result?.status === 'GENUINE';
  const threatScore = typeof result?.threatScore === 'number' ? result.threatScore
    : typeof result?.confidence === 'number' ? (isSafe ? 100 - result.confidence : result.confidence) : 0;
  const confidence = result?.confidence ?? 0;
  const riskLevel: string = result?.riskLevel ?? 'UNKNOWN';
  const patterns: string[] = Array.isArray(result?.detectedPatterns) ? result.detectedPatterns : [];
  const reasons: { description: string; severity: string }[] = Array.isArray(result?.reasons) ? result.reasons : [];
  const explanation = useTypingEffect((result?.aiExplanation as string) || 'Target verified. No threats detected.', 8);

  const accentColor = isSafe ? 'rgba(255,255,255,0.9)' : threatScore > 75 ? '#ef4444' : '#f97316';
  const accentMuted = isSafe ? 'rgba(255,255,255,0.08)' : threatScore > 75 ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)';
  const borderColor = isSafe ? 'rgba(255,255,255,0.07)' : threatScore > 75 ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)';
  const textAccent = isSafe ? 'text-white' : threatScore > 75 ? 'text-red-400' : 'text-orange-400';
  const statusLabel = isSafe ? 'SECURE' : result?.status ?? 'THREAT DETECTED';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 w-full max-w-4xl mt-6 font-mono"
    >
      {/* ── ROW 1: Status header + Threat ring + Confidence ── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row items-center gap-6 w-full"
        style={{
          background: accentMuted,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          padding: '28px 36px',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
          opacity: 0.5,
        }} />

        {/* Threat Score Ring */}
        <ThreatRing score={threatScore} isSafe={isSafe} />

        {/* Divider */}
        <div className="hidden md:block w-[1px] self-stretch" style={{ background: borderColor }} />

        {/* Status text block */}
        <div className="flex flex-col flex-1 items-center md:items-start gap-2 text-center md:text-left">
          <span className="text-[9px] tracking-[0.45em] text-white/30 uppercase">Analysis Result</span>
          <span className={`text-[26px] md:text-[32px] font-bold tracking-[0.25em] uppercase leading-none ${textAccent}`}>
            {statusLabel}
          </span>
          <div className="flex flex-wrap gap-3 mt-2 justify-center md:justify-start">
            <span className="text-[9px] tracking-[0.35em] text-white/25 uppercase">Risk:
              <span className={`ml-2 ${textAccent} font-bold`}>{riskLevel}</span>
            </span>
            <span className="text-[9px] tracking-[0.35em] text-white/25 uppercase">Confidence:
              <span className="ml-2 text-white font-bold">{confidence}%</span>
            </span>
          </div>
        </div>

        {/* Confidence arc (right) */}
        <div className="flex flex-col items-center gap-1 md:border-l md:border-white/10 md:pl-8">
          <span className="text-[9px] tracking-[0.35em] text-white/30 uppercase">Confidence</span>
          <span className="text-4xl font-light text-white tabular-nums">{confidence}<span className="text-lg opacity-40">%</span></span>
          {/* Mini bar */}
          <div className="w-20 h-[2px] bg-white/10 rounded-full overflow-hidden mt-1">
            <motion.div
              className="h-full rounded-full bg-white/70"
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── ROW 2: AI Explanation ── */}
      <motion.div
        variants={itemVariants}
        style={{
          background: 'rgba(255,255,255,0.012)',
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          padding: '28px 36px',
          backdropFilter: 'blur(8px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
          opacity: 0.5,
        }} />

        <span className="text-[9px] tracking-[0.45em] text-white/25 uppercase block mb-4">Neural Analysis</span>
        <p className="text-[14px] md:text-[16px] leading-[2] tracking-[0.03em] font-sans font-light text-white/80">
          {explanation}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="inline-block w-[2px] h-[16px] ml-1.5 align-middle"
            style={{ background: accentColor }}
          />
        </p>
      </motion.div>

      {/* ── ROW 3: Reasons + Patterns ── */}
      <AnimatePresence>
        {reasons.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <span className="text-[9px] tracking-[0.45em] text-white/25 uppercase">Threat Indicators</span>
            <div className="flex flex-col gap-2">
              {reasons.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                  style={{ border: `1px solid ${borderColor}`, borderRadius: 10 }}
                  className="flex items-start gap-4 px-5 py-3 bg-white/[0.015]"
                >
                  <span className={`text-[9px] font-bold tracking-[0.3em] uppercase mt-0.5 shrink-0 ${
                    r.severity === 'high' ? 'text-red-400' : r.severity === 'medium' ? 'text-orange-400' : 'text-white/40'
                  }`}>
                    {r.severity}
                  </span>
                  <span className="text-[12px] tracking-[0.05em] text-white/60 font-sans font-light leading-relaxed">{r.description}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 justify-center md:justify-start">
          {patterns.map((pattern, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + idx * 0.07, type: 'spring', stiffness: 200 }}
              style={{ border: `1px solid ${borderColor}` }}
              className={`text-[9px] tracking-[0.25em] px-4 py-2 rounded-full uppercase backdrop-blur-sm ${
                isSafe ? 'text-white/40 bg-white/5' : 'text-orange-400/80 bg-orange-500/5'
              }`}
            >
              {pattern.replace(/_/g, ' ')}
            </motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
