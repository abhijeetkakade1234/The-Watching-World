// ──────────────────────────────────────────────────────────────────────────────
// CHAPTER 1 — CONFIGURATION & METADATA
// ──────────────────────────────────────────────────────────────────────────────

export const COLS = 60;
export const ROWS = 70;

export const TILES = {
  G1: 0, G2: 1, G3: 2, TG: 3, TR: 4, TK: 5, TT: 6,
  DT: 7, DV: 8, DW: 9, WT: 10, WB: 11, WL: 12, WR: 13, WI: 14,
  RK: 15, RKS: 16, BU: 17, HR: 19, HW: 32, HWI: 33, HD: 26, MBX: 34,
  FH: 20, FV: 31, FL: 21, SG: 22, WL2: 23, BR: 24, CL: 25, GR: 27,
  BD: 28, PL: 29, WF: 30, FT: 35, CF: 36, BN: 37, LP: 38, WMH: 39,
  WMB: 40, HL: 41, INNR: 42, INNW: 43, GPL: 44,
  THR: 45, THW: 46, // Thatch Roof, Log Wall
  SR: 47, SW: 48,   // Stone Roof, Stone Wall
  FCTL: 49, FCTR: 50, FCBL: 51, FCBR: 52, // Fence Corners
} as const;

export const TILE_PROPERTIES: Record<number, { walkable: boolean; name: string }> = {
  [TILES.G1]:  { walkable: true,  name: 'grass' },
  [TILES.G2]:  { walkable: true,  name: 'grass2' },
  [TILES.G3]:  { walkable: true,  name: 'grass3' },
  [TILES.TG]:  { walkable: false, name: 'tall grass' },
  [TILES.TR]:  { walkable: false, name: 'tree' },
  [TILES.TK]:  { walkable: false, name: 'dark tree' },
  [TILES.TT]:  { walkable: false, name: 'tree top' },
  [TILES.DT]:  { walkable: true,  name: 'dirt' },
  [TILES.DV]:  { walkable: true,  name: 'path' },
  [TILES.DW]:  { walkable: true,  name: 'wide path' },
  [TILES.WT]:  { walkable: false, name: 'water top' },
  [TILES.WB]:  { walkable: false, name: 'water bottom' },
  [TILES.WL]:  { walkable: false, name: 'water left' },
  [TILES.WR]:  { walkable: false, name: 'water right' },
  [TILES.WI]:  { walkable: false, name: 'water' },
  [TILES.RK]:  { walkable: false, name: 'rock' },
  [TILES.RKS]: { walkable: true,  name: 'small rock' },
  [TILES.BU]:  { walkable: false, name: 'bush' },
  [TILES.HR]:  { walkable: false, name: 'house roof' },
  [TILES.HW]:  { walkable: false, name: 'house wall' },
  [TILES.HWI]: { walkable: false, name: 'house window' },
  [TILES.HD]:  { walkable: true,  name: 'house door' },
  [TILES.MBX]: { walkable: false, name: 'mailbox' },
  [TILES.FH]:  { walkable: false, name: 'fence horizontal' },
  [TILES.FV]:  { walkable: false, name: 'fence vertical' },
  [TILES.FL]:  { walkable: true,  name: 'flower' },
  [TILES.SG]:  { walkable: false, name: 'sign' },
  [TILES.WL2]: { walkable: false, name: 'well' },
  [TILES.BR]:  { walkable: true,  name: 'bridge' },
  [TILES.CL]:  { walkable: false, name: 'cliff' },
  [TILES.GR]:  { walkable: true,  name: 'gravel' },
  [TILES.BD]:  { walkable: false, name: 'border' },
  [TILES.PL]:  { walkable: false, name: 'pillar' },
  [TILES.WF]:  { walkable: false, name: 'waterfall' },
  [TILES.FT]:  { walkable: false, name: 'fruit tree' },
  [TILES.CF]:  { walkable: true,  name: 'crop field' },
  [TILES.BN]:  { walkable: false, name: 'bench' },
  [TILES.LP]:  { walkable: false, name: 'lantern post' },
  [TILES.WMH]: { walkable: false, name: 'windmill head' },
  [TILES.WMB]: { walkable: false, name: 'windmill base' },
  [TILES.HL]:  { walkable: false, name: 'hill slope' },
  [TILES.INNR]:{ walkable: false, name: 'inn roof' },
  [TILES.INNW]:{ walkable: false, name: 'inn wall' },
  [TILES.GPL]: { walkable: true,  name: 'grassy path' },
  [TILES.THR]: { walkable: false, name: 'thatch roof' },
  [TILES.THW]: { walkable: false, name: 'log wall' },
  [TILES.SR]:  { walkable: false, name: 'stone roof' },
  [TILES.SW]:  { walkable: false, name: 'stone wall' },
  [TILES.FCTL]:{ walkable: false, name: 'fence corner' },
  [TILES.FCTR]:{ walkable: false, name: 'fence corner' },
  [TILES.FCBL]:{ walkable: false, name: 'fence corner' },
  [TILES.FCBR]:{ walkable: false, name: 'fence corner' },
};

export const SPAWN_POINT  = { x: 32, y: 30 };
export const EXIT_ZONE    = { xStart: 21, xEnd: 22, y: 0 };

export const CHAPTER_LABELS = [
  { col: 11, row: 13, text: 'ELDER',         color: '#ffe870' },
  { col: 17, row: 28, text: "LEO'S HOME",    color: '#ffe870' },
  { col: 35, row: 12, text: 'POND',          color: '#80d8ff' },
  { col:  6, row: 16, text: 'WELL',          color: '#c0e0ff' },
  { col: 27, row: 15, text: 'NEIGHBOR',      color: '#ffe870' },
  { col: 18, row:  1, text: '▲ EXIT',        color: '#ff9040' },
];
