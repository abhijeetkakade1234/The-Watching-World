import type { MapId } from '@/types/game';

export const CHAPTER1_BASE_ROUTE = '/chapter1';
export const CHAPTER1_VILLAGE_ROUTE = `${CHAPTER1_BASE_ROUTE}/village`;

const HOUSE_SEGMENT_TO_MAP: Record<string, MapId> = {
  boysHome: 'house-boysHome',
  elder: 'house-elder',
  neighborA: 'house-neighborA',
  neighborB: 'house-neighborB',
  inn: 'house-inn',
};

const MAP_TO_HOUSE_SEGMENT: Partial<Record<MapId, string>> = {
  'house-boysHome': 'boysHome',
  'house-elder': 'elder',
  'house-neighborA': 'neighborA',
  'house-neighborB': 'neighborB',
  'house-inn': 'inn',
};

export function chapter1MapFromHouseSegment(segment: string): MapId | null {
  return HOUSE_SEGMENT_TO_MAP[segment] ?? null;
}

export function chapter1RouteForMap(mapId: MapId): string {
  if (mapId === 'village_chapter') return CHAPTER1_VILLAGE_ROUTE;
  const houseSegment = MAP_TO_HOUSE_SEGMENT[mapId];
  return houseSegment ? `${CHAPTER1_BASE_ROUTE}/house/${houseSegment}` : CHAPTER1_VILLAGE_ROUTE;
}
