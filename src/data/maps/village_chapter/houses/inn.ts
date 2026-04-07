// ──────────────────────────────────────────────────────────────────────────────
// INN — INTERIOR MAP (20x15)
// "The Blue Tankard"
// ──────────────────────────────────────────────────────────────────────────────

export const INTERIOR_COLS = 20;
export const INTERIOR_ROWS = 15;

import { TILES_INT } from './constants';

const E = TILES_INT.EMPTY;
const FL = TILES_INT.FLOOR;
const W = TILES_INT.WALL;
const WN = TILES_INT.WINDOW;
const TB = TILES_INT.TABLE;
const RG = TILES_INT.RUG;
const DR = TILES_INT.DOOR;
const CH = TILES_INT.CHAIR;

export const innMap: number[][] = [
  [ E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E ],
  [ E, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, E ],
  [ E, W, WN, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, WN, W, E ],
  [ E, W, FL, FL, TB, TB, FL, TB, TB, FL, TB, TB, FL, TB, TB, FL, FL, FL, W, E ],
  [ E, W, FL, CH, TB, TB, CH, TB, TB, CH, TB, TB, CH, TB, TB, CH, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, FL, RG, RG, RG, RG, RG, RG, RG, RG, RG, RG, RG, RG, RG, FL, FL, W, E ],
  [ E, W, FL, RG, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, RG, FL, FL, FL, W, E ],
  [ E, W, FL, RG, FL, TB, TB, TB, TB, TB, TB, TB, TB, FL, RG, FL, FL, FL, W, E ],
  [ E, W, FL, RG, FL, CH, CH, CH, CH, CH, CH, CH, CH, FL, RG, FL, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, FL, W, E ],
  [ E, W, W, W, W, W, W, W, W, DR, DR, W, W, W, W, W, W, W, W, E ],
  [ E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E ],
];

import { DynamicEntity } from '@/types/game';

export const INN_SPAWN = { x: 9, y: 13 };
export const INN_ENTITIES: DynamicEntity[] = [
  { id: 'chest-clue-inn', x: 2, y: 12, type: 'chest', message: "A regular's tab: 'They say the Watcher was once the village's guardian... until the corruption turned its eye towards us.'" }
];
