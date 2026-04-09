import { NextRequest, NextResponse } from 'next/server';
import { sendAuthCode } from '@/lib/auth';

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
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400, headers: CORS_HEADERS });
    }

    await sendAuthCode(email.trim().toLowerCase());

    return NextResponse.json({ message: 'Code sent' }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500, headers: CORS_HEADERS });
  }
}
