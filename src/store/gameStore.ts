import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  chapter1Map, HOUSE_MAPS, TILES, TILE_PROPERTIES 
} from '../data/maps/village_chapter/index';
import { TILE_PROPERTIES_INT } from '../data/maps/village_chapter/houses/constants';
import { SPAWN_POINT, EXIT_ZONE } from '../data/maps/village_chapter/index';

import type { DynamicEntity, GameStatus, MapId } from '@/types/game';

interface GameState {
  sessionId: string;
  playerPos: { x: number; y: number };
  playerHistory: { x: number; y: number }[];
  lastMoveTime: number;
  playerEnergy: number;
  playerHunger: number;
  qteActive: boolean;
  aiTrapFrequencyMs: number;
  status: GameStatus;
  entities: DynamicEntity[];
  gameStartTime: number;

  currentNarration: string;
  isNarrationActive: boolean;

  // Map state
  currentMap: MapId;
  returnPos: { x: number; y: number } | null; 
  entryFromWorldPos: { x: number; y: number } | null;
  isMapTransitioning: boolean;
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
  updateSurvival: () => void;
  spawnPredictedThreat: () => void;
  handleAITurn: (aiStrategy: unknown) => void;
  resolveQTE: (success: boolean) => void;
  syncRouteMap: (mapId: MapId) => void;
  setMapTransitioning: (isTransitioning: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      sessionId: '', 
      playerPos: { x: 20, y: 18 },
      playerHistory: [],
      lastMoveTime: 0,
      playerEnergy: 300,
      playerHunger: 0,
      qteActive: false,
      aiTrapFrequencyMs: 15000,
      status: 'playing',
      entities: [],
      gameStartTime: 0,

      currentNarration: '',
      isNarrationActive: false,
      currentMap: 'village_chapter',
      returnPos: null,
      entryFromWorldPos: null,
      isMapTransitioning: false,
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
          playerEnergy: 300,
          playerHunger: 0,
          qteActive: false,
          aiTrapFrequencyMs: 15000,
          status: 'playing',
          gameStartTime: Date.now(),
          entities: startingEntities,
          currentNarration: '',
          isNarrationActive: false,
          currentMap: 'village_chapter',
          returnPos: null,
          entryFromWorldPos: null,
          isMapTransitioning: false,
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

      updateSurvival: () => {
        const state = get();
        if (state.status !== 'playing') return;

        const nextHunger = Math.min(100, state.playerHunger + 0.2);
        const energyDrain = nextHunger > 85 ? 0.6 : 0.2;
        const nextEnergy = Math.max(0, state.playerEnergy - energyDrain);
        const nextVisibility = Math.max(2, 5 - nextHunger / 25);

        if (nextEnergy <= 0) {
          set({
            playerEnergy: 0,
            playerHunger: nextHunger,
            visibilityRadius: nextVisibility,
            status: 'game_over',
          });
          return;
        }

        set({
          playerEnergy: nextEnergy,
          playerHunger: nextHunger,
          visibilityRadius: nextVisibility,
        });
      },

      spawnPredictedThreat: () => {
        // Placeholder hook for AI threat spawning. Keeping this no-op
        // preserves type contracts for currently mounted overlays.
      },

      handleAITurn: (aiStrategy: unknown) => {
        if (!aiStrategy || typeof aiStrategy !== 'object') return;
      },

      resolveQTE: (success: boolean) => {
        const state = get();
        if (!state.qteActive) return;
        set({
          qteActive: false,
          playerEnergy: success ? Math.min(300, state.playerEnergy + 5) : Math.max(0, state.playerEnergy - 20),
          status: success ? state.status : state.playerEnergy <= 20 ? 'game_over' : state.status,
        });
      },

      syncRouteMap: (mapId: MapId) => {
        const state = get();
        if (!state.sessionId) {
          get().initializeGame();
        }

        const latestState = get();
        if (latestState.currentMap === mapId) {
          set({ isMapTransitioning: false });
          return;
        }

        const persistentEntities = latestState.entities.filter(e => !e.id.startsWith('temp-'));

        if (mapId === 'village_chapter') {
          set({
            currentMap: 'village_chapter',
            entities: persistentEntities,
            interactionMessage: null,
            isMapTransitioning: false,
          });
          return;
        }

        const house = HOUSE_MAPS[mapId];
        if (!house) {
          set({ isMapTransitioning: false });
          return;
        }

        set({
          currentMap: mapId,
          playerPos: { x: house.spawn.x, y: house.spawn.y },
          entities: [
            ...persistentEntities,
            ...house.entities.map((e: DynamicEntity) => ({ ...e, id: 'temp-' + e.id })),
          ],
          interactionMessage: null,
          isMapTransitioning: false,
        });
      },

      setMapTransitioning: (isTransitioning: boolean) => set({ isMapTransitioning: isTransitioning }),

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
            const preferredExit = state.entryFromWorldPos ?? state.returnPos ?? { x: SPAWN_POINT.x, y: SPAWN_POINT.y + 1 };
            const isWalkableWorldTile = (x: number, y: number) => {
              if (y < 0 || y >= chapter1Map.length || x < 0 || x >= chapter1Map[0].length) return false;
              const tile = chapter1Map[y][x];
              if (!TILE_PROPERTIES[tile]?.walkable) return false;
              const blocking = state.entities.find(e => {
                if (e.isHidden || e.id.startsWith('temp-')) return false;
                const w = e.width || 1;
                const h = e.height || 1;
                const inside = x >= e.x && x < e.x + w && y >= e.y && y < e.y + h;
                return inside && (e.type === 'npc' || e.type === 'block' || e.type === 'chest');
              });
              return !blocking;
            };

            const findNearestWorldTile = (x: number, y: number) => {
              if (isWalkableWorldTile(x, y)) return { x, y };
              const deltas = [
                [0, -1], [1, 0], [0, 1], [-1, 0],
                [1, -1], [1, 1], [-1, 1], [-1, -1],
                [0, -2], [2, 0], [0, 2], [-2, 0],
              ] as const;
              for (const [dx2, dy2] of deltas) {
                const nx = x + dx2;
                const ny = y + dy2;
                if (isWalkableWorldTile(nx, ny)) return { x: nx, y: ny };
              }
              return { x: SPAWN_POINT.x, y: SPAWN_POINT.y + 1 };
            };

            const exitPos = findNearestWorldTile(preferredExit.x, preferredExit.y);
            set({
              currentMap: 'village_chapter',
              playerPos: exitPos,
              returnPos: null,
              entryFromWorldPos: null,
              isMapTransitioning: true,
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

          // Multi-tile Entity Collision
          const blockingEntity = state.entities.find(e => {
            if (e.isHidden) return false;
            const w = e.width || 1;
            const h = e.height || 1;
            return targetX >= e.x && targetX < e.x + w && targetY >= e.y && targetY < e.y + h;
          });
          if (blockingEntity && (blockingEntity.type === 'npc' || blockingEntity.type === 'block' || blockingEntity.type === 'chest')) {
            return;
          }

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
             houseId = 'house-boysHome'; houseName = "Our Home";
          } else if (targetY === 8 && (targetX === 27 || targetX === 28)) { 
             houseId = 'house-elder'; houseName = "Elder Kael's Hall";
          } else if (targetY === 21 && (targetX === 7 || targetX === 8)) { 
             houseId = 'house-neighborA'; houseName = "Finn's Cottage";
          } else if (targetY === 43 && (targetX === 12 || targetX === 13)) { 
             houseId = 'house-neighborB'; houseName = "Lyra's Abode";
          } else if (targetY === 15 && (targetX === 41 || targetX === 42)) { 
             houseId = 'house-inn'; houseName = "The Village Inn";
          }

          if (houseId) {
            const house = HOUSE_MAPS[houseId];
            set({
              currentMap: houseId,
              playerPos: { x: house.spawn.x, y: house.spawn.y },
              returnPos: { x: targetX, y: targetY },
              entryFromWorldPos: { x: state.playerPos.x, y: state.playerPos.y },
              isMapTransitioning: true,
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

        // Multi-tile Entity Collision
        const blockingEntity = state.entities.find(e => {
          if (e.isHidden) return false;
          const w = e.width || 1;
          const h = e.height || 1;
          return targetX >= e.x && targetX < e.x + w && targetY >= e.y && targetY < e.y + h;
        });
        
        if (blockingEntity && (blockingEntity.type === 'npc' || blockingEntity.type === 'block' || blockingEntity.type === 'chest')) {
          if (blockingEntity.type === 'block' || blockingEntity.type === 'npc' || blockingEntity.type === 'chest') return;
        }

        if (blockingEntity?.type === 'goal') {
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
      name: 'watching-world-save-chapter1',
    }
  )
);
