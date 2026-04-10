# The Watching World: 9-Chapter Architecture Plan (v1)

## Summary
Build a modular monolith on Cloudflare with Firebase Google Auth for identity and D1 as the source of truth for gameplay data through Chapter 9.
Keep crypto/economy in a deferred domain (Phase 3+) with stable interfaces now, but no on-chain dependency in core gameplay.

## Implementation Changes
1. Domain architecture (inside current Next.js app)
- Define backend modules: `auth`, `player`, `progression`, `telemetry`, `content`, `ai`, `economy_stub`.
- Keep one deployable worker/app; enforce boundaries by module-level services/repositories.
- Introduce a shared `domain/events` contract for gameplay actions (chapter start, checkpoint reached, item obtained, dialogue milestone).

2. Auth and identity
- Add Firebase Auth (Google sign-in) on client.
- Add server-side Firebase ID token verification (edge-safe) and derive `playerId` from token `sub`.
- Store only minimal auth mirror in D1 (`players` table: id, email hash/optional metadata, createdAt, lastLoginAt).

3. Data model (D1 + Drizzle)
- Keep existing `sessions` and `actions`; add normalized progression tables:
- `player_profiles` (playerId, displayName, settings, activeSlot).
- `save_slots` (id, playerId, chapter, mapId, posX, posY, statsJson, updatedAt, version).
- `chapter_progress` (playerId, chapterId, objectiveStateJson, completionFlags, updatedAt).
- `inventory_items` (playerId, itemId, qty, sourceChapter, metadataJson).
- `narrative_flags` (playerId, flagKey, flagValue, updatedAt).
- Add indices on `(playerId, updatedAt)` and `(playerId, chapterId)` for fast resume.
- Version save payloads (`version`) for future chapter schema changes.

4. API/interface contracts
- `POST /api/auth/session`: validate Firebase token, upsert player, return app session context.
- `GET /api/game/bootstrap`: fetch profile + active slot + chapter content metadata.
- `POST /api/game/save`: atomic write for position/progression/inventory delta.
- `POST /api/game/event`: append telemetry/domain event (replaces ad-hoc event writes over time).
- Keep `POST /api/ai-action` but pass `playerId`, `chapterId`, and recent domain events summary.
- Define strict Zod DTOs per endpoint and version them when changed.

5. Frontend state and rendering architecture
- Split Zustand into slices by concern: `ui`, `runtime`, `progression`, `inventory`, `narrative`.
- Move to selector-based subscriptions everywhere (avoid `useGameStore()` full-store subscriptions).
- Add derived selector memoization (`proxy-memoize`) for expensive map/entity derivations.
- Keep Canvas path for now; design render adapter so Chapter 4+ can swap to `pixi.js` + `@pixi/react` without gameplay logic rewrite.
- Keep server state (save/bootstrap/profile) out of Zustand internals; use request cache layer (`@tanstack/react-query`) for network data.

6. Crypto/economy future-proofing (Phase 3+)
- Create `economy_stub` interfaces now:
- `grantWanderReward(playerId, rewardId)` returns off-chain inventory update.
- `prepareMintableAsset(playerId, itemId)` returns placeholder payload.
- No wallet/on-chain writes in core loop until Phase 3.
- Later AVAX integration plugs into this boundary (contract adapter module), preserving gameplay APIs.

## Test Plan
1. Auth
- Google login creates/updates player record and allows resume across devices.
- Invalid/expired Firebase token is rejected on protected APIs.

2. Progression and saves
- Save/load restores exact chapter/map/position/objective flags.
- Migration test: old save payload version upgrades without data loss.

3. State/render performance
- Regression test that HUD/overlay components do not re-render on unrelated movement ticks.
- Stress run for long chapter session confirms stable frame pacing and no runaway store updates.

4. Telemetry and AI
- `game/event` writes ordered event history.
- `ai-action` still responds when telemetry volume grows; fallback path works if AI provider fails.

5. Security and integrity
- Player can only read/write own save slots.
- Server recomputes critical progression transitions (no trust in client-only chapter advancement).

## Assumptions and Defaults
- Locked choices: Google via Firebase Auth, D1 primary, single-player only, modular monolith.
- Economy/crypto detail is intentionally deferred; default future model is off-chain-first with optional on-chain settlement.
- Existing Cloudflare + OpenNext deployment remains the platform baseline.
- Chapters 1-3 harden core systems first; Chapters 4-9 reuse the same progression/content contracts without backend redesign.
