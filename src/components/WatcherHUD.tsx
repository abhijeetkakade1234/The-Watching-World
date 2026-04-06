'use client';

import { useGameStore } from '../store/gameStore';

export function WatcherHUD() {
  const { currentNarration, isNarrationActive } = useGameStore();

  if (!isNarrationActive || !currentNarration) return null;

  return (
    <div className="fixed inset-0 z-[500] pointer-events-none flex items-center justify-center pointer-events-none">
      {/* Cinematic Vignette Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 via-transparent to-red-900/40 animate-pulse" />
      
      {/* Glitchy Narration Text */}
      <div className="relative p-12 max-w-2xl text-center group">
         <div className="absolute inset-0 bg-black/60 blur-3xl rounded-full scale-150" />
         
         {/* THE VOICE */}
         <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight text-white drop-shadow-[0_0_15px_rgba(248,113,113,1)] uppercase animate-in fade-in zoom-in duration-1000">
            <span className="text-red-500/80 mr-4 font-mono">[WATCHER]:</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-white to-cyan-400 drop-shadow-xl">
               "{currentNarration}"
            </span>
         </h2>
         
         {/* Secondary "Glitch" Text Layer */}
         <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight text-cyan-400/20 blur-sm uppercase animate-pulse">
            "{currentNarration}"
         </h2>
         
         <div className="mt-6 flex justify-center gap-2">
            <div className="h-[2px] w-12 bg-red-500 animate-ping" />
            <div className="h-[2px] w-12 bg-white" />
            <div className="h-[2px] w-12 bg-cyan-400 animate-ping" />
         </div>
      </div>

      {/* Side "Data Stream" Glitches */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 text-[8px] font-mono text-red-500/50 uppercase tracking-widest animate-pulse">
         <span>INTEL_SCANNING...</span>
         <span>QTE_OBSERVED...</span>
         <span>PATTERNS_DETECTED...</span>
         <span>FATAL_LOOP_LOCKED...</span>
      </div>
    </div>
  );
}
