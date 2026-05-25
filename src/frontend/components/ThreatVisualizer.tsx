'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// ── Smooth animated counter ──────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setValue(Math.round(target * eased));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ── Typing effect ────────────────────────────────────────────────────
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

// ── External URL helper ──────────────────────────────────────────────
function formatExternalUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// ── Threat Score Ring ────────────────────────────────────────────────
function ThreatRing({ score, isSafe, isInvalid }: { score: number; isSafe: boolean; isInvalid: boolean }) {
  const R = 44, C = 2 * Math.PI * R;
  const count = useCountUp(score, 1400);
  const glowColor = isInvalid ? '#facc15' : isSafe ? '#a78bfa' : score > 75 ? '#f87171' : '#fb923c';
  const trackColor = isInvalid ? 'rgba(250,204,21,0.15)' : isSafe ? 'rgba(167,139,250,0.15)' : score > 75 ? 'rgba(248,113,113,0.15)' : 'rgba(251,146,60,0.15)';
  const offset = C - (C * (isSafe ? 0 : score / 100));

  if (isInvalid) {
    return (
      <div className="flex flex-col items-center justify-center w-[100px] h-[100px] shrink-0">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[8px] tracking-[0.3em] uppercase mt-2" style={{ color: 'rgba(250,204,21,0.6)' }}>INVALID</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-[100px] h-[100px] shrink-0">
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={R} fill="none" stroke={trackColor} strokeWidth="5" />
        <motion.circle
          cx="50" cy="50" r={R} fill="none"
          stroke={glowColor} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[22px] font-light tabular-nums" style={{ color: glowColor }}>
          {count}<span className="text-[11px] opacity-50">%</span>
        </span>
        <span className="text-[7px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>THREAT</span>
      </div>
    </div>
  );
}

// ── Visit Site Link ──────────────────────────────────────────────────
function VisitSiteLink({ url }: { url: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.a
      href={formatExternalUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative uppercase text-[15px] tracking-[0.4em] font-mono flex items-center gap-4 cursor-pointer select-none text-white/50 hover:text-white transition-colors duration-300 py-3 px-8 rounded-full focus:outline-none focus-visible:outline-none"
      style={{
        border: 'none',
        outline: 'none',
      }}
    >
      {/* Floating Pill Background & Border on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.span
            key="hover-pill"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 0,
              margin: '-12px -36px',
              background: 'rgba(255,255,255,0.07)',
              border: '1.5px solid rgba(255,255,255,0.28)',
              boxShadow: '0 0 32px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 font-semibold mr-[-0.4em]">VISIT SECURED SITE</span>
      <svg
        className="relative z-10 w-5 h-5 transition-transform duration-300"
        style={{ transform: isHovered ? 'translate(2px, -2px)' : 'none' }}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </motion.a>
  );
}

// ── Main ThreatVisualizer ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ThreatVisualizer({ result, targetUrl }: { result: any; targetUrl?: string }) {
  const isSafe = result?.status === 'SAFE' || result?.status === 'GENUINE';
  const isInvalid = result?.status === 'INVALID';
  const isMalicious = result?.status === 'MALICIOUS';
  const isSuspicious = result?.status === 'SUSPICIOUS' || result?.status === 'SPOOFED';

  const threatScore = typeof result?.threatScore === 'number'
    ? result.threatScore
    : typeof result?.confidence === 'number' ? (isSafe ? 100 - result.confidence : result.confidence) : 0;
  const confidence = result?.confidence ?? 0;
  const riskLevel: string = isInvalid ? 'N/A' : (result?.riskLevel ?? 'UNKNOWN');
  const explanation = useTypingEffect((result?.aiExplanation as string) || 'Target verified. No threats detected.', 8);

  // Single colour source of truth
  const accent = isInvalid ? '#facc15' : isSafe ? '#a78bfa' : isMalicious ? '#f87171' : isSuspicious ? '#fb923c' : '#a78bfa';
  const statusLabel = isInvalid ? 'INVALID' : isSafe ? 'SECURE' : isMalicious ? 'MALICIOUS' : result?.status ?? 'UNKNOWN';
  const statusSub = isInvalid ? 'Domain unreachable' : isSafe ? 'No threats detected' : isMalicious ? 'Threat confirmed' : isSuspicious ? 'Suspicious activity' : 'Analysis complete';

  const fadeUp = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: (i: number) => ({
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as const }
    })
  };

  return (
    <div className="w-full font-mono flex flex-col gap-14">

      {/* ── SECTION 1: Score ring + Status + Confidence ── */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row items-center justify-between gap-12"
      >
        {/* Left side: Threat Ring + Status Label */}
        <div className="flex items-center gap-8">
          <ThreatRing score={threatScore} isSafe={isSafe} isInvalid={isInvalid} />
          
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] tracking-[0.55em] uppercase text-white/30">
              Analysis Result
            </span>
            <span className="text-[44px] md:text-[54px] font-extralight tracking-[-0.03em] leading-none" style={{ color: accent }}>
              {statusLabel}
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-white/40">
              {statusSub}
            </span>
          </div>
        </div>

        {/* Right side: Confidence & Risk Level */}
        <div className="flex flex-col items-center md:items-end gap-3.5 shrink-0">
          <span className="text-[10px] tracking-[0.45em] uppercase text-white/30">
            Confidence
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-[44px] font-extralight tabular-nums text-white leading-none">
              {confidence}
            </span>
            <span className="text-[18px] opacity-30">%</span>
          </div>
          <div className="w-36 h-[3px] rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: accent }}
            />
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/25">
            Risk Assessment:&nbsp;<span style={{ color: accent }}>{riskLevel}</span>
          </span>
        </div>
      </motion.div>

      {/* ── SECTION 2: Neural Analysis ── */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        <span className="text-[10px] tracking-[0.55em] uppercase text-white/30">
          Neural Analysis
        </span>
        <p className="text-[16px] md:text-[18px] font-sans font-light leading-[2.1] text-white/80 tracking-wide">
          {explanation}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.65, repeat: Infinity }}
            className="inline-block w-[2px] h-[14px] ml-1 align-middle rounded-full"
            style={{ background: accent }}
          />
        </p>
      </motion.div>

      {/* ── SECTION 2.5: Visit CTA ── */}
      {isSafe && targetUrl && (
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex justify-center pt-2"
        >
          <VisitSiteLink url={targetUrl} />
        </motion.div>
      )}

    </div>
  );
}
