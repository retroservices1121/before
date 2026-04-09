import { db, initDb } from './db';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

// Beta mode: all users get 2 briefs/day free. Set B4E_BETA=false in env to enable paid tiers.
export const BETA_MODE = process.env.B4E_BETA !== 'false';

const TIER_LIMITS: Record<string, number> = BETA_MODE
  ? { anon: 2, lite: 2, pro: 2 }
  : { anon: 2, lite: 5, pro: Infinity };

export function getTierLimit(tier: string): number | null {
  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.anon;
  return limit === Infinity ? null : limit;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkRateLimit(
  userId: string,
  tier: string
): Promise<RateLimitResult> {
  // Admin bypass — unlimited briefs for testing
  if (tier === 'admin') {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.anon;

  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  await initDb();

  const today = todayUTC();
  const result = await db.execute({
    sql: 'SELECT count FROM usage WHERE user_id = ? AND used_date = ?',
    args: [userId, today],
  });

  const count = result.rows.length > 0 ? (result.rows[0].count as number) : 0;
  const remaining = Math.max(0, limit - count);

  return {
    allowed: count < limit,
    remaining,
    limit,
  };
}

export async function recordUsage(userId: string): Promise<void> {
  await initDb();

  const today = todayUTC();
  await db.execute({
    sql: `INSERT INTO usage (user_id, used_date, count)
          VALUES (?, ?, 1)
          ON CONFLICT (user_id, used_date)
          DO UPDATE SET count = count + 1`,
    args: [userId, today],
  });
}
