import { NextRequest, NextResponse } from 'next/server';
import { getDb, type Env } from '@/db';
import { actions, sessions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { LOG_ACTION, logActionRequestSchema, logActionResponseSchema } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = logActionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    const { sessionId, actionType, x, y, details } = parsed.data;

    let env: Env;
    try {
      const context = await getCloudflareContext({ async: true });
      env = (context?.env || process.env) as Env;
    } catch {
      env = process.env as Env;
    }
    
    // In local dev without D1, we just return success
    if (!env.DB) {
      console.warn('D1 Database [DB] binding is missing, Skipping log per local development.');
      return NextResponse.json({ success: true, local: true });
    }
    const db = getDb(env);

    // 1. Ensure session exists
    await db.insert(sessions).values({
      id: sessionId,
      startedAt: Date.now(),
      lastActive: Date.now(),
      sectorReached: 1,
      qteSuccessCount: 0,
      qteFailCount: 0
    }).onConflictDoUpdate({
      target: sessions.id,
      set: { lastActive: Date.now() }
    });

    // 2. Log Action
    await db.insert(actions).values({
      id: crypto.randomUUID(),
      sessionId,
      actionType,
      posX: x ?? null,
      posY: y ?? null,
      timestamp: Date.now(),
      details: details ? JSON.stringify(details) : null
    });

    // 3. Update Session Stats if QTE
    if (actionType === LOG_ACTION.QTE_SUCCESS) {
      await db.update(sessions)
        .set({ qteSuccessCount: sql`${sessions.qteSuccessCount} + 1` })
        .where(eq(sessions.id, sessionId));
    } else if (actionType === LOG_ACTION.QTE_FAIL) {
      await db.update(sessions)
        .set({ qteFailCount: sql`${sessions.qteFailCount} + 1` })
        .where(eq(sessions.id, sessionId));
    }

    return NextResponse.json(logActionResponseSchema.parse({ success: true }));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Log Error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
