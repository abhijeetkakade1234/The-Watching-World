# Database Architecture (D1) - Milestone Save Model

## Overview
- Database: Cloudflare D1 (SQLite)
- Auth identity source: Firebase Auth (`players.id` = Firebase UID)
- Save strategy: Milestone-based only (no autosave, no session table)
- Resume behavior: Player loads at last saved milestone position for that chapter

## Active Tables

```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,                  -- Firebase UID
  email TEXT,
  display_name TEXT,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL
);

CREATE TABLE chapter_progress (
  id TEXT PRIMARY KEY,                  -- UUID
  player_id TEXT NOT NULL,
  chapter_id INTEGER NOT NULL,
  last_milestone_key TEXT NOT NULL,     -- Example: CH2_BRIDGE_GATE
  map_id TEXT NOT NULL,
  pos_x REAL NOT NULL,
  pos_y REAL NOT NULL,
  state_json TEXT,                      -- Optional compact chapter state
  status TEXT NOT NULL DEFAULT 'in_progress',
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id),
  UNIQUE (player_id, chapter_id)
);

CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  item_key TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id),
  UNIQUE (player_id, item_key)
);

CREATE INDEX idx_chapter_progress_player_updated
  ON chapter_progress(player_id, updated_at);

CREATE INDEX idx_inventory_player_updated
  ON inventory_items(player_id, updated_at);
```

## Demo Data

```sql
INSERT INTO players (id, email, display_name, created_at, last_login_at) VALUES
('uid_9f2a11', 'leo.player@gmail.com', 'Leo', 1775750400000, 1775836800000);

INSERT INTO chapter_progress (
  id, player_id, chapter_id, last_milestone_key, map_id, pos_x, pos_y, state_json, status, updated_at
) VALUES
('cp_001', 'uid_9f2a11', 1, 'CH1_VILLAGE_GATE', 'village_chapter', 19, 16,
 '{"elder_talked":true,"finn_helped":true,"bridge_unlocked":false}', 'in_progress', 1775836800000),
('cp_002', 'uid_9f2a11', 2, 'CH2_DEEP_FOREST_ENTRY', 'chapter2_forest', 7, 42,
 '{"trap_tutorial_done":true,"watcher_warning_seen":true}', 'in_progress', 1775923200000);

INSERT INTO inventory_items (
  id, player_id, item_key, qty, metadata_json, updated_at
) VALUES
('inv_001', 'uid_9f2a11', 'healing_herb', 3, '{"rarity":"common"}', 1775836800000),
('inv_002', 'uid_9f2a11', 'old_locket', 1, '{"quest_item":true}', 1775836800000);
```

## Old Table Cleanup

Run this only after deploying code that no longer depends on old telemetry/session tables.

```sql
DROP TABLE IF EXISTS actions;
DROP TABLE IF EXISTS sessions;
```

## Notes
- `chapter_progress` is the single source for chapter-level save location and milestone.
- `inventory_items` is intentionally minimal until item economy is finalized.
- `wander_claims` is deferred for later blockchain phase.
