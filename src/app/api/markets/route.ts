import { NextResponse } from 'next/server';
import { getTrendingMarkets } from '@/lib/spredd';

export async function GET() {
  const markets = await getTrendingMarkets();

  return NextResponse.json(
    { markets, count: markets.length },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
