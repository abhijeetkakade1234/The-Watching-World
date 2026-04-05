'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { level1Map, TILE_PROPERTIES, TILES } from '../data/maps/level1';

export function MiniMap() {
  const { playerPos, entities, status, togglePause } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const MAP_W = 160;
  const MAP_H = 120;

  // Toggle Logic (M key)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        setIsExpanded(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Initial Terrain Render (one time only to background canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw simplified terrain
    ctx.clearRect(0, 0, MAP_W, MAP_H);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = level1Map[y][x];
        const props = TILE_PROPERTIES[tile];
        
        if (tile === TILES.WI || tile === TILES.WS || tile === TILES.WE || tile === TILES.WF) {
          ctx.fillStyle = '#1e3a8a'; // Deep Water Blue
        } else if (tile === TILES.DT || tile === TILES.BR || tile === TILES.WT || tile === TILES.DV) {
          ctx.fillStyle = '#b45309'; // Path Brown
        } else if (tile === TILES.SA || tile === TILES.DS) {
          ctx.fillStyle = '#d4b070'; // Sand/Desert Yellow
        } else if (tile === TILES.MT || tile === TILES.RK) {
          ctx.fillStyle = '#4a5860'; // Mountain/Rock Grey
        } else if (tile === TILES.FO) {
          ctx.fillStyle = '#f97316'; // Food Orange
        } else if (tile === TILES.HL) {
          ctx.fillStyle = '#10b981'; // Heal Emerald
        } else if (props && !props.walkable) {
          ctx.fillStyle = '#064e3b'; // Forest Wall Dark
        } else if (tile === TILES.CG || tile === TILES.CE || tile === TILES.CR) {
          ctx.fillStyle = '#581c87'; // Corruption Purple
        } else {
          ctx.fillStyle = '#166534'; // Safe Grass Green
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  if (status !== 'playing' && status !== 'paused') return null;

  const goal = entities.find(e => e.type === 'goal');
  
  // Dynamic scaling based on mode
  const scale = isExpanded ? 4.5 : 1.5; 
  const containerClass = isExpanded 
    ? "fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-500 p-10 cursor-alias overflow-auto"
    : "fixed bottom-6 right-6 z-50 p-2 bg-black/60 backdrop-blur-md border-2 border-slate-700 rounded-lg shadow-2xl overflow-hidden cursor-pointer transition-all duration-300";

  return (
    <div 
       className={containerClass}
       onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={`relative ${isExpanded ? "shadow-[0_0_100px_rgba(34,211,238,0.3)] border-4 border-cyan-500/40 rounded-xl" : "bg-slate-900"}`}>
        {/* Terrain Canvas */}
        <canvas 
          ref={canvasRef}
          width={MAP_W}
          height={MAP_H}
          className="block image-pixelated pointer-events-none"
          style={{ width: MAP_W * scale, height: MAP_H * scale }}
        />
        
        {/* Goal Indicator */}
        {goal && (
          <div 
            className="absolute bg-emerald-400 rounded-full animate-ping z-20"
            style={{ 
              left: goal.x * scale - (isExpanded ? 6 : 2), 
              top: goal.y * scale - (isExpanded ? 6 : 2), 
              width: isExpanded ? 12 : 6, 
              height: isExpanded ? 12 : 6 
            }}
          />
        )}
        {goal && (
          <div 
            className="absolute bg-emerald-500 rounded-full border border-white z-20 shadow-[0_0_15px_rgba(16,185,129,1)]"
            style={{ 
              left: goal.x * scale - (isExpanded ? 4 : 2), 
              top: goal.y * scale - (isExpanded ? 4 : 2), 
              width: isExpanded ? 8 : 4, 
              height: isExpanded ? 8 : 4 
            }}
          />
        )}

        {/* Player Position */}
        <div 
          className="absolute bg-cyan-400 rounded-full border-2 border-white shadow-[0_0_15px_cyan] z-30 transition-all duration-150"
          style={{ 
            left: playerPos.x * scale - (isExpanded ? 6 : 2.5), 
            top: playerPos.y * scale - (isExpanded ? 6 : 2.5),
            width: isExpanded ? 12 : 5, 
            height: isExpanded ? 12 : 5 
          }}
        />

        {/* Helper HUD */}
        {isExpanded && (
          <div className="absolute -bottom-16 left-0 w-full text-center">
             <h3 className="text-cyan-400 font-black text-2xl tracking-[0.2em] animate-pulse uppercase">Electronic Direction Map</h3>
             <p className="text-slate-400 text-sm mt-1 uppercase font-bold tracking-widest">Target Locked: (Far South-East) | Safe Extraction: Active</p>
             <p className="text-white/40 text-[10px] mt-4 font-mono">PRESS [M] OR CLICK TO DISMISS</p>
          </div>
        )}
      </div>

      {!isExpanded && (
        <div className="mt-2 text-[10px] text-slate-400 font-mono flex justify-between uppercase tracking-tighter">
          <span>X:{playerPos.x}</span>
          <span>Y:{playerPos.y}</span>
          <span className="text-emerald-400 font-bold">[M] MAP</span>
        </div>
      )}
    </div>
  );
}
