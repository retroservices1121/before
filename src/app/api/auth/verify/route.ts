import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthCode, createSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { db, initDb } from '@/lib/db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, ref } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400, headers: CORS_HEADERS });
    }

    const session = await verifyAuthCode(email.trim().toLowerCase(), code.trim(), ref);

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401, headers: CORS_HEADERS });
    }

    const token = await createSessionToken(session);

    // Fetch API key for extension/client use
    await initDb();
    const userResult = await db.execute({
      sql: 'SELECT api_key FROM users WHERE id = ?',
      args: [session.userId],
    });
    const apiKey = userResult.rows[0]?.api_key as string | undefined;

    const response = NextResponse.json(
      { user: { email: session.email, tier: session.tier }, apiKey },
      { headers: CORS_HEADERS }
    );

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500, headers: CORS_HEADERS });
  }
}
