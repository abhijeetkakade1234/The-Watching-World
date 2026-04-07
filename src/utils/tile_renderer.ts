import { TILES, COLS as CH1_COLS, ROWS as CH1_ROWS } from '../data/maps/village_chapter/constants';
import { TILES_INT } from '../data/maps/village_chapter/houses/constants';

export const TILE_SIZE = 16;
export const COLS = CH1_COLS;
export const ROWS = CH1_ROWS;

// ── DRAW HELPERS (GBA STYLE) ──────────────────────────────────────────────────
function r(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ── MAIN DRAW FUNCTION ───────────────────────────────────────────────────────
export function drawTile(ctx: CanvasRenderingContext2D, col: number, row: number, type: number) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const T = TILE_SIZE;
  ctx.save();

  switch (type) {
    // ── GRASS VARIANTS (POKEMON GBA STYLE) ─────────────────────────────
    case TILES.G1: // Base Grass
      r(ctx, '#5a9e38', x, y, T, T);
      r(ctx, '#4a8a2c', x + 2, y + 3, 2, 4); r(ctx, '#4a8a2c', x + 10, y + 6, 2, 3);
      r(ctx, '#6ab848', x + 8, y + 2, 1, 3); r(ctx, '#6ab848', x + 4, y + 10, 1, 4);
      break;
    case TILES.G2: // Slightly Darker
      r(ctx, '#4e8f30', x, y, T, T);
      r(ctx, '#5aaa38', x + 1, y + 1, 3, 3); r(ctx, '#5aaa38', x + 11, y + 2, 2, 4);
      r(ctx, '#3d7225', x + 6, y + 6, 2, 5); r(ctx, '#3d7225', x + 3, y + 11, 3, 3);
      break;
    case TILES.G3: // Shaded Grass
      r(ctx, '#58a035', x, y, T, T);
      r(ctx, '#4d8c2d', x, y + 4, 4, 4); r(ctx, '#4d8c2d', x + 7, y, 4, 4);
      r(ctx, '#70c045', x + 6, y + 5, 2, 2);
      break;

    // ── TALL GRASS (LAYERED) ───────────────────────────────────────────
    case TILES.TG:
      r(ctx, '#4e8f30', x, y, T, T);
      r(ctx, '#7ac450', x + 1, y + 4, 2, 12); r(ctx, '#7ac450', x + 9, y + 5, 2, 11);
      r(ctx, '#5aa838', x + 5, y + 2, 2, 14); r(ctx, '#5aa838', x + 13, y + 3, 2, 13);
      r(ctx, '#3d7225', x + 3, y + 8, 1, 3); r(ctx, '#3d7225', x + 7, y + 7, 1, 4);
      break;

    // ── TREES (ROUNDED CANOPIES) ──────────────────────────────────────────
    case TILES.TR: // Main Forest Tree
      r(ctx, '#4aaa2e', x + 2, y, 12, 12);
      r(ctx, '#3a9820', x, y + 4, T, 8);
      r(ctx, '#5ab83a', x + 4, y + 2, 8, 8);
      r(ctx, '#1a4e08', x + 6, y + 10, 4, 6); // trunk base
      r(ctx, '#4a2808', x + 7, y + 10, 2, 6); // trunk core
      break;
    case TILES.TK: // Dark/Edge Tree
      r(ctx, '#316b1b', x + 1, y, 14, 10);
      r(ctx, '#255a11', x + 3, y + 2, 10, 8);
      r(ctx, '#153a08', x + 6, y + 9, 4, 7);
      r(ctx, '#3a2008', x + 7, y + 9, 2, 7);
      break;

    // ── DIRT PATHS (POKEMON GBA STYLE) ──────────────────────────────────
    case TILES.DT: // Field Dirt
      r(ctx, '#c8a060', x, y, T, T);
      r(ctx, '#b89050', x + 2, y + 2, 3, 3); r(ctx, '#b89050', x + 10, y + 10, 2, 2);
      r(ctx, '#d4b070', x + 8, y + 4, 2, 2);
      break;
    case TILES.DV: // Village Path
      r(ctx, '#c0984e', x, y, T, T);
      r(ctx, '#a07840', x, y, 2, T); r(ctx, '#a07840', x + 14, y, 2, T); // edges
      r(ctx, '#d4b070', x + 4, y + 10, 2, 2);
      break;

    // ── WATER (RIPPLED) ─────────────────────────────────────────────────
    case TILES.WI: // Water Mid
      r(ctx, '#2878d8', x, y, T, T);
      r(ctx, '#3890f0', x, y + 4, 6, 1); r(ctx, '#3890f0', x + 8, y + 12, 8, 1);
      r(ctx, '#1a5ea8', x + 4, y + 7, 5, 1);
      break;
    case TILES.WT: // Water Top (Deep Blue)
      r(ctx, '#1a5ea8', x, y, T, T);
      r(ctx, '#2878d8', x + 1, y + 1, T-2, T-2);
      r(ctx, '#ffffff77', x + 3, y + 4, 6, 1);
      break;

    // ── BUILDINGS (POKEMON GBA HOUSE) ───────────────────────────────────
    case TILES.HR: // Roof Red Shingles
      r(ctx, '#c04030', x, y, T, T);
      r(ctx, '#a83020', x, y + 14, T, 2); // shadow edge
      for (let i = 0; i < 4; i++) {
        r(ctx, '#9b2c1f', x, y + i * 4, T, 1); // layer separation
        r(ctx, '#d05040', x + 2, y + i * 4 + 1, 4, 2); // highlight
      }
      break;
    case TILES.HW: // White Siding Wall
      r(ctx, '#e8e8e8', x, y, T, T);
      r(ctx, '#d1d5db', x, y + 7, T, 1); r(ctx, '#d1d5db', x, y + 15, T, 1); // panel lines
      break;
    case TILES.HWI: // Blue Sky Window
      r(ctx, '#e8e8e8', x, y, T, T);
      r(ctx, '#4b453a', x + 3, y + 3, 10, 10); // frame
      r(ctx, '#a0d8f0', x + 4, y + 4, 8, 8); // sky
      r(ctx, '#ffffff', x + 6, y + 5, 4, 1); // reflection
      break;
    case TILES.HD: // Wooden Door
      r(ctx, '#e8e8e8', x, y, T, T);
      r(ctx, '#634a36', x + 2, y + 2, 12, 14); // wood
      r(ctx, '#453224', x + 3, y + 3, 10, 12); // panel
      r(ctx, '#facc15', x + 11, y + 10, 2, 2); // knob
      break;

    // ── VILLAGE DETAILS ─────────────────────────────────────────────────
    case TILES.MBX: // Mailbox
      r(ctx, '#5a9e38', x, y, T, T); // grass base
      r(ctx, '#4a2808', x + 7, y + 8, 2, 8); // post
      r(ctx, '#9ca3af', x + 5, y + 4, 6, 5); // box
      r(ctx, '#dc2626', x + 9, y + 5, 2, 2); // flag
      break;
    case TILES.LP: // Lantern Post (Glow)
      r(ctx, '#111827', x + 7, y, 2, T); // iron post
      r(ctx, '#fbbf24', x + 5, y + 2, 6, 6); // glass
      r(ctx, '#ffffff', x + 7, y + 4, 2, 2); // wick
      break;
    case TILES.CF: // Crop field (Wheat)
      r(ctx, '#78350f', x, y, T, T); // soil
      r(ctx, '#fde047', x + 2, y + 2, 2, 6); r(ctx, '#fde047', x + 5, y + 4, 2, 8);
      r(ctx, '#eab308', x + 10, y + 1, 2, 10);
      break;
    case TILES.WMH: // Windmill Head
      r(ctx, '#f3f4f6', x + 6, y + 2, 4, 4); // hub
      r(ctx, '#94a3b8', x, y + 7, T, 2); // horizontal blade
      r(ctx, '#94a3b8', x + 7, y, 2, T); // vertical blade
      break;

    // ── NEW BUILDING VARIANTS ──────────────────────────────────────────
    case TILES.THR: // Thatch Roof (Rustic)
      r(ctx, '#92400e', x, y, T, T); // Dark straw
      r(ctx, '#713f12', x, y + 14, T, 2);
      for(let i=0; i<4; i++) {
        r(ctx, '#b45309', x, y + i*4, T, 1); // Layering
        r(ctx, '#d97706', x + 2, y + i*4 + 1, 6, 2); // Highlight
      }
      break;
    case TILES.THW: // Log/Wood Wall
      r(ctx, '#451a03', x, y, T, T); // Dark wood
      r(ctx, '#713f12', x + 1, y + 1, 14, 6); r(ctx, '#713f12', x + 1, y + 9, 14, 6); // Logs
      break;
    case TILES.SR: // Stone Roof (Blue/Slate)
      r(ctx, '#1e293b', x, y, T, T); // Deep slate
      r(ctx, '#334155', x + 2, y + 2, T-4, 2); // Shingle highlight
      r(ctx, '#0f172a', x, y + 14, T, 2);
      break;
    case TILES.SW: // Stone Wall (Grey Brick)
      r(ctx, '#64748b', x, y, T, T); // Grey base
      r(ctx, '#475569', x, y + 7, T, 1); r(ctx, '#475569', x + 8, y + 15, T, 1); // Mortar
      break;

    case TILES.HL: // Hill Side
      r(ctx, '#4a8a2c', x, y, T, T);
      r(ctx, '#5a9e38', x + 2, y + 2, T - 4, T - 4);
      break;

    // ── VILLAGE DETAILS ─────────────────────────────────────────────────
    case TILES.SG: // Signboard (Post & Board)
      r(ctx, '#5a9e38', x, y, T, T); // Grass base
      r(ctx, '#4a2808', x + 7, y + 6, 2, 10); // Post
      r(ctx, '#8b5e3c', x + 3, y + 2, 10, 6); // Board
      r(ctx, '#634a36', x + 4, y + 3, 8, 4); // Panel
      break;
    case TILES.WL2: // Stone Well
      r(ctx, '#5a9e38', x, y, T, T); // Grass base
      r(ctx, '#94a3b8', x + 1, y + 1, 14, 14); // Stone base
      r(ctx, '#2878d8', x + 4, y + 4, 8, 8); // Water
      r(ctx, '#4a2808', x, y + 8, T, 2); // Crossbar
      break;
    case TILES.BN: // Wooden Bench
      r(ctx, '#5a9e38', x, y, T, T); // Grass base
      r(ctx, '#8b5e3c', x, y + 6, T, 4); // Seat
      r(ctx, '#4a2808', x + 1, y + 10, 2, 6); // Legs
      r(ctx, '#4a2808', x + 13, y + 10, 2, 6);
      break;
    case TILES.FH: // Fence Horizontal
      r(ctx, '#5a9e38', x, y, T, T); // Grass base
      r(ctx, '#a16207', x, y + 6, T, 2); // Top rail (Brighter brown)
      r(ctx, '#a16207', x, y + 10, T, 2); // Bottom rail
      r(ctx, '#713f12', x + 7, y + 4, 2, 12); // Post
      break;
    case TILES.FV: // Fence Vertical
      r(ctx, '#5a9e38', x, y, T, T); // Grass base
      r(ctx, '#713f12', x + 7, y, 2, T); // Post
      r(ctx, '#a16207', x + 5, y + 4, 6, 2); // Rail
      break;

    // ── FENCE CORNERS ────────────────────────────────────────────────────
    case TILES.FCTL: // Fence Corner Top-Left
      r(ctx, '#5a9e38', x, y, T, T); r(ctx, '#713f12', x + 7, y + 4, 2, 12); // Post
      r(ctx, '#a16207', x + 9, y + 6, 7, 2); r(ctx, '#a16207', x + 9, y + 10, 7, 2); // Right rails
      r(ctx, '#a16207', x + 5, y + 12, 6, 2); // Bottom rail connection
      break;
    case TILES.FCTR: // Fence Corner Top-Right
      r(ctx, '#5a9e38', x, y, T, T); r(ctx, '#713f12', x + 7, y + 4, 2, 12); // Post
      r(ctx, '#a16207', x, y + 6, 7, 2); r(ctx, '#a16207', x, y + 10, 7, 2); // Left rails
      r(ctx, '#a16207', x + 5, y + 12, 6, 2); 
      break;
    case TILES.FCBL: // Fence Corner Bottom-Left
      r(ctx, '#5a9e38', x, y, T, T); r(ctx, '#713f12', x + 7, y, 2, 12); // Post
      r(ctx, '#a16207', x + 9, y + 4, 7, 2); r(ctx, '#a16207', x + 9, y + 8, 7, 2); // Right rails
      break;
    case TILES.FCBR: // Fence Corner Bottom-Right
      r(ctx, '#5a9e38', x, y, T, T); r(ctx, '#713f12', x + 7, y, 2, 12); // Post
      r(ctx, '#a16207', x, y + 4, 7, 2); r(ctx, '#a16207', x, y + 8, 7, 2); // Left rails
      break;
    case TILES.INNR: // Inn Roof (Blue)
      r(ctx, '#2563eb', x, y, T, T); // Deep blue
      r(ctx, '#1d4ed8', x, y + 14, T, 2); 
      for (let i = 0; i < 4; i++) {
        r(ctx, '#1e40af', x, y + i * 4, T, 1);
        r(ctx, '#3b82f6', x + 2, y + i * 4 + 1, 4, 2);
      }
      break;
    case TILES.INNW: // Inn Wall (Stone)
      r(ctx, '#94a3b8', x, y, T, T);
      r(ctx, '#64748b', x + 1, y + 7, 6, 1); r(ctx, '#64748b', x + 10, y + 15, 6, 1); // Mortar
      break;
    case TILES.MBX: // Mailbox
      r(ctx, '#5a9e38', x, y, T, T); // grass base
      r(ctx, '#4a2808', x + 7, y + 8, 2, 8); // post
      r(ctx, '#9ca3af', x + 5, y + 4, 6, 5); // box
      r(ctx, '#dc2626', x + 9, y + 5, 2, 2); // flag
      break;

    // ── ENVIRONMENT ─────────────────────────────────────────────────────
    case TILES.BR: // Bridge
      r(ctx, '#634a36', x, y, T, T);
      r(ctx, '#8b5e3c', x, y, T, 3); r(ctx, '#8b5e3c', x, y + 13, T, 3); // railings
      for(let i=0; i<4; i++) r(ctx, '#4a3224', x + i*4, y+3, 2, 10); // planks
      break;
    case TILES.FL: // Flowers
      r(ctx, '#5a9e38', x, y, T, T);
      r(ctx, '#fb7185', x + 4, y + 4, 3, 3); r(ctx, '#facc15', x + 10, y + 8, 3, 3);
      r(ctx, '#ffffff', x + 5, y + 5, 1, 1);
      break;
    case TILES.RK: // Big Rock
      r(ctx, '#7888a0', x + 2, y + 2, 12, 12);
      r(ctx, '#94a3b8', x + 4, y + 3, 6, 4); // highlight
      r(ctx, '#475569', x + 2, y + 12, 12, 2); // shadow
      break;

    default: r(ctx, '#5a9e38', x, y, T, T);
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
      r(ctx, '#8b4513', x, y, T, T); // Wood base
      r(ctx, '#6b3410', x, y + 15, T, 1); // Plank line
      r(ctx, '#a0522d', x + 2, y + 2, T-4, 1); // Highlight
      break;
    case TILES_INT.WALL:
      r(ctx, '#4a3224', x, y, T, T);
      r(ctx, '#5d4037', x + 1, y + 1, 14, 14);
      break;
    case TILES_INT.WINDOW:
      r(ctx, '#4a3224', x, y, T, T);
      r(ctx, '#a0d8f0', x + 4, y + 4, 8, 8);
      r(ctx, '#ffffff', x + 6, y + 5, 4, 1);
      break;
    case TILES_INT.RUG:
      r(ctx, '#8b4513', x, y, T, T);
      r(ctx, '#b91c1c', x + 1, y + 1, 14, 14);
      r(ctx, '#ef4444', x + 3, y + 3, 10, 10);
      break;
    case TILES_INT.BED:
      r(ctx, '#5d4037', x, y, T, T);
      r(ctx, '#ffffff', x + 2, y + 2, 12, 6); // pillow/sheet
      r(ctx, '#991b1b', x + 2, y + 8, 12, 6); // blanket
      break;
    case TILES_INT.TABLE:
      r(ctx, '#8b4513', x + 2, y + 2, 12, 12);
      r(ctx, '#5d4037', x + 3, y + 3, 10, 10);
      break;

    default: r(ctx, '#2a2018', x, y, T, T);
  }
  ctx.restore();
}
