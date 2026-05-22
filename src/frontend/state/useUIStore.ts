import { create } from 'zustand';
import Tesseract from 'tesseract.js';

export type ScanMode = 'URL' | 'EMAIL' | 'IMAGE';

interface UIStore {
  activeMode: ScanMode;
  setActiveMode: (mode: ScanMode) => void;
  urlValue: string;
  isScanning: boolean;
  scanComplete: boolean;
  scanResult?: Record<string, unknown> | undefined;
  setUrlValue: (v: string) => void;
  triggerScan: () => void;
  resetScan: () => void;

  emailValue: string;
  isVerifying: boolean;
  verifyComplete: boolean;
  verifyResult?: Record<string, unknown> | undefined;
  setEmailValue: (v: string) => void;
  triggerVerify: () => void;
  resetVerify: () => void;

  imageName: string;
  isImageScanning: boolean;
  imageScanComplete: boolean;
  imageScanResult?: Record<string, unknown> | undefined;
  setImageName: (v: string) => void;
  triggerImageScan: (file?: File) => void;
  resetImageScan: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activeMode: 'URL',
  setActiveMode: (mode) => set({ activeMode: mode }),
  urlValue: '',
  isScanning: false,
  scanComplete: false,
  scanResult: undefined,
  setUrlValue: (v) => set({ urlValue: v }),
  triggerScan: async () => {
    set({ isScanning: true, scanComplete: false, scanResult: undefined });
    try {
      const { urlValue } = get();
      const res = await fetch('/api/scan-url', { method: 'POST', body: JSON.stringify({ url: urlValue }) });
      const data = await res.json();
      set({ isScanning: false, scanComplete: true, scanResult: data });
    } catch {
      set({ isScanning: false, scanComplete: true, scanResult: { error: true } });
    }
  },
  resetScan: () => set({ urlValue: '', isScanning: false, scanComplete: false, scanResult: undefined }),

  emailValue: '',
  isVerifying: false,
  verifyComplete: false,
  verifyResult: undefined,
  setEmailValue: (v) => set({ emailValue: v }),
  triggerVerify: async () => {
    set({ isVerifying: true, verifyComplete: false, verifyResult: undefined });
    try {
      const { emailValue } = get();
      const res = await fetch('/api/verify-email', { method: 'POST', body: JSON.stringify({ email: emailValue }) });
      const data = await res.json();
      set({ isVerifying: false, verifyComplete: true, verifyResult: data });
    } catch {
      set({ isVerifying: false, verifyComplete: true, verifyResult: { error: true } });
    }
  },
  resetVerify: () => set({ emailValue: '', isVerifying: false, verifyComplete: false, verifyResult: undefined }),

  imageName: '',
  isImageScanning: false,
  imageScanComplete: false,
  imageScanResult: undefined,
  setImageName: (v) => set({ imageName: v }),
  triggerImageScan: async (file?: File) => {
    set({ isImageScanning: true, imageScanComplete: false, imageScanResult: undefined });
    
    if (!file) {
      set({ isImageScanning: false, imageScanComplete: true, imageScanResult: { status: 'SAFE', aiExplanation: 'No image provided.' } });
      return;
    }

    try {
      // 1. Run OCR directly on the client side
      const tesseractResult = await Tesseract.recognize(file, 'eng');
      const ocrText = tesseractResult.data.text;

      // 2. Send text to backend for AI scoring
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocrText, filename: file.name }),
      });
      
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      set({ isImageScanning: false, imageScanComplete: true, imageScanResult: data });
    } catch (err) {
      console.error(err);
      set({ isImageScanning: false, imageScanComplete: true, imageScanResult: { error: true, aiExplanation: 'Failed to extract content or analyze image.' } });
    }
  },
  resetImageScan: () => set({ imageName: '', isImageScanning: false, imageScanComplete: false, imageScanResult: undefined }),
}));
