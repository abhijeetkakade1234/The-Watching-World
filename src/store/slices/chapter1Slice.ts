import type { StateCreator } from 'zustand';
import {
  chapter1Map,
  EXIT_ZONE,
  HOUSE_MAPS,
  SPAWN_POINT,
  TILE_PROPERTIES,
  TILES,
} from '@/data/maps/village_chapter/index';
import {
  CHAPTER1_FINN_DIALOGUE_SCRIPT,
  CHAPTER1_KAEL_DIALOGUE_SCRIPT,
  CHAPTER1_LYRA_DIALOGUE_SCRIPT,
  CHAPTER1_ROWAN_DIALOGUE_SCRIPT,
} from '@/chapters/chapter1/dialogue';
import { TILE_PROPERTIES_INT } from '@/data/maps/village_chapter/houses/constants';
import { isEntityWithinRange } from '@/utils/entityInteraction';
import type { DynamicEntity, MapId } from '@/types/game';
import type { Chapter1PreparationProgress, Chapter1ObjectiveStage, CoreActions, GameState } from '@/store/gameStore.types';

const EMPTY_CHAPTER1_PREPARATION_PROGRESS: Chapter1PreparationProgress = {
  visitedLyraAbode: false,
  visitedVillageInn: false,
  visitedElderKael: false,
};

function chapter1ProgressFromHouseId(houseId: MapId): Partial<Chapter1PreparationProgress> {
  if (houseId === 'house-inn') return { visitedVillageInn: true };
  return {};
}

const DIALOGUE_MIN_MS = 2400;
const DIALOGUE_MAX_MS = 5200;
const DIALOGUE_MS_PER_CHAR = 42;
const ROWAN_ENTITY_ID = 'rowan-bridge';
const ROWAN_SPRITE_PATH = '/characters/elder-rowan.png';
const ROWAN_BRIDGE_POSITION = { x: 22, y: 65 };
const BRIDGE_BLOCKED_MESSAGE = 'Complete the objectives first';
const BRIDGE_BLOCKED_MESSAGE_COOLDOWN_MS = 1800;
const BRIDGE_BLOCKED_MESSAGE_DURATION_MS = 1500;

let dialogueTimer: ReturnType<typeof setTimeout> | null = null;
let bridgeBlockedMessageCooldownUntil = 0;

function clearDialogueTimer() {
  if (dialogueTimer) {
    clearTimeout(dialogueTimer);
    dialogueTimer = null;
  }
}

function dialogueLineDurationMs(text: string): number {
  return Math.max(DIALOGUE_MIN_MS, Math.min(DIALOGUE_MAX_MS, text.length * DIALOGUE_MS_PER_CHAR));
}

function isChapter1PreparationComplete(progress: Chapter1PreparationProgress): boolean {
  return progress.visitedLyraAbode && progress.visitedVillageInn && progress.visitedElderKael;
}

function nextChapter1StageAfterProgress(
  currentStage: Chapter1ObjectiveStage,
  progress: Chapter1PreparationProgress
): Chapter1ObjectiveStage {
  if (currentStage === 'prepare_for_forest' && isChapter1PreparationComplete(progress)) {
    return 'meet_elder_rowan';
  }
  return currentStage;
}

function withRowanVisibility(entities: DynamicEntity[], stage: Chapter1ObjectiveStage): DynamicEntity[] {
  const shouldShowRowan = stage === 'meet_elder_rowan' || stage === 'chapter_entry_unlocked';
  return entities.map((entity) => {
    const baseId = entity.id.startsWith('temp-') ? entity.id.slice(5) : entity.id;
    if (baseId !== ROWAN_ENTITY_ID) return entity;
    return { ...entity, isHidden: !shouldShowRowan };
  });
}

function ensureRowanEntity(entities: DynamicEntity[]): DynamicEntity[] {
  const hasRowan = entities.some((entity) => {
    const baseId = entity.id.startsWith('temp-') ? entity.id.slice(5) : entity.id;
    return baseId === ROWAN_ENTITY_ID;
  });
  if (hasRowan) return entities;
  return [
    ...entities,
    {
      id: ROWAN_ENTITY_ID,
      x: ROWAN_BRIDGE_POSITION.x,
      y: ROWAN_BRIDGE_POSITION.y,
      type: 'npc',
      sprite: ROWAN_SPRITE_PATH,
      width: 2,
      height: 2,
      isHidden: true,
    },
  ];
}

type Chapter1Slice = Omit<GameState, keyof CoreActions>;

export const createChapter1Slice: StateCreator<GameState, [], [], Chapter1Slice> = (set, get) => ({
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
  isMusicEnabled: true,
  visibilityRadius: 5,
  interactionMessage: null,
  interactionProgress: 0,
  interactingEntityId: null,
  chapter1ObjectiveStage: 'find_finn_house',
  chapter1PreparationProgress: { ...EMPTY_CHAPTER1_PREPARATION_PROGRESS },
  hasVisitedFinnCottage: false,
  hasTalkedToFinn: false,
  hasTalkedToKael: false,
  hasTalkedToLyra: false,
  hasReceivedMapFromKael: false,
  hasMetElderRowan: false,
  isDialogueActive: false,
  dialogueSpeaker: '',
  dialogueText: '',
  dialogueLineIndex: -1,

  initializeGame: (opts?: { spawnX?: number; spawnY?: number }) => {
    clearDialogueTimer();
    if (get().sessionId !== '') return;

    const spawnX = opts?.spawnX ?? SPAWN_POINT.x;
    const spawnY = opts?.spawnY ?? SPAWN_POINT.y;
    const newSessionId = crypto.randomUUID();

    const goalX = EXIT_ZONE.xStart + 1;
    const goalY = EXIT_ZONE.y - 1;

    const startingEntities: DynamicEntity[] = [
      { id: 'goal-1', x: goalX, y: goalY, type: 'goal' },
      {
        id: ROWAN_ENTITY_ID,
        x: ROWAN_BRIDGE_POSITION.x,
        y: ROWAN_BRIDGE_POSITION.y,
        type: 'npc',
        sprite: ROWAN_SPRITE_PATH,
        width: 2,
        height: 2,
        isHidden: true,
      },
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
      isMusicEnabled: get().isMusicEnabled,
      visibilityRadius: 5,
      interactionMessage: null,
      interactionProgress: 0,
      interactingEntityId: null,
      chapter1ObjectiveStage: 'find_finn_house',
      chapter1PreparationProgress: { ...EMPTY_CHAPTER1_PREPARATION_PROGRESS },
      hasVisitedFinnCottage: false,
      hasTalkedToFinn: false,
      hasTalkedToKael: false,
      hasTalkedToLyra: false,
      hasReceivedMapFromKael: false,
      hasMetElderRowan: false,
      isDialogueActive: false,
      dialogueSpeaker: '',
      dialogueText: '',
      dialogueLineIndex: -1,
    });
  },

  interact: () => {
    const state = get();
    const entityId = state.interactingEntityId;
    if (!entityId) return;

    const entity = state.entities.find((e) => e.id === entityId);
    if (entity && entity.type === 'chest') {
      const newEntities = state.entities.map((e) => (e.id === entity.id ? { ...e, isOpened: true } : e));

      set({
        entities: newEntities,
        currentNarration: entity.message || 'A faint memory flickers...',
        isNarrationActive: true,
        interactionProgress: 100,
        interactionMessage: '(Hold E to Re-Read)',
      });

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
      const persistentEntities = ensureRowanEntity(latestState.entities.filter((e) => !e.id.startsWith('temp-')));
      set({
        entities:
          mapId === 'village_chapter'
            ? withRowanVisibility(persistentEntities, latestState.chapter1ObjectiveStage)
            : [...persistentEntities, ...latestState.entities.filter((e) => e.id.startsWith('temp-'))],
        isMapTransitioning: false,
      });
      return;
    }

    const persistentEntities = ensureRowanEntity(latestState.entities.filter((e) => !e.id.startsWith('temp-')));

    if (mapId === 'village_chapter') {
      clearDialogueTimer();
      set({
        currentMap: 'village_chapter',
        entities: withRowanVisibility(persistentEntities, latestState.chapter1ObjectiveStage),
        interactionMessage: null,
        isDialogueActive: false,
        dialogueSpeaker: '',
        dialogueText: '',
        dialogueLineIndex: -1,
        isMapTransitioning: false,
      });
      return;
    }

    const house = HOUSE_MAPS[mapId];
    if (!house) {
      set({ isMapTransitioning: false });
      return;
    }

    const enteringFinnForFirstTime = mapId === 'house-neighborA' && !latestState.hasVisitedFinnCottage;
    const mergedProgress: Chapter1PreparationProgress = {
      ...latestState.chapter1PreparationProgress,
      ...chapter1ProgressFromHouseId(mapId),
    };
    const nextStage = nextChapter1StageAfterProgress(
      enteringFinnForFirstTime ? 'talk_to_finn' : latestState.chapter1ObjectiveStage,
      mergedProgress
    );

    set({
      currentMap: mapId,
      playerPos: { x: house.spawn.x, y: house.spawn.y },
      entities: [...persistentEntities, ...house.entities.map((e: DynamicEntity) => ({ ...e, id: 'temp-' + e.id }))],
      chapter1PreparationProgress: mergedProgress,
      hasVisitedFinnCottage: latestState.hasVisitedFinnCottage || mapId === 'house-neighborA',
      chapter1ObjectiveStage: nextStage,
      interactionMessage: null,
      isMapTransitioning: false,
    });
  },

  setMapTransitioning: (isTransitioning: boolean) => set({ isMapTransitioning: isTransitioning }),

  startFinnDialogue: () => {
    const state = get();
    if (state.currentMap !== 'house-neighborA') return;
    if (state.isDialogueActive) return;

    const startLine = CHAPTER1_FINN_DIALOGUE_SCRIPT[0];
    if (!startLine) return;

    clearDialogueTimer();

    const playLine = (lineIndex: number) => {
      const line = CHAPTER1_FINN_DIALOGUE_SCRIPT[lineIndex];
      if (!line) {
        set({
          isDialogueActive: false,
          dialogueSpeaker: '',
          dialogueText: '',
          dialogueLineIndex: -1,
          hasTalkedToFinn: true,
          chapter1ObjectiveStage: nextChapter1StageAfterProgress('prepare_for_forest', get().chapter1PreparationProgress),
          interactionMessage: null,
        });
        return;
      }

      set({
        isDialogueActive: true,
        dialogueSpeaker: line.speaker,
        dialogueText: line.text,
        dialogueLineIndex: lineIndex,
        currentNarration: '',
        isNarrationActive: false,
        interactionMessage: null,
        interactingEntityId: null,
        interactionProgress: 0,
      });

      dialogueTimer = setTimeout(() => {
        const latestState = get();
        if (!latestState.isDialogueActive || latestState.currentMap !== 'house-neighborA') {
          clearDialogueTimer();
          return;
        }
        playLine(lineIndex + 1);
      }, dialogueLineDurationMs(line.text));
    };

    playLine(0);
  },

  startKaelDialogue: () => {
    const state = get();
    if (state.currentMap !== 'house-elder') return;
    if (state.isDialogueActive) return;

    const startLine = CHAPTER1_KAEL_DIALOGUE_SCRIPT[0];
    if (!startLine) return;

    clearDialogueTimer();

    const playLine = (lineIndex: number) => {
      const line = CHAPTER1_KAEL_DIALOGUE_SCRIPT[lineIndex];
      if (!line) {
        const updatedProgress: Chapter1PreparationProgress = {
          ...get().chapter1PreparationProgress,
          visitedElderKael: true,
        };
        set({
          isDialogueActive: false,
          dialogueSpeaker: '',
          dialogueText: '',
          dialogueLineIndex: -1,
          hasTalkedToKael: true,
          hasReceivedMapFromKael: true,
          hasMiniMap: true,
          chapter1PreparationProgress: updatedProgress,
          chapter1ObjectiveStage: nextChapter1StageAfterProgress(get().chapter1ObjectiveStage, updatedProgress),
          interactionMessage: null,
        });
        return;
      }

      set({
        isDialogueActive: true,
        dialogueSpeaker: line.speaker,
        dialogueText: line.text,
        dialogueLineIndex: lineIndex,
        currentNarration: '',
        isNarrationActive: false,
        interactionMessage: null,
        interactingEntityId: null,
        interactionProgress: 0,
      });

      dialogueTimer = setTimeout(() => {
        const latestState = get();
        if (!latestState.isDialogueActive || latestState.currentMap !== 'house-elder') {
          clearDialogueTimer();
          return;
        }
        playLine(lineIndex + 1);
      }, dialogueLineDurationMs(line.text));
    };

    playLine(0);
  },

  startLyraDialogue: () => {
    const state = get();
    if (state.currentMap !== 'house-neighborB') return;
    if (state.isDialogueActive) return;

    const startLine = CHAPTER1_LYRA_DIALOGUE_SCRIPT[0];
    if (!startLine) return;

    clearDialogueTimer();

    const playLine = (lineIndex: number) => {
      const line = CHAPTER1_LYRA_DIALOGUE_SCRIPT[lineIndex];
      if (!line) {
        const updatedProgress: Chapter1PreparationProgress = {
          ...get().chapter1PreparationProgress,
          visitedLyraAbode: true,
        };
        set({
          isDialogueActive: false,
          dialogueSpeaker: '',
          dialogueText: '',
          dialogueLineIndex: -1,
          hasTalkedToLyra: true,
          chapter1PreparationProgress: updatedProgress,
          chapter1ObjectiveStage: nextChapter1StageAfterProgress(get().chapter1ObjectiveStage, updatedProgress),
          interactionMessage: null,
        });
        return;
      }

      set({
        isDialogueActive: true,
        dialogueSpeaker: line.speaker,
        dialogueText: line.text,
        dialogueLineIndex: lineIndex,
        currentNarration: '',
        isNarrationActive: false,
        interactionMessage: null,
        interactingEntityId: null,
        interactionProgress: 0,
      });

      dialogueTimer = setTimeout(() => {
        const latestState = get();
        if (!latestState.isDialogueActive || latestState.currentMap !== 'house-neighborB') {
          clearDialogueTimer();
          return;
        }
        playLine(lineIndex + 1);
      }, dialogueLineDurationMs(line.text));
    };

    playLine(0);
  },

  startRowanDialogue: () => {
    const state = get();
    if (state.currentMap !== 'village_chapter') return;
    if (state.isDialogueActive) return;
    if (state.chapter1ObjectiveStage !== 'meet_elder_rowan') return;

    const startLine = CHAPTER1_ROWAN_DIALOGUE_SCRIPT[0];
    if (!startLine) return;

    clearDialogueTimer();

    const playLine = (lineIndex: number) => {
      const line = CHAPTER1_ROWAN_DIALOGUE_SCRIPT[lineIndex];
      if (!line) {
        set((prev) => ({
          isDialogueActive: false,
          dialogueSpeaker: '',
          dialogueText: '',
          dialogueLineIndex: -1,
          hasMetElderRowan: true,
          chapter1ObjectiveStage: 'chapter_entry_unlocked',
          interactionMessage: null,
          entities: withRowanVisibility(ensureRowanEntity(prev.entities), 'chapter_entry_unlocked'),
        }));
        return;
      }

      set({
        isDialogueActive: true,
        dialogueSpeaker: line.speaker,
        dialogueText: line.text,
        dialogueLineIndex: lineIndex,
        currentNarration: '',
        isNarrationActive: false,
        interactionMessage: null,
        interactingEntityId: null,
        interactionProgress: 0,
      });

      dialogueTimer = setTimeout(() => {
        const latestState = get();
        if (!latestState.isDialogueActive || latestState.currentMap !== 'village_chapter') {
          clearDialogueTimer();
          return;
        }
        playLine(lineIndex + 1);
      }, dialogueLineDurationMs(line.text));
    };

    playLine(0);
  },

  restartChapter: (chapterSlug: string) => {
    clearDialogueTimer();
    bridgeBlockedMessageCooldownUntil = 0;

    if (chapterSlug === 'chapter1') {
      const spawnX = SPAWN_POINT.x;
      const spawnY = SPAWN_POINT.y;
      const newSessionId = crypto.randomUUID();
      const goalX = EXIT_ZONE.xStart + 1;
      const goalY = EXIT_ZONE.y - 1;

      const startingEntities: DynamicEntity[] = [
        { id: 'goal-1', x: goalX, y: goalY, type: 'goal' },
        {
          id: ROWAN_ENTITY_ID,
          x: ROWAN_BRIDGE_POSITION.x,
          y: ROWAN_BRIDGE_POSITION.y,
          type: 'npc',
          sprite: ROWAN_SPRITE_PATH,
          width: 2,
          height: 2,
          isHidden: true,
        },
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
        chapter1ObjectiveStage: 'find_finn_house',
        chapter1PreparationProgress: { ...EMPTY_CHAPTER1_PREPARATION_PROGRESS },
        hasVisitedFinnCottage: false,
        hasTalkedToFinn: false,
        hasTalkedToKael: false,
        hasTalkedToLyra: false,
        hasReceivedMapFromKael: false,
        hasMetElderRowan: false,
        isDialogueActive: false,
        dialogueSpeaker: '',
        dialogueText: '',
        dialogueLineIndex: -1,
      });
      return;
    }

    set((state) => ({
      status: 'playing',
      qteActive: false,
      isMapTransitioning: false,
      currentNarration: '',
      isNarrationActive: false,
      interactionMessage: null,
      interactionProgress: 0,
      interactingEntityId: null,
      isDialogueActive: false,
      dialogueSpeaker: '',
      dialogueText: '',
      dialogueLineIndex: -1,
      isMiniMapOpen: false,
      sessionId: state.sessionId || crypto.randomUUID(),
    }));
  },

  movePlayer: (dx, dy) => {
    const state = get();
    if (state.status !== 'playing') return;
    if (state.isDialogueActive) return;
    const now = Date.now();
    const targetX = state.playerPos.x + dx;
    const targetY = state.playerPos.y + dy;

    if (HOUSE_MAPS[state.currentMap]) {
      const house = HOUSE_MAPS[state.currentMap];
      if (targetX < 0 || targetX >= house.dims.cols || targetY < 0 || targetY >= house.dims.rows) return;
      const intTile = house.map[targetY][targetX];

      if (intTile === 9) {
        const preferredExit = state.entryFromWorldPos ?? state.returnPos ?? { x: SPAWN_POINT.x, y: SPAWN_POINT.y + 1 };
        const isWalkableWorldTile = (x: number, y: number) => {
          if (y < 0 || y >= chapter1Map.length || x < 0 || x >= chapter1Map[0].length) return false;
          const tile = chapter1Map[y][x];
          if (!TILE_PROPERTIES[tile]?.walkable) return false;
          const blocking = state.entities.find((e) => {
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
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
            [1, -1],
            [1, 1],
            [-1, 1],
            [-1, -1],
            [0, -2],
            [2, 0],
            [0, 2],
            [-2, 0],
          ] as const;
          for (const [dx2, dy2] of deltas) {
            const nx = x + dx2;
            const ny = y + dy2;
            if (isWalkableWorldTile(nx, ny)) return { x: nx, y: ny };
          }
          return { x: SPAWN_POINT.x, y: SPAWN_POINT.y + 1 };
        };

        const exitPos = findNearestWorldTile(preferredExit.x, preferredExit.y);
        clearDialogueTimer();
        set({
          currentMap: 'village_chapter',
          playerPos: exitPos,
          returnPos: null,
          entryFromWorldPos: null,
          isMapTransitioning: true,
          entities: withRowanVisibility(
            ensureRowanEntity(state.entities.filter((e) => !e.id.startsWith('temp-'))),
            state.chapter1ObjectiveStage
          ),
          interactionMessage: null,
          isDialogueActive: false,
          dialogueSpeaker: '',
          dialogueText: '',
          dialogueLineIndex: -1,
          currentNarration: 'Exiting to Village Square...',
          isNarrationActive: true,
        });
        setTimeout(() => set({ isNarrationActive: false }), 2000);
        return;
      }

      const intProps = TILE_PROPERTIES_INT[intTile];
      if (intProps && !intProps.walkable) return;

      const blockingEntity = state.entities.find((e) => {
        if (e.isHidden) return false;
        const w = e.width || 1;
        const h = e.height || 1;
        return targetX >= e.x && targetX < e.x + w && targetY >= e.y && targetY < e.y + h;
      });
      if (blockingEntity && (blockingEntity.type === 'npc' || blockingEntity.type === 'block' || blockingEntity.type === 'chest')) {
        return;
      }

      const nearbyChest = state.entities.find((e) => e.type === 'chest' && isEntityWithinRange(e, targetX, targetY, 1));
      const nearbyFinn =
        state.currentMap === 'house-neighborA' && !state.isDialogueActive
          ? state.entities.find((e) => {
              if (e.type !== 'npc') return false;
              const baseId = e.id.startsWith('temp-') ? e.id.slice(5) : e.id;
              return baseId === 'finn' && isEntityWithinRange(e, targetX, targetY, 1);
            })
          : null;
      const nearbyKael =
        state.currentMap === 'house-elder' && !state.isDialogueActive
          ? state.entities.find((e) => {
              if (e.type !== 'npc') return false;
              const baseId = e.id.startsWith('temp-') ? e.id.slice(5) : e.id;
              return baseId === 'elder' && isEntityWithinRange(e, targetX, targetY, 1);
            })
          : null;
      const nearbyLyra =
        state.currentMap === 'house-neighborB' && !state.isDialogueActive
          ? state.entities.find((e) => {
              if (e.type !== 'npc') return false;
              const baseId = e.id.startsWith('temp-') ? e.id.slice(5) : e.id;
              return baseId === 'neighbor-b' && isEntityWithinRange(e, targetX, targetY, 1);
            })
          : null;
      set({
        playerPos: { x: targetX, y: targetY },
        lastMoveTime: now,
        interactionMessage: nearbyFinn
          ? '[E] TALK TO FINN'
          : nearbyKael
            ? '[E] TALK TO ELDER KAEL'
            : nearbyLyra
              ? '[E] TALK TO LYRA'
          : nearbyChest
            ? nearbyChest.isOpened
              ? '(Hold E to Re-Read)'
              : 'HOLD E TO OPEN'
            : null,
      });
      return;
    }

    if (targetY < 0 || targetY >= chapter1Map.length || targetX < 0 || targetX >= chapter1Map[0].length) return;
    const tileType = chapter1Map[targetY][targetX];

    if (tileType === 26) {
      let houseId: MapId | null = null;
      let houseName = '';

      if (targetY === 28 && (targetX === 32 || targetX === 33)) {
        houseId = 'house-boysHome';
        houseName = 'Our Home';
      } else if (targetY === 8 && (targetX === 27 || targetX === 28)) {
        houseId = 'house-elder';
        houseName = "Elder Kael's Hall";
      } else if (targetY === 21 && (targetX === 7 || targetX === 8)) {
        houseId = 'house-neighborA';
        houseName = "Finn's Cottage";
      } else if (targetY === 43 && (targetX === 12 || targetX === 13)) {
        houseId = 'house-neighborB';
        houseName = "Lyra's Abode";
      } else if (targetY === 15 && (targetX === 41 || targetX === 42)) {
        houseId = 'house-inn';
        houseName = 'The Village Inn';
      }

      if (houseId) {
        const house = HOUSE_MAPS[houseId];
        const enteringFinnForFirstTime = houseId === 'house-neighborA' && !state.hasVisitedFinnCottage;
        const mergedProgress: Chapter1PreparationProgress = {
          ...state.chapter1PreparationProgress,
          ...chapter1ProgressFromHouseId(houseId),
        };
        const nextStage = nextChapter1StageAfterProgress(
          enteringFinnForFirstTime ? 'talk_to_finn' : state.chapter1ObjectiveStage,
          mergedProgress
        );
        set({
          currentMap: houseId,
          playerPos: { x: house.spawn.x, y: house.spawn.y },
          returnPos: { x: targetX, y: targetY },
          entryFromWorldPos: { x: state.playerPos.x, y: state.playerPos.y },
          isMapTransitioning: true,
          entities: [...state.entities, ...house.entities.map((e: DynamicEntity) => ({ ...e, id: 'temp-' + e.id }))],
          chapter1PreparationProgress: mergedProgress,
          hasVisitedFinnCottage: state.hasVisitedFinnCottage || houseId === 'house-neighborA',
          chapter1ObjectiveStage: nextStage,
          currentNarration: `Entering ${houseName}...`,
          isNarrationActive: true,
        });
        setTimeout(() => set({ isNarrationActive: false }), 3000);
        return;
      }
    }

    const props = TILE_PROPERTIES[tileType];
    if (!props?.walkable) return;

    const blockingEntity = state.entities.find((e) => {
      if (e.isHidden) return false;
      const w = e.width || 1;
      const h = e.height || 1;
      return targetX >= e.x && targetX < e.x + w && targetY >= e.y && targetY < e.y + h;
    });

    if (blockingEntity && (blockingEntity.type === 'npc' || blockingEntity.type === 'block' || blockingEntity.type === 'chest')) {
      if (blockingEntity.type === 'block' || blockingEntity.type === 'npc' || blockingEntity.type === 'chest') return;
    }

    if (blockingEntity?.type === 'goal') {
      if (state.chapter1ObjectiveStage !== 'chapter_entry_unlocked') {
        const nowMs = Date.now();
        if (nowMs >= bridgeBlockedMessageCooldownUntil) {
          bridgeBlockedMessageCooldownUntil = nowMs + BRIDGE_BLOCKED_MESSAGE_COOLDOWN_MS;
          set({
            currentNarration: BRIDGE_BLOCKED_MESSAGE,
            isNarrationActive: true,
          });
          setTimeout(() => set({ isNarrationActive: false }), BRIDGE_BLOCKED_MESSAGE_DURATION_MS);
        }
        return;
      }
      set({ playerPos: { x: targetX, y: targetY }, status: 'victory' });
      return;
    }

    const getHouseAtSign = (sx: number, sy: number): string | null => {
      if (sy === 14 && sx === 6) return 'Our Home';
      if (sy === 9 && sx === 26) return "Elder Kael's Hall";
      if (sy === 22 && sx === 6) return "Finn's Cottage";
      if (sy === 44 && sx === 11) return "Lyra's Abode";
      if (sy === 16 && sx === 41) return 'The Village Inn';
      return null;
    };

    const nearbyChest = state.entities.find((e) => e.type === 'chest' && isEntityWithinRange(e, targetX, targetY, 1));

    let signMessage: string | null = null;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx2 = -1; dx2 <= 1; dx2++) {
        if (chapter1Map[targetY + dy]?.[targetX + dx2] === TILES.SG) {
          const name = getHouseAtSign(targetX + dx2, targetY + dy);
          if (name) signMessage = `[ ${name} ]`;
        }
      }
    }

    const newHistory = [...state.playerHistory, { x: targetX, y: targetY }].slice(-5);
    const nearbyRowan =
      state.chapter1ObjectiveStage === 'meet_elder_rowan' && !state.hasMetElderRowan
        ? state.entities.find((e) => {
            if (e.type !== 'npc' || e.isHidden) return false;
            const baseId = e.id.startsWith('temp-') ? e.id.slice(5) : e.id;
            return baseId === ROWAN_ENTITY_ID && isEntityWithinRange(e, targetX, targetY, 1);
          })
        : null;
    set({
      playerPos: { x: targetX, y: targetY },
      playerHistory: newHistory,
      lastMoveTime: now,
      interactionMessage: signMessage || (nearbyChest ? (nearbyChest.isOpened ? '[E] TO RE-READ MESSAGE' : '[E] TO OPEN (HOLD)') : null),
    });
    if (nearbyRowan) {
      get().startRowanDialogue();
    }
  },
});
