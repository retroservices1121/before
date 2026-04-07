import { NextRequest, NextResponse } from 'next/server';
import { getMarket } from '@/lib/spredd';
import { generateContextBrief } from '@/lib/ai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug parameter' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const market = await getMarket(slug);

  if (!market) {
    return NextResponse.json(
      { error: 'Market not found' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const brief = await generateContextBrief(market);

  return NextResponse.json(brief, {
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
