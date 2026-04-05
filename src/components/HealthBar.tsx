'use client';

import { useGameStore } from '../store/gameStore';

export function HealthBar() {
  const { playerEnergy, playerHunger, status, visibilityRadius } = useGameStore();

  if (status !== 'playing' && status !== 'paused') return null;

  // Max Energy constant (NERF: 300)
  const MAX_ENERGY = 300;

  // Integrity (Health) Color
  let hpColor = 'bg-emerald-500 shadow-emerald-400';
  if (playerEnergy <= 100) hpColor = 'bg-yellow-400 shadow-yellow-300';
  if (playerEnergy <= 50) hpColor = 'bg-red-500 shadow-red-400 animate-pulse';

  // Exhaustion (Hunger) Color
  let hgColor = 'bg-orange-500 shadow-orange-400';
  if (playerHunger > 80) hgColor = 'bg-red-600 shadow-red-500 animate-bounce';

  const isExhausted = playerHunger > 85; // Matches new 85 threshold in store
  const isBlurred = visibilityRadius < 15;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 w-96 max-w-[90vw] z-[400] pointer-events-none space-y-4">
      {/* INTEGRITY BAR */}
      <div>
        <div className="flex justify-between items-end mb-1 text-[10px] sm:text-xs">
           <span className="text-emerald-400 font-black tracking-[0.2em] uppercase text-shadow-sm">Physiological Integrity</span>
           <span className="text-white font-bold tabular-nums">{Math.floor(playerEnergy)} / {MAX_ENERGY}</span>
        </div>
        <div className="h-3 w-full bg-slate-900 border border-slate-700 p-[1px] rounded-sm overflow-hidden backdrop-blur-md">
          <div 
            className={`h-full transition-all duration-300 ${hpColor}`} 
            style={{ width: `${Math.max(0, Math.min(100, (playerEnergy / MAX_ENERGY) * 100))}%` }}
          />
        </div>
      </div>

      {/* EXHAUSTION BAR */}
      <div>
        <div className="flex justify-between items-end mb-1 text-[10px] sm:text-xs">
           <span className="text-orange-400 font-black tracking-[0.2em] uppercase text-shadow-sm">Neural Exhaustion</span>
           <span className="text-white font-bold tabular-nums">{Math.floor(playerHunger)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-900 border border-slate-800 p-[1px] rounded-sm overflow-hidden backdrop-blur-md">
          <div 
            className={`h-full transition-all duration-700 ${hgColor}`} 
            style={{ width: `${playerHunger}%` }}
          />
        </div>
      </div>

      {/* STATUS INDICATORS */}
      <div className="flex gap-2 justify-center">
        {isExhausted && (
          <span className="px-2 py-0.5 bg-red-900/40 text-red-500 text-[10px] font-black border border-red-500 animate-pulse rounded uppercase tracking-widest">
            Speed Restricted
          </span>
        )}
        {isBlurred && (
          <span className="px-2 py-0.5 bg-purple-900/40 text-purple-400 text-[10px] font-black border border-purple-500 animate-pulse rounded uppercase tracking-widest">
            Vision Impaired
          </span>
        )}
      </div>
    </div>
  );
}
