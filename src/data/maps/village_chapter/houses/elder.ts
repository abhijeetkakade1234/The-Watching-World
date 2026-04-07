// ──────────────────────────────────────────────────────────────────────────────
// ELDER — INTERIOR MAP (16x12)
// ──────────────────────────────────────────────────────────────────────────────

export const INTERIOR_COLS = 16;
export const INTERIOR_ROWS = 12;

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
const CH = TILES_INT.CHAIR;

export const elderMap: number[][] = [
  [ E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E ],
  [ E, W, W, W, W, W, W, W, W, W, W, W, W, W, W, E ],
  [ E, W, WN, FL, SH, SH, SH, SH, SH, SH, FL, WN, W, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, SH, FL, RG, RG, RG, RG, RG, RG, FL, SH, W, E ],
  [ E, W, SH, FL, RG, CH, TB, TB, TB, FL, FL, SH, W, E ],
  [ E, W, SH, FL, RG, FL, CH, TB, FL, FL, FL, SH, W, E ],
  [ E, W, FL, FL, RG, RG, RG, RG, RG, RG, FL, FL, W, E ],
  [ E, W, FL, BD, BD, FL, FL, FL, SH, SH, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, W, W, W, W, DR, DR, W, W, W, W, W, W, E ],
  [ E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E ],
];

import type { DynamicEntity } from '@/types/game';

export const ELDER_SPAWN = { x: 7, y: 10 };
export const ELDER_ENTITIES: DynamicEntity[] = [
  { id: 'elder', x: 8, y: 3, type: 'npc', message: 'The Watchers are restless... proceed with caution, child.' },
  { id: 'chest-map', x: 2, y: 8, type: 'chest', message: "You found the Village Map! The route is now clear. Press [M] to open map." }
];
