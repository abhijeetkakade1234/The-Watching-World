'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { level1Map, TILE_PROPERTIES } from '../data/maps/level1';
import { drawTile, COLS, ROWS, TILE_SIZE } from '../utils/tile_renderer';

export function MapViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playerPos, entities, status, movePlayer, initializeGame, togglePause, visibilityRadius } = useGameStore();

  const [scale, setScale] = useState(1);

  // Dynamic Window Scaling (Virtual Camera)
  const VIRTUAL_W = 500;
  const VIRTUAL_H = 350;
  const [windowSize, setWindowSize] = useState({ w: 1000, h: 800 });

  useLayoutEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      const widthScale = window.innerWidth / VIRTUAL_W;
      const heightScale = window.innerHeight / VIRTUAL_H;
      setScale(Math.max(widthScale, heightScale));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw Background Map Once
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        drawTile(ctx, c, r, level1Map[r][c]);
      }
    }
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
      }

      if (status !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w': movePlayer(0, -1); break;
        case 'ArrowDown':
        case 's': movePlayer(0, 1); break;
        case 'ArrowLeft':
        case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight':
        case 'd': movePlayer(1, 0); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, movePlayer, togglePause]);

  const widthStr = `${COLS * TILE_SIZE}px`;
  const heightStr = `${ROWS * TILE_SIZE}px`;

  // Calculate Camera Translation safely center-locking the screen on Player coordinates
  let centerX = (windowSize.w / 2) / scale - (playerPos.x * TILE_SIZE + TILE_SIZE / 2);
  let centerY = (windowSize.h / 2) / scale - (playerPos.y * TILE_SIZE + TILE_SIZE / 2);

  // CLAMPING: Prevent Camera from revealing the black void past the map array pixel bounds!
  const minTx = (windowSize.w / scale) - (COLS * TILE_SIZE);
  const minTy = (windowSize.h / scale) - (ROWS * TILE_SIZE);

  if (minTx < 0) centerX = Math.max(minTx, Math.min(0, centerX));
  else centerX = minTx / 2;

  if (minTy < 0) centerY = Math.max(minTy, Math.min(0, centerY));
  else centerY = minTy / 2;

  // Fog of War Size
  const visionSize = (visibilityRadius * TILE_SIZE) * scale;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden m-0 p-0 pointer-events-none z-0">
      {/* Fog of War Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 transition-all duration-700"
        style={{
          background: `radial-gradient(circle ${visionSize}px at ${windowSize.w/2}px ${windowSize.h/2}px, transparent 0%, rgba(0,0,0,0.85) 70%, black 100%)`
        }}
      />

      <div 
        className="absolute origin-top-left"
        style={{ 
          width: widthStr, 
          height: heightStr, 
          imageRendering: 'pixelated',
          transform: `scale(${scale}) translate(${centerX}px, ${centerY}px)`, 
          transition: 'transform 0.15s ease-out'
        }}
      >
        {/* Layer 1: Pixel Canvas Background */}
        <canvas 
          ref={canvasRef} 
          width={COLS * TILE_SIZE} 
          height={ROWS * TILE_SIZE}
          className="absolute top-0 left-0 pointer-events-none"
        />

        {/* Layer 2: Entity Overlays */}
        {entities.map((ent) => {
          let bgClass = "";
          let content = "";
          
          if (ent.type === 'corruption') {
            bgClass = "bg-purple-900/60 border border-purple-500 shadow-[inset_0_0_8px_rgba(168,85,247,0.8)]";
          }
          if (ent.type === 'trap') { 
            if (ent.isHidden) {
              bgClass = "border border-orange-500/30 bg-orange-500/10";
              content = "⚠️";
            } else {
              bgClass = "bg-orange-600/40 border border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"; 
              content = "🔥"; 
            }
          }
          if (ent.type === 'goal') { 
            bgClass = "bg-emerald-400/30 border-2 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse"; 
          }
          if (ent.type === 'block') { 
            bgClass = "bg-black/80 border border-slate-700 shadow-[0_0_10px_black]"; 
          }

          return (
            <div
              key={ent.id}
              className={`absolute flex items-center justify-center transition-all duration-300 pointer-events-none ${bgClass}`}
              style={{
                left: ent.x * TILE_SIZE,
                top: ent.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                fontSize: '10px'
              }}
            >
              {content}
            </div>
          );
        })}

        {/* Layer 3: Player Avatar */}
        <div 
          className="absolute z-10 transition-all duration-150 pointer-events-none"
          style={{
            left: playerPos.x * TILE_SIZE,
            top: playerPos.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE
          }}
        >
          <div className="w-full h-full p-[2px]">
             <div className="w-full h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
