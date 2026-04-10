import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const players = sqliteTable('players', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email'),
  displayName: text('display_name'),
  createdAt: integer('created_at').notNull(),
  lastLoginAt: integer('last_login_at').notNull(),
});

export const chapterProgress = sqliteTable(
  'chapter_progress',
  {
    id: text('id').primaryKey(),
    playerId: text('player_id').notNull().references(() => players.id),
    chapterId: integer('chapter_id').notNull(),
    lastMilestoneKey: text('last_milestone_key').notNull(),
    mapId: text('map_id').notNull(),
    posX: real('pos_x').notNull(),
    posY: real('pos_y').notNull(),
    stateJson: text('state_json'),
    status: text('status').notNull().default('in_progress'),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    uniqPlayerChapter: uniqueIndex('ux_chapter_progress_player_chapter').on(table.playerId, table.chapterId),
    idxPlayerUpdated: index('idx_chapter_progress_player_updated').on(table.playerId, table.updatedAt),
  })
);

export const inventoryItems = sqliteTable(
  'inventory_items',
  {
    id: text('id').primaryKey(),
    playerId: text('player_id').notNull().references(() => players.id),
    itemKey: text('item_key').notNull(),
    qty: integer('qty').notNull().default(0),
    metadataJson: text('metadata_json'),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    uniqPlayerItem: uniqueIndex('ux_inventory_player_item').on(table.playerId, table.itemKey),
    idxPlayerUpdated: index('idx_inventory_player_updated').on(table.playerId, table.updatedAt),
  })
);
