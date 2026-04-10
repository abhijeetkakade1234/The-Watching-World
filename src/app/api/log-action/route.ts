import { NextRequest, NextResponse } from 'next/server';
import { LOG_ACTION, logActionRequestSchema, logActionResponseSchema } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = logActionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    const { sessionId, actionType, x, y, details } = parsed.data;

    // Compatibility endpoint: accepted while progression APIs are being migrated
    // to milestone-based writes on chapter boundaries.
    void sessionId;
    void actionType;
    void x;
    void y;
    void details;
    void LOG_ACTION;

    return NextResponse.json(logActionResponseSchema.parse({ success: true }));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Log Error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
