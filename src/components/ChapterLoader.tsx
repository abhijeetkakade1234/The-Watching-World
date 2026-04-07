'use client';

import { useEffect } from 'react';

interface ChapterLoaderProps {
  variant: 'boot' | 'transition';
  message?: string;
  onReady?: () => void;
}

export function ChapterLoader({ variant, message, onReady }: ChapterLoaderProps) {
  const isBoot = variant === 'boot';
  const defaultMessage = isBoot ? 'THE WORLD IS WATCHING...' : 'LOADING...';

  useEffect(() => {
    if (!isBoot || !onReady) return;
    const timeout = window.setTimeout(() => onReady(), 1450);
    return () => window.clearTimeout(timeout);
  }, [isBoot, onReady]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden pointer-events-none"
      aria-label="Loading chapter 1 map"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,#335f2d_0%,#17351a_33%,#0d1a10_62%,#09110c_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0)_2px,rgba(255,255,255,0)_4px)] bg-[length:100%_4px] opacity-25 animate-[scan_1.6s_linear_infinite]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_0.6px,transparent_0.6px)] [background-size:3px_3px]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.65),rgba(0,0,0,0.08))]" />

      <div className="absolute top-[22%] left-[25%] h-2 w-4 bg-[#d7f1b2]/20 blur-[1px] animate-[eyePulse_3.6s_ease-in-out_infinite]" />
      <div className="absolute top-[22%] left-[30%] h-2 w-4 bg-[#d7f1b2]/20 blur-[1px] animate-[eyePulse_3.6s_ease-in-out_infinite_220ms]" />
      <div className="absolute top-[28%] right-[22%] h-[6px] w-[10px] bg-[#bddd8e]/15 blur-[1px] animate-[eyePulse_4.2s_ease-in-out_infinite_400ms]" />
      <div className="absolute top-[28%] right-[26%] h-[6px] w-[10px] bg-[#bddd8e]/15 blur-[1px] animate-[eyePulse_4.2s_ease-in-out_infinite_620ms]" />

      <div className="absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute block h-[3px] w-[3px] bg-[#b8e389] shadow-[0_0_8px_#b8e389] animate-[firefly_3.2s_ease-in-out_infinite]"
            style={{
              left: `${6 + ((i * 7) % 88)}%`,
              top: `${12 + ((i * 11) % 72)}%`,
              animationDelay: `${(i % 7) * 220}ms`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-[min(92vw,620px)] border-2 border-[#2a4a1a] bg-[#0f1d12]/82 p-6 text-center shadow-[0_0_38px_rgba(40,95,36,0.45)]">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.36em] text-[#b1dd78]">The Watching World</p>
        <h2 className="mb-1 font-mono text-lg uppercase tracking-[0.24em] text-[#ecf8d1]">Chapter 1</h2>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#82b45a]">The Start Forest</p>

        <div className="mx-auto mb-3 flex w-fit items-center gap-2">
          <span className="h-2 w-2 bg-[#9cd56e] animate-[blink_1.2s_steps(1)_infinite]" />
          <span className="h-2 w-2 bg-[#7bb84e] animate-[blink_1.2s_steps(1)_infinite_240ms]" />
          <span className="h-2 w-2 bg-[#5d9a3c] animate-[blink_1.2s_steps(1)_infinite_480ms]" />
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#d8f1a8]">
          {message ?? defaultMessage}
        </p>
      </div>

      <style jsx>{`
        @keyframes firefly {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.2; }
          35% { transform: translate3d(4px, -6px, 0); opacity: 0.85; }
          70% { transform: translate3d(-3px, -2px, 0); opacity: 0.35; }
        }
        @keyframes eyePulse {
          0%, 100% { opacity: 0.04; }
          45% { opacity: 0.14; }
          55% { opacity: 0.03; }
          70% { opacity: 0.16; }
        }
        @keyframes blink {
          0%, 49%, 100% { opacity: 0.25; }
          50% { opacity: 0.95; }
        }
        @keyframes scan {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
