// ──────────────────────────────────────────────────────────────────────────────
// HOUSE INTERIORS — CONSTANTS & PROPERTIES
// ──────────────────────────────────────────────────────────────────────────────

export const TILES_INT = {
  EMPTY: 0, 
  FLOOR: 1, 
  WALL: 2, 
  WINDOW: 3, 
  BED: 4, 
  TABLE: 5, 
  SHELF: 6, 
  FIREPLACE: 7, 
  RUG: 8, 
  DOOR: 9, 
  CHAIR: 10,
} as const;

export const TILE_PROPERTIES_INT: Record<number, { walkable: boolean; name: string }> = {
  [TILES_INT.EMPTY]: { walkable: false, name: 'void' },
  [TILES_INT.FLOOR]: { walkable: true,  name: 'floor' },
  [TILES_INT.WALL]:  { walkable: false, name: 'wall' },
  [TILES_INT.WINDOW]:{ walkable: false, name: 'window' },
  [TILES_INT.BED]:   { walkable: false, name: 'bed' },
  [TILES_INT.TABLE]: { walkable: false, name: 'table' },
  [TILES_INT.SHELF]: { walkable: false, name: 'shelf' },
  [TILES_INT.FIREPLACE]: { walkable: false, name: 'fireplace' },
  [TILES_INT.RUG]:   { walkable: true,  name: 'rug' },
  [TILES_INT.DOOR]:  { walkable: true,  name: 'door' },
  [TILES_INT.CHAIR]: { walkable: false, name: 'chair' },
};
