'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, ScanMode } from '@frontend/state/useUIStore';
import TacticalLoader from './TacticalLoader';
import ThreatVisualizer from './ThreatVisualizer';
import { Marquee } from './Marquee';

import { UrlSystemLogo } from './ui/url-system-logo';

const MODES: ScanMode[] = ['URL', 'EMAIL', 'IMAGE'];

export default function CoreInterface() {
  const {
    activeMode, setActiveMode,
    urlValue, setUrlValue, isScanning, triggerScan, scanComplete, resetScan, scanResult,
    emailValue, setEmailValue, isVerifying, triggerVerify, verifyComplete, resetVerify, verifyResult,
    imageName, setImageName, isImageScanning, triggerImageScan, imageScanComplete, resetImageScan, imageScanResult,
  } = useUIStore();

  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${Math.floor(d.getMilliseconds() / 10).toString().padStart(2, '0')}`);
    };
    const iv = setInterval(tick, 50);
    return () => clearInterval(iv);
  }, []);

  const isWorking = isScanning || isVerifying || isImageScanning;
  const isComplete = scanComplete || verifyComplete || imageScanComplete;
  const activeResult = activeMode === 'URL' ? scanResult : activeMode === 'EMAIL' ? verifyResult : imageScanResult;
  // Overlay active = loading OR result shown
  const overlayActive = isWorking || isComplete;

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  useEffect(() => {
    if (!isWorking && !isComplete && (activeMode === 'URL' || activeMode === 'EMAIL')) {
      inputRef.current?.focus();
    }
  }, [activeMode, isWorking, isComplete]);

  const handleAction = () => {
    if (activeMode === 'URL' && urlValue.trim() && !isScanning) triggerScan();
    if (activeMode === 'EMAIL' && emailValue.trim() && !isVerifying) triggerVerify();
    if (activeMode === 'IMAGE') {
      const file = fileInputRef.current?.files?.[0];
      if (file && !isImageScanning) triggerImageScan(file);
      else if (!file) fileInputRef.current?.click();
    }
  };

  const handleReset = () => {
    if (activeMode === 'URL') resetScan();
    if (activeMode === 'EMAIL') resetVerify();
    if (activeMode === 'IMAGE') resetImageScan();
  };

  const processFile = (f: File) => {
    if (f?.type.startsWith('image/')) { setImageName(f.name); triggerImageScan(f); }
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const inputValue = activeMode === 'URL' ? urlValue : emailValue;

  return (
    <div className="h-screen w-screen text-white overflow-hidden relative selection:bg-white selection:text-black">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />

      {/* ── Marquee ── */}
      <div className="absolute bottom-0 left-0 w-screen overflow-hidden pointer-events-none z-0 opacity-20">
        <Marquee text="GLOBAL THREAT NETWORK MONITORING // DEEP NEURAL SCANNING // SECURE UPLINK ESTABLISHED // " />
      </div>

      {/* ── Logo Top Left ── */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-30 pointer-events-auto flex flex-col justify-center items-start">
        <UrlSystemLogo
          className="h-14 md:h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          style={{ aspectRatio: '950/250' }}
          speed={1.1}
        />
      </div>

      {/* ── Top Bar Right ── */}
      <header className="absolute top-8 right-8 md:top-12 md:right-12 flex justify-end items-start z-30 font-mono pointer-events-auto">
        <div className="flex flex-col gap-1.5 items-end">
          <span className="text-[10px] tracking-[0.4em] text-white uppercase">{time || '00:00:00.00'}</span>
          <span className="text-[10px] tracking-[0.4em] text-white/30 uppercase">SEC_LEVEL : GAMMA</span>
        </div>
      </header>


      {/* ── Background Input Stage (always rendered, blurs behind overlay) ── */}
      <main className="absolute inset-0 w-screen h-screen flex flex-col items-center justify-center z-10 pointer-events-none">
        <motion.div
          layout
          className="w-full max-w-5xl relative flex flex-col items-center pointer-events-auto"
          animate={{
            filter: overlayActive ? 'blur(8px)' : 'blur(0px)',
            opacity: overlayActive ? 0.25 : 1,
            scale: overlayActive ? 0.97 : 1,
          }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mode Selector */}
          <div className="absolute bottom-full left-0 w-full mb-16 flex justify-center items-center gap-8 font-mono">
            {MODES.map((mode) => {
              const isActive = activeMode === mode;
              const isHovered = hoveredMode === mode;
              return (
                <motion.button
                  key={mode}
                  onClick={() => { if (!isWorking) { handleReset(); setActiveMode(mode); } }}
                  onMouseEnter={() => setHoveredMode(mode)}
                  onMouseLeave={() => setHoveredMode(null)}
                  disabled={overlayActive}
                  animate={{ opacity: isActive ? 1 : isHovered ? 0.75 : 0.35 }}
                  transition={{ duration: 0.25 }}
                  className="relative uppercase text-[14px] tracking-[0.35em] text-white font-mono"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {/* Hover pill — appears on mouseover, disappears on leave */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        key="pill"
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: 0,
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.22)',
                          boxShadow: '0 0 24px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',
                          margin: '-10px -36px',
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10" style={{ padding: '10px 36px' }}>{mode}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Input */}
          <AnimatePresence mode="wait">
            {(activeMode === 'URL' || activeMode === 'EMAIL') ? (
              <motion.div
                key="text"
                layout
                initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex justify-center"
              >
                <input
                  ref={inputRef}
                  type={activeMode === 'EMAIL' ? 'email' : 'text'}
                  value={inputValue}
                  onChange={e => activeMode === 'URL' ? setUrlValue(e.target.value) : setEmailValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAction()}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={overlayActive}
                  placeholder={activeMode === 'URL' ? 'ENTER TARGET URL' : 'ENTER TARGET EMAIL'}
                  className="w-full max-w-4xl bg-transparent border-none outline-none text-center text-[clamp(28px,4vw,64px)] font-sans font-light tracking-[-0.04em] placeholder-white/10 text-white disabled:opacity-40"
                  autoComplete="off"
                  spellCheck="false"
                />
              </motion.div>
            ) : (
              <motion.div
                key="image"
                layout
                initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center"
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                  if (e.target.files?.[0]) {
                    processFile(e.target.files[0]);
                    e.target.value = '';
                  }
                }} />
                <div
                  onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => !overlayActive && fileInputRef.current?.click()}
                  className={`text-center cursor-pointer transition-all duration-500 w-full ${overlayActive ? 'opacity-40 pointer-events-none' : 'hover:opacity-60'}`}
                >
                  <div className={`w-full bg-transparent border-none outline-none text-center text-[clamp(28px,4vw,64px)] font-sans font-light tracking-[-0.04em] ${!imageName ? 'text-white/10' : 'text-white'}`}>
                    {imageName ? imageName : 'DROP TARGET IMAGE'}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status line */}
          <motion.div layout className="absolute top-full mt-8 left-1/2 -translate-x-1/2 w-full max-w-lg h-[1px] bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: '0%', opacity: 0 }}
              animate={{
                width: isFocused ? '100%' : '0%',
                opacity: isFocused ? 1 : 0
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-full bg-white"
            />
          </motion.div>
        </motion.div>
      </main>

      {/* ── Full-screen dark blur overlay (loading + result) ── */}
      <AnimatePresence>
        {overlayActive && (
          <motion.div
            key="overlay-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-20 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Loading overlay (centered, above blur) ── */}
      <AnimatePresence>
        {isWorking && (
          <motion.div
            key="loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <TacticalLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result Card Overlay ── */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            key="result-card-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 overflow-y-auto pointer-events-auto"
          >
            <div className="min-h-full w-full flex flex-col items-center justify-center gap-8 px-6 md:px-10 py-16 md:py-24">
              {/* ── Flat Intelligence Report ── */}
              <motion.div
                initial={{ opacity: 0, y: 32, filter: 'blur(14px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl"
              >
                <ThreatVisualizer
                  result={activeResult}
                  targetUrl={activeMode === 'URL' ? urlValue : undefined}
                />
              </motion.div>

              {/* ── New Scan button ── */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleReset}
                className="group flex items-center gap-4"
              >
                {/* Icon circle */}
                <div
                  className="relative flex items-center justify-center w-14 h-14 rounded-full group-hover:scale-105 transition-transform duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                    className="text-white/40 group-hover:text-white transition-colors duration-300"
                  >
                    <path d="M17 10H3M10 3L3 10l7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: '0 0 24px rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.2)' }}
                  />
                </div>
                <span className="text-[12px] tracking-[0.5em] font-mono uppercase text-white/25 group-hover:text-white/60 transition-colors duration-300">
                  New Scan
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
