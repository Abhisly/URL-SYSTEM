'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, ScanMode } from '@frontend/state/useUIStore';
import TacticalLoader from './TacticalLoader';
import SystemStatusPanel from './SystemStatusPanel';
import ThreatVisualizer from './ThreatVisualizer';
import LiveThreatFeed from './LiveThreatFeed';

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
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Focus input automatically on load and when not working
  useEffect(() => {
    if (!isWorking && !isComplete && (activeMode === 'URL' || activeMode === 'EMAIL')) {
      inputRef.current?.focus();
    }
  }, [activeMode, isWorking, isComplete]);

  const handleAction = () => {
    if (activeMode === 'URL' && urlValue.trim() && !isScanning) triggerScan();
    if (activeMode === 'EMAIL' && emailValue.trim() && !isVerifying) triggerVerify();
    if (activeMode === 'IMAGE') {
      if (imageName && !isImageScanning) triggerImageScan();
      else if (!imageName) fileInputRef.current?.click();
    }
  };

  const handleReset = () => {
    if (activeMode === 'URL') resetScan();
    if (activeMode === 'EMAIL') resetVerify();
    if (activeMode === 'IMAGE') resetImageScan();
  };

  const processFile = (f: File) => {
    if (f?.type.startsWith('image/')) { setImageName(f.name); triggerImageScan(); }
  };
  
  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const inputValue = activeMode === 'URL' ? urlValue : emailValue;
  
  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col justify-between p-8 md:p-12 overflow-hidden relative selection:bg-white selection:text-black">
      
      {/* Film grain overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03] z-0" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}
      />
      
      {/* Tactical Grid Background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <SystemStatusPanel />
      <LiveThreatFeed />

      {/* ─────────────────────────────────────────────────────────
          TOP BAR (Ultra minimal monospace)
          ───────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-start z-10 font-mono">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[0.4em] font-bold text-white uppercase">URL_SYSTEM</span>
          <span className="text-[10px] tracking-[0.4em] text-white/30 uppercase">CORE // V2.0</span>
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <span className="text-[10px] tracking-[0.4em] text-white uppercase">{time || '00:00:00.00'}</span>
          <span className="text-[10px] tracking-[0.4em] text-white/30 uppercase">SEC_LEVEL : GAMMA</span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────
          CENTER STAGE
          ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto z-10 relative">
        
        {/* Mode Selector */}
        <div className="flex gap-10 mb-20 font-mono">
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => { if (!isWorking) { handleReset(); setActiveMode(mode); } }}
              disabled={isWorking}
              className={`text-[11px] tracking-[0.5em] transition-all duration-500 uppercase ${
                activeMode === mode ? 'text-white font-bold' : 'text-white/20 hover:text-white/60'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <motion.div layout className="w-full relative flex flex-col items-center">
          <AnimatePresence mode="wait">
            {(activeMode === 'URL' || activeMode === 'EMAIL') ? (
              <motion.div
                key="text"
                layout
                initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
                animate={{ 
                  opacity: isComplete ? 0.3 : 1, 
                  filter: 'blur(0px)',
                  scale: isComplete ? 0.6 : 1,
                  y: isComplete ? -20 : 0
                }}
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
                  disabled={isWorking || isComplete}
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
                animate={{ 
                  opacity: isComplete ? 0.3 : 1, 
                  filter: 'blur(0px)',
                  scale: isComplete ? 0.6 : 1,
                  y: isComplete ? -20 : 0
                }}
                exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center"
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
                <div 
                  onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => !isWorking && !isComplete && fileInputRef.current?.click()}
                  className={`text-center cursor-pointer transition-all duration-500 w-full ${isWorking || isComplete ? 'opacity-40 pointer-events-none' : 'hover:opacity-60'}`}
                >
                   <div className={`w-full bg-transparent border-none outline-none text-center text-[clamp(28px,4vw,64px)] font-sans font-light tracking-[-0.04em] ${!imageName ? 'text-white/10' : 'text-white'}`}>
                      {imageName ? imageName : 'DROP TARGET IMAGE'}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimalist status line */}
          <motion.div layout className="w-full max-w-lg mt-8 h-[1px] bg-white/5 relative overflow-hidden">
            <motion.div
              initial={{ width: '0%', opacity: 0 }}
              animate={{ 
                width: isComplete ? '100%' : isWorking ? '80%' : isFocused ? '100%' : '0%',
                opacity: isComplete ? 0 : isWorking || isFocused ? 1 : 0
              }}
              transition={{ duration: isWorking ? 20 : 0.8, ease: 'easeOut' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-full bg-white"
            />
          </motion.div>

          {/* Status Text / Output */}
          <motion.div layout className="mt-8 min-h-[24px] flex flex-col items-center justify-start w-full font-mono">
            <AnimatePresence mode="wait">
              {isWorking && <TacticalLoader key="working" />}
              {isComplete && <ThreatVisualizer key="complete" result={activeResult} />}
            </AnimatePresence>
          </motion.div>
        </motion.div>

      </main>

      {/* ─────────────────────────────────────────────────────────
          BOTTOM BAR
          ───────────────────────────────────────────────────────── */}
      <footer className="flex justify-between items-end z-10 font-mono">
         <div className="flex flex-col gap-4">
            {isComplete ? (
              <button onClick={handleReset} className="text-[10px] tracking-[0.4em] text-white/30 hover:text-white transition-colors uppercase flex items-center gap-3">
                <span className="text-[14px]">↲</span> RESET SEQUENCE
              </button>
            ) : (
              <div className={`text-[10px] tracking-[0.4em] uppercase transition-colors duration-500 ${inputValue || activeMode === 'IMAGE' ? 'text-white' : 'text-white/20'}`}>
                {activeMode === 'IMAGE' ? 'CLICK OR DRAG TO UPLOAD' : 'PRESS [ENTER] TO INITIALIZE'}
              </div>
            )}
         </div>
         <div className="text-[9px] tracking-[0.4em] text-white/20 uppercase text-right leading-relaxed">
           AUTONOMOUS<br/>THREAT INTELLIGENCE
         </div>
      </footer>
    </div>
  );
}
