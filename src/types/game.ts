export type GameStatus = 'playing' | 'game_over' | 'victory' | 'paused';
export type MapId = 'village_chapter' | 'house-boysHome' | 'house-elder' | 'house-neighborA' | 'house-neighborB' | 'house-inn';

export interface DynamicEntity {
  id: string;
  x: number;
  y: number;
  type: 'corruption' | 'trap' | 'goal' | 'block' | 'chest' | 'npc';
  isHidden?: boolean;
  message?: string;
  isOpened?: boolean;
}

export interface HouseData {
  map: number[][];
  spawn: { x: number; y: number };
  entities: DynamicEntity[];
  dims: { cols: number; rows: number };
}
