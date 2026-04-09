'use client';

import { PIXEL_HUD } from '@/styles/pixelHud';
import { useGameStore } from '../store/gameStore';

export function WatcherHUD() {
  const { currentNarration, isNarrationActive } = useGameStore();

  if (!isNarrationActive || !currentNarration) return null;

  return (
    <div className="fixed inset-0 z-[500] pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(95,36,24,0.35),transparent_35%,transparent_65%,rgba(95,36,24,0.35))]" />
      <div className="relative p-12 max-w-2xl text-center group">
         <div className={`relative p-6 sm:p-8 ${PIXEL_HUD.panelDanger}`}>
           <h2 className={`text-sm sm:text-base mb-3 ${PIXEL_HUD.heading}`}>WATCHER</h2>
           <p className="font-mono text-xl sm:text-3xl text-[#f3e8d3] leading-relaxed">
             &quot;{currentNarration}&quot;
           </p>
         </div>

         <div className="mt-6 flex justify-center gap-2">
            <div className="h-[2px] w-12 bg-[#a04633] animate-ping" />
            <div className="h-[2px] w-12 bg-[#cfb777]" />
            <div className="h-[2px] w-12 bg-[#a04633] animate-ping" />
         </div>
      </div>

      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-1 text-[8px] font-mono text-[#9c7e54] uppercase tracking-[0.14em] animate-pulse">
         <span>whisper_detected...</span>
         <span>watching...</span>
         <span>echo_trail_found...</span>
         <span>memory_lock...</span>
      </div>
    </div>
  );
}
