import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { elapsedSeconds, corruptedCount } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are the "Watcher Base Mind", an intelligent AI Strategist overseeing a real-time pixel art board game.
      The human player has been running for ${elapsedSeconds} seconds.
      Currently active Threats on board: ${corruptedCount}.
      
      Your role is NOT to place traps manually. You control the overall pacing and aggression of the subordinate logic engines.
      
      Decide the global difficulty tuning right now.
      
      Return a STRICT JSON object:
      {
        "trapFrequencyMs": 5000, // How many milliseconds until the next local trap spawns? (1000 = fast, 6000 = slow)
        "attackType": "corruption" | "trap" | "block",
        "reason": "short explanation"
      }
      Rules:
      - As elapsedSeconds grows very large, you should drastically lower trapFrequencyMs to ramp up frequency.
      - Never go below 500ms for trapFrequencyMs.
    `;

    const response = await ai.models.generateContent({
      model: 'gemma-3-27b-it',
      contents: prompt,
      config: {
        temperature: 0.9
      }
    });

    const aiDecisionText = response.text;
    if (!aiDecisionText) {
      throw new Error("No response from AI");
    }

    // Extract JSON from response (bypassing markdown backticks if they exist)
    const jsonMatch = aiDecisionText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON out of AI response string.");
    }
    
    const aiDecision = JSON.parse(jsonMatch[0]) as {
      trapFrequencyMs: number;
      attackType: "corruption" | "trap" | "block";
      reason: string;
    };

    return NextResponse.json(aiDecision);
  } catch (error: unknown) {
    console.error('AI Error:', error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
