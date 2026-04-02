import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'waitlist.json');

async function readWaitlist(): Promise<{ emails: { email: string; joinedAt: string }[] }> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { emails: [] };
  }
}

async function writeWaitlist(data: { emails: { email: string; joinedAt: string }[] }) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const waitlist = await readWaitlist();

    if (waitlist.emails.some((e) => e.email === normalized)) {
      return NextResponse.json({ message: 'Already on the waitlist' }, { status: 200 });
    }

    waitlist.emails.push({ email: normalized, joinedAt: new Date().toISOString() });
    await writeWaitlist(waitlist);

    console.log(`[Waitlist] New signup: ${normalized} (total: ${waitlist.emails.length})`);

    return NextResponse.json({ message: 'Added to waitlist', count: waitlist.emails.length });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const waitlist = await readWaitlist();
  return NextResponse.json(waitlist);
}
