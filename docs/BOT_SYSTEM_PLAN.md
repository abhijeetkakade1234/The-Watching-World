# Bot System Plan (Global Across All Chapters)

## Locked Decisions
- All new bots are prototyped and validated first in `/playground`.
- A bot is added to live chapter maps only after playground behavior is approved.
- Bots must be chapter-agnostic by default so they can run in any map/chapter.

## Development Workflow
1. Build bot logic in `src/ai/bots/*`.
2. Wire and test in `src/app/playground/page.tsx`.
3. Validate behavior using strategist modes + feedback logs.
4. Promote to live runtime adapter (chapter integration layer) after approval.

## Global Bot Architecture (Target)
- `src/ai/bots/`: pure bot evaluators (`TrapBot`, `CorruptionBot`, future bots).
- `src/ai/registry/`: single registry of all bots and capability metadata.
- `src/ai/strategist/`: chooses active bot set and per-bot plan.
- `src/ai/runtime/`: executes bot decisions against current chapter/map state.
- `src/ai/contracts/`: shared types used by all chapters/maps.

This keeps bots reusable across Chapter 1..9 without rewriting logic per chapter.

## Where Bot Data Will Be Stored

### Runtime (in memory)
- Active bot plans, cooldowns, and temporary hazard tiles.
- Lives in client/runtime state during session.

### Persistent (D1, to add later)
- `bot_configs`: default bot settings and tunables.
- `chapter_bot_overrides`: chapter-specific constraints/allowlists.
- `bot_feedback_events`: compact outcomes sent back to strategist.
- `bot_runs`: periodic strategist decisions and selected bot mix.

## Promotion Rules (Playground -> Live)
- Bot has visible, testable behavior in playground.
- Bot has cooldown/safety guards.
- Bot supports fallback when strategist/API fails.
- Bot reads shared contracts only (no chapter-hardcoded logic inside core bot file).

## Notes
- Current playground is the official testbed for bot experiments.
- Future request: after this document, next step is to scaffold `registry`, `strategist`, and `runtime` folders with base interfaces.
