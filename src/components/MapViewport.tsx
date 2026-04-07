'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  chapter1Map, COLS as EXT_COLS, ROWS as EXT_ROWS,
  HOUSE_MAPS
} from '../data/maps/village_chapter/index';
import { drawTile, drawInteriorTile, TILE_SIZE } from '../utils/tile_renderer';

type Facing = 'up' | 'down' | 'left' | 'right';

const PLAYER_FRAMES: Record<Facing, string[]> = {
  up: [
    '/characters/boy/leo_up_0.png',
    '/characters/boy/leo_up_1.png',
    '/characters/boy/leo_up_2.png',
    '/characters/boy/leo_up_3.png',
    '/characters/boy/leo_up_4.png',
    '/characters/boy/leo_up_5.png',
  ],
  down: [
    '/characters/boy/leo_down_0.png',
    '/characters/boy/leo_down_1.png',
    '/characters/boy/leo_down_2.png',
    '/characters/boy/leo_down_3.png',
    '/characters/boy/leo_down_4.png',
    '/characters/boy/leo_down_5.png',
    '/characters/boy/leo_down_6.png',

  ],
  left: [
    '/characters/boy/leo_left_0.png',
    '/characters/boy/leo_left_1.png',
    '/characters/boy/leo_left_2.png',
    '/characters/boy/leo_left_3.png',
  ],
  right: [
    '/characters/boy/leo_right_0.png',
    '/characters/boy/leo_right_1.png',
    '/characters/boy/leo_right_2.png',
    '/characters/boy/leo_right_3.png',
    '/characters/boy/leo_right_4.png',
    '/characters/boy/leo_right_5.png',
    '/characters/boy/leo_right_6.png',
  ],
};

const MOVE_INTERVAL_MS = 140;
const PLAYER_SCALE = 1.45;

export function MapViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    playerPos, entities, status, currentMap,
    movePlayer, initializeGame, togglePause, visibilityRadius,
    toggleMap, interact, interactionMessage, interactionProgress,
    startInteracting, stopInteracting, tickInteraction, interactingEntityId
  } = useGameStore();

  const [scale, setScale] = useState(1);
  const [facing, setFacing] = useState<Facing>('down');
  const [walkFrame, setWalkFrame] = useState(0);
  const lastMoveAtRef = useRef(0);

  // Active map data
  const isHouse = currentMap.startsWith('house-');
  const house = HOUSE_MAPS[currentMap];
  const hasValidHouseMap = isHouse && Boolean(house);

  const activeCols = hasValidHouseMap ? house.dims.cols : EXT_COLS;
  const activeRows = hasValidHouseMap ? house.dims.rows : EXT_ROWS;
  const activeMap = hasValidHouseMap ? house.map : chapter1Map;
  const activeDraw = hasValidHouseMap ? drawInteriorTile : drawTile;

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
    canvasRef.current.width = activeCols * TILE_SIZE;
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
        const now = performance.now();
        if (now - lastMoveAtRef.current < MOVE_INTERVAL_MS) return;
        lastMoveAtRef.current = now;

        const moveWithStepAnimation = (dx: number, dy: number, nextFacing: Facing) => {
          setFacing(nextFacing);

          const before = useGameStore.getState().playerPos;
          movePlayer(dx, dy);
          const after = useGameStore.getState().playerPos;
          const moved = before.x !== after.x || before.y !== after.y;

          if (moved) {
            setWalkFrame(prev => (prev + 1) % PLAYER_FRAMES[nextFacing].length);
          } else {
            setWalkFrame(0);
          }
        };

        switch (key) {
          case 'arrowup': case 'w': moveWithStepAnimation(0, -1, 'up'); break;
          case 'arrowdown': case 's': moveWithStepAnimation(0, 1, 'down'); break;
          case 'arrowleft': case 'a': moveWithStepAnimation(-1, 0, 'left'); break;
          case 'arrowright': case 'd': moveWithStepAnimation(1, 0, 'right'); break;
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

  const widthStr = `${activeCols * TILE_SIZE}px`;
  const heightStr = `${activeRows * TILE_SIZE}px`;

  let centerX = (windowSize.w / 2) / scale - (playerPos.x * TILE_SIZE + TILE_SIZE / 2);
  let centerY = (windowSize.h / 2) / scale - (playerPos.y * TILE_SIZE + TILE_SIZE / 2);

  const minTx = (windowSize.w / scale) - (activeCols * TILE_SIZE);
  const minTy = (windowSize.h / scale) - (activeRows * TILE_SIZE);

  if (minTx < 0) centerX = Math.max(minTx, Math.min(0, centerX)); else centerX = minTx / 2;
  if (minTy < 0) centerY = Math.max(minTy, Math.min(0, centerY)); else centerY = minTy / 2;

  const playerPx = playerPos.x * TILE_SIZE;
  const playerPy = playerPos.y * TILE_SIZE;
  const visPx = visibilityRadius * TILE_SIZE;
  const playerFrame = PLAYER_FRAMES[facing][walkFrame];
  const playerSize = Math.round(TILE_SIZE * PLAYER_SCALE);
  const playerOffset = Math.floor((playerSize - TILE_SIZE) / 2);

  const fogStyle = hasValidHouseMap
    ? `radial-gradient(circle ${visPx * 3}px at ${playerPx + 8}px ${playerPy + 8}px, transparent 100%, black 100%)`
    : `radial-gradient(circle ${visPx}px at ${playerPx + 8}px ${playerPy + 8}px, transparent 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.85) 100%)`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: hasValidHouseMap ? '#110c08' : '#0a1a05',
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
            maskImage: hasValidHouseMap ? fogStyle : 'none',
            WebkitMaskImage: hasValidHouseMap ? fogStyle : 'none',
            background: hasValidHouseMap ? 'rgba(0,0,0,0.92)' : 'transparent',
          }}
        />

        {/* Dynamic Entities (NPCs, Chests, etc) */}
        {entities.map(entity => {
          if (entity.isHidden) return null;
          const ex = entity.x * TILE_SIZE;
          const ey = entity.y * TILE_SIZE;
          const colors: Record<string, string> = {
            chest: entity.isOpened ? '#ca8a04' : '#facc15',
            npc: '#fb7185',
            goal: '#34d399',
          };

          return (
            <div
              key={entity.id}
              style={{
                position: 'absolute', left: ex, top: ey,
                width: (entity.width || 1) * TILE_SIZE,
                height: (entity.height || 1) * TILE_SIZE,
                background: entity.sprite ? 'transparent' : (colors[entity.type] ?? '#fff'),
                borderRadius: entity.type === 'npc' && !entity.sprite ? '50%' : 2,
                boxShadow: entity.sprite ? 'none' : `0 0 10px ${colors[entity.type] ?? '#fff'}`,
                opacity: 1.0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                imageRendering: 'pixelated',
                zIndex: 5,
              }}
            >
              {entity.sprite ? (
                // eslint-disable-next-line @next/next/no-img-element -- Pixel sprites are intentionally rendered in a canvas-like overlay.
                <img
                  src={entity.sprite}
                  alt={entity.id}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                entity.type === 'chest' && <div className="absolute inset-1 border border-black/30" />
              )}
            </div>
          );
        })}


        {/* Player Indicator & Circular Progress Overlay */}
        <div
          style={{
            position: 'absolute',
            left: playerPx - playerOffset, top: playerPy - playerOffset,
            width: playerSize, height: playerSize,
            background: 'transparent',
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
              left: 0, top: 0,
              width: '100%', height: '100%',
              imageRendering: 'pixelated',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Pixel sprite animation needs direct frame swapping without optimization transforms. */}
            <img
              src={playerFrame}
              alt="Player"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                imageRendering: 'pixelated',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
