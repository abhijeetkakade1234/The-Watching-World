import { z } from 'zod';

export const AI_ATTACK_TYPES = ['none', 'trap', 'corruption', 'block'] as const;
export const LOG_ACTION_TYPES = [
  'QTE_SUCCESS',
  'QTE_FAIL',
  'SECTOR_CLAIM',
  'AI_NARRATION',
  'TRAP_SPAWN',
] as const;
export const LOG_ACTION = {
  QTE_SUCCESS: 'QTE_SUCCESS',
  QTE_FAIL: 'QTE_FAIL',
  SECTOR_CLAIM: 'SECTOR_CLAIM',
  AI_NARRATION: 'AI_NARRATION',
  TRAP_SPAWN: 'TRAP_SPAWN',
} as const;

const sessionIdSchema = z.string().min(1).max(128);
const coordinateSchema = z.number().finite().min(-10000).max(10000);

export const aiActionRequestSchema = z
  .object({
    sessionId: sessionIdSchema,
    playerX: coordinateSchema,
    playerY: coordinateSchema,
    playerEnergy: z.number().finite().min(0).max(300).optional(),
    playerHunger: z.number().finite().min(0).max(100).optional(),
    currentMap: z.string().min(1).max(64).optional(),
  })
  .passthrough();

export const aiActionDecisionSchema = z
  .object({
    narration: z.string().min(1).max(400),
    trapFrequencyMs: z.number().int().min(1000).max(60000),
    attackType: z.enum(AI_ATTACK_TYPES),
  })
  .strict();

export const logActionTypeSchema = z.union([
  z.enum(LOG_ACTION_TYPES),
  z.string().min(1).max(64),
]);

export const logActionRequestSchema = z
  .object({
    sessionId: sessionIdSchema,
    actionType: logActionTypeSchema,
    x: coordinateSchema.nullable().optional(),
    y: coordinateSchema.nullable().optional(),
    details: z.unknown().optional(),
  })
  .passthrough();

export const logActionResponseSchema = z
  .object({
    success: z.literal(true),
    local: z.literal(true).optional(),
  })
  .strict();

export type AiActionRequest = z.infer<typeof aiActionRequestSchema>;
export type AiActionDecision = z.infer<typeof aiActionDecisionSchema>;
export type LogActionRequest = z.infer<typeof logActionRequestSchema>;
