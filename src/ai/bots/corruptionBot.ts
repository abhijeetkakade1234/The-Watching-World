export interface CorruptionBotPlan {
  attackType: 'none' | 'trap' | 'corruption' | 'block';
  spreadIntervalMs: number;
  maxActiveTiles: number;
}

export interface CorruptionBotRuntime {
  status: 'playing' | 'game_over' | 'victory' | 'paused';
  currentMap: string;
  nowMs: number;
  lastSpreadAtMs: number;
  playerPos: { x: number; y: number };
  activeTiles: Array<{ x: number; y: number }>;
}

export interface CorruptionBotDecision {
  shouldSpread: boolean;
  nextLastSpreadAtMs: number;
  nextTile: { x: number; y: number } | null;
}

const MIN_SPREAD_INTERVAL_MS = 3000;

export function evaluateCorruptionBot(plan: CorruptionBotPlan, runtime: CorruptionBotRuntime): CorruptionBotDecision {
  if (runtime.status !== 'playing') {
    return { shouldSpread: false, nextLastSpreadAtMs: runtime.lastSpreadAtMs, nextTile: null };
  }

  if (plan.attackType !== 'corruption') {
    return { shouldSpread: false, nextLastSpreadAtMs: runtime.lastSpreadAtMs, nextTile: null };
  }

  if (runtime.activeTiles.length >= plan.maxActiveTiles) {
    return { shouldSpread: false, nextLastSpreadAtMs: runtime.lastSpreadAtMs, nextTile: null };
  }

  const spreadEvery = Math.max(MIN_SPREAD_INTERVAL_MS, plan.spreadIntervalMs);
  if (runtime.nowMs - runtime.lastSpreadAtMs < spreadEvery) {
    return { shouldSpread: false, nextLastSpreadAtMs: runtime.lastSpreadAtMs, nextTile: null };
  }

  const ring = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
    { x: 0, y: -2 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: -2, y: 0 },
  ];

  const used = new Set(runtime.activeTiles.map((tile) => `${tile.x},${tile.y}`));
  for (const delta of ring) {
    const candidate = { x: runtime.playerPos.x + delta.x, y: runtime.playerPos.y + delta.y };
    if (!used.has(`${candidate.x},${candidate.y}`)) {
      return { shouldSpread: true, nextLastSpreadAtMs: runtime.nowMs, nextTile: candidate };
    }
  }

  return { shouldSpread: false, nextLastSpreadAtMs: runtime.lastSpreadAtMs, nextTile: null };
}
