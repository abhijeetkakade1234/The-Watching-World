'use client';

import { PIXEL_HUD } from '@/styles/pixelHud';
import { useGameStore } from '../store/gameStore';
import { COLS as EXT_COLS, ROWS as EXT_ROWS } from '../data/maps/village_chapter/index';

export function MiniMap() {
  const { playerPos, visibilityRadius, hasMiniMap, isMiniMapOpen } = useGameStore();

  if (!hasMiniMap || !isMiniMapOpen) return null;

  // MiniMap Scale
  const SCALE = 3;

  const playerPx = playerPos.x * SCALE;
  const playerPy = playerPos.y * SCALE;
  const visPx = visibilityRadius * SCALE;

  return (
    <div className={`fixed bottom-6 right-6 z-40 overflow-hidden p-2 ${PIXEL_HUD.panelMuted}`}>
      <div className="relative border border-[#3e3216] bg-[#0d0b07]" style={{ width: EXT_COLS * SCALE, height: EXT_ROWS * SCALE }}>
        {/* Simple Map Visualization */}
        <div className="absolute inset-0 opacity-40">
          {/* In a real scenario we'd draw the map here, but for mini-map a rough shape is fine */}
          <div className="w-full h-full bg-[#1a2e10]" />
        </div>

        {/* Player Position */}
        <div
          className="absolute animate-pulse bg-[#d8b95d] shadow-[0_0_8px_rgba(216,185,93,0.55)]"
          style={{
            left: playerPx - 2,
            top: playerPy - 2,
            width: 4, height: 4,
            transition: 'left 0.1s linear, top 0.1s linear'
          }}
        />

        {/* Exit Zone Marker */}
        <div
          className="absolute border border-[#7cae4a] bg-[#6b9a41]/50"
          style={{
            left: 21 * SCALE,
            top: 69 * SCALE - 4,
            width: 2 * SCALE,
            height: 4
          }}
        />

        {/* Fog of War mask for MiniMap */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.6)',
            maskImage: `radial-gradient(circle ${visPx * 3}px at ${playerPx}px ${playerPy}px, transparent 0%, black 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${visPx * 3}px at ${playerPx}px ${playerPy}px, transparent 0%, black 100%)`
          }}
        />
      </div>
      <div className={`mt-2 text-center text-[10px] uppercase tracking-[0.18em] ${PIXEL_HUD.subHeading}`}>
        Scout Map
      </div>
    </div>
  );
}
