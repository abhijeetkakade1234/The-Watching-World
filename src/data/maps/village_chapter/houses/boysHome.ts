// ──────────────────────────────────────────────────────────────────────────────
// BOY'S HOME — INTERIOR MAP (16x14)
// Entry: south (DOOR tile at row 12, cols 7-8)
// ──────────────────────────────────────────────────────────────────────────────

export const INTERIOR_COLS = 16;
export const INTERIOR_ROWS = 14;

import { TILES_INT } from './constants';

const E = TILES_INT.EMPTY;
const FL = TILES_INT.FLOOR;
const W = TILES_INT.WALL;
const WN = TILES_INT.WINDOW;
const BD = TILES_INT.BED;
const TB = TILES_INT.TABLE;
const SH = TILES_INT.SHELF;
const FP = TILES_INT.FIREPLACE;
const RG = TILES_INT.RUG;
const DR = TILES_INT.DOOR;
const CH = TILES_INT.CHAIR;

export const boysHomeMap: number[][] = [
  [ E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E ],
  [ E, W, W, W, W, W, W, W, W, W, W, W, W, W, W, E ],
  [ E, W, WN, WN, FL, BD, BD, FL, FL, BD, BD, WN, WN, W, W, E ],
  [ E, W, FL, FL, FL, BD, BD, FL, FL, BD, BD, FL, FL, W, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, SH, FL, FL, RG, RG, RG, FL, FL, TB, TB, FL, FL, W, E ],
  [ E, W, SH, FL, FL, RG, RG, RG, FL, CH, TB, FL, FL, FL, W, E ],
  [ E, W, FP, FP, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, W, W, W, W, W, DR, DR, W, W, W, W, W, W, E ],
  [ E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E ],
];

import type { DynamicEntity } from '@/types/game';

export const BOYS_HOME_SPAWN = { x: 7, y: 11 };
export const BOYS_HOME_ENTITIES: DynamicEntity[] = [
  { id: 'grandma', x: 5, y: 2, type: 'npc', message: 'im not feeling well..' },
  { id: 'chest-cure', x: 2, y: 3, type: 'chest', message: "The grandmother's strength fades. Only the Eternal Glimmer from the deep forest can restore her spirit..." }
];
