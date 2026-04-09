export const CHAPTER2_BASE_ROUTE = '/chapter2';
export const CHAPTER2_START_ROUTE = CHAPTER2_BASE_ROUTE;

const SCENE_TO_SEGMENT = {
  start: '',
  camp: 'camp',
  forestEdge: 'forest-edge',
} as const;

type Chapter2Scene = keyof typeof SCENE_TO_SEGMENT;

export function chapter2RouteForScene(scene: Chapter2Scene = 'start'): string {
  const segment = SCENE_TO_SEGMENT[scene];
  return segment ? `${CHAPTER2_BASE_ROUTE}/${segment}` : CHAPTER2_START_ROUTE;
}

