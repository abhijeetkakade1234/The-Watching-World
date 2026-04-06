export const TILES = {
  G1: 0, G2: 1, G3: 2, TG: 3, DT: 4, DV: 5, WT: 6, WI: 7, 
  TR: 8, TK: 9, BU: 10, RK: 11, CL: 12, ST: 13, BR: 14, 
  SH: 15, SF: 16, CG: 17, CE: 18, CR: 19, WS: 20, WE: 21,
  SA: 22, DS: 23, MT: 24, WF: 25, FO: 26, HL: 27
};

export const TILE_PROPERTIES: Record<number, { walkable: boolean, name: string }> = {
  [TILES.G1]: { walkable: true, name: 'grass1' },
  [TILES.G2]: { walkable: true, name: 'grass2' },
  [TILES.G3]: { walkable: true, name: 'grass3' },
  [TILES.TG]: { walkable: true, name: 'tall grass' },
  [TILES.DT]: { walkable: true, name: 'dirt path' },
  [TILES.DV]: { walkable: true, name: 'dirt path v' },
  [TILES.WT]: { walkable: true, name: 'dirt path h' },
  [TILES.WI]: { walkable: false, name: 'water' },
  [TILES.WS]: { walkable: false, name: 'water start' },
  [TILES.WE]: { walkable: false, name: 'water end' },
  [TILES.WF]: { walkable: false, name: 'waterfall' },
  [TILES.TR]: { walkable: false, name: 'tree' },
  [TILES.TK]: { walkable: false, name: 'tree knot' },
  [TILES.BU]: { walkable: false, name: 'bush' },
  [TILES.RK]: { walkable: false, name: 'rock' },
  [TILES.CL]: { walkable: false, name: 'cliff' },
  [TILES.ST]: { walkable: false, name: 'stone' },
  [TILES.MT]: { walkable: false, name: 'mountain' },
  [TILES.BR]: { walkable: true, name: 'bridge' },
  [TILES.SH]: { walkable: false, name: 'shrine' },
  [TILES.SF]: { walkable: true, name: 'shrine front' },
  [TILES.CG]: { walkable: true, name: 'corruption grass' },
  [TILES.CE]: { walkable: true, name: 'corruption cracked' },
  [TILES.CR]: { walkable: true, name: 'corruption dark' },
  [TILES.SA]: { walkable: true, name: 'sand' },
  [TILES.DS]: { walkable: true, name: 'desert' },
  [TILES.FO]: { walkable: true, name: 'food' },
  [TILES.HL]: { walkable: true, name: 'heal' },
};

const { G1, G2, TR, WI, BR, SH, SF, CG, CE, SA, DS, MT, FO, HL, ST } = TILES;

const MAP_W = 160;
const MAP_H = 120;

// FEWER CENTERS = BIGGER, CLEANER REGIONS
const BIOME_TYPES = ['forest', 'desert', 'blight', 'lake', 'mountain'];
const biomeCenters = Array.from({ length: 8 }, () => ({
  x: Math.random() * MAP_W,
  y: Math.random() * MAP_H,
  type: BIOME_TYPES[Math.floor(Math.random() * BIOME_TYPES.length)]
}));

export const level1Map: number[][] = [];

for (let y = 0; y < MAP_H; y++) {
  const row = [];
  for (let x = 0; x < MAP_W; x++) {
    let closestDist = Infinity;
    let biome = 'forest';
    for (const center of biomeCenters) {
      const dist = Math.sqrt((x - center.x)**2 + (y - center.y)**2);
      if (dist < closestDist) {
        closestDist = dist;
        biome = center.type;
      }
    }

    let tile = G1;
    if (biome === 'forest') {
      const r = Math.random();
      if (r < 0.92) tile = G1;
      else if (r < 0.97) tile = G2;
      else tile = TR; 
    } else if (biome === 'desert') {
      tile = Math.random() < 0.95 ? SA : DS;
    } else if (biome === 'blight') {
      tile = Math.random() < 0.92 ? CG : CE;
    } else if (biome === 'lake') {
      tile = Math.random() < 0.92 ? WI : BR;
    } else if (biome === 'mountain') {
      tile = Math.random() < 0.85 ? G1 : MT; 
    }

    // LOWER BLOCKAGE: Only 1% chance for random stone obstacles
    if (Math.random() < 0.01 && tile !== FO && tile !== HL) {
      tile = ST;
    }

    // RESOURCES: 1.5% each
    const resourceRoll = Math.random();
    if (resourceRoll < 0.015) tile = FO; 
    else if (resourceRoll < 0.025) tile = HL;

    // REMOVED FORCED GRID ROADS - Natural openness only
    // (Previous grid lines made map hard to read)

    // Landmark
    if (x >= 145 && x <= 146 && y >= 115 && y <= 116) {
      if (x === 145 && y === 115) tile = SH;
      if (x === 146 && y === 115) tile = SH;
      if (x === 145 && y === 116) tile = SF;
      if (x === 146 && y === 116) tile = SF;
    }

    row.push(tile);
  }
  level1Map.push(row);
}
