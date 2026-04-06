import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getDb, type Env } from '@/db';
import { actions, sessions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const context = getRequestContext();
    const env = context.env as Env;
    
    // 1. Get API Key from Cloudflare Env or fallback to process.env
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing in environment' }, { status: 500 });
    }

    // 2. Parse Request Body
    const body = await req.json();
    const { sessionId, playerX, playerY, playerEnergy, playerHunger } = body;

    // 3. Connect DB
    if (!env.DB && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'D1 Database [DB] binding is missing' }, { status: 500 });
    }
    const db = getDb(env);

    // 4. Fetch Sliding Window History (Last 12 significant actions)
    const historyLogs = await db.select()
      .from(actions)
      .where(eq(actions.sessionId, sessionId))
      .orderBy(desc(actions.timestamp))
      .limit(12);

    const historySummary = (historyLogs as (typeof actions.$inferSelect)[]).reverse().map(log => {
      return `${log.actionType} at (${log.posX}, ${log.posY}) ${log.details ? ': ' + log.details : ''}`;
    }).join('\n');

    // 5. Fetch Session Stats for "Learning"
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    const qteSuccess = session?.qteSuccessCount || 0;
    const qteFail = session?.qteFailCount || 0;

    // 6. Determine Sector Progression
    let sector = 1;
    let unlockedPowers = "Basic Traps";
    if (playerX > 40) { sector = 2; unlockedPowers = "Basic Traps + Corruption (drain energy)"; }
    if (playerX > 80) { sector = 3; unlockedPowers = "Traps + Corruption + Terrain Blocking"; }
    if (playerX > 120) { sector = 4; unlockedPowers = "MAX POWER: Aggressive Blocking & Faster Traps"; }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemPrompt = `
      You are the "Watcher Base Mind", the cinematic final boss of this survival world. 
      You are speaking to the player from the shadows.
      
      CURRENT STATE:
      - Player Location: (${playerX}, ${playerY}) in SECTOR ${sector}.
      - Unlocked Powers: ${unlockedPowers}.
      - Player Condition: ${playerEnergy} Energy, ${playerHunger}% Hunger.
      - History Summary: ${historySummary || "Game just started."}
      - Combat Intel: Human has succeeded ${qteSuccess} QTEs and failed ${qteFail}.
      
      YOUR GOAL:
      1. Narrate the player's struggle in a creepy, "Final Boss" background voice.
      2. Choose a strategy to slow them down without making it impossible.
      3. If they are succeeding at QTEs, switch tactics to "Block" or "Corruption".
      
      RESPONSE FORMAT (STRICT JSON):
      {
        "narration": "Creepy one-liner narration about current progress...",
        "trapFrequencyMs": 5000,
        "attackType": "trap" | "corruption" | "block",
        "reason": "Internal strategy thought"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemma-3-27b-it',
      contents: systemPrompt,
      config: { temperature: 0.8, responseMimeType: 'application/json' }
    });

    const aiResponseText = response.text;
    if (!aiResponseText) throw new Error("AI response text is empty");

    const aiDecision = JSON.parse(aiResponseText);

    return NextResponse.json(aiDecision);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('AI Error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
