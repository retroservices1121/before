import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import { Resend } from 'resend';
import { db, initDb } from './db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
const SESSION_COOKIE = 'b4e_session';
const JWT_EXPIRY = '30d';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'dummy');
  return _resend;
}

export interface AuthSession {
  userId: string;
  email: string;
  tier: 'lite' | 'pro';
}

// --- Magic link codes ---

export async function sendAuthCode(email: string): Promise<void> {
  await initDb();

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Clear old codes for this email
  await db.execute({
    sql: 'DELETE FROM auth_codes WHERE email = ?',
    args: [email],
  });

  await db.execute({
    sql: 'INSERT INTO auth_codes (email, code, expires_at) VALUES (?, ?, ?)',
    args: [email, code, expiresAt],
  });

  if (process.env.RESEND_API_KEY) {
    await getResend().emails.send({
      from: 'before <noreply@updates.b4e.dev>',
      to: email,
      subject: `${code} is your before login code`,
      html: `
        <div style="font-family: monospace; background: #0a0a0a; color: #e5e5e5; padding: 40px; border-radius: 8px;">
          <p style="color: #00e59f; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">before</p>
          <p style="margin-bottom: 24px;">Your login code:</p>
          <p style="font-size: 32px; font-weight: bold; color: #00e59f; letter-spacing: 8px; margin-bottom: 24px;">${code}</p>
          <p style="color: #525252; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });
  } else {
    console.log(`[Auth] Code for ${email}: ${code}`);
  }
}

export async function verifyAuthCode(
  email: string,
  code: string,
  refPlatform?: string
): Promise<AuthSession | null> {
  await initDb();

  const result = await db.execute({
    sql: 'SELECT * FROM auth_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime(\'now\')',
    args: [email, code],
  });

  if (result.rows.length === 0) return null;

  // Mark code as used
  await db.execute({
    sql: 'UPDATE auth_codes SET used = 1 WHERE email = ? AND code = ?',
    args: [email, code],
  });

  // Get or create user
  let user = await db.execute({
    sql: 'SELECT id, email, tier FROM users WHERE email = ?',
    args: [email],
  });

  if (user.rows.length === 0) {
    const id = nanoid();
    const apiKey = `bk_${nanoid(32)}`;
    await db.execute({
      sql: 'INSERT INTO users (id, email, api_key, tier, ref_platform) VALUES (?, ?, ?, \'lite\', ?)',
      args: [id, email, apiKey, refPlatform || null],
    });
    return { userId: id, email, tier: 'lite' };
  }

  const row = user.rows[0];
  return {
    userId: row.id as string,
    email: row.email as string,
    tier: (row.tier as 'lite' | 'pro') || 'lite',
  };
}

// --- JWT sessions ---

export async function createSessionToken(session: AuthSession): Promise<string> {
  return new SignJWT({ sub: session.userId, email: session.email, tier: session.tier })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function getSession(request: NextRequest): Promise<AuthSession | null> {
  // Admin key bypass for testing
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.B4E_ADMIN_KEY;
  if (adminKey && authHeader === `Bearer ${adminKey}`) {
    return { userId: 'admin', email: 'admin', tier: 'admin' as any };
  }

  // Try API key first (for extension)
  if (authHeader?.startsWith('Bearer bk_')) {
    const apiKey = authHeader.slice(7);
    return getUserByApiKey(apiKey);
  }

  // Try session cookie
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      tier: (payload.tier as 'lite' | 'pro') || 'lite',
    };
  } catch {
    return null;
  }
}

async function getUserByApiKey(apiKey: string): Promise<AuthSession | null> {
  await initDb();

  const result = await db.execute({
    sql: 'SELECT id, email, tier FROM users WHERE api_key = ?',
    args: [apiKey],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    userId: row.id as string,
    email: row.email as string,
    tier: (row.tier as 'lite' | 'pro') || 'lite',
  };
}

export { SESSION_COOKIE };
