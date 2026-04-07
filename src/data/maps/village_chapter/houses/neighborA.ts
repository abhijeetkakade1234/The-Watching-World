// ──────────────────────────────────────────────────────────────────────────────
// NEIGHBOR A — INTERIOR MAP (12x10)
// ──────────────────────────────────────────────────────────────────────────────

export const INTERIOR_COLS = 12;
export const INTERIOR_ROWS = 10;

import { TILES_INT } from './constants';

const E = TILES_INT.EMPTY;
const FL = TILES_INT.FLOOR;
const W = TILES_INT.WALL;
const WN = TILES_INT.WINDOW;
const BD = TILES_INT.BED;
const TB = TILES_INT.TABLE;
const SH = TILES_INT.SHELF;
const RG = TILES_INT.RUG;
const DR = TILES_INT.DOOR;

export const neighborAMap: number[][] = [
  [ E, E, E, E, E, E, E, E, E, E, E, E ],
  [ E, W, W, W, W, W, W, W, W, W, W, E ],
  [ E, W, WN, FL, FL, BD, BD, FL, WN, W, W, E ],
  [ E, W, FL, FL, FL, BD, BD, FL, FL, W, W, E ],
  [ E, W, SH, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, FL, RG, RG, RG, FL, TB, TB, FL, W, E ],
  [ E, W, FL, RG, RG, RG, FL, FL, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, W, W, W, DR, DR, W, W, W, W, E ],
  [ E, E, E, E, E, E, E, E, E, E, E, E ],
];

import type { DynamicEntity } from '@/types/game';

export const NEIGHBOR_A_SPAWN = { x: 5, y: 8 };
export const NEIGHBOR_A_ENTITIES: DynamicEntity[] = [
  { id: 'neighbor-a', x: 3, y: 3, type: 'npc', message: 'Have you seen the strange lights in the southern woods?' }
];
