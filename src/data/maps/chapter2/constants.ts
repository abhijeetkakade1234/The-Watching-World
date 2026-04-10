// CHAPTER 2 - CONFIGURATION & METADATA

export const COLS = 200;
export const ROWS = 150;

export const TILES = {
  GRASS: 0,
  PATH: 1,
  TREES: 2,
  WATER: 3,
  BRIDGE: 4,
  ROCKS: 5,
  RUINS_GROUND: 6,
  MYSTERY_GRASS: 7,
} as const;

export const TILE_PROPERTIES: Record<number, { walkable: boolean; name: string }> = {
  [TILES.GRASS]: { walkable: true, name: 'grass' },
  [TILES.PATH]: { walkable: true, name: 'path' },
  [TILES.TREES]: { walkable: false, name: 'trees' },
  [TILES.WATER]: { walkable: false, name: 'water' },
  [TILES.BRIDGE]: { walkable: true, name: 'bridge' },
  [TILES.ROCKS]: { walkable: false, name: 'rocks' },
  [TILES.RUINS_GROUND]: { walkable: true, name: 'ruins-ground' },
  [TILES.MYSTERY_GRASS]: { walkable: true, name: 'mystery-grass' },
};

export const SPAWN_POINT = { x: 5, y: 118 };

export const CHAPTER_LABELS = [
  { col: 12, row: 118, text: 'ENTRY FROM CHAPTER 1', color: '#cde5a5' },
  { col: 92, row: 102, text: 'RUINED VILLAGE', color: '#f3dfb3' },
  { col: 70, row: 60, text: 'ANCIENT RUINS', color: '#b9c7dd' },
  { col: 123, row: 120, text: 'TRADER HUT', color: '#dfc38f' },
  { col: 162, row: 76, text: 'BRIDGE', color: '#f0d39c' },
  { col: 182, row: 52, text: 'THE OTHER SIDE', color: '#9cb7a4' },
];

export type Chapter2Sprite = {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Chapter2CollisionRect = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const LANDMARK_SPRITES: Chapter2Sprite[] = [
  // Ruined village cluster
  { id: 'rv_house_1', src: '/characters/Broken-houses-ch2/front-side.png', x: 84 * 16, y: 92 * 16, w: 112, h: 80 },
  { id: 'rv_house_2', src: '/characters/Broken-houses-ch2/left-side.png', x: 96 * 16, y: 87 * 16, w: 96, h: 86 },
  { id: 'rv_house_3', src: '/characters/Broken-houses-ch2/right-side.png', x: 108 * 16, y: 98 * 16, w: 92, h: 78 },
  { id: 'rv_house_4', src: '/characters/Broken-houses-ch2/top-down.png', x: 89 * 16, y: 103 * 16, w: 106, h: 70 },
  { id: 'rv_house_5', src: '/characters/Broken-houses-ch2/front-door.png', x: 116 * 16, y: 90 * 16, w: 82, h: 70 },
  { id: 'rv_house_6', src: '/characters/Broken-houses-ch2/right-door.png', x: 80 * 16, y: 100 * 16, w: 80, h: 68 },

  // Side ruins landmark
  { id: 'side_ruins_gate', src: '/characters/Broken-houses-ch2/top-down.png', x: 66 * 16, y: 56 * 16, w: 160, h: 120 },

  // Wandering trader hut
  { id: 'trader_hut', src: '/characters/WANDERING/WANDERING-TRADER-HUT-ch2.png', x: 120 * 16, y: 114 * 16, w: 128, h: 112 },
];

export const COLLISION_RECTS: Chapter2CollisionRect[] = [
  // Ruined village houses
  { id: 'rv_col_1', x: 84 * 16 + 10, y: 92 * 16 + 34, w: 92, h: 40 },
  { id: 'rv_col_2', x: 96 * 16 + 8, y: 87 * 16 + 38, w: 78, h: 42 },
  { id: 'rv_col_3', x: 108 * 16 + 7, y: 98 * 16 + 30, w: 72, h: 44 },
  { id: 'rv_col_4', x: 89 * 16 + 10, y: 103 * 16 + 24, w: 88, h: 38 },
  { id: 'rv_col_5', x: 116 * 16 + 6, y: 90 * 16 + 26, w: 66, h: 36 },
  { id: 'rv_col_6', x: 80 * 16 + 8, y: 100 * 16 + 28, w: 60, h: 36 },

  // Side ruins
  { id: 'ruins_outer', x: 64 * 16 + 6, y: 54 * 16 + 6, w: 14 * 16, h: 14 * 16 },
  { id: 'ruins_core', x: 68 * 16, y: 58 * 16, w: 8 * 16, h: 8 * 16 },

  // Trader hut
  { id: 'trader_hut_col', x: 120 * 16 + 18, y: 114 * 16 + 44, w: 92, h: 56 },
];
