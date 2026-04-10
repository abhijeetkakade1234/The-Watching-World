'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { evaluateTrapBot, type TrapBotPlan } from '@/ai/bots/trapBot';
import { evaluateCorruptionBot, type CorruptionBotPlan } from '@/ai/bots/corruptionBot';

type Cell = 0 | 1 | 2;

const MAP: Cell[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const START_POS = { x: 1, y: 1 };
const COLS = MAP[0].length;
const ROWS = MAP.length;
const TILE = 36;
const QTE_REQUIRED_TAPS = 10;
const QTE_WINDOW_MS = 2500;
const CORRUPTION_TTL_MS = 7000;
const CORRUPTION_SHIFT_MS = 1600;

type CorruptionTile = { x: number; y: number; expiresAt: number };

function isWalkable(x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;
  return MAP[y][x] !== 1;
}

export default function PlaygroundPage() {
  const [playerPos, setPlayerPos] = useState(START_POS);
  const [strategistMode, setStrategistMode] = useState<'observe' | 'trap_pressure' | 'corruption_pressure'>('trap_pressure');
  const [trapBotEnabled, setTrapBotEnabled] = useState(true);
  const [trapFrequencyMs, setTrapFrequencyMs] = useState(3500);
  const [corruptionBotEnabled, setCorruptionBotEnabled] = useState(true);
  const [corruptionSpreadMs, setCorruptionSpreadMs] = useState(3500);
  const [corruptionTiles, setCorruptionTiles] = useState<CorruptionTile[]>([]);

  const [qteActive, setQteActive] = useState(false);
  const [qteTaps, setQteTaps] = useState(0);
  const qteStartAtRef = useRef<number | null>(null);
  const lastTrapAtRef = useRef(0);
  const lastSpreadAtRef = useRef(0);
  const lastShiftAtRef = useRef(0);

  const [trapTriggeredCount, setTrapTriggeredCount] = useState(0);
  const [trapEscapedCount, setTrapEscapedCount] = useState(0);
  const [trapFailedCount, setTrapFailedCount] = useState(0);
  const [corruptionSpreadCount, setCorruptionSpreadCount] = useState(0);
  const [corruptionHitCount, setCorruptionHitCount] = useState(0);
  const [milestoneReached, setMilestoneReached] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const plan: TrapBotPlan = useMemo(
    () => ({
      attackType: trapBotEnabled && strategistMode === 'trap_pressure' ? 'trap' : 'none',
      trapFrequencyMs,
      allowExplorationMaps: true,
    }),
    [strategistMode, trapBotEnabled, trapFrequencyMs]
  );
  const corruptionPlan: CorruptionBotPlan = useMemo(
    () => ({
      attackType: corruptionBotEnabled && strategistMode === 'corruption_pressure' ? 'corruption' : 'none',
      spreadIntervalMs: corruptionSpreadMs,
      maxActiveTiles: 8,
    }),
    [corruptionBotEnabled, strategistMode, corruptionSpreadMs]
  );
  const strategistAttackType =
    strategistMode === 'trap_pressure'
      ? 'trap'
      : strategistMode === 'corruption_pressure'
        ? 'corruption'
        : 'none';
  const canUseTrap = trapBotEnabled;
  const canUseCorruption = corruptionBotEnabled;

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 8));
  };

  useEffect(() => {
    setTimeout(() => addLog('Playground ready. Trap mode is active by default.'), 0);
  }, []);

  useEffect(() => {
    if (strategistMode === 'trap_pressure' && !canUseTrap) {
      setTimeout(() => {
        setStrategistMode('observe');
        addLog('TrapBot disabled, strategist switched to OBSERVE.');
      }, 0);
    }
    if (strategistMode === 'corruption_pressure' && !canUseCorruption) {
      setTimeout(() => {
        setStrategistMode('observe');
        addLog('CorruptionBot disabled, strategist switched to OBSERVE.');
      }, 0);
    }
  }, [strategistMode, canUseTrap, canUseCorruption]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (qteActive && event.code === 'Space') {
        setQteTaps((prev) => prev + 1);
        return;
      }

      let dx = 0;
      let dy = 0;
      const key = event.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') dy = -1;
      if (key === 'arrowdown' || key === 's') dy = 1;
      if (key === 'arrowleft' || key === 'a') dx = -1;
      if (key === 'arrowright' || key === 'd') dx = 1;
      if (dx === 0 && dy === 0) return;

      setPlayerPos((prev) => {
        const nextX = prev.x + dx;
        const nextY = prev.y + dy;
        if (!isWalkable(nextX, nextY)) return prev;
        return { x: nextX, y: nextY };
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [qteActive]);

  useEffect(() => {
    const onMilestone = MAP[playerPos.y]?.[playerPos.x] === 2;
    if (onMilestone && !milestoneReached) {
      setTimeout(() => {
        setMilestoneReached(true);
        addLog('Milestone reached. (This is where chapter progress would save)');
      }, 0);
    }
  }, [playerPos, milestoneReached]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const decision = evaluateTrapBot(plan, {
        status: 'playing',
        currentMap: 'playground_test',
        qteActive,
        nowMs: now,
        lastTriggerAtMs: lastTrapAtRef.current,
      });

      if (decision.shouldTrigger) {
        lastTrapAtRef.current = decision.nextLastTriggerAtMs;
        setQteActive(true);
        setQteTaps(0);
        qteStartAtRef.current = now;
        setTrapTriggeredCount((v) => v + 1);
        addLog('TrapBot activated QTE.');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [plan, qteActive]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const decision = evaluateCorruptionBot(corruptionPlan, {
        status: 'playing',
        currentMap: 'playground_test',
        nowMs: now,
        lastSpreadAtMs: lastSpreadAtRef.current,
        playerPos,
        activeTiles: corruptionTiles.map((tile) => ({ x: tile.x, y: tile.y })),
      });

      if (!decision.shouldSpread || !decision.nextTile) return;
      const tile = decision.nextTile;
      if (!isWalkable(tile.x, tile.y)) return;

      lastSpreadAtRef.current = decision.nextLastSpreadAtMs;
      setCorruptionTiles((prev) => [...prev, { ...tile, expiresAt: now + CORRUPTION_TTL_MS }].slice(-corruptionPlan.maxActiveTiles));
      setCorruptionSpreadCount((v) => v + 1);
      addLog(`CorruptionBot spread to (${tile.x}, ${tile.y}).`);
    }, 1000);

    return () => clearInterval(timer);
  }, [corruptionPlan, playerPos, corruptionTiles]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCorruptionTiles((prev) => {
        const alive = prev.filter((tile) => tile.expiresAt > now);
        if (alive.length === 0) return alive;
        if (now - lastShiftAtRef.current < CORRUPTION_SHIFT_MS) return alive;

        lastShiftAtRef.current = now;
        const moved = [...alive];
        const idx = Math.floor(Math.random() * moved.length);
        const source = moved[idx];
        const used = new Set(moved.map((tile) => `${tile.x},${tile.y}`));
        const deltas = [
          { x: 0, y: -1 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: -1 },
          { x: 1, y: 1 },
          { x: -1, y: 1 },
          { x: -1, y: -1 },
        ];

        for (const d of deltas) {
          const nx = source.x + d.x;
          const ny = source.y + d.y;
          if (!isWalkable(nx, ny)) continue;
          if (MAP[ny]?.[nx] === 2) continue;
          if (used.has(`${nx},${ny}`)) continue;
          moved[idx] = { x: nx, y: ny, expiresAt: now + CORRUPTION_TTL_MS };
          break;
        }

        return moved;
      });
    }, 250);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!qteActive) return;
    if (qteTaps >= QTE_REQUIRED_TAPS) {
      setTimeout(() => {
        setQteActive(false);
        setTrapEscapedCount((v) => v + 1);
        addLog('Player escaped trap. Feedback -> strategist can increase pressure.');
      }, 0);
    }
  }, [qteActive, qteTaps]);

  useEffect(() => {
    if (!qteActive) return;
    const timer = setInterval(() => {
      if (!qteStartAtRef.current) return;
      const elapsed = Date.now() - qteStartAtRef.current;
      if (elapsed >= QTE_WINDOW_MS) {
        setQteActive(false);
        setTrapFailedCount((v) => v + 1);
        addLog('Player failed trap QTE. Feedback -> strategist can switch bot mix.');
      }
    }, 100);
    return () => clearInterval(timer);
  }, [qteActive]);

  useEffect(() => {
    const isOnCorruption = corruptionTiles.some((tile) => tile.x === playerPos.x && tile.y === playerPos.y);
    if (!isOnCorruption) return;
    setTimeout(() => {
      setCorruptionHitCount((v) => v + 1);
      addLog('Player stepped on corruption tile. Feedback -> strategist can add traps.');
      setCorruptionTiles((prev) => prev.filter((tile) => tile.x !== playerPos.x || tile.y !== playerPos.y));
    }, 0);
  }, [playerPos, corruptionTiles]);

  const resetRun = () => {
    setPlayerPos(START_POS);
    setMilestoneReached(false);
    setQteActive(false);
    setQteTaps(0);
    setTrapTriggeredCount(0);
    setTrapEscapedCount(0);
    setTrapFailedCount(0);
    setCorruptionSpreadCount(0);
    setCorruptionHitCount(0);
    setCorruptionTiles([]);
    lastTrapAtRef.current = 0;
    lastSpreadAtRef.current = 0;
    lastShiftAtRef.current = 0;
    setLogs([]);
  };

  return (
    <main className="min-h-screen bg-[#0d1310] text-[#e8dfc8] p-6">
      <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[auto_320px]">
        <section>
          <h1 className="font-mono text-2xl mb-2">Bot Playground</h1>
          <p className="font-mono text-sm text-[#b8aa86] mb-4">
            Move with WASD/arrow keys. Reach the gold tile. Corruption blocks shift over time so you can avoid them.
          </p>
          <p className="font-mono text-xs text-[#cdb88b] mb-4">
            Quick test: wait 3-5s for Trap QTE, then switch strategist to Corrupt to see moving hazard tiles.
          </p>

          <div
            className="relative border-2 border-[#3f4d3f] bg-[#1a241d]"
            style={{ width: COLS * TILE, height: ROWS * TILE }}
          >
            {MAP.map((row, y) =>
              row.map((cell, x) => {
                const hasCorruption = corruptionTiles.some((tile) => tile.x === x && tile.y === y);
                const baseColor = hasCorruption
                  ? '#5c2037'
                  : cell === 1
                    ? '#334537'
                    : cell === 2
                      ? '#8a6a2b'
                      : '#1b2d22';
                return (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      position: 'absolute',
                      left: x * TILE,
                      top: y * TILE,
                      width: TILE,
                      height: TILE,
                      background: baseColor,
                      outline: '1px solid rgba(0,0,0,0.2)',
                    }}
                  />
                );
              })
            )}

            <div
              style={{
                position: 'absolute',
                left: playerPos.x * TILE + 6,
                top: playerPos.y * TILE + 6,
                width: TILE - 12,
                height: TILE - 12,
                background: '#e96d4c',
                border: '2px solid #ffd8a8',
              }}
            />
          </div>
        </section>

        <aside className="border-2 border-[#3f4d3f] bg-[#151d18] p-4 font-mono text-sm">
          <h2 className="text-lg mb-3">Strategist + Bots</h2>
          <div className="space-y-3">
            <div>
              <p className="text-[#b8aa86] mb-1">Strategist mode</p>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 border ${strategistMode === 'observe' ? 'bg-[#2e472f]' : 'bg-[#222]'} border-[#55715b]`}
                  onClick={() => {
                    setStrategistMode('observe');
                    addLog('Strategist set to OBSERVE (attackType:none)');
                  }}
                >
                  Observe
                </button>
                <button
                  className={`px-3 py-1 border ${strategistMode === 'trap_pressure' ? 'bg-[#6e2f2f]' : 'bg-[#222]'} border-[#8d5252]`}
                  disabled={!canUseTrap}
                  onClick={() => {
                    if (!canUseTrap) return;
                    setStrategistMode('trap_pressure');
                    addLog('Strategist set to PRESSURE (attackType:trap)');
                  }}
                >
                  Trap
                </button>
                <button
                  className={`px-3 py-1 border ${strategistMode === 'corruption_pressure' ? 'bg-[#6a2d69]' : 'bg-[#222]'} border-[#8c5994]`}
                  disabled={!canUseCorruption}
                  onClick={() => {
                    if (!canUseCorruption) return;
                    setStrategistMode('corruption_pressure');
                    addLog('Strategist set to PRESSURE (attackType:corruption)');
                  }}
                >
                  Corrupt
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={trapBotEnabled}
                onChange={(e) => {
                  setTrapBotEnabled(e.target.checked);
                  addLog(`TrapBot ${e.target.checked ? 'enabled' : 'disabled'}.`);
                }}
              />
              TrapBot enabled
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={corruptionBotEnabled}
                onChange={(e) => {
                  setCorruptionBotEnabled(e.target.checked);
                  addLog(`CorruptionBot ${e.target.checked ? 'enabled' : 'disabled'}.`);
                }}
              />
              CorruptionBot enabled
            </label>

            <label className="block">
              <span className="text-[#b8aa86]">Trap interval (ms): {trapFrequencyMs}</span>
              <input
                className="w-full"
                type="range"
                min={3000}
                max={15000}
                step={500}
                value={trapFrequencyMs}
                onChange={(e) => setTrapFrequencyMs(Number(e.target.value))}
              />
            </label>
            <label className="block">
              <span className="text-[#b8aa86]">Corruption spread (ms): {corruptionSpreadMs}</span>
              <input
                className="w-full"
                type="range"
                min={3000}
                max={12000}
                step={500}
                value={corruptionSpreadMs}
                onChange={(e) => setCorruptionSpreadMs(Number(e.target.value))}
              />
            </label>

            <div className="border-t border-[#324337] pt-3">
              <p>Plan attackType: <strong>{strategistAttackType}</strong></p>
              <p>Triggered: {trapTriggeredCount}</p>
              <p>Escaped: {trapEscapedCount}</p>
              <p>Failed: {trapFailedCount}</p>
              <p>Corruption spread: {corruptionSpreadCount}</p>
              <p>Corruption hits: {corruptionHitCount}</p>
              <p>Milestone reached: {milestoneReached ? 'yes' : 'no'}</p>
            </div>

            <button className="w-full border border-[#55715b] py-1 bg-[#223027]" onClick={resetRun}>
              Reset run
            </button>

            <div className="border-t border-[#324337] pt-3">
              <p className="text-[#b8aa86] mb-1">Feedback log</p>
              <div className="space-y-1 text-xs">
                {logs.length === 0 ? <p className="text-[#7f8d7f]">No events yet.</p> : null}
                {logs.map((entry) => (
                  <p key={entry}>{entry}</p>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {qteActive ? (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50">
          <div className="border-2 border-[#8d5252] bg-[#2a1111] p-6 text-center font-mono">
            <p className="text-xl mb-2">TrapBot QTE</p>
            <p className="text-sm mb-4">Press Space {QTE_REQUIRED_TAPS} times to escape.</p>
            <p className="text-2xl">{qteTaps} / {QTE_REQUIRED_TAPS}</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
