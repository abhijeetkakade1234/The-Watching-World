import type { DynamicEntity, GameStatus, MapId } from '@/types/game';

export type Chapter1ObjectiveStage =
  | 'find_finn_house'
  | 'talk_to_finn'
  | 'prepare_for_forest'
  | 'meet_elder_rowan'
  | 'chapter_entry_unlocked';

export interface Chapter1PreparationProgress {
  visitedLyraAbode: boolean;
  visitedVillageInn: boolean;
  visitedElderKael: boolean;
}

export interface GameState {
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
  currentMap: MapId;
  returnPos: { x: number; y: number } | null;
  entryFromWorldPos: { x: number; y: number } | null;
  isMapTransitioning: boolean;
  hasMiniMap: boolean;
  isMiniMapOpen: boolean;
  isMusicEnabled: boolean;
  visibilityRadius: number;
  interactionMessage: string | null;
  interactionProgress: number;
  interactingEntityId: string | null;
  chapter1ObjectiveStage: Chapter1ObjectiveStage;
  chapter1PreparationProgress: Chapter1PreparationProgress;
  hasVisitedFinnCottage: boolean;
  hasTalkedToFinn: boolean;
  hasTalkedToKael: boolean;
  hasTalkedToLyra: boolean;
  hasReceivedMapFromKael: boolean;
  hasMetElderRowan: boolean;
  isDialogueActive: boolean;
  dialogueSpeaker: string;
  dialogueText: string;
  dialogueLineIndex: number;
  initializeGame: (opts?: { spawnX?: number; spawnY?: number }) => void;
  movePlayer: (dx: number, dy: number) => void;
  togglePause: () => void;
  toggleMap: () => void;
  toggleMusic: () => void;
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
  startFinnDialogue: () => void;
  startKaelDialogue: () => void;
  startLyraDialogue: () => void;
  startRowanDialogue: () => void;
  restartChapter: (chapterSlug: string) => void;
}

export type CoreActions = Pick<GameState, 'togglePause' | 'toggleMap' | 'toggleMusic'>;
