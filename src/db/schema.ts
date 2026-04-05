import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  startedAt: integer('started_at').notNull(),
  lastActive: integer('last_active').notNull(),
});

export const actions = sqliteTable('actions', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  actionType: text('action_type').notNull(), // 'move', 'ability', 'ai_trap'
  posX: real('pos_x'),
  posZ: real('pos_z'),
  timestamp: integer('timestamp').notNull(),
  details: text('details'), // JSON string
});
