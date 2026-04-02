import { NextRequest, NextResponse } from 'next/server';
import { getMarket } from '@/lib/spredd';
import { generateContextBrief } from '@/lib/ai';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug parameter' },
      { status: 400 }
    );
  }

  const market = await getMarket(slug);

  if (!market) {
    return NextResponse.json(
      { error: 'Market not found' },
      { status: 404 }
    );
  }

  const brief = await generateContextBrief(market);

  return NextResponse.json(brief, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
