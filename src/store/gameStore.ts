import { create } from 'zustand';
import { level1Map, TILE_PROPERTIES, TILES } from '../data/maps/level1';

export type GameStatus = 'playing' | 'game_over' | 'victory' | 'paused';

export interface DynamicEntity {
  id: string;
  x: number;
  y: number;
  type: 'corruption' | 'trap' | 'goal' | 'block';
  isHidden?: boolean;
}

interface AIAction {
  narration?: string;
  trapFrequencyMs?: number;
  attackType?: 'trap' | 'block' | 'corruption';
}

interface GameState {
  sessionId: string;
  playerPos: { x: number; y: number };
  playerHistory: { x: number; y: number }[];
  playerEnergy: number;
  playerHunger: number;
  visibilityRadius: number;
  lastMoveTime: number;
  status: GameStatus;
  entities: DynamicEntity[];
  qteActive: boolean;
  gameStartTime: number;

  // AI Master settings
  aiTrapFrequencyMs: number;
  aiPreferredAttack: 'trap' | 'block' | 'corruption';
  currentNarration: string;
  isNarrationActive: boolean;
  
  // Actions
  initializeGame: () => void;
  movePlayer: (dx: number, dy: number) => void;
  updateSurvival: () => void;
  togglePause: () => void;
  handleAITurn: (aiAction: AIAction) => void;
  resolveQTE: (success: boolean) => void;
  spawnPredictedThreat: () => void;
}

// Helper: Pathfinding Check (BFS) to ensure goal is reachable
function hasPathToGoal(start: {x: number, y: number}, goal: {x: number, y: number}, entities: DynamicEntity[]): boolean {
  const queue = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const rows = level1Map.length;
  const cols = level1Map[0].length;
  const blockMap = new Set(entities.filter(e => e.type === 'block').map(e => `${e.x},${e.y}`));

  while (queue.length > 0) {
    const {x, y} = queue.shift()!;
    if (x === goal.x && y === goal.y) return true;

    for (const [dx, dy] of [[0,1], [0,-1], [1,0], [-1,0]]) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;

      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited.has(key)) {
        const tileType = level1Map[ny][nx];
        if (TILE_PROPERTIES[tileType].walkable && !blockMap.has(key)) {
          visited.add(key);
          queue.push({x: nx, y: ny});
        }
      }
    }
  }
  return false;
}

// Helper: Log Action to telemetry
async function logAction(
  sessionId: string,
  actionType: string,
  x?: number,
  y?: number,
  details?: Record<string, unknown>
) {
  try {
    await fetch('/api/log-action', {
      method: 'POST',
      body: JSON.stringify({ sessionId, actionType, x, y, details })
    });
  } catch (e) {
    console.error('Failed to log action:', e);
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  sessionId: '', 
  playerPos: { x: 13, y: 3 },
  playerHistory: [],
  playerEnergy: 300,
  playerHunger: 0,
  visibilityRadius: 22,
  lastMoveTime: 0,
  status: 'playing',
  entities: [],
  qteActive: false,
  gameStartTime: 0,

  aiTrapFrequencyMs: 5000,
  aiPreferredAttack: 'trap',
  currentNarration: '',
  isNarrationActive: false,

  initializeGame: () => {
    const newSessionId = crypto.randomUUID();
    const goalX = 145;
    const goalY = 115;
    const startingEntities: DynamicEntity[] = [
      { id: 'goal-1', x: goalX, y: goalY, type: 'goal' }
    ];

    // Pre-place some traps
    let trapsPlaced = 0;
    while (trapsPlaced < 50) {
      const rx = Math.floor(Math.random() * 160);
      const ry = Math.floor(Math.random() * 120);
      if (rx < 20 && ry < 20) continue; 
      const type = level1Map[ry]?.[rx];
      if (type !== undefined && TILE_PROPERTIES[type].walkable) {
         startingEntities.push({ id: `pre-trap-${trapsPlaced}`, x: rx, y: ry, type: 'trap', isHidden: true });
         trapsPlaced++;
      }
    }

    set({
      sessionId: newSessionId,
      playerPos: { x: 13, y: 3 },
      playerHistory: [{ x: 13, y: 3 }],
      playerEnergy: 300,
      playerHunger: 0,
      visibilityRadius: 22,
      lastMoveTime: 0,
      status: 'playing',
      qteActive: false,
      gameStartTime: Date.now(),
      entities: startingEntities,
      currentNarration: 'I see you... your journey begins now.',
      isNarrationActive: true
    });

    logAction(newSessionId, 'GAME_START', 13, 3);
    
    // Auto-dismiss narration after 5s
    setTimeout(() => set({ isNarrationActive: false }), 5000);
  },

  togglePause: () => {
    const state = get();
    if (state.status === 'playing') set({ status: 'paused' });
    else if (state.status === 'paused') set({ status: 'playing' });
  },

  updateSurvival: () => {
    const state = get();
    if (state.status !== 'playing' || state.qteActive) return;
    const newHunger = Math.min(100, state.playerHunger + 0.02); 
    let newVisibility = 22;
    if (newHunger > 80) {
      newVisibility = 22 - ((newHunger - 80) / 20) * 14;
    }
    if (newHunger >= 100) {
      set({ status: 'game_over' });
      logAction(state.sessionId, 'GAME_OVER_STARVATION', state.playerPos.x, state.playerPos.y);
    } else {
      set({ playerHunger: newHunger, visibilityRadius: newVisibility });
    }
  },

  movePlayer: (dx, dy) => {
    const state = get();
    if (state.status !== 'playing' || state.qteActive) return;
    const now = Date.now();
    const targetX = state.playerPos.x + dx;
    const targetY = state.playerPos.y + dy;

    if (targetY < 0 || targetY >= level1Map.length || targetX < 0 || targetX >= level1Map[0].length) return;
    const tileType = level1Map[targetY][targetX];
    
    // WATER Check
    if (tileType === TILES.WI || tileType === TILES.WS || tileType === TILES.WE || tileType === TILES.WF) {
      const newEnergy = state.playerEnergy - 10;
      if (newEnergy <= 0) set({ status: 'game_over' });
      else set({ playerEnergy: newEnergy, lastMoveTime: now });
      return;
    }

    const props = TILE_PROPERTIES[tileType];
    if (!props.walkable) return;
    const entity = state.entities.find(e => e.x === targetX && e.y === targetY);
    if (entity?.type === 'block') return;

    let newHunger = Math.min(100, state.playerHunger + 0.15);
    let newEnergy = state.playerEnergy;
    if (tileType === TILES.FO) newHunger = Math.max(0, newHunger - 30);
    if (tileType === TILES.HL) newEnergy = Math.min(300, newEnergy + 60);

    if (entity?.type === 'goal') {
      set({ playerPos: { x: targetX, y: targetY }, status: 'victory' });
      logAction(state.sessionId, 'VICTORY', targetX, targetY);
      return;
    }

    if (entity?.type === 'trap') {
      set({ playerPos: { x: targetX, y: targetY }, qteActive: true, lastMoveTime: now, playerHunger: newHunger });
      return;
    }

    if (entity?.type === 'corruption') {
      newEnergy -= 15;
      if (newEnergy <= 0) {
        set({ playerPos: { x: targetX, y: targetY }, playerEnergy: 0, status: 'game_over' });
        logAction(state.sessionId, 'GAME_OVER_CORRUPTION', targetX, targetY);
        return;
      }
      set({ playerPos: { x: targetX, y: targetY }, playerEnergy: newEnergy, lastMoveTime: now, playerHunger: newHunger });
      return;
    }

    const newHistory = [...state.playerHistory, { x: targetX, y: targetY }].slice(-5);
    set({ playerPos: { x: targetX, y: targetY }, playerHistory: newHistory, lastMoveTime: now, playerHunger: newHunger, playerEnergy: newEnergy });
  },

  handleAITurn: (aiAction: AIAction) => {
    const state = get();
    if (state.status !== 'playing') return;

    const newNarration = aiAction.narration || state.currentNarration;
    set({ 
      aiTrapFrequencyMs: aiAction.trapFrequencyMs || state.aiTrapFrequencyMs,
      aiPreferredAttack: aiAction.attackType || state.aiPreferredAttack,
      currentNarration: newNarration,
      isNarrationActive: !!aiAction.narration
    });

    if (aiAction.narration) {
      logAction(state.sessionId, 'AI_NARRATION', state.playerPos.x, state.playerPos.y, { narration: newNarration });
      setTimeout(() => set({ isNarrationActive: false }), 6000);
    }

    // Predictive spawning (with Fair Play pathfinding check)
    if (state.playerHistory.length >= 2) {
      const history = state.playerHistory;
      const curr = history[history.length - 1];
      const prev = history[Math.max(0, history.length - 3)];
      let dx = curr.x - prev.x;
      let dy = curr.y - prev.y;
      if (dx !== 0) dx = dx > 0 ? 1 : -1;
      if (dy !== 0) dy = dy > 0 ? 1 : -1;
      const targetX = Math.max(0, Math.min(159, curr.x + dx * 2));
      const targetY = Math.max(0, Math.min(119, curr.y + dy * 2));

      const typ = aiAction.attackType || 'trap';
      const potentialEntities = [...state.entities, { id: `threat-${Date.now()}`, x: targetX, y: targetY, type: typ }];
      
      // FAIR PLAY: Ensure a path still exists
      if (!state.entities.some(e => e.x === targetX && e.y === targetY) && 
          hasPathToGoal(state.playerPos, {x: 145, y: 115}, potentialEntities)) {
        set({ entities: potentialEntities });
        logAction(state.sessionId, 'AI_SPAWN', targetX, targetY, { type: typ });
      } else {
        console.log("AI attempt rejected by Fair Play constraint.");
      }
    }
  },

  resolveQTE: (success: boolean) => {
    const state = get();
    if (!state.qteActive) return;
    const { x, y } = state.playerPos;
    const newEntities = state.entities.filter(e => !(e.type === 'trap' && e.x === x && e.y === y));
    const penalty = success ? 5 : 20;
    const newEnergy = Math.max(0, state.playerEnergy - penalty);

    set({ playerEnergy: newEnergy, qteActive: false, entities: newEntities });
    logAction(state.sessionId, success ? 'QTE_SUCCESS' : 'QTE_FAIL', x, y);
    
    if (newEnergy <= 0) set({ status: 'game_over' });
  },

  spawnPredictedThreat: () => {
    const state = get();
    if (state.status !== 'playing' || state.qteActive || state.playerHistory.length < 2) return;

    const history = state.playerHistory;
    const curr = history[history.length - 1];
    const prev = history[Math.max(0, history.length - 3)];
    let dx = curr.x - prev.x;
    let dy = curr.y - prev.y;
    if (dx !== 0) dx = dx > 0 ? 1 : -1;
    if (dy !== 0) dy = dy > 0 ? 1 : -1;
    const targetX = Math.max(0, Math.min(159, curr.x + dx * 2));
    const targetY = Math.max(0, Math.min(119, curr.y + dy * 2));

    const typ = state.aiPreferredAttack || 'trap';
    const potentialEntities = [...state.entities, { id: `threat-${Date.now()}`, x: targetX, y: targetY, type: typ, isHidden: typ === 'trap' }];
    
    // FAIR PLAY: Ensure a path still exists
    if (!state.entities.some(e => e.x === targetX && e.y === targetY) && 
        hasPathToGoal(state.playerPos, {x: 145, y: 115}, potentialEntities)) {
      set({ entities: potentialEntities });
      logAction(state.sessionId, 'AI_SPAWN', targetX, targetY, { type: typ });
    }
  }
}));
