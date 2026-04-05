import { TILES } from '../data/maps/level1';

export const TILE_SIZE = 16;
export const COLS = 160;
export const ROWS = 120;

export function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, type: number) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  const T = TILE_SIZE;
  
  ctx.save();
  switch (type) {
    case TILES.G1:
      ctx.fillStyle = '#5a9e38'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#4a8a2c'; ctx.fillRect(px + 2, py + 3, 2, 4); ctx.fillRect(px + 12, py + 5, 2, 3);
      ctx.fillStyle = '#6ab848'; ctx.fillRect(px + 8, py + 1, 1, 3); ctx.fillRect(px + 5, py + 9, 1, 4);
      break;
    case TILES.G2:
      ctx.fillStyle = '#4e8f30'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#5aaa38'; ctx.fillRect(px + 1, py + 1, 3, 3); ctx.fillRect(px + 11, py + 2, 2, 4);
      ctx.fillStyle = '#3d7225'; ctx.fillRect(px + 6, py + 6, 2, 5); ctx.fillRect(px + 3, py + 11, 3, 3);
      break;
    case TILES.G3:
      ctx.fillStyle = '#58a035'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#4d8c2d'; ctx.fillRect(px, py + 4, 4, 4); ctx.fillRect(px + 7, py, 4, 4);
      ctx.fillStyle = '#70c045'; ctx.fillRect(px + 6, py + 5, 2, 2);
      break;
    case TILES.TG:
      ctx.fillStyle = '#4e8f30'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#7ac450'; ctx.fillRect(px + 1, py + 4, 2, 12); ctx.fillRect(px + 9, py + 5, 2, 11);
      ctx.fillStyle = '#5aa838'; ctx.fillRect(px + 5, py + 2, 2, 14); ctx.fillRect(px + 13, py + 3, 2, 13);
      ctx.fillStyle = '#3d7225'; ctx.fillRect(px + 3, py + 8, 1, 3); ctx.fillRect(px + 7, py + 7, 1, 4);
      break;
    case TILES.DT:
      ctx.fillStyle = '#c8a060'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#b89050'; ctx.fillRect(px + 2, py + 2, 3, 3); ctx.fillRect(px + 4, py + 10, 4, 2);
      ctx.fillStyle = '#d4b070'; ctx.fillRect(px + 9, py + 5, 2, 2); ctx.fillRect(px + 11, py + 11, 3, 3);
      break;
    case TILES.DV:
      ctx.fillStyle = '#c0984e'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#a07840'; ctx.fillRect(px, py, 2, T); ctx.fillRect(px + 14, py, 2, T);
      ctx.fillStyle = '#d4b070'; ctx.fillRect(px + 2, py + 3, 2, 2); ctx.fillRect(px + 10, py + 9, 2, 2);
      break;
    case TILES.WT:
      ctx.fillStyle = '#c0984e'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#a07840'; ctx.fillRect(px, py, T, 2); ctx.fillRect(px, py + 14, T, 2);
      ctx.fillStyle = '#d4b070'; ctx.fillRect(px + 3, py + 3, 2, 2); ctx.fillRect(px + 9, py + 9, 2, 2);
      break;
    case TILES.WI:
      ctx.fillStyle = '#2878d8'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#3890f0'; ctx.fillRect(px, py + 5, 8, 2); ctx.fillRect(px + 8, py + 11, 8, 2);
      ctx.fillStyle = '#50a8ff'; ctx.fillRect(px + 2, py + 1, 5, 1); ctx.fillRect(px + 10, py + 7, 4, 1);
      break;
    case TILES.TR:
      ctx.fillStyle = '#4aaa2e'; ctx.fillRect(px + 2, py, 12, 12);
      ctx.fillStyle = '#3a9820'; ctx.fillRect(px, py + 4, T, 8);
      ctx.fillStyle = '#5ab83a'; ctx.fillRect(px + 4, py + 2, 8, 8);
      ctx.fillStyle = '#2a6810'; ctx.fillRect(px + 6, py + 10, 4, 6);
      ctx.fillStyle = '#4a2808'; ctx.fillRect(px + 7, py + 10, 2, 6);
      break;
    case TILES.TK:
      ctx.fillStyle = '#3a9820'; ctx.fillRect(px + 1, py, 14, 10);
      ctx.fillStyle = '#4aaa2e'; ctx.fillRect(px + 3, py + 2, 10, 8);
      ctx.fillStyle = '#5ab83a'; ctx.fillRect(px + 5, py + 1, 6, 6);
      ctx.fillStyle = '#4a2808'; ctx.fillRect(px + 6, py + 9, 4, 7);
      ctx.fillStyle = '#5a3010'; ctx.fillRect(px + 7, py + 9, 2, 7);
      break;
    case TILES.BU:
      ctx.fillStyle = '#3a8020'; ctx.fillRect(px + 1, py + 4, 14, 10);
      ctx.fillStyle = '#4a9828'; ctx.fillRect(px, py + 6, 16, 8);
      ctx.fillStyle = '#5aaa30'; ctx.fillRect(px + 2, py + 5, 4, 6); ctx.fillRect(px + 7, py + 4, 5, 7); ctx.fillRect(px + 12, py + 6, 3, 5);
      ctx.fillStyle = '#2d6018'; ctx.fillRect(px + 4, py + 12, 2, 2); ctx.fillRect(px + 10, py + 11, 2, 2);
      break;
    case TILES.RK:
      ctx.fillStyle = '#7888a0'; ctx.fillRect(px + 1, py + 4, 14, 10);
      ctx.fillStyle = '#8898b0'; ctx.fillRect(px + 2, py + 2, 12, 8);
      ctx.fillStyle = '#a0b0c0'; ctx.fillRect(px + 4, py + 2, 8, 4);
      ctx.fillStyle = '#5a6870'; ctx.fillRect(px + 1, py + 12, 14, 2);
      break;
    case TILES.CL:
      ctx.fillStyle = '#7888a0'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#9aaabb'; ctx.fillRect(px, py, T, 4);
      ctx.fillStyle = '#4a5860'; ctx.fillRect(px + 2, py + 4, 2, 12); ctx.fillRect(px + 9, py + 6, 2, 8);
      ctx.fillStyle = '#6878a0'; ctx.fillRect(px, py, T, 2);
      break;
    case TILES.ST:
      ctx.fillStyle = '#8898a8'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#7888a0'; ctx.fillRect(px, py, 8, 8); ctx.fillRect(px + 8, py + 8, 8, 8);
      ctx.fillStyle = '#5a6870'; ctx.fillRect(px, py + 8, T, 1); ctx.fillRect(px + 8, py, 1, 8);
      ctx.fillStyle = '#9aaabb'; ctx.fillRect(px, py, 1, 8); ctx.fillRect(px, py + 8, 1, 8);
      break;
    case TILES.BR:
      ctx.fillStyle = '#a07040'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#c09050'; ctx.fillRect(px, py, T, 3); ctx.fillRect(px, py + 13, T, 3);
      ctx.fillStyle = '#b08040'; ctx.fillRect(px, py + 6, T, 4);
      ctx.fillStyle = '#805030';
      [0, 4, 8, 12].forEach(ox => { ctx.fillRect(px + ox, py + 3, 2, 3); ctx.fillRect(px + ox, py + 10, 2, 3); });
      break;
    case TILES.SH:
      ctx.fillStyle = '#d0c080'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#a09050'; ctx.fillRect(px + 1, py + 4, 3, 12); ctx.fillRect(px + 12, py + 4, 3, 12);
      ctx.fillStyle = '#a87830'; ctx.fillRect(px, py, T, 4);
      ctx.fillStyle = '#e8ac58'; ctx.fillRect(px + 2, py + 1, 12, 2);
      ctx.fillStyle = '#ffd870'; ctx.fillRect(px + 5, py, 6, 2);
      ctx.fillStyle = '#f0e070'; ctx.fillRect(px + 4, py + 5, 8, 8);
      ctx.fillStyle = '#fff0a0'; ctx.fillRect(px + 6, py + 6, 4, 5);
      break;
    case TILES.SF:
      ctx.fillStyle = '#c8b880'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#e8d8a0'; ctx.fillRect(px, py, T, 2);
      ctx.fillStyle = '#ffd030'; ctx.fillRect(px + 4, py + 4, 8, 8);
      ctx.fillStyle = '#ffe870'; ctx.fillRect(px + 6, py + 5, 4, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(px + 7, py + 5, 2, 2);
      ctx.fillStyle = '#a89050'; ctx.fillRect(px, py + 12, T, 4);
      break;
    case TILES.CG:
      ctx.fillStyle = '#2d1a4a'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#3a1f5e'; ctx.fillRect(px, py, 4, 4); ctx.fillRect(px + 8, py + 4, 4, 4); ctx.fillRect(px + 4, py + 8, 4, 4);
      ctx.fillStyle = '#6a20a0'; ctx.fillRect(px + 1, py + 9, 2, 5); ctx.fillRect(px + 7, py + 1, 2, 4);
      break;
    case TILES.CE:
      ctx.fillStyle = '#3c2860'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#8050c0';
      ctx.fillRect(px, py + 7, 7, 1); ctx.fillRect(px + 7, py + 4, 1, 7); ctx.fillRect(px + 10, py + 10, 6, 1);
      ctx.fillStyle = '#6030a0'; ctx.fillRect(px + 3, py + 12, 8, 1); ctx.fillRect(px + 2, py + 2, 4, 1);
      break;
    case TILES.CR:
      ctx.fillStyle = '#1a0828'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#3a1f5e'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#6a20a0'; ctx.fillRect(px + 2, py + 8, 2, 5); ctx.fillRect(px + 6, py + 1, 2, 4); ctx.fillRect(px + 11, py + 6, 2, 3);
      ctx.fillStyle = '#b060f0'; ctx.fillRect(px + 5, py + 5, 4, 4);
      ctx.fillStyle = '#c070ff'; ctx.fillRect(px + 6, py + 6, 2, 2);
      break;
    case TILES.SA:
      ctx.fillStyle = '#e8d8a0'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#d8c890'; ctx.fillRect(px + 3, py + 4, 1, 1); ctx.fillRect(px + 10, py + 8, 1, 1);
      break;
    case TILES.DS:
      ctx.fillStyle = '#dcb860'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#c8a850'; ctx.fillRect(px, py + 8, T, 2); ctx.fillRect(px + 2, py + 12, 4, 1);
      break;
    case TILES.MT:
      ctx.fillStyle = '#5a6870'; ctx.fillRect(px, py + 4, T, 12);
      ctx.fillStyle = '#7888a0'; ctx.beginPath(); ctx.moveTo(px, py + 8); ctx.lineTo(px + 8, py); ctx.lineTo(px + 16, py + 8); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(px + 6, py + 2); ctx.lineTo(px + 8, py); ctx.lineTo(px + 10, py + 2); ctx.fill();
      break;
    case TILES.WF:
      ctx.fillStyle = '#2878d8'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(px + 2, py, 2, 16); ctx.fillRect(px + 11, py, 1, 16);
      ctx.fillStyle = '#50a8ff'; ctx.fillRect(px + 6, py, 3, 16);
      break;
    case TILES.WS:
      ctx.fillStyle = '#2060c0'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#2878d8'; ctx.fillRect(px + 2, py, T - 2, T);
      ctx.fillStyle = '#1a5ea8'; ctx.fillRect(px, py, 2, T);
      ctx.fillStyle = '#50a8ff'; ctx.fillRect(px + 4, py + 3, 6, 1); ctx.fillRect(px + 10, py + 9, 4, 1);
      break;
    case TILES.WE:
      ctx.fillStyle = '#2878d8'; ctx.fillRect(px, py, T, T);
      ctx.fillStyle = '#3890f0'; ctx.fillRect(px + 2, py + 2, 12, 12);
      ctx.fillStyle = '#1a5ea8'; ctx.fillRect(px, py + 14, T, 2);
      ctx.fillStyle = '#50a8ff'; ctx.fillRect(px + 3, py + 5, 4, 1); ctx.fillRect(px + 9, py + 10, 5, 1);
      break;
    case TILES.FO:
      ctx.fillStyle = '#783c12'; ctx.fillRect(px + 2, py + 4, 12, 10);
      ctx.fillStyle = '#a16219'; ctx.fillRect(px + 3, py + 5, 10, 8);
      ctx.fillStyle = '#f97316'; ctx.fillRect(px + 5, py + 6, 2, 2); ctx.fillRect(px + 9, py + 8, 2, 2);
      break;
    case TILES.HL:
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(px + 3, py + 3, 10, 10);
      ctx.fillStyle = '#ef4444'; 
      ctx.fillRect(px + 7, py + 5, 2, 6); // Vertical Cross
      ctx.fillRect(px + 5, py + 7, 6, 2); // Horizontal Cross
      break;
  }
  ctx.restore();
}
