// CHAPTER 2 - THE WATCHING DEEP (MAIN OVERWORLD)
// Handcrafted deterministic layout. No random generation.

import { COLS, ROWS, TILES, TILE_PROPERTIES, SPAWN_POINT, CHAPTER_LABELS } from './constants';

export { COLS, ROWS, TILES, TILE_PROPERTIES, SPAWN_POINT, CHAPTER_LABELS };

const {
  GRASS, PATH, TREES, WATER, ROCKS, RUINS_GROUND, MYSTERY_GRASS,
} = TILES;

const raw: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(GRASS));

const set = (r: number, c: number, t: number) => {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
  raw[r][c] = t;
};

const fill = (r1: number, c1: number, r2: number, c2: number, t: number) => {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) set(r, c, t);
  }
};

function disk(centerR: number, centerC: number, radius: number, tile: number) {
  const r2 = radius * radius;
  for (let r = centerR - radius; r <= centerR + radius; r++) {
    for (let c = centerC - radius; c <= centerC + radius; c++) {
      const dr = r - centerR;
      const dc = c - centerC;
      if (dr * dr + dc * dc <= r2) set(r, c, tile);
    }
  }
}

function linePath(r1: number, c1: number, r2: number, c2: number, width: number, tile: number) {
  const steps = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const r = Math.round(r1 + (r2 - r1) * t);
    const c = Math.round(c1 + (c2 - c1) * t);
    disk(r, c, width, tile);
  }
}

function clearing(centerR: number, centerC: number, radiusR: number, radiusC: number) {
  for (let r = centerR - radiusR; r <= centerR + radiusR; r++) {
    for (let c = centerC - radiusC; c <= centerC + radiusC; c++) {
      const nr = (r - centerR) / radiusR;
      const nc = (c - centerC) / radiusC;
      if (nr * nr + nc * nc <= 1) set(r, c, GRASS);
    }
  }
}

function riverCenterRow(col: number): number {
  return 74 + Math.floor(Math.sin(col / 16) * 2) + Math.floor(Math.sin(col / 45) * 2);
}

// 1) Border forest shell
fill(0, 0, 2, COLS - 1, TREES);
fill(ROWS - 3, 0, ROWS - 1, COLS - 1, TREES);
fill(0, 0, ROWS - 1, 2, TREES);
fill(0, COLS - 3, ROWS - 1, COLS - 1, TREES);

// 2) Medium-density forest clusters (deterministic pattern)
for (let r = 6; r < ROWS - 6; r += 3) {
  for (let c = 6; c < COLS - 6; c += 3) {
    const pattern = (c * 17 + r * 31 + c * r) % 23;
    const nearVillage = c > 72 && c < 132 && r > 72 && r < 124;
    const nearRiverBand = r > 62 && r < 92;
    if (!nearVillage && !nearRiverBand && (pattern === 3 || pattern === 7 || pattern === 12)) {
      set(r, c, TREES);
      if ((r + c) % 2 === 0) set(r, c + 1, TREES);
    }
  }
}

// 3) River system (horizontal divider)
for (let c = 3; c < COLS - 3; c++) {
  const cr = riverCenterRow(c);
  for (let r = cr - 5; r <= cr + 5; r++) set(r, c, WATER);
}

// 4) Single bridge crossing
const BRIDGE_BOUNDS = { c1: 160, c2: 166, r1: 66, r2: 84 };
fill(BRIDGE_BOUNDS.r1, BRIDGE_BOUNDS.c1, BRIDGE_BOUNDS.r2, BRIDGE_BOUNDS.c2, TILES.BRIDGE);

// 5) Main guided path + reconnecting side routes
linePath(118, 4, 116, 30, 2, PATH);
linePath(116, 30, 108, 58, 2, PATH);
linePath(108, 58, 102, 92, 3, PATH);
linePath(102, 92, 98, 126, 3, PATH);
linePath(98, 126, 90, 152, 2, PATH);
linePath(90, 152, 86, 163, 2, PATH);
linePath(86, 163, 69, 163, 2, PATH);
linePath(69, 163, 59, 170, 2, PATH);
linePath(59, 170, 52, 186, 2, PATH);

// Side path: trader hut
linePath(103, 110, 111, 116, 2, PATH);
linePath(111, 116, 120, 124, 2, PATH);

// Side path: ruins landmark
linePath(99, 94, 88, 86, 2, PATH);
linePath(88, 86, 74, 74, 2, PATH);
linePath(74, 74, 60, 70, 2, PATH);

// Through-village reconnect
linePath(98, 80, 98, 108, 2, PATH);
linePath(98, 108, 86, 116, 2, PATH);
linePath(86, 116, 88, 136, 2, PATH);

// 6) Ruined village footprint (center)
fill(86, 80, 116, 124, RUINS_GROUND);

// 7) Clearings
clearing(102, 48, 8, 11);
clearing(115, 138, 7, 10);
clearing(66, 58, 7, 9);

// 8) Side ruins footprint
fill(54, 64, 68, 78, RUINS_GROUND);

// 9) Rock accents near ruins + river
for (let r = 56; r <= 66; r += 2) {
  for (let c = 65; c <= 77; c += 3) {
    if ((r + c) % 4 === 0) set(r, c, ROCKS);
  }
}
for (let c = 22; c < 198; c += 9) {
  const cr = riverCenterRow(c);
  if (c % 18 === 0) set(cr - 7, c, ROCKS);
  if (c % 27 === 0) set(cr + 7, c + 1, ROCKS);
}

// 10) Far side tone variation
fill(28, 166, 72, 198, MYSTERY_GRASS);

// 11) Enforce river as single crossing (except bridge)
for (let c = 3; c < COLS - 3; c++) {
  const inBridgeCols = c >= BRIDGE_BOUNDS.c1 && c <= BRIDGE_BOUNDS.c2;
  const cr = riverCenterRow(c);
  for (let r = cr - 6; r <= cr + 6; r++) {
    if (!inBridgeCols) set(r, c, WATER);
  }
}
fill(BRIDGE_BOUNDS.r1, BRIDGE_BOUNDS.c1, BRIDGE_BOUNDS.r2, BRIDGE_BOUNDS.c2, TILES.BRIDGE);

export const chapter2Map: number[][] = raw;
