import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  chapter1Map, HOUSE_MAPS, TILES, TILE_PROPERTIES 
} from '../data/maps/village_chapter/index';
import { TILE_PROPERTIES_INT } from '../data/maps/village_chapter/houses/constants';
import { SPAWN_POINT, EXIT_ZONE } from '../data/maps/village_chapter/index';

import { DynamicEntity, GameStatus, MapId } from '@/types/game';

interface GameState {
  sessionId: string;
  playerPos: { x: number; y: number };
  playerHistory: { x: number; y: number }[];
  lastMoveTime: number;
  status: GameStatus;
  entities: DynamicEntity[];
  gameStartTime: number;

  currentNarration: string;
  isNarrationActive: boolean;

  // Map state
  currentMap: MapId;
  returnPos: { x: number; y: number } | null; 
  hasMiniMap: boolean;
  isMiniMapOpen: boolean;
  visibilityRadius: number; 
  interactionMessage: string | null;
  interactionProgress: number; 
  interactingEntityId: string | null;
  
  // Actions
  initializeGame: (opts?: { spawnX?: number; spawnY?: number }) => void;
  movePlayer: (dx: number, dy: number) => void;
  togglePause: () => void;
  toggleMap: () => void;
  interact: () => void;
  startInteracting: (entityId: string) => void;
  stopInteracting: () => void;
  tickInteraction: (dt: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      sessionId: '', 
      playerPos: { x: 20, y: 18 },
      playerHistory: [],
      lastMoveTime: 0,
      status: 'playing',
      entities: [],
      gameStartTime: 0,

      currentNarration: '',
      isNarrationActive: false,
      currentMap: 'village_chapter',
      returnPos: null,
      hasMiniMap: false,
      isMiniMapOpen: false,
      visibilityRadius: 5,
      interactionMessage: null,
      interactionProgress: 0,
      interactingEntityId: null,

      initializeGame: (opts?: { spawnX?: number; spawnY?: number }) => {
        if (get().sessionId !== '') return; 

        const spawnX = opts?.spawnX ?? SPAWN_POINT.x;
        const spawnY = opts?.spawnY ?? SPAWN_POINT.y;
        const newSessionId = crypto.randomUUID();

        const goalX = EXIT_ZONE.xStart + 1;
        const goalY = EXIT_ZONE.y - 1;

        const startingEntities: DynamicEntity[] = [
          { id: 'goal-1', x: goalX, y: goalY, type: 'goal' }
        ];

        set({
          sessionId: newSessionId,
          playerPos: { x: spawnX, y: spawnY },
          playerHistory: [{ x: spawnX, y: spawnY }],
          lastMoveTime: 0,
          status: 'playing',
          gameStartTime: Date.now(),
          entities: startingEntities,
          currentNarration: '',
          isNarrationActive: false,
          hasMiniMap: false,
          isMiniMapOpen: false,
          visibilityRadius: 5,
          interactionMessage: null,
          interactionProgress: 0,
          interactingEntityId: null,
        });
      },

      togglePause: () => {
        const state = get();
        if (state.status === 'playing') set({ status: 'paused' });
        else if (state.status === 'paused') set({ status: 'playing' });
      },

      toggleMap: () => {
        const state = get();
        if (state.hasMiniMap) set({ isMiniMapOpen: !state.isMiniMapOpen });
      },

      interact: () => {
        const state = get();
        const entityId = state.interactingEntityId;
        if (!entityId) return;

        const entity = state.entities.find(e => e.id === entityId);
        if (entity && entity.type === 'chest') {
          const newEntities = state.entities.map(e => 
            e.id === entity.id ? { ...e, isOpened: true } : e
          );
          
          set({ 
            entities: newEntities, 
            currentNarration: entity.message || "A faint memory flickers...", 
            isNarrationActive: true,
            interactionProgress: 100,
            interactionMessage: "(Hold E to Re-Read)"
          });
          
          if (entity.id.includes('chest-map')) {
            set({ hasMiniMap: true });
          }
          
          // Clear interacting ID so user can release E
          set({ interactingEntityId: null });
          
          setTimeout(() => set({ isNarrationActive: false }), 6000);
        }
      },

      startInteracting: (id: string) => set({ interactingEntityId: id, interactionProgress: 0 }),
      stopInteracting: () => set({ interactingEntityId: null, interactionProgress: 0 }),
      
      tickInteraction: (dt: number) => {
        const state = get();
        if (!state.interactingEntityId) return;
        
        const newProgress = Math.min(100, state.interactionProgress + dt);
        if (newProgress >= 100 && state.interactionProgress < 100) {
          get().interact();
        } else {
          set({ interactionProgress: newProgress });
        }
      },

      movePlayer: (dx, dy) => {
        const state = get();
        if (state.status !== 'playing') return;
        const now = Date.now();
        const targetX = state.playerPos.x + dx;
        const targetY = state.playerPos.y + dy;

        // Interior Logic
        if (HOUSE_MAPS[state.currentMap]) {
          const house = HOUSE_MAPS[state.currentMap];
          if (targetX < 0 || targetX >= house.dims.cols || targetY < 0 || targetY >= house.dims.rows) return;
          const intTile = house.map[targetY][targetX];
          
          if (intTile === 9) { // EXIT
            const back = state.returnPos ?? { x: SPAWN_POINT.x, y: SPAWN_POINT.y + 1 };
            set({
              currentMap: 'village_chapter',
              playerPos: { x: back.x, y: back.y + 1 },
              returnPos: null,
              entities: state.entities.filter(e => !e.id.startsWith('temp-')),
              interactionMessage: null,
              currentNarration: "Exiting to Village Square...",
              isNarrationActive: true
            });
            setTimeout(() => set({ isNarrationActive: false }), 2000);
            return;
          }

          // Simplified Interior Collision
          const intProps = TILE_PROPERTIES_INT[intTile];
          if (intProps && !intProps.walkable) return;

          const nearbyChest = state.entities.find(e => e.type === 'chest' && Math.abs(e.x - targetX) <= 1 && Math.abs(e.y - targetY) <= 1);
          set({ 
            playerPos: { x: targetX, y: targetY }, 
            lastMoveTime: now,
            interactionMessage: nearbyChest ? (nearbyChest.isOpened ? "(Hold E to Re-Read)" : "HOLD E TO OPEN") : null
          });
          return;
        }

        // World Logic
        if (targetY < 0 || targetY >= chapter1Map.length || targetX < 0 || targetX >= chapter1Map[0].length) return;
        const tileType = chapter1Map[targetY][targetX];

        if (tileType === 26) { // HOUSE DOOR (HD)
          let houseId: MapId | null = null;
          let houseName = "";

          // New Precise Coordinate Mapping (Synced with main.ts)
          if (targetY === 28 && (targetX === 32 || targetX === 33)) { 
             houseId = 'house-boysHome'; houseName = "Your Home";
          } else if (targetY === 8 && (targetX === 27 || targetX === 28)) { 
             houseId = 'house-elder'; houseName = "Elder's House";
          } else if (targetY === 21 && (targetX === 7 || targetX === 8)) { 
             houseId = 'house-neighborA'; houseName = "Neighbor's House";
          } else if (targetY === 43 && (targetX === 12 || targetX === 13)) { 
             houseId = 'house-neighborB'; houseName = "Neighbor's House";
          } else if (targetY === 15 && (targetX === 41 || targetX === 42)) { 
             houseId = 'house-inn'; houseName = "The Village Inn";
          }

          if (houseId) {
            const house = HOUSE_MAPS[houseId];
            set({
              currentMap: houseId,
              playerPos: { x: house.spawn.x, y: house.spawn.y },
              returnPos: { x: targetX, y: targetY },
              entities: [...state.entities, ...house.entities.map((e: DynamicEntity) => ({ ...e, id: 'temp-' + e.id }))],
              currentNarration: `Entering ${houseName}...`,
              isNarrationActive: true
            });
            setTimeout(() => set({ isNarrationActive: false }), 3000);
            return;
          }
        }

        const props = TILE_PROPERTIES[tileType];
        if (!props?.walkable) return;

        const entity = state.entities.find(e => e.x === targetX && e.y === targetY);
        if (entity?.type === 'block') return;

        if (entity?.type === 'goal') {
          set({ playerPos: { x: targetX, y: targetY }, status: 'victory' });
          return;
        }

        const getHouseAtSign = (sx: number, sy: number): string | null => {
          if (sy === 14 && sx === 6) return "Our Home";
          if (sy === 9 && sx === 26) return "Elder Kael's Hall";
          if (sy === 22 && sx === 6) return "Finn's Cottage";
          if (sy === 44 && sx === 11) return "Lyra's Abode";
          if (sy === 16 && sx === 41) return "The Village Inn";
          return null;
        };

        const nearbyChest = state.entities.find(e => e.type === 'chest' && Math.abs(e.x - targetX) <= 1 && Math.abs(e.y - targetY) <= 1);
        
        // Detect Signboard Proximity
        let signMessage: string | null = null;
        for(let dy=-1; dy<=1; dy++) {
          for(let dx=-1; dx<=1; dx++) {
            if (chapter1Map[targetY+dy]?.[targetX+dx] === TILES.SG) {
              const name = getHouseAtSign(targetX+dx, targetY+dy);
              if (name) signMessage = `[ ${name} ]`;
            }
          }
        }

        const newHistory = [...state.playerHistory, { x: targetX, y: targetY }].slice(-5);
        set({ 
          playerPos: { x: targetX, y: targetY }, 
          playerHistory: newHistory, 
          lastMoveTime: now, 
          interactionMessage: signMessage || (nearbyChest ? (nearbyChest.isOpened ? "[E] TO RE-READ MESSAGE" : "[E] TO OPEN (HOLD)") : null)
        });
      }
    }),
    {
      name: 'watching-world-save',
    }
  )
);
