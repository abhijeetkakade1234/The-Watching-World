import { TILES, COLS as CH1_COLS, ROWS as CH1_ROWS } from '../data/maps/village_chapter/constants';
import { TILES_INT } from '../data/maps/village_chapter/houses/constants';

export const TILE_SIZE = 16;
export const COLS = CH1_COLS;
export const ROWS = CH1_ROWS;

// ── DRAW HELPER ──────────────────────────────────────────────────────────────
function r(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ── STARDEW-STYLE PALETTE ────────────────────────────────────────────────────
// Matched to the warm earthy tones of the chapter1-houses sprite assets.
const PAL = {
  // Grass — soft sage-olive like the grass borders in farm/house sprites
  grassBase:  '#7a9a5a',  // medium sage green
  grassDark:  '#5a7840',  // shadowed blade
  grassLight: '#9aba72',  // sunlit blade tip
  grassPatch: '#6a8e4c',  // secondary variation
  grassG2:    '#6d8e48',  // slightly darker variant (G2)
  grassG2d:   '#4e6e32',
  grassG2l:   '#88b060',
  grassG3:    '#587c38',  // shaded / near-tree (G3)
  grassG3d:   '#3e5e28',
  grassG3l:   '#70a050',

  // Path — sandy beige matching the stone paths in kaels-hall / village inn sprites
  pathBase:   '#c8aa72',
  pathDark:   '#a88c54',
  pathLight:  '#dcc88e',
  pathDot:    '#e8daaa',

  // Water — calm teal-blue matching the pond images
  waterDeep:  '#4a8cc0',
  waterMid:   '#5ca8d8',
  waterShine: '#90c8f0',
  waterFoam:  '#cce8f8',

  // Trees — rich forest greens
  treeLight:  '#4a9838',
  treeMid:    '#3a8228',
  treeDark:   '#285818',
  treeEdge:   '#204810',
  treeTrunk:  '#6a3c18',
  treeTrunkD: '#4a2808',

  // Tall grass
  tgBase:     '#4e7830',
  tgLight:    '#72aa50',
  tgMid:      '#5a9038',
  tgShadow:   '#3c6222',

  // Fence — warm oak like the farm fences in the sprite assets
  fencePost:  '#7a5230',
  fenceRail:  '#9e6c40',
  fenceLight: '#b88050',

  // Ground detail
  rock:       '#8898a8',
  rockLight:  '#a8b8c8',
  rockShadow: '#5a6878',

  // Gravel / square
  gravel:     '#b0a080',
  gravelD:    '#907a60',
  gravelL:    '#ccc0a0',
} as const;

// ── GRASS ────────────────────────────────────────────────────────────────────
function drawGrass(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, t: number,
  base: string, dark: string, light: string,
  patch = false
) {
  r(ctx, base, x, y, t, t);
  // Soft diagonal blade scattering
  r(ctx, light, x + 2,  y + 1,  1, 3);
  r(ctx, light, x + 7,  y + 3,  1, 3);
  r(ctx, light, x + 11, y + 1,  1, 4);
  r(ctx, light, x + 14, y + 5,  1, 3);
  r(ctx, dark,  x + 1,  y + 9,  2, 2);
  r(ctx, dark,  x + 5,  y + 12, 2, 2);
  r(ctx, dark,  x + 10, y + 10, 2, 2);
  r(ctx, dark,  x + 13, y + 13, 2, 2);
  if (patch) {
    r(ctx, PAL.grassPatch, x,      y + 5, 4, 4);
    r(ctx, PAL.grassPatch, x + 12, y + 7, 4, 4);
  }
}

function drawNeutralGround(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  drawGrass(ctx, x, y, t, PAL.grassBase, PAL.grassDark, PAL.grassLight);
}

// ── PATH ─────────────────────────────────────────────────────────────────────
function drawPath(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, sideEdges: boolean) {
  r(ctx, PAL.pathBase,  x, y, t, t);
  r(ctx, PAL.pathDark,  x + 3,      y, 2, t);
  r(ctx, PAL.pathDark,  x + 11,     y, 2, t);
  r(ctx, PAL.pathLight, x + 6,      y + 2, 1, 3);
  r(ctx, PAL.pathLight, x + 9,      y + 6, 1, 3);
  r(ctx, PAL.pathDot,   x + 7,      y + 11, 2, 2);
  if (sideEdges) {
    r(ctx, PAL.pathDark, x,          y, 1, t);
    r(ctx, PAL.pathDark, x + t - 1,  y, 1, t);
  }
}

// ── SPRITE SYSTEM ────────────────────────────────────────────────────────────
type Chapter1ExteriorHouseSprite = {
  id: string;
  src: string;
  anchorTileX: number;
  anchorTileY: number;
  widthPx: number;
  heightPx: number;
  z: number;
};

type LoadedHouseSprite = Chapter1ExteriorHouseSprite & { image: HTMLImageElement; loaded: boolean };

const CHAPTER1_EXTERIOR_HOUSE_SPRITES: Chapter1ExteriorHouseSprite[] = [
  // ── FARMS (z:0) ─────────────────────────────────────────────────────────
  { id: 'farm-northwest', src: '/characters/chapter1-houses/farm1.png', anchorTileX: 9,  anchorTileY: 6,  widthPx: 192, heightPx: 104, z: 0 },
  { id: 'farm-southwest', src: '/characters/chapter1-houses/farm2.png', anchorTileX: 9,  anchorTileY: 50, widthPx: 240, heightPx: 112, z: 0 },
  { id: 'farm-southeast', src: '/characters/chapter1-houses/farm1.png', anchorTileX: 34, anchorTileY: 53, widthPx: 208, heightPx: 116, z: 0 },

  // ── ENVIRONMENT (ponds & bridge) ─────────────────────────────────────────
  // Pond 1 — Central-west meadow: map fill(13,13,15,17). Anchor slightly above/left.
  { id: 'pond-west',   src: '/characters/chapter1-houses/pond1.png',   anchorTileX: 11, anchorTileY: 11, widthPx: 112, heightPx: 96,  z: 0 },
  // Pond 2 — Bottom East: map fill(35,50,37,53).
  { id: 'pond-east',   src: '/characters/chapter1-houses/pond2.png',   anchorTileX: 47, anchorTileY: 33, widthPx: 112, heightPx: 96,  z: 0 },
  // Bridge — Northern crossing: map fill(0,21,4,23).
  { id: 'bridge-north',src: '/characters/chapter1-houses/bridge.png',  anchorTileX: 20, anchorTileY: -1, widthPx: 64,  heightPx: 112, z: 1 },

  // ── BUILDINGS ────────────────────────────────────────────────────────────
  { id: 'kaels-hall',   src: '/characters/chapter1-houses/kaels-hall.png',   anchorTileX: 23, anchorTileY: 9,  widthPx: 160, heightPx: 112, z: 1 },
  { id: 'leos-house',   src: '/characters/chapter1-houses/leos-house.png',   anchorTileX: 28, anchorTileY: 23, widthPx: 160, heightPx: 112, z: 2 },
  { id: 'finns-cottage',src: '/characters/chapter1-houses/finns-cottage.png', anchorTileX: 3,  anchorTileY: 22, widthPx: 160, heightPx: 112, z: 2 },
  { id: 'lyras-abode',  src: '/characters/chapter1-houses/lyras-abode.png',  anchorTileX: 8,  anchorTileY: 38, widthPx: 160, heightPx: 112, z: 2 },
  { id: 'village-inn',  src: '/characters/chapter1-houses/village-inn.png',  anchorTileX: 36, anchorTileY: 15, widthPx: 192, heightPx: 128, z: 3 },
  { id: 'pond-inn',     src: '/characters/chapter1-houses/pond1.png',        anchorTileX: 50, anchorTileY: 14, widthPx: 112, heightPx: 96,  z: 0 },
];

let chapter1HouseSpritesLoaded = false;
let chapter1HouseSpritesLoadingPromise: Promise<void> | null = null;
let loadedChapter1HouseSprites: LoadedHouseSprite[] = [];

function isExteriorHouseTile(type: number): boolean {
  return (
    type === TILES.HR  || type === TILES.HW  || type === TILES.HWI ||
    type === TILES.HD  || type === TILES.THR || type === TILES.THW ||
    type === TILES.SR  || type === TILES.SW  || type === TILES.INNR || type === TILES.INNW
  );
}

function isExteriorFarmBaseTile(type: number): boolean {
  return type === TILES.CF;
}

/**
 * True for WT/WI tiles inside the two small decorative ponds.
 * These tiles are covered by a sprite overlay so we draw grass underneath
 * to prevent blue CSS from bleeding through transparent sprite edges.
 * Collision is unchanged — WT/WI remain non-walkable.
 */
function isSmallPondWaterTile(col: number, row: number): boolean {
  // Pond 1 — Central-west meadow: fill(13, 13, 15, 17)
  if (row >= 13 && row <= 15 && col >= 13 && col <= 17) return true;
  // Pond 2 — Bottom East: fill(35, 50, 37, 53)
  if (row >= 35 && row <= 37 && col >= 50 && col <= 53) return true;
  // Pond 3 — Inn-Side: fill(16, 52, 18, 56)
  if (row >= 16 && row <= 18 && col >= 52 && col <= 56) return true;
  return false;
}

export function preloadChapter1ExteriorSprites(): Promise<void> {
  if (chapter1HouseSpritesLoaded) return Promise.resolve();
  if (chapter1HouseSpritesLoadingPromise) return chapter1HouseSpritesLoadingPromise;
  if (typeof Image === 'undefined') return Promise.resolve();

  const sprites: LoadedHouseSprite[] = CHAPTER1_EXTERIOR_HOUSE_SPRITES.map((sprite) => ({
    ...sprite,
    image: new Image(),
    loaded: false,
  }));

  chapter1HouseSpritesLoadingPromise = Promise.allSettled(
    sprites.map(
      (sprite) =>
        new Promise<void>((resolve) => {
          sprite.image.onload = () => { sprite.loaded = true; resolve(); };
          sprite.image.onerror = () => resolve();
          sprite.image.src = sprite.src;
        })
    )
  ).then(() => {
    loadedChapter1HouseSprites = sprites.sort((a, b) => a.z - b.z || a.anchorTileY - b.anchorTileY);
    chapter1HouseSpritesLoaded = true;
  });

  return chapter1HouseSpritesLoadingPromise;
}

export function drawChapter1ExteriorSpriteLayer(ctx: CanvasRenderingContext2D): void {
  if (!chapter1HouseSpritesLoaded) return;
  for (const sprite of loadedChapter1HouseSprites) {
    if (!sprite.loaded) continue;
    ctx.drawImage(sprite.image, sprite.anchorTileX * TILE_SIZE, sprite.anchorTileY * TILE_SIZE, sprite.widthPx, sprite.heightPx);
  }
}

// ── MAIN TILE DRAW ────────────────────────────────────────────────────────────
export function drawTile(ctx: CanvasRenderingContext2D, col: number, row: number, type: number) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const T = TILE_SIZE;
  ctx.save();

  // House / farm base tiles: render grass so sprite overlays sit on clean ground
  if (isExteriorHouseTile(type) || isExteriorFarmBaseTile(type)) {
    drawNeutralGround(ctx, x, y, T);
    ctx.restore();
    return;
  }

  switch (type) {

    // ── GRASS ─────────────────────────────────────────────────────────────
    case TILES.G1:
      drawGrass(ctx, x, y, T, PAL.grassBase, PAL.grassDark, PAL.grassLight);
      break;
    case TILES.G2:
      drawGrass(ctx, x, y, T, PAL.grassG2, PAL.grassG2d, PAL.grassG2l);
      break;
    case TILES.G3:
      drawGrass(ctx, x, y, T, PAL.grassG3, PAL.grassG3d, PAL.grassG3l, true);
      break;

    // ── TALL GRASS ────────────────────────────────────────────────────────
    case TILES.TG:
      r(ctx, PAL.tgBase,   x, y, T, T);
      r(ctx, PAL.tgLight,  x + 1, y + 3, 2, 13); r(ctx, PAL.tgLight,  x + 9, y + 4, 2, 12);
      r(ctx, PAL.tgMid,    x + 5, y + 1, 2, 15); r(ctx, PAL.tgMid,    x + 13, y + 2, 2, 14);
      r(ctx, PAL.tgShadow, x + 3, y + 8, 1,  4); r(ctx, PAL.tgShadow, x + 7,  y + 7, 1,  5);
      break;

    // ── TREES ─────────────────────────────────────────────────────────────
    case TILES.TR: // Bright canopy tree
      r(ctx, PAL.treeMid,   x + 2,  y,     12, 11);
      r(ctx, PAL.treeLight, x,       y + 3,  T,  9);
      r(ctx, PAL.treeLight, x + 4,   y + 1,  8,  7);
      r(ctx, PAL.treeDark,  x + 3,   y + 9,  10, 3);
      r(ctx, PAL.treeTrunk, x + 6,   y + 10, 4,  6);
      r(ctx, PAL.treeTrunkD,x + 7,   y + 10, 2,  6);
      break;
    case TILES.TK: // Dark/edge tree
      r(ctx, PAL.treeDark,  x + 1,  y,     14, 10);
      r(ctx, PAL.treeEdge,  x + 3,  y + 2, 10,  8);
      r(ctx, PAL.treeEdge,  x + 6,  y + 9,  4,  7);
      r(ctx, PAL.treeTrunkD,x + 7,  y + 9,  2,  7);
      break;

    // ── PATHS ─────────────────────────────────────────────────────────────
    case TILES.DT:
      drawPath(ctx, x, y, T, false);
      break;
    case TILES.DV:
      drawPath(ctx, x, y, T, true);
      break;

    // ── GRAVEL (village square / well area) ───────────────────────────────
    case TILES.GR:
      r(ctx, PAL.gravel,  x, y, T, T);
      r(ctx, PAL.gravelD, x + 2,  y + 2,  3, 2);
      r(ctx, PAL.gravelD, x + 9,  y + 9,  3, 2);
      r(ctx, PAL.gravelL, x + 6,  y + 5,  2, 2);
      r(ctx, PAL.gravelL, x + 12, y + 12, 2, 2);
      break;

    // Grassy path (GPL — yard interiors)
    case TILES.GPL:
      drawGrass(ctx, x, y, T, '#8aaa62', PAL.grassDark, '#a0c078');
      break;

    // ── WATER ─────────────────────────────────────────────────────────────
    // Small pond tiles render as grass so sprite sits on a clean base.
    case TILES.WI:
      if (isSmallPondWaterTile(col, row)) { drawNeutralGround(ctx, x, y, T); break; }
      r(ctx, PAL.waterMid,   x, y, T, T);
      r(ctx, PAL.waterShine, x,      y + 4, 6, 1);
      r(ctx, PAL.waterShine, x + 8,  y + 12, 8, 1);
      r(ctx, PAL.waterDeep,  x + 4,  y + 8, 5, 1);
      break;
    case TILES.WT:
      if (isSmallPondWaterTile(col, row)) { drawNeutralGround(ctx, x, y, T); break; }
      r(ctx, PAL.waterDeep,  x, y, T, T);
      r(ctx, PAL.waterMid,   x + 1,  y + 1, T - 2, T - 2);
      r(ctx, PAL.waterFoam,  x + 3,  y + 4, 6, 1);
      break;
    case TILES.WB:
      r(ctx, PAL.waterDeep, x, y, T, T);
      r(ctx, PAL.waterMid,  x + 1, y, T - 2, T - 3);
      break;
    case TILES.WL:
      r(ctx, PAL.waterDeep, x, y, T, T);
      r(ctx, PAL.waterMid,  x + 1, y, T - 3, T);
      break;
    case TILES.WR:
      r(ctx, PAL.waterDeep, x, y, T, T);
      r(ctx, PAL.waterMid,  x + 2, y, T - 3, T);
      break;

    // ── BUILDINGS — all render as grass (covered by sprite overlays) ───────
    case TILES.HR: case TILES.HW: case TILES.HWI: case TILES.HD:
    case TILES.THR: case TILES.THW: case TILES.SR: case TILES.SW:
    case TILES.INNR: case TILES.INNW: case TILES.CF:
      drawNeutralGround(ctx, x, y, T);
      break;

    // ── FENCE ─────────────────────────────────────────────────────────────
    case TILES.FH:
      drawNeutralGround(ctx, x, y, T);
      r(ctx, PAL.fencePost,  x + 7, y + 3, 2, 13);
      r(ctx, PAL.fenceRail,  x,     y + 5, T, 2);
      r(ctx, PAL.fenceRail,  x,     y + 10, T, 2);
      r(ctx, PAL.fenceLight, x + 1, y + 5, T - 2, 1);
      break;
    case TILES.FV:
      drawNeutralGround(ctx, x, y, T);
      r(ctx, PAL.fencePost,  x + 7, y,     2, T);
      r(ctx, PAL.fenceRail,  x + 4, y + 4, 6, 2);
      r(ctx, PAL.fenceLight, x + 4, y + 4, 6, 1);
      break;
    case TILES.FCTL:
      drawNeutralGround(ctx, x, y, T);
      r(ctx, PAL.fencePost,  x + 7, y + 3, 2, 13);
      r(ctx, PAL.fenceRail,  x + 9, y + 5, 7, 2); r(ctx, PAL.fenceRail,  x + 9, y + 10, 7, 2);
      r(ctx, PAL.fenceLight, x + 9, y + 5, 7, 1); r(ctx, PAL.fenceLight, x + 9, y + 10, 7, 1);
      break;
    case TILES.FCTR:
      drawNeutralGround(ctx, x, y, T);
      r(ctx, PAL.fencePost,  x + 7, y + 3, 2, 13);
      r(ctx, PAL.fenceRail,  x,     y + 5, 7, 2); r(ctx, PAL.fenceRail,  x, y + 10, 7, 2);
      r(ctx, PAL.fenceLight, x,     y + 5, 7, 1); r(ctx, PAL.fenceLight, x, y + 10, 7, 1);
      break;
    case TILES.FCBL:
      drawNeutralGround(ctx, x, y, T);
      r(ctx, PAL.fencePost,  x + 7, y,     2, 12);
      r(ctx, PAL.fenceRail,  x + 9, y + 3, 7, 2); r(ctx, PAL.fenceRail,  x + 9, y + 8, 7, 2);
      r(ctx, PAL.fenceLight, x + 9, y + 3, 7, 1); r(ctx, PAL.fenceLight, x + 9, y + 8, 7, 1);
      break;
    case TILES.FCBR:
      drawNeutralGround(ctx, x, y, T);
      r(ctx, PAL.fencePost,  x + 7, y,     2, 12);
      r(ctx, PAL.fenceRail,  x,     y + 3, 7, 2); r(ctx, PAL.fenceRail,  x, y + 8, 7, 2);
      r(ctx, PAL.fenceLight, x,     y + 3, 7, 1); r(ctx, PAL.fenceLight, x, y + 8, 7, 1);
      break;

    // ── VILLAGE DETAILS ───────────────────────────────────────────────────
    case TILES.LP: // Lantern Post
      drawNeutralGround(ctx, x, y, T);
      r(ctx, '#3a2e1e', x + 7, y + 6,  2, 10); // iron post
      r(ctx, '#f0c040', x + 5, y + 2,  6,  5); // warm lantern glass
      r(ctx, '#ffe890', x + 6, y + 3,  4,  3); // glow centre
      r(ctx, '#ffffff', x + 7, y + 3,  2,  1); // wick
      break;
    case TILES.MBX: // Mailbox
      drawNeutralGround(ctx, x, y, T);
      r(ctx, '#5a3c1e', x + 7, y + 8, 2, 8); // post
      r(ctx, '#8a8a7a', x + 5, y + 4, 6, 5); // box body
      r(ctx, '#c8a060', x + 5, y + 4, 6, 1); // top edge
      r(ctx, '#cc3030', x + 9, y + 5, 2, 2); // flag
      break;
    case TILES.SG: // Signboard
      drawNeutralGround(ctx, x, y, T);
      r(ctx, '#5a3c1e', x + 7, y + 6, 2, 10);
      r(ctx, '#9e6c40', x + 3, y + 2, 10, 6);
      r(ctx, '#7a5230', x + 4, y + 3,  8, 4);
      r(ctx, '#ead090', x + 5, y + 3,  6, 1); // highlight
      break;
    case TILES.WL2: // Stone Well
      drawNeutralGround(ctx, x, y, T);
      r(ctx, '#9aaa98', x + 1, y + 1, 14, 14); // stone body
      r(ctx, '#7a8a78', x + 2, y + 8, 12,  1); // mortar line
      r(ctx, PAL.waterMid,  x + 4, y + 4,  8,  8); // water
      r(ctx, '#5a3c1e', x,     y + 7, T,   2); // crossbar
      r(ctx, '#7a5230', x + 1, y + 7, T-2, 1); // crossbar highlight
      break;
    case TILES.BN: // Wooden Bench
      drawNeutralGround(ctx, x, y, T);
      r(ctx, '#9e6c40', x, y + 6, T, 4); // seat
      r(ctx, '#7a5230', x, y + 7, T, 1); // shadow line
      r(ctx, '#5a3c1e', x + 1,  y + 10, 2, 6);
      r(ctx, '#5a3c1e', x + 13, y + 10, 2, 6);
      break;
    case TILES.WMH: // Windmill Head
      drawNeutralGround(ctx, x, y, T);
      r(ctx, '#e8e0c8', x + 6,  y + 2, 4,  4); // hub
      r(ctx, '#b0a880', x,       y + 7, T,  2); // horizontal blade
      r(ctx, '#b0a880', x + 7,   y,     2,  T); // vertical blade
      break;
    case TILES.HL: // Hill / elevated ground
      drawGrass(ctx, x, y, T, '#6a9248', '#4a6e30', '#88b060');
      r(ctx, '#4a6e30', x, y,     T, 2); // top shadow edge
      r(ctx, '#4a6e30', x, y + 2, 2, T - 2); // left shadow edge
      break;

    // ── ENVIRONMENT ───────────────────────────────────────────────────────
    case TILES.BR: // Bridge — sprite overlay (bridge.png) draws on top
      drawGrass(ctx, x, y, T, PAL.pathBase, PAL.pathDark, PAL.pathLight);
      break;
    case TILES.FL: // Flowers
      drawNeutralGround(ctx, x, y, T);
      r(ctx, '#e87898', x + 3, y + 4, 3, 3);
      r(ctx, '#ffffff', x + 4, y + 5, 1, 1);
      r(ctx, '#f0c840', x + 9, y + 8, 3, 3);
      r(ctx, '#ffffff', x + 10, y + 9, 1, 1);
      r(ctx, '#a8d870', x + 7,  y + 3, 1, 4);
      r(ctx, '#a8d870', x + 3,  y + 7, 1, 4);
      break;
    case TILES.RK: // Big Rock
      drawNeutralGround(ctx, x, y, T);
      r(ctx, PAL.rock,        x + 2, y + 3, 12, 10);
      r(ctx, PAL.rockLight,   x + 4, y + 4,  6,  4);
      r(ctx, PAL.rockShadow,  x + 3, y + 11, 10,  2);
      break;

    default:
      drawNeutralGround(ctx, x, y, T);
      break;
  }
  ctx.restore();
}

// ── INTERIOR RENDERING ───────────────────────────────────────────────────────
export function drawInteriorTile(ctx: CanvasRenderingContext2D, col: number, row: number, type: number) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const T = TILE_SIZE;
  ctx.save();
  switch (type) {
    case TILES_INT.FLOOR:
      r(ctx, '#8b5e3c', x, y, T, T);
      r(ctx, '#704a28', x,     y + 15, T, 1);
      r(ctx, '#a07048', x + 2, y + 2,  T - 4, 1);
      break;
    case TILES_INT.WALL:
      r(ctx, '#4a3224', x, y, T, T);
      r(ctx, '#5d4037', x + 1, y + 1, 14, 14);
      break;
    case TILES_INT.WINDOW:
      r(ctx, '#4a3224', x, y, T, T);
      r(ctx, '#90c8e8', x + 4, y + 4, 8, 8);
      r(ctx, '#ffffff', x + 6, y + 5, 4, 1);
      break;
    case TILES_INT.RUG:
      r(ctx, '#8b5e3c', x, y, T, T);
      r(ctx, '#a02828', x + 1, y + 1, 14, 14);
      r(ctx, '#cc4040', x + 3, y + 3, 10, 10);
      break;
    case TILES_INT.BED:
      r(ctx, '#5d4037', x, y, T, T);
      r(ctx, '#f0ece0', x + 2, y + 2, 12, 6); // pillow/sheet
      r(ctx, '#8b3030', x + 2, y + 8, 12, 6); // blanket
      break;
    case TILES_INT.TABLE:
      r(ctx, '#8b5e3c', x + 2, y + 2, 12, 12);
      r(ctx, '#5d4037', x + 3, y + 3, 10, 10);
      break;
    default:
      r(ctx, '#2a2018', x, y, T, T);
      break;
  }
  ctx.restore();
}
