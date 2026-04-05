'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { level1Map, TILE_PROPERTIES, TILES } from '../data/maps/level1';

export function MiniMap() {
  const { playerPos, entities, status } = useGameStore();
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

  // Initial Terrain Render (simplified for readability)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, MAP_W, MAP_H);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = level1Map[y][x];
        const props = TILE_PROPERTIES[tile];
        
        if (tile === TILES.WI || tile === TILES.WS || tile === TILES.WE || tile === TILES.WF) {
          ctx.fillStyle = '#1e40af'; // Solid Blue
        } else if (tile === TILES.FO) {
          ctx.fillStyle = '#f97316'; // Food Orange
        } else if (tile === TILES.HL) {
          ctx.fillStyle = '#10b981'; // Heal Emerald
        } else if (tile === TILES.SA || tile === TILES.DS) {
          ctx.fillStyle = '#eab308'; // Desert Yellow
        } else if (tile === TILES.MT || tile === TILES.RK) {
          ctx.fillStyle = '#475569'; // Mountain Grey
        } else if (props && !props.walkable) {
          ctx.fillStyle = '#064e3b'; // Wall Dark Green
        } else if (tile === TILES.CG || tile === TILES.CE || tile === TILES.CR) {
          ctx.fillStyle = '#6b21a8'; // Blight Purple
        } else {
          ctx.fillStyle = '#166534'; // Grass Green
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  if (status !== 'playing' && status !== 'paused') return null;

  const goal = entities.find(e => e.type === 'goal');
  const scale = isExpanded ? 4.5 : 1.5; 
  const containerClass = isExpanded 
    ? "fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-xl transition-all duration-500 p-10 overflow-hidden"
    : "fixed bottom-6 right-6 z-50 p-2 bg-black/80 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105";

  return (
    <div 
       className={containerClass}
       onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={`relative ${isExpanded ? "shadow-[0_0_80px_rgba(34,211,238,0.2)] border border-cyan-500/20 rounded-lg" : ""}`}>
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
              left: goal.x * scale - (isExpanded ? 8 : 3), 
              top: goal.y * scale - (isExpanded ? 8 : 3), 
              width: isExpanded ? 16 : 6, 
              height: isExpanded ? 16 : 6 
            }}
          />
        )}
        {goal && (
          <div 
            className="absolute bg-emerald-500 rounded-full border border-white z-20 shadow-[0_0_20px_emerald]"
            style={{ 
              left: goal.x * scale - (isExpanded ? 5 : 2), 
              top: goal.y * scale - (isExpanded ? 5 : 2), 
              width: isExpanded ? 10 : 4, 
              height: isExpanded ? 10 : 4 
            }}
          />
        )}

        {/* Player Position */}
        <div 
          className="absolute bg-cyan-400 rounded-full border border-white shadow-[0_0_15px_cyan] z-30 transition-all duration-150"
          style={{ 
            left: playerPos.x * scale - (isExpanded ? 6 : 2), 
            top: playerPos.y * scale - (isExpanded ? 6 : 2),
            width: isExpanded ? 12 : 4, 
            height: isExpanded ? 12 : 4 
          }}
        />

        {/* HUD Elements for expanded mode */}
        {isExpanded && (
          <div className="absolute -bottom-20 left-0 w-full flex flex-col items-center">
             <h3 className="text-cyan-400 font-black text-2xl tracking-[0.3em] uppercase opacity-80 mb-2">Electronic Direction Map</h3>
             <div className="flex gap-8 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Player</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Extraction</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> Rations</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Medkits</span>
             </div>
             <p className="text-white/20 text-[9px] mt-8 font-mono">MAP INTERFACE ACTIVE | PRESS [M] TO CLOAK</p>
          </div>
        )}
      </div>

      {!isExpanded && (
        <div className="mt-2 flex justify-between items-center text-[9px] font-black font-mono tracking-tighter">
          <div className="flex gap-3 text-slate-500 uppercase">
            <span>X:{playerPos.x}</span>
            <span>Y:{playerPos.y}</span>
          </div>
          <span className="text-cyan-400/80 animate-pulse">[M] MAP</span>
        </div>
      )}
    </div>
  );
}
