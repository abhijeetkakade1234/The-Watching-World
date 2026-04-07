'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { 
  chapter1Map, COLS as EXT_COLS, ROWS as EXT_ROWS, 
  HOUSE_MAPS 
} from '../data/maps/village_chapter/index';
import { drawTile, drawInteriorTile, TILE_SIZE } from '../utils/tile_renderer';

export function MapViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    playerPos, entities, status, currentMap,
    movePlayer, initializeGame, togglePause, visibilityRadius,
    toggleMap, interact, interactionMessage, interactionProgress,
    startInteracting, stopInteracting, tickInteraction, interactingEntityId
  } = useGameStore();

  const [scale, setScale] = useState(1);

  // Active map data
  const isHouse = currentMap.startsWith('house-');
  const house = HOUSE_MAPS[currentMap];

  const activeCols = isHouse ? house.dims.cols : EXT_COLS;
  const activeRows = isHouse ? house.dims.rows : EXT_ROWS;
  const activeMap  = isHouse ? house.map : chapter1Map;
  const activeDraw = isHouse ? drawInteriorTile : drawTile;

  const VIRTUAL_W = 500;
  const VIRTUAL_H = 350;
  const [windowSize, setWindowSize] = useState({ w: 1000, h: 800 });

  useLayoutEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      setScale(Math.max(window.innerWidth / VIRTUAL_W, window.innerHeight / VIRTUAL_H));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width  = activeCols * TILE_SIZE;
    canvasRef.current.height = activeRows * TILE_SIZE;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    for (let r = 0; r < activeRows; r++) {
      for (let c = 0; c < activeCols; c++) {
        activeDraw(ctx, c, r, activeMap[r][c]);
      }
    }

    if (currentMap === 'village_chapter') {
      initializeGame();
    }
  }, [currentMap, activeCols, activeRows, activeMap, activeDraw, initializeGame]);

  // Handle Interaction Tick
  useEffect(() => {
    let lastTime = performance.now();
    let frame: number;

    const loop = (now: number) => {
      const dt = (now - lastTime) / 10; // ~3 seconds to fill 100 (distributing 100 over 3000ms = 0.33 per ms)
      if (interactingEntityId) {
        tickInteraction(dt);
      }
      lastTime = now;
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [interactingEntityId, tickInteraction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // 1. Pause & Map (High Priority)
      if (key === 'escape') { togglePause(); return; }
      if (key === 'm') { toggleMap(); return; }

      if (status !== 'playing') return;

      const isMovementKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key);

      // 2. Interaction (Triggered ONLY by 'E')
      if (key === 'e' && interactionMessage && !interactingEntityId) {
        const { x, y } = playerPos;
        const chestOrSign = entities.find(e => 
          (e.type === 'chest' || e.type === 'npc') && Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1
        ) || interactionMessage.includes('['); // For signs which are baked into map

        if (chestOrSign || interactionMessage) {
          const entityToUse = (typeof chestOrSign === 'object') ? chestOrSign : { id: 'sign', isOpened: true };
          // Always use startInteracting to match user's "(Hold E to Re-Read)" requirement
          startInteracting(entityToUse.id);
          return; // Interacting blocks movement for that frame
        }
      }

      // 3. Movement (Always processed if not interacting)
      if (isMovementKey) {
        switch (key) {
          case 'arrowup':    case 'w': movePlayer(0, -1); break;
          case 'arrowdown':  case 's': movePlayer(0, 1);  break;
          case 'arrowleft':  case 'a': movePlayer(-1, 0); break;
          case 'arrowright': case 'd': movePlayer(1, 0);  break;
        }
      }
    };

    const handleKeyUp = () => {
      if (interactingEntityId) stopInteracting();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
       window.removeEventListener('keydown', handleKeyDown);
       window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, movePlayer, togglePause, toggleMap, interact, interactionMessage, entities, playerPos, interactingEntityId, startInteracting, stopInteracting]);

  const widthStr  = `${activeCols * TILE_SIZE}px`;
  const heightStr = `${activeRows * TILE_SIZE}px`;

  let centerX = (windowSize.w / 2) / scale - (playerPos.x * TILE_SIZE + TILE_SIZE / 2);
  let centerY = (windowSize.h / 2) / scale - (playerPos.y * TILE_SIZE + TILE_SIZE / 2);
  
  const minTx = (windowSize.w / scale) - (activeCols * TILE_SIZE);
  const minTy = (windowSize.h / scale) - (activeRows * TILE_SIZE);

  if (minTx < 0) centerX = Math.max(minTx, Math.min(0, centerX)); else centerX = minTx / 2;
  if (minTy < 0) centerY = Math.max(minTy, Math.min(0, centerY)); else centerY = minTy / 2;

  const playerPx = playerPos.x * TILE_SIZE;
  const playerPy = playerPos.y * TILE_SIZE;
  const visPx    = visibilityRadius * TILE_SIZE;

  const fogStyle = isHouse
    ? `radial-gradient(circle ${visPx * 3}px at ${playerPx + 8}px ${playerPy + 8}px, transparent 100%, black 100%)`
    : `radial-gradient(circle ${visPx}px at ${playerPx + 8}px ${playerPy + 8}px, transparent 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.85) 100%)`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: isHouse ? '#110c08' : '#0a1a05',
        imageRendering: 'pixelated',
      }}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${centerX}px, ${centerY}px)`,
          transformOrigin: '0 0',
          position: 'absolute',
          width: widthStr, height: heightStr,
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />

        <div
          style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
            maskImage: isHouse ? fogStyle : 'none',
            WebkitMaskImage: isHouse ? fogStyle : 'none',
            background: isHouse ? 'rgba(0,0,0,0.92)' : 'transparent',
          }}
        />

        {/* Dynamic Entities (NPCs, Chests, etc) */}
        {entities.map(entity => {
          if (entity.isHidden) return null;
          const ex = entity.x * TILE_SIZE;
          const ey = entity.y * TILE_SIZE;
          const colors: Record<string, string> = {
            chest: entity.isOpened ? '#ca8a04' : '#facc15',
            npc:   '#fb7185',
            goal:  '#34d399',
          };
          
          return (
            <div
              key={entity.id}
              style={{
                position: 'absolute', left: ex, top: ey,
                width: TILE_SIZE, height: TILE_SIZE,
                background: colors[entity.type] ?? '#fff',
                borderRadius: entity.type === 'npc' ? '50%' : 2,
                boxShadow: `0 0 10px ${colors[entity.type] ?? '#fff'}`,
                opacity: 0.9,
              }}
            >
               {entity.type === 'chest' && <div className="absolute inset-1 border border-black/30" />}
            </div>
          );
        })}


        {/* Player Indicator & Circular Progress Overlay */}
        <div
          style={{
            position: 'absolute',
            left: playerPx + 1, top: playerPy + 1,
            width: 14, height: 14,
            background: 'transparent',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            transition: 'left 0.1s linear, top 0.1s linear',
            zIndex: 10,
          }}
        >
          {interactingEntityId && (
            <svg className="absolute -inset-1 w-16 h-16 -rotate-90 pointer-events-none" style={{ left: -10, top: -10 }}>
              <circle
                cx="32" cy="32" r="14"
                fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="4"
                strokeDasharray={`${(interactionProgress / 100) * 88} 88`}
                className="transition-all duration-75"
              />
            </svg>
          )}
          
          <div
            style={{
              position: 'absolute',
              left: 2, top: 2,
              width: 10, height: 10,
              background: '#38bdf8',
              borderRadius: '50%',
              boxShadow: '0 0 15px #0ea5e9',
            }}
          />
        </div>
      </div>
    </div>
  );
}
