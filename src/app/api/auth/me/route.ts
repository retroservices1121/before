import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db, initDb } from '@/lib/db';
import { getTierLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  await initDb();

  // Get API key and usage
  const userResult = await db.execute({
    sql: 'SELECT api_key FROM users WHERE id = ?',
    args: [session.userId],
  });

  const today = new Date().toISOString().slice(0, 10);
  const usageResult = await db.execute({
    sql: 'SELECT count FROM usage WHERE user_id = ? AND used_date = ?',
    args: [session.userId, today],
  });

  const apiKey = userResult.rows[0]?.api_key as string | undefined;
  const usedToday = usageResult.rows.length > 0 ? (usageResult.rows[0].count as number) : 0;

  const limit = getTierLimit(session.tier);

  return NextResponse.json({
    user: {
      email: session.email,
      tier: session.tier,
      apiKey,
      usage: {
        today: usedToday,
        limit,
      },
    },
  });
}
