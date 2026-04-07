'use client';

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
    <div className="fixed bottom-6 right-6 z-40 p-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
      <div className="relative border border-slate-800 rounded bg-black/40" style={{ width: EXT_COLS * SCALE, height: EXT_ROWS * SCALE }}>
        {/* Simple Map Visualization */}
        <div className="absolute inset-0 opacity-40">
          {/* In a real scenario we'd draw the map here, but for mini-map a rough shape is fine */}
          <div className="w-full h-full bg-[#1a2e10]" />
        </div>

        {/* Player Position */}
        <div
          className="absolute bg-sky-400 rounded-full animate-pulse shadow-[0_0_8px_#38bdf8]"
          style={{
            left: playerPx - 2,
            top: playerPy - 2,
            width: 4, height: 4,
            transition: 'left 0.1s linear, top 0.1s linear'
          }}
        />

        {/* Exit Zone Marker */}
        <div
          className="absolute bg-emerald-500/50 border border-emerald-400/50"
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
      <div className="mt-2 text-[10px] font-mono text-slate-400 text-center uppercase tracking-widest">
        Satellite Interface Active
      </div>
    </div>
  );
}
