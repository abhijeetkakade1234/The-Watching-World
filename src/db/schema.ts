import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  startedAt: integer('started_at').notNull(),
  lastActive: integer('last_active').notNull(),
  sectorReached: integer('sector_reached').default(1),
  qteSuccessCount: integer('qte_success_count').default(0),
  qteFailCount: integer('qte_fail_count').default(0),
});

export const actions = sqliteTable('actions', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  actionType: text('action_type').notNull(), // 'QTE_SUCCESS', 'QTE_FAIL', 'SECTOR_CLAIM', 'AI_NARration', 'TRAP_SPAWN'
  posX: real('pos_x'),
  posY: real('pos_y'),
  timestamp: integer('timestamp').notNull(),
  details: text('details'), // JSON string with narration content or AI reason
});
