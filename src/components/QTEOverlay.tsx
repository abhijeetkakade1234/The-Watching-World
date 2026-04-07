'use client';

import { useEffect, useState } from 'react';
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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-md">
      <div className="animate-bounce">
        <h1 className="text-7xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] tracking-widest text-center">
          TRAP TRIGGERED
        </h1>
        <p className="text-2xl text-red-200 mt-4 text-center font-bold tracking-widest">
          MASH [SPACEBAR] TO ESCAPE!
        </p>
      </div>

      {/* Tap Progress */}
      <div className="w-1/2 max-w-2xl mt-12 bg-gray-900 border-4 border-red-900 rounded-full h-12 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,1)] relative">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-yellow-400 transition-all duration-75"
          style={{ width: `${(taps / requiredTaps) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white/50 font-black text-xl mix-blend-overlay">
          {taps} / {requiredTaps}
        </div>
      </div>

      {/* Time Remaining Bar */}
      <div className="w-1/3 mt-6 bg-gray-900 border-2 border-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className={`${timeLeft < 30 ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'} h-full transition-all duration-[50ms]`}
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
