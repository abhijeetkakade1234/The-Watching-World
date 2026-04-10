export interface TrapBotPlan {
  attackType: 'none' | 'trap' | 'corruption' | 'block';
  trapFrequencyMs: number;
  allowExplorationMaps?: boolean;
}

export interface TrapBotRuntime {
  status: 'playing' | 'game_over' | 'victory' | 'paused';
  currentMap: string;
  qteActive: boolean;
  nowMs: number;
  lastTriggerAtMs: number;
}

export interface TrapBotDecision {
  shouldTrigger: boolean;
  nextLastTriggerAtMs: number;
}

const MIN_TRAP_INTERVAL_MS = 3000;

function isExplorationMap(mapId: string): boolean {
  return mapId === 'village_chapter' || mapId.startsWith('house-');
}

export function evaluateTrapBot(plan: TrapBotPlan, runtime: TrapBotRuntime): TrapBotDecision {
  if (runtime.status !== 'playing') {
    return { shouldTrigger: false, nextLastTriggerAtMs: runtime.lastTriggerAtMs };
  }

  if (runtime.qteActive) {
    return { shouldTrigger: false, nextLastTriggerAtMs: runtime.lastTriggerAtMs };
  }

  if (!plan.allowExplorationMaps && isExplorationMap(runtime.currentMap)) {
    return { shouldTrigger: false, nextLastTriggerAtMs: runtime.lastTriggerAtMs };
  }

  if (plan.attackType !== 'trap') {
    return { shouldTrigger: false, nextLastTriggerAtMs: runtime.lastTriggerAtMs };
  }

  const intervalMs = Math.max(MIN_TRAP_INTERVAL_MS, plan.trapFrequencyMs);
  if (runtime.nowMs - runtime.lastTriggerAtMs < intervalMs) {
    return { shouldTrigger: false, nextLastTriggerAtMs: runtime.lastTriggerAtMs };
  }

  // Keep a bit of uncertainty so encounters feel less robotic.
  const roll = Math.random();
  if (roll > 0.75) {
    return { shouldTrigger: false, nextLastTriggerAtMs: runtime.lastTriggerAtMs };
  }

  return { shouldTrigger: true, nextLastTriggerAtMs: runtime.nowMs };
}
