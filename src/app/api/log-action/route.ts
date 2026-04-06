import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { actions, sessions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const context = getRequestContext();
    const env = context.env as any;
    
    if (!env.DB && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'D1 Database [DB] binding is missing' }, { status: 500 });
    }

    const { sessionId, actionType, x, y, details } = await req.json();
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
      posX: x,
      posY: y,
      timestamp: Date.now(),
      details: details ? JSON.stringify(details) : null
    });

    // 3. Update Session Stats if QTE
    if (actionType === 'QTE_SUCCESS') {
      await db.update(sessions)
        .set({ qteSuccessCount: sql`${sessions.qteSuccessCount} + 1` })
        .where(eq(sessions.id, sessionId));
    } else if (actionType === 'QTE_FAIL') {
      await db.update(sessions)
        .set({ qteFailCount: sql`${sessions.qteFailCount} + 1` })
        .where(eq(sessions.id, sessionId));
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Log Error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
