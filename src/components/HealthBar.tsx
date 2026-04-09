'use client';

import { PIXEL_HUD } from '@/styles/pixelHud';
import { useGameStore } from '../store/gameStore';

// Reserved for future chapters. Keep logic compiled but not mounted in Chapter 1 UI.
export function HealthBar() {
  const { playerEnergy, playerHunger, status, visibilityRadius } = useGameStore();

  if (status !== 'playing' && status !== 'paused') return null;

  // Max Energy constant (NERF: 300)
  const MAX_ENERGY = 300;

  // Integrity (Health) Color
  let hpColor: string = PIXEL_HUD.barFillGreen;
  if (playerEnergy <= 100) hpColor = PIXEL_HUD.barFillAmber;
  if (playerEnergy <= 50) hpColor = `${PIXEL_HUD.barFillRed} animate-pulse`;

  // Exhaustion (Hunger) Color
  let hgColor: string = PIXEL_HUD.barFillAmber;
  if (playerHunger > 80) hgColor = `${PIXEL_HUD.barFillRed} animate-bounce`;

  const isExhausted = playerHunger > 85; // Matches new 85 threshold in store
  const isBlurred = visibilityRadius < 15;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 w-96 max-w-[90vw] z-[400] pointer-events-none space-y-4">
      {/* INTEGRITY BAR */}
      <div>
        <div className="flex justify-between items-end mb-1 text-[10px] sm:text-xs">
           <span className={`${PIXEL_HUD.heading} text-[#8fbe5e]`}>Physiological Integrity</span>
           <span className={`${PIXEL_HUD.text} font-bold tabular-nums`}>{Math.floor(playerEnergy)} / {MAX_ENERGY}</span>
        </div>
        <div className={`h-3 w-full overflow-hidden ${PIXEL_HUD.barTrack}`}>
          <div 
            className={`h-full transition-all duration-300 ${hpColor}`} 
            style={{ width: `${Math.max(0, Math.min(100, (playerEnergy / MAX_ENERGY) * 100))}%` }}
          />
        </div>
      </div>

      {/* EXHAUSTION BAR */}
      <div>
        <div className="flex justify-between items-end mb-1 text-[10px] sm:text-xs">
           <span className={`${PIXEL_HUD.heading} text-[#d89f57]`}>Neural Exhaustion</span>
           <span className={`${PIXEL_HUD.text} font-bold tabular-nums`}>{Math.floor(playerHunger)}%</span>
        </div>
        <div className={`h-2 w-full overflow-hidden ${PIXEL_HUD.barTrack}`}>
          <div 
            className={`h-full transition-all duration-700 ${hgColor}`} 
            style={{ width: `${playerHunger}%` }}
          />
        </div>
      </div>

      {/* STATUS INDICATORS */}
      <div className="flex gap-2 justify-center">
        {isExhausted && (
          <span className="border border-[#8f4032] bg-[#2d120f] px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-[#de7f68] animate-pulse">
            Speed Restricted
          </span>
        )}
        {isBlurred && (
          <span className="border border-[#6b5a2d] bg-[#261d0e] px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-[#cfbb7e] animate-pulse">
            Vision Impaired
          </span>
        )}
      </div>
    </div>
  );
}
