'use client';

import { useEffect, useState } from 'react';
import { PIXEL_HUD } from '@/styles/pixelHud';
import { useGameStore } from '../store/gameStore';

function ActiveQTE({ resolveQTE }: { resolveQTE: (success: boolean) => void }) {
  const [taps, setTaps] = useState(0);
  const requiredTaps = 12;
  const timeLimitMs = 2500;
  const [timeLeft, setTimeLeft] = useState(100); // Percentage

  useEffect(() => {
    // Timer Logic
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / timeLimitMs) * 100);
      setTimeLeft(remaining);

      if (elapsed >= timeLimitMs) {
        clearInterval(timer);
        resolveQTE(false); // Failed
      }
    }, 50);

    return () => clearInterval(timer);
  }, [resolveQTE]);

  useEffect(() => {
    if (taps >= requiredTaps) {
      resolveQTE(true);
    }
  }, [taps, resolveQTE, requiredTaps]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setTaps((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${PIXEL_HUD.overlayBackdrop}`}>
      <div className="animate-bounce">
        <h1 className="text-center font-mono text-5xl sm:text-7xl font-black tracking-[0.14em] text-[#d36d57]">
          TRAP TRIGGERED
        </h1>
        <p className="mt-4 text-center font-mono text-lg sm:text-2xl font-bold tracking-[0.14em] text-[#e6d6a8]">
          MASH [SPACEBAR] TO ESCAPE!
        </p>
      </div>

      {/* Tap Progress */}
      <div className={`relative mt-12 h-12 w-1/2 max-w-2xl overflow-hidden ${PIXEL_HUD.panelDanger}`}>
        <div
          className="h-full bg-gradient-to-r from-[#8f2f26] via-[#b26a3d] to-[#d2a154] transition-all duration-75"
          style={{ width: `${(taps / requiredTaps) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xl text-[#f0e8cd]/75">
          {taps} / {requiredTaps}
        </div>
      </div>

      {/* Time Remaining Bar */}
      <div className={`mt-6 h-3 w-1/3 overflow-hidden ${PIXEL_HUD.barTrack}`}>
        <div
          className={`${timeLeft < 30 ? 'bg-[#b14635] animate-pulse' : 'bg-[#74a248]'} h-full transition-all duration-[50ms]`}
          style={{ width: `${timeLeft}%` }}
        />
      </div>
    </div>
  );
}

// Reserved for future chapters. Keep logic compiled but not mounted in Chapter 1 UI.
export function QTEOverlay() {
  const { qteActive, resolveQTE } = useGameStore();

  if (!qteActive) return null;

  return <ActiveQTE resolveQTE={resolveQTE} />;
}
