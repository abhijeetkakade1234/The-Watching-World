# 🌿 THE WATCHING WORLD — GAME DESIGN DOCUMENT

> **"The Last Cure"** — A boy. A dying grandmother. A world that watches and learns.

---

## 🎯 CORE CONCEPT

A 2D top-down survival adventure where the world is controlled by an AI entity (The Watcher).  
The Watcher is not evil — it is a guardian that **tests, teaches, and adapts** to make the player worthy of reaching the cure.

The twist: you were never being hunted. You were being prepared.

---

## 🏗️ TECH STACK

| Layer | Technology |
|-------|----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Rendering | HTML5 Canvas (2D) via `MapViewport.tsx` |
| State | Zustand (`gameStore.ts`) |
| AI Brain | Google Gemini API (`gemma-3-27b-it`) |
| Database | Cloudflare D1 (SQLite at the Edge) |
| Deployment | Cloudflare Pages (frontend + edge functions) |
| ORM | Drizzle ORM |

---

## 🗂️ PROJECT STRUCTURE

```
src/
  app/
    page.tsx                  — Main game page
    api/
      ai-action/route.ts      — AI decision endpoint (Gemini)
      log-action/route.ts     — Telemetry / session logging
  components/
    MapViewport.tsx            — Canvas renderer + input
    GameLoop.tsx               — AI heartbeat + survival tick
    WatcherHUD.tsx             — Cinematic narration overlay
  data/
    maps/
      chapter1.ts             ✅ Predefined 60×70 map
      chapter2.ts             🔲 (future)
      ...                     🔲 (see Story Bible below)
  store/
    gameStore.ts              — All game state + Zustand
  db/
    index.ts                  — Hybrid D1 / local DB getter
    schema.ts                 — Drizzle schema (sessions + actions)
  utils/
    tile_renderer.ts          — Canvas tile drawing functions
```

---

## 🗄️ DATABASE SCHEMA

```sql
CREATE TABLE sessions (
  id           TEXT PRIMARY KEY,
  started_at   INTEGER NOT NULL,
  last_active  INTEGER NOT NULL,
  sector_reached INTEGER DEFAULT 1,
  qte_success_count INTEGER DEFAULT 0,
  qte_fail_count    INTEGER DEFAULT 0
);

CREATE TABLE actions (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES sessions(id),
  action_type TEXT NOT NULL,    -- 'QTE_SUCCESS', 'QTE_FAIL', 'SECTOR_CLAIM', etc.
  pos_x       REAL,
  pos_y       REAL,
  timestamp   INTEGER NOT NULL,
  details     TEXT              -- JSON blob for extra data
);
```

---

## 🔑 ENVIRONMENT

### Local `.env.local`
```
GEMINI_API_KEY=your_key_here
```

### Cloudflare Pages Dashboard

**Environment Variables:**
| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | your Gemini key |

**D1 Bindings (Settings → Functions → D1 Bindings):**
| Variable Name | Database |
|---|---|
| `DB` | `the-watching-world-db` |

---

## 🗺️ MAP SYSTEM

### Tile IDs (Chapter 1)
| ID | Name | Walkable |
|----|------|----------|
| 0 | G1 (bright grass) | ✅ |
| 1 | G2 (mid grass) | ✅ |
| 2 | G3 (shadow grass) | ✅ |
| 3 | TG (tall grass) | ❌ |
| 4 | TR (round tree) | ❌ |
| 5 | TK (dark tree) | ❌ |
| 7 | DT (dirt tile) | ✅ |
| 8 | DV (dirt path vert) | ✅ |
| 10-14 | Water edges/inner | ❌ |
| 15 | RK (rock) | ❌ |
| 16 | RKS (small rock) | ✅ |
| 17 | BU (bush) | ❌ |
| 18 | HG (house ground) | ❌ |
| 19 | HR (house roof) | ❌ |
| 20 | FN (fence) | ❌ |
| 21 | FL (flower) | ✅ |
| 22 | SG (sign post) | ❌ |
| 23 | WL2 (well) | ❌ |
| 26 | SP (spawn point) | ✅ |
| 27 | GR (gravel) | ✅ |
| 28 | BD (border tree) | ❌ |
| 30 | WF (waterfall) | ❌ |

### Chapter 1 Map
- **File:** `src/data/maps/chapter1.ts`
- **Size:** 60 cols × 70 rows (960×1120 px at 16px/tile)
- **Spawn:** `{ x: 19, y: 16 }`
- **Exit:** Row 69, cols 18-21 → Chapter 2

### Zone Layout
| Rows | Zone |
|------|------|
| 0–3 | North border (dense tree wall) |
| 4–12 | Upper village (elder's home, pond, waterfall, east house) |
| 12–21 | Village core (boy's home, well, main path junction) |
| 22–28 | South village (neighbor house, outskirts, sign post) |
| 29–38 | Forest entry (path visible, trees flanking, first tall grass) |
| 39–50 | Mid forest (path curves west, dense undergrowth) |
| 51–67 | Deep forest (path returns east, trees close in) |
| 68–69 | South border / exit gate |

---

## 🤖 AI SYSTEM

### How It Works
1. Every **10 seconds**, `GameLoop.tsx` calls `POST /api/ai-action`
2. The AI endpoint fetches the **last 12 logged actions** from D1 (Sliding Window Memory)
3. Gemini receives a structured prompt with:
   - Player position + health
   - Session QTE stats (win/fail ratio)
   - Sector progression
   - Action history summary
4. Gemini returns a **JSON decision:**
```json
{
  "narration": "You walk familiar paths... but do they walk back?",
  "trapFrequencyMs": 7000,
  "attackType": "trap",
  "reason": "Player is succeeding QTEs — stay passive this chapter"
}
```
5. The decision is applied in `gameStore.ts` → `handleAITurn()`

### Sector Progression
| Player X | Sector | AI Powers |
|----------|--------|-----------|
| 0–40 | 1 | Basic traps only |
| 40–80 | 2 | Traps + Energy drain |
| 80–120 | 3 | Traps + Drain + Terrain blocking |
| 120+ | 4 | Full aggression |

### Telemetry Actions Logged
- `QTE_SUCCESS` / `QTE_FAIL`
- `SECTOR_CLAIM`
- `AI_NARRATION`
- `TRAP_TRIGGERED`

---

## 📖 STORY BIBLE

### Characters
| Name | Role |
|------|------|
| **The Boy** | Protagonist. Quiet, brave. His love for his grandmother drives him. |
| **Grandmother** | Dying from the Watching Blight. The reason. |
| **Village Elder** | Knows the truth but fears to say it fully. Warns the boy. |
| **The Watcher** | The AI guardian. Not evil — testing the boy's worthiness. |

### Story Summary
A boy's grandmother is dying from "The Watching Blight."  
The only cure is **The Heart of Aether 💠** — hidden in a forbidden shrine.  
He sets out through increasingly dangerous biomes.  
The world around him shifts, traps him, adapts to him.  
He thinks it wants to destroy him.

**The Twist:** At Chapter 7, the AI goes silent and reveals:  
*"You were never being hunted. You were being prepared."*  
Only someone the Watcher has shaped can survive the final shrine.

---

## 🗺️ CHAPTER MAP (All Planned)

| # | Chapter Name | Biome | Size | AI Mode | Status |
|---|--------------|-------|------|---------|--------|
| 1 | The Start Forest | Forest Village | 60×70 | Silent | ✅ Done |
| 2 | The Deep Forest | Dense Forest | 50×60 | Observing | 🔲 |
| 3 | Abandoned Village | Ruins + Dead Farm | 50×55 | First traps | 🔲 |
| 4A | Lake of Stillness | Still Lake + Bridges | 45×50 | Precise traps | 🔲 |
| 4B | Ancient Ruins | Stone Maze | 45×50 | Exit blocking | 🔲 |
| 5A | The Marsh | Swamp + Mud | 45×55 | Hesitation punished | 🔲 |
| 5B | Corruption Edge | Dark Blight | 45×55 | Full corruption | 🔲 |
| 6 | Pressure Zone | Narrow Corridors | 40×55 | Chain traps | 🔲 |
| 7 | The Truth | Open Plateau | 45×40 | AI goes **silent** | 🔲 |
| 8 | Blight Core | Full Corruption | 50×60 | Controls terrain | 🔲 |
| 9 | Final Ascent | Mountain + Ice | 40×60 | Full aggression | 🔲 |
| ∞ | The Shrine | Sacred Silence | 30×30 | Silent / end | 🔲 |

### Chapter 4 Split
At the end of Chapter 3, the path **physically splits**.  
- Left fork → **4A (Lake)**
- Right fork → **4B (Ruins)**  
Both converge at **Chapter 6 (Pressure Zone)**.

### Per-Chapter AI Escalation
| Chapter | trapFrequencyMs | attackType |
|---------|----------------|------------|
| 1 | null (off) | none |
| 2 | 12000 | trap |
| 3 | 8000 | trap |
| 4A | 6000 | trap (on bridges) |
| 4B | 7000 | block |
| 5A | 4000 | trap + corruption |
| 5B | 3500 | corruption |
| 6 | 3000 | trap + block + corruption |
| 7 | null | narration only |
| 8 | 2000 | terrain control |
| 9 | 1500 | all (max aggression) |
| Shrine | null | none |

---

## 💬 WATCHER NARRATION SCRIPT (Per Chapter)

| Chapter | Trigger | Line |
|---------|---------|------|
| 1 | None | (Silent) |
| 2 | Loop crossed | *"You walk the same path twice. How... interesting."* |
| 3 | Village entered | *"Others stood where you stand now."* |
| 4A | First bridge | *"Careful steps... or no steps at all."* |
| 4B | First dead end | *"Wrong turn. Again."* |
| 5A | Player slows | *"You hesitate. The ground learns from your pause."* |
| 5B | Corruption spreads | *"Every step you take... I take one back."* |
| 6 | Mid zone | *"I knew you would go left. I placed it there two steps ago."* |
| 7 | Row 21 reached | *"This is not a place. This is a test."* (full reveal) |
| 8 | Entry | *"Welcome home."* |
| 9 | Mid climb | *"This is where most of them stopped. Will you?"* |
| Shrine | SH tile stepped | *"You were never being hunted. You were being prepared."* |

---

## 🚀 DEPLOYMENT CHECKLIST

- [x] Cloudflare Pages project created
- [x] D1 database `the-watching-world-db` created
- [x] SQL schema executed (sessions + actions tables)
- [x] `wrangler.toml` updated with D1 database ID
- [x] `GEMINI_API_KEY` added to Pages environment variables
- [x] D1 `DB` binding added to Pages Functions settings
- [x] `next.config.ts` — build errors ignored during edge compile
- [x] `compatibility_date` = 2026-04-01
- [x] Next.js downgraded to 15.4.11 (Cloudflare compatibility)
- [x] ESLint downgraded to 8.57.1 (plugin compatibility)
- [x] `package-lock.json` regenerated (clean install)
- [ ] First successful production build ← **IN PROGRESS**

---

## 🐛 KNOWN ISSUES / NOTES

- The `require()` in `src/db/index.ts` uses `eslint-disable` comments intentionally — it's an Edge-safe dynamic import pattern.
- `next.config.ts` has `ignoreBuildErrors` set — this is temporary during the ESLint/TypeScript migration phase.
- Tile renderer in `tile_renderer.ts` uses the OLD level1.ts tile IDs. Chapter 1 uses a **new** tile ID system — the renderer needs to be updated to match `chapter1.ts` tile IDs before Chapter 1 renders correctly.
- The `chapter1_start_forest.html` in root is a **visual reference only** — the game does not use it.

---

## 📅 NEXT STEPS (Priority Order)

1. **Update tile renderer** (`tile_renderer.ts`) to draw Chapter 1 tile set (houses, water, waterfall, etc.)
2. **Wire `chapter1Map` into `MapViewport.tsx`** (replace `level1Map` reference)
3. **Test Chapter 1** locally — validate walkability, spawn, exit zone
4. **Add QTE system** (Space bar triggers — already partially in gameStore)
5. **Add chapter transition screen** (simple fade + text)
6. **Design Chapter 2** — once Chapter 1 is tested and approved
