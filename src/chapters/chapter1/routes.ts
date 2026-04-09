import type { MapId } from '@/types/game';

export const CHAPTER1_BASE_ROUTE = '/chapter1';
export const CHAPTER1_VILLAGE_ROUTE = `${CHAPTER1_BASE_ROUTE}/village`;

const HOUSE_SEGMENT_TO_MAP: Record<string, MapId> = {
  boyshome: 'house-boysHome',
  elder: 'house-elder',
  neighbora: 'house-neighborA',
  neighborb: 'house-neighborB',
  inn: 'house-inn',
  boysHome: 'house-boysHome',
  neighborA: 'house-neighborA',
  neighborB: 'house-neighborB',
};

const MAP_TO_HOUSE_SEGMENT: Record<MapId, string> = {
  village_chapter: 'village',
  'house-boysHome': 'boyshome',
  'house-elder': 'elder',
  'house-neighborA': 'neighbora',
  'house-neighborB': 'neighborb',
  'house-inn': 'inn',
};

export function chapter1MapFromHouseSegment(segment: string): MapId | null {
  const normalized = decodeURIComponent(segment).trim();
  return HOUSE_SEGMENT_TO_MAP[normalized] ?? HOUSE_SEGMENT_TO_MAP[normalized.toLowerCase()] ?? null;
}

export function chapter1HouseSegmentForMap(mapId: MapId): string | null {
  if (mapId === 'village_chapter') return null;
  return MAP_TO_HOUSE_SEGMENT[mapId] ?? null;
}

export function chapter1RouteForMap(mapId: MapId): string {
  if (mapId === 'village_chapter') return CHAPTER1_VILLAGE_ROUTE;
  const houseSegment = chapter1HouseSegmentForMap(mapId);
  return houseSegment ? `${CHAPTER1_BASE_ROUTE}/house/${houseSegment}` : CHAPTER1_VILLAGE_ROUTE;
}
