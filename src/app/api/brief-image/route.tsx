import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get('title') || 'Market';
  const summary = params.get('summary') || '';
  const factors = params.get('factors') || '[]';
  const probability = params.get('probability') || '';
  const platform = params.get('platform') || '';
  const volume = params.get('volume') || '';
  const outcomes = params.get('outcomes') || '';

  let factorList: { name: string; sentiment: string }[] = [];
  try {
    factorList = JSON.parse(factors);
  } catch {}

  // Parse outcomes for multi-market events
  let outcomeList: { name: string; prob: string }[] = [];
  if (outcomes) {
    try {
      const parsed = JSON.parse(outcomes);
      outcomeList = Object.entries(parsed)
        .map(([name, prob]) => ({ name, prob: `${((prob as number) * 100).toFixed(0)}%` }))
        .sort((a, b) => parseFloat(b.prob) - parseFloat(a.prob))
        .slice(0, 4);
    } catch {}
  }

  const sentimentColor = (s: string) => {
    if (s === 'bullish') return '#00e59f';
    if (s === 'bearish') return '#ff6b6b';
    if (s === 'neutral') return '#f59e0b';
    return '#525252';
  };

  const sentimentArrow = (s: string) => {
    if (s === 'bullish') return '▲';
    if (s === 'bearish') return '▼';
    return '●';
  };

  const platformLabel = (p: string) => {
    if (p === 'polymarket') return 'Polymarket';
    if (p === 'limitless') return 'Limitless';
    if (p === 'kalshi') return 'Kalshi';
    return p;
  };

  const platformColor = (p: string) => {
    if (p === 'polymarket') return '#3b82f6';
    if (p === 'limitless') return '#a855f7';
    if (p === 'kalshi') return '#f59e0b';
    return '#00e59f';
  };

  const isMultiOutcome = outcomeList.length > 0;
  const hasBriefData = summary || factorList.length > 0;

  // Read the background image as base64 from the public directory
  let bgSrc = '';
  try {
    const imgPath = join(process.cwd(), 'public', 'og.png');
    const buf = readFileSync(imgPath);
    bgSrc = `data:image/png;base64,${buf.toString('base64')}`;
  } catch (e) {
    console.error('Failed to read og.png:', e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Background image */}
        <img
          src={bgSrc}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/* Content overlay */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            top: '85px',
            left: '40px',
            right: '40px',
            bottom: '65px',
          }}
        >
          {/* Market title */}
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#e5e5e5',
              lineHeight: 1.3,
              marginBottom: '12px',
            }}
          >
            {title.length > 80 ? title.slice(0, 77) + '...' : title}
          </div>

          {/* Platform badge + probability + volume row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            {platform && (
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase' as const,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '4px',
                  color: platformColor(platform),
                  backgroundColor: `${platformColor(platform)}20`,
                }}
              >
                {platformLabel(platform)}
              </span>
            )}
            {probability && !isMultiOutcome && (
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#00e59f' }}>
                {probability}
              </span>
            )}
            {volume && (
              <span style={{ fontSize: '13px', color: '#525252' }}>
                Vol: {volume}
              </span>
            )}
          </div>

          {/* Multi-outcome grid OR probability bar */}
          {isMultiOutcome ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {outcomeList.map((o, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#1e1e1e',
                    border: i === 0 ? '1px solid #00e59f40' : '1px solid #1e1e1e',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 700, color: i === 0 ? '#00e59f' : '#e5e5e5' }}>
                    {o.prob}
                  </span>
                  <span style={{ fontSize: '11px', color: '#a3a3a3', maxWidth: '160px' }}>
                    {o.name.length > 35 ? o.name.slice(0, 32) + '...' : o.name}
                  </span>
                </div>
              ))}
            </div>
          ) : probability ? (
            <div style={{ display: 'flex', marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: probability,
                    height: '100%',
                    backgroundColor: '#00e59f',
                    borderRadius: '3px',
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* Summary (truncated) */}
          {summary && (
            <div
              style={{
                fontSize: '13px',
                lineHeight: 1.6,
                color: '#a3a3a3',
                marginBottom: '14px',
              }}
            >
              {summary.length > 200 ? summary.slice(0, 197) + '...' : summary}
            </div>
          )}

          {/* Key factors row */}
          {factorList.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: 'auto' }}>
              {factorList.slice(0, 4).map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ fontSize: '11px', color: sentimentColor(f.sentiment) }}>
                    {sentimentArrow(f.sentiment)}
                  </span>
                  <span style={{ fontSize: '11px', color: '#a3a3a3' }}>
                    {f.name.length > 25 ? f.name.slice(0, 22) + '...' : f.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 960,
      height: 540,
    }
  );
}
