// CHAPTER 1 - INDEX
import { 
  TILES, TILE_PROPERTIES, SPAWN_POINT, EXIT_ZONE, CHAPTER_LABELS, COLS, ROWS 
} from './constants';

import { chapter1Map } from './main';

// Re-exporting consolidated data
export { chapter1Map, TILES, TILE_PROPERTIES, SPAWN_POINT, EXIT_ZONE, CHAPTER_LABELS, COLS, ROWS };

import type { HouseData } from '@/types/game';

// Explicitly import house data
import { boysHomeMap, BOYS_HOME_SPAWN, BOYS_HOME_ENTITIES } from './houses/boysHome';
import { elderMap, ELDER_SPAWN, ELDER_ENTITIES } from './houses/elder';
import { neighborAMap, NEIGHBOR_A_SPAWN, NEIGHBOR_A_ENTITIES } from './houses/neighborA';
import { neighborBMap, NEIGHBOR_B_SPAWN, NEIGHBOR_B_ENTITIES } from './houses/neighborB';
import { innMap, INN_SPAWN, INN_ENTITIES } from './houses/inn';

export const HOUSE_MAPS: Record<string, HouseData> = {
  'house-boysHome': {
    map: boysHomeMap,
    spawn: BOYS_HOME_SPAWN,
    entities: BOYS_HOME_ENTITIES,
    dims: { cols: 16, rows: 14 }
  },
  'house-elder': {
    map: elderMap,
    spawn: ELDER_SPAWN,
    entities: ELDER_ENTITIES,
    dims: { cols: 16, rows: 12 }
  },
  'house-neighborA': {
    map: neighborAMap,
    spawn: NEIGHBOR_A_SPAWN,
    entities: NEIGHBOR_A_ENTITIES,
    dims: { cols: 12, rows: 10 }
  },
  'house-neighborB': {
    map: neighborBMap,
    spawn: NEIGHBOR_B_SPAWN,
    entities: NEIGHBOR_B_ENTITIES,
    dims: { cols: 12, rows: 10 }
  },
  'house-inn': {
    map: innMap,
    spawn: INN_SPAWN,
    entities: INN_ENTITIES,
    dims: { cols: 20, rows: 15 }
  }
};
