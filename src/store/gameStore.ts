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

interface GameState {
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
  
  // Actions
  initializeGame: () => void;
  movePlayer: (dx: number, dy: number) => void;
  updateSurvival: () => void;
  togglePause: () => void;
  handleAITurn: (aiAction: any) => void;
  resolveQTE: (success: boolean) => void;
  spawnPredictedThreat: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerPos: { x: 13, y: 3 },
  playerHistory: [],
  playerEnergy: 300, // NERF: Increased from 200
  playerHunger: 0,
  visibilityRadius: 22, // NERF: Increased from 18
  lastMoveTime: 0,
  status: 'playing',
  entities: [],
  qteActive: false,
  gameStartTime: Date.now(),

  aiTrapFrequencyMs: 5000,
  aiPreferredAttack: 'trap',

  initializeGame: () => {
    const goalX = 145;
    const goalY = 115;
    const startingEntities: DynamicEntity[] = [
      { id: 'goal-1', x: goalX, y: goalY, type: 'goal' }
    ];

    let trapsPlaced = 0;
    while (trapsPlaced < 50) {
      const rx = Math.floor(Math.random() * 160);
      const ry = Math.floor(Math.random() * 120);
      if (rx < 20 && ry < 20) continue; 
      
      const type = level1Map[ry]?.[rx];
      if (type !== undefined && TILE_PROPERTIES[type].walkable) {
         startingEntities.push({
           id: `pre-trap-${trapsPlaced}`,
           x: rx,
           y: ry,
           type: 'trap',
           isHidden: true
         });
         trapsPlaced++;
      }
    }

    set({
      playerPos: { x: 13, y: 3 },
      playerHistory: [{ x: 13, y: 3 }],
      playerEnergy: 300,
      playerHunger: 0,
      visibilityRadius: 22,
      lastMoveTime: 0,
      status: 'playing',
      qteActive: false,
      gameStartTime: Date.now(),
      entities: startingEntities
    });
  },

  togglePause: () => {
    const state = get();
    if (state.status === 'playing') set({ status: 'paused' });
    else if (state.status === 'paused') set({ status: 'playing' });
  },

  updateSurvival: () => {
    const state = get();
    if (state.status !== 'playing' || state.qteActive) return;

    // NERF: Metabolism 5x slower (0.1 -> 0.02)
    const newHunger = Math.min(100, state.playerHunger + 0.02); 
    
    // NERF: Vision only drops after 80% hunger
    let newVisibility = 22;
    if (newHunger > 80) {
      newVisibility = 22 - ((newHunger - 80) / 20) * 14; // Drops to 8
    }

    if (newHunger >= 100) {
      set({ status: 'game_over' });
    } else {
      set({ playerHunger: newHunger, visibilityRadius: newVisibility });
    }
  },

  movePlayer: (dx, dy) => {
    const state = get();
    if (state.status !== 'playing' || state.qteActive) return;
    
    // Hunger slowdown if hunger > 85 (was 70)
    const now = Date.now();
    const moveCooldown = state.playerHunger > 85 ? 400 : 0;
    if (now - state.lastMoveTime < moveCooldown) return;

    const targetX = state.playerPos.x + dx;
    const targetY = state.playerPos.y + dy;

    if (targetY < 0 || targetY >= level1Map.length) return;
    if (targetX < 0 || targetX >= level1Map[0].length) return;

    const tileType = level1Map[targetY][targetX];
    
    // NERF: WATER IS NO LONGER LETHAL
    if (tileType === TILES.WI || tileType === TILES.WS || tileType === TILES.WE || tileType === TILES.WF) {
      const newEnergy = state.playerEnergy - 10;
      if (newEnergy <= 0) {
        set({ status: 'game_over' });
      } else {
        set({ playerEnergy: newEnergy, lastMoveTime: now });
      }
      return; // Block movement into water but just take damage
    }

    const props = TILE_PROPERTIES[tileType];
    if (!props.walkable) return;

    const entity = state.entities.find(e => e.x === targetX && e.y === targetY);
    if (entity?.type === 'block') return;

    // NERF: Move hunger gain reduced (0.5 -> 0.15)
    const hungerGain = 0.15;
    let newHunger = Math.min(100, state.playerHunger + hungerGain);
    let newEnergy = state.playerEnergy;

    // Interaction
    if (tileType === TILES.FO) {
       newHunger = Math.max(0, newHunger - 30);
    }
    if (tileType === TILES.HL) {
       newEnergy = Math.min(300, newEnergy + 60);
    }

    if (entity?.type === 'goal') {
      set({ playerPos: { x: targetX, y: targetY }, status: 'victory' });
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
        return;
      }
      set({ playerPos: { x: targetX, y: targetY }, playerEnergy: newEnergy, lastMoveTime: now, playerHunger: newHunger });
      return;
    }

    const newHistory = [...state.playerHistory, { x: targetX, y: targetY }].slice(-5);
    set({ 
      playerPos: { x: targetX, y: targetY }, 
      playerHistory: newHistory, 
      lastMoveTime: now,
      playerHunger: newHunger,
      playerEnergy: newEnergy
    });
  },

  handleAITurn: (aiAction) => {
    const state = get();
    if (state.status !== 'playing') return;
    set({ 
      aiTrapFrequencyMs: aiAction.trapFrequencyMs || state.aiTrapFrequencyMs,
      aiPreferredAttack: aiAction.attackType || state.aiPreferredAttack
    });
  },

  spawnPredictedThreat: () => {
    const state = get();
    if (state.status !== 'playing' || state.playerHistory.length < 2) return;
    const history = state.playerHistory;
    const curr = history[history.length - 1];
    const prev = history[Math.max(0, history.length - 3)];
    let dx = curr.x - prev.x;
    let dy = curr.y - prev.y;
    if (dx !== 0) dx = dx > 0 ? 1 : -1;
    if (dy !== 0) dy = dy > 0 ? 1 : -1;
    const targetX = Math.max(0, Math.min(159, curr.x + dx * 2));
    const targetY = Math.max(0, Math.min(119, curr.y + dy * 2));
    if (state.entities.some(e => e.x === targetX && e.y === targetY)) return;
    const typ = state.aiPreferredAttack || 'trap';
    set({ entities: [...state.entities, {
      id: `threat-${Date.now()}`,
      x: targetX,
      y: targetY,
      type: typ,
      isHidden: typ === 'trap'
    }]});
  },

  resolveQTE: (success: boolean) => {
    const state = get();
    if (!state.qteActive) return;
    const { x, y } = state.playerPos;
    const newEntities = state.entities.filter(e => !(e.type === 'trap' && e.x === x && e.y === y));

    // NERF: TRAP PENALTY REDUCED
    const penalty = success ? 5 : 20;
    const newEnergy = Math.max(0, state.playerEnergy - penalty);

    if (newEnergy <= 0) {
      set({ playerEnergy: 0, status: 'game_over', qteActive: false, entities: newEntities });
    } else {
      set({ playerEnergy: newEnergy, qteActive: false, entities: newEntities });
    }
  }
}));
