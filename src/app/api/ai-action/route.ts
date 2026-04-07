import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getDb, type Env } from '@/db';
import { actions, sessions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  aiActionDecisionSchema,
  aiActionRequestSchema,
  type AiActionDecision,
} from '@/types/api';

const FALLBACK_AI_DECISION: AiActionDecision = {
  narration: 'The Watcher waits in the silence.',
  trapFrequencyMs: 5000,
  attackType: 'none',
};

export async function POST(req: NextRequest) {
  try {
    let env: Env;
    try {
      const context = await getCloudflareContext({ async: true });
      env = (context?.env || process.env) as Env;
    } catch {
      env = process.env as Env;
    }
    
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      // In local dev, we might not have a database log, but we still want the AI to talk!
      console.warn('Gemini API Key missing in environment, using mock narrator.');
    }

    const body = await req.json();
    const parsed = aiActionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    const { sessionId, playerX, playerY, playerEnergy, playerHunger, currentMap } = parsed.data;

    let historySummary = 'Game just started.';
    let qteSuccess = 0;
    let qteFail = 0;

    // Only try to access DB if we have a real DB binding (Cloudflare production or local wrangler)
    if (env.DB) {
      try {
        const db = getDb(env);
        const historyLogs = await db.select()
          .from(actions)
          .where(eq(actions.sessionId, sessionId))
          .orderBy(desc(actions.timestamp))
          .limit(12);

        historySummary = (historyLogs as (typeof actions.$inferSelect)[]).reverse().map(log => {
          return `${log.actionType} at (${log.posX}, ${log.posY})`;
        }).join('\n');

        const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
        qteSuccess = session?.qteSuccessCount || 0;
        qteFail = session?.qteFailCount || 0;
      } catch (e) {
        console.error('Database access failed, falling back to mock history.', e);
      }
    }

    let sector = 1;
    let unlockedPowers = 'Basic Traps';
    if (playerX > 40) { sector = 2; unlockedPowers = 'Basic Traps + Corruption'; }
    if (playerX > 80) { sector = 3; unlockedPowers = 'Traps + Corruption + Terrain Blocking'; }

    const isExploration = currentMap === 'village_chapter' || currentMap?.startsWith('house-');
    if (!apiKey) {
      return NextResponse.json(FALLBACK_AI_DECISION);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemPrompt = `
      You are the "Watcher Base Mind", speaking from the shadows.
      
      CURRENT STATE:
      - Map: ${currentMap}.
      - Mode: ${isExploration ? 'EXPLORATION (ATTACKS DISABLED)' : 'SURVIVAL (ACTIVE ATTACK)'}.
      - Player Location: (${playerX}, ${playerY}).
      - Player Stats: Energy=${playerEnergy ?? 'unknown'}, Hunger=${playerHunger ?? 'unknown'}.
      - Session Stats: QTE Success=${qteSuccess}, QTE Fail=${qteFail}.
      - Sector Estimate: ${sector}.
      - Unlocked Powers: ${unlockedPowers}.
      - History: ${historySummary || 'Game just started.'}
      
      YOUR GOAL:
      1. Narrate the player's struggle in a creepy, "Final Boss" voice.
      2. ${isExploration ? 'DO NOT attack. Set attackType to "none".' : 'Attack to slow them down.'}
      
      RESPONSE FORMAT (JSON):
      {
        "narration": "Creepy one-liner...",
        "trapFrequencyMs": 5000,
        "attackType": "none" | "trap" | "corruption" | "block"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemma-3-27b-it',
        contents: systemPrompt,
        config: { temperature: 0.8, responseMimeType: 'application/json' }
      });

      const resText = response.text || '{}';
      const parsedDecision = JSON.parse(resText);

      const validatedDecision = aiActionDecisionSchema.safeParse(parsedDecision);
      if (!validatedDecision.success) {
        return NextResponse.json(FALLBACK_AI_DECISION);
      }

      return NextResponse.json(validatedDecision.data);
    } catch (aiErr: unknown) {
      console.error('AI generation failed, using fallback response.', aiErr);
      return NextResponse.json(FALLBACK_AI_DECISION);
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('AI Error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
