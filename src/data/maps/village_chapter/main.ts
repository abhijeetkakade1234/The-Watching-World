// ──────────────────────────────────────────────────────────────────────────────
// CHAPTER 1 — THE START FOREST  "The Promise"
// ──────────────────────────────────────────────────────────────────────────────

import { 
  TILES, TILE_PROPERTIES, COLS, ROWS, SPAWN_POINT, EXIT_ZONE, CHAPTER_LABELS 
} from './constants';

export { TILES, TILE_PROPERTIES, COLS, ROWS, SPAWN_POINT, EXIT_ZONE, CHAPTER_LABELS };

const {
  G1,G2,G3,TK,DV,WT,WB,WL,WR,WI,
  HR,HW,HWI,HD,FH,FV,SG,WL2,BR,GR,BD,
  CF,BN,LP,WMH,WMB,HL,INNR,INNW,GPL,
  THR,THW,SR,SW,
  FCTL, FCTR, FCBL, FCBR
} = TILES;

const raw: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(G1));
const set = (r: number, c: number, t: number) => { if (r >= 0 && r < ROWS && c >= 0 && c < COLS) raw[r][c] = t; };
const fill = (r1: number, c1: number, r2: number, c2: number, t: number) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, t); };
const hline = (r: number, c1: number, c2: number, t: number) => fill(r, c1, r, c2, t);
const vline = (c: number, r1: number, r2: number, t: number) => fill(r1, c, r2, c, t);

function placeHouse(r: number, c: number, width: number = 6, height: number = 4, type: 'CLASSIC' | 'INN' | 'RUSTIC' | 'STONE' = 'CLASSIC') {
  let roofTile: number = HR; 
  let wallTile: number = HW;
  if (type === 'INN') { roofTile = INNR; wallTile = INNW; }
  else if (type === 'RUSTIC') { roofTile = THR; wallTile = THW; }
  else if (type === 'STONE') { roofTile = SR; wallTile = SW; }
  
  hline(r, c, c + width - 1, roofTile); hline(r + 1, c, c + width - 1, roofTile);
  fill(r + 2, c, r + height - 1, c + width - 1, wallTile);
  set(r + 2, c + 1, HWI); set(r + 2, c + width - 2, HWI);
  const doorCol = c + Math.floor(width / 2) - 1;
  set(r + height - 1, doorCol, HD); set(r + height - 1, doorCol + 1, HD);
  // Path to door
  fill(r + height, doorCol, r + height + 5, doorCol + 1, GR);
}

function placeWindmill(r: number, c: number) { fill(r + 1, c, r + 3, c + 2, WMB); set(r, c + 1, WMH); set(r + 1, c, WMH); set(r + 1, c + 2, WMH); }

function placeYard(r: number, c: number, w: number, h: number) {
  fill(r + 1, c + 1, r + h - 2, c + w - 2, GPL); // Yard floor
  hline(r, c + 1, c + w - 2, FH); hline(r + h - 1, c + 1, c + w - 2, FH); // Horizontal rails
  vline(c, r + 1, r + h - 2, FV); vline(c + w - 1, r + 1, r + h - 2, FV); // Vertical posts
  // Corners
  set(r, c, FCTL); set(r, c + w - 1, FCTR);
  set(r + h - 1, c, FCBL); set(r + h - 1, c + w - 1, FCBR);
  // WIDER GATE (Gap in the bottom fence)
  const gateCol = c + Math.floor(w / 2) - 2;
  fill(r + h - 1, gateCol, r + h - 1, gateCol + 3, GR);
}

function placeFarm(r: number, c: number, w: number, h: number) {
  fill(r + 1, c + 1, r + h - 2, c + w - 2, CF);
  // Farms intentionally have no fence ring now (sprite-based exterior visuals).
  // Keep perimeter as walkable grassy path so movement/collision is not blocked by farm edges.
  fill(r, c, r + h - 1, c + w - 1, GPL);
  // Crop tiles are still authored for data consistency, but sprite overlay will
  // visually replace this area in renderer.
  fill(r + 1, c + 1, r + h - 2, c + w - 2, CF);
}

function placeSquare(r: number, c: number, w: number, h: number) {
  fill(r, c, r + h - 1, c + w - 1, GR);
  set(r + 1, c + 1, LP); set(r + 1, c + w - 2, LP);
  set(r + h - 2, c + 1, LP); set(r + h - 2, c + w - 2, LP);
  set(r + Math.floor(h/2), c + 1, BN); set(r + Math.floor(h/2), c + w - 2, BN);
}

function placeHill(r: number, c: number, w: number, h: number) { fill(r, c, r + h - 1, c + w - 1, HL); }

// Layout Construction (Clear Path at col 21-23 for Northern Gateway)
hline(0, 0, 20, BD); hline(0, 24, 59, BD); hline(69,0, 59, BD); vline(0, 0, 69, BD); vline(59,0, 69, BD);

// Forest Edges (Randomized and Organic)
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (r < 5 || r > ROWS - 6 || c < 4 || c > COLS - 5) {
       if (Math.random() > 0.4) set(r, c, TK);
    }
  }
}

// West Forest Wall
fill(4, 1, 45, 3, TK);
for (let r = 5; r < 45; r++) { if (Math.random() > 0.6) set(r, 4, TK); }

// Village Paths (Divert around farm at Row 45)
fill(0, 21, 44, 22, DV); // North segment (Connects to Bridge at row 0)
hline(44, 21, 26, DV); fill(45, 26, 54, 27, DV); // Bypass east
hline(54, 21, 26, DV); fill(55, 21, 60, 22, DV); // Reconnect South segment (truncated)

hline(21, 5, 55, DV); // Main horizontal cross-road

// --- HOUSES, SIGNS & YARDS ---

// 1. ELDER'S HOUSE (North-Central - Stone Style)
placeYard(10, 23, 10, 7);
placeHouse(11, 25, 6, 4, 'STONE');
set(15, 26, SG);

// 2. YOUR HOME (Central-East - Rustic Style)
placeYard(24, 28, 10, 7); 
placeHouse(25, 30, 6, 4, 'RUSTIC');
set(29, 31, SG); 

// 3. NEIGHBOR A (West-Central - Classic)
placeYard(23, 3, 10, 7);
placeHouse(24, 5, 6, 4, 'CLASSIC');
set(28, 6, SG); 

// 4. NEIGHBOR B (West-South - Classic)
placeYard(39, 8, 10, 7);
placeHouse(40, 10, 6, 4, 'CLASSIC');
set(44, 11, SG);

// 5. THE VILLAGE INN (Standalone - No overlaps)
placeYard(14, 35, 14, 10);
placeHouse(16, 37, 10, 6, 'INN');
set(22, 41, SG); 

// Aesthetic Ponds
// Pond 1 — Central-west meadow (rows 13-15, cols 13-17).
// Open grassland: below farm sprite (rows 0-6.5), left of main path (cols 21-22),
// above Neighbor A yard (row 17+), right of farm tiles (cols 10-19 end at row 8).
fill(13, 13, 15, 17, WT); fill(14, 14, 14, 16, WI); // Central-West Village Pond
fill(35, 50, 37, 53, WT); fill(36, 51, 36, 52, WI); // Bottom East Pond

// Village Square (Central Hub)
placeSquare(19, 18, 8, 5); 
set(21, 21, WL2); 

placeHill(10, 55, 12, 8); // Shifted south to clear new river
placeWindmill(11, 52);

// Farms (Pushed to clear central area)
placeFarm(7, 10, 10, 8); // Top West (shifted south for river)
placeFarm(52, 10, 15, 8); // South West
placeFarm(55, 35, 12, 10); // South East

// Inn-Side Pond (Shifted south to clear river and formatted as a pond)
fill(16, 52, 18, 56, WT); fill(17, 53, 17, 55, WI);

// Northern Exit Gateway (Final Chapter 1 Transition)
// 1. Crossing River (Row 0-4)
hline(0, 0, 59, WB); hline(4, 0, 59, WT); fill(1, 0, 3, 59, WI);

// 2. Gateway Bridge (Directly at the Northern Exit)
hline(0, 20, 24, FH); hline(4, 20, 24, FH); fill(0, 21, 4, 23, BR);

// Random grass variation
for (let r = 0; r < ROWS; r++) { for (let c = 0; c < COLS; c++) { if (raw[r][c] === G1 && Math.random() > 0.85) raw[r][c] = Math.random() > 0.5 ? G2 : G3; } }

export const chapter1Map: number[][] = raw;
