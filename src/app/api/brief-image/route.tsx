import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get('title') || 'Market';
  const summary = params.get('summary') || '';
  const factors = params.get('factors') || '[]';
  const baseRate = params.get('baseRate') || '';
  const catalysts = params.get('catalysts') || '[]';
  const probability = params.get('probability') || '';
  const platform = params.get('platform') || '';

  let factorList: { name: string; sentiment: string; detail?: string }[] = [];
  let catalystList: string[] = [];

  try {
    factorList = JSON.parse(factors);
  } catch {}
  try {
    catalystList = JSON.parse(catalysts);
  } catch {}

  const sentimentColor = (s: string) => {
    if (s === 'bullish') return '#00e59f';
    if (s === 'bearish') return '#ff6b6b';
    if (s === 'neutral') return '#f59e0b';
    return '#525252';
  };

  const platformColor = (p: string) => {
    if (p === 'polymarket') return '#3b82f6';
    if (p === 'limitless') return '#a855f7';
    if (p === 'kalshi') return '#f59e0b';
    return '#00e59f';
  };

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a',
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00e59f',
              boxShadow: '0 0 8px rgba(0,229,159,0.6)',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              letterSpacing: '3px',
              textTransform: 'uppercase' as const,
              color: '#00e59f',
            }}
          >
            before Intelligence Brief
          </span>
        </div>

        {/* Platform + Probability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          {platform && (
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase' as const,
                padding: '3px 10px',
                borderRadius: '4px',
                color: platformColor(platform),
                backgroundColor: `${platformColor(platform)}20`,
              }}
            >
              {platform}
            </span>
          )}
          {probability && (
            <span
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#00e59f',
              }}
            >
              {probability}
            </span>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: 600,
            color: '#e5e5e5',
            lineHeight: 1.3,
            marginBottom: '20px',
          }}
        >
          {title}
        </div>

        {/* Summary */}
        {summary && (
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase' as const,
                color: '#525252',
                marginBottom: '6px',
              }}
            >
              Why This Probability
            </span>
            <span
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#a3a3a3',
              }}
            >
              {summary.length > 280 ? summary.slice(0, 280) + '...' : summary}
            </span>
          </div>
        )}

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', backgroundColor: '#1e1e1e', marginBottom: '16px' }} />

        {/* Key Factors */}
        {factorList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase' as const,
                color: '#525252',
                marginBottom: '8px',
              }}
            >
              Key Factors
            </span>
            {factorList.slice(0, 4).map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{f.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: sentimentColor(f.sentiment),
                    textTransform: 'capitalize' as const,
                  }}
                >
                  {f.sentiment}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Catalysts */}
        {catalystList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#1e1e1e', marginBottom: '12px' }} />
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase' as const,
                color: '#525252',
                marginBottom: '8px',
              }}
            >
              Upcoming Catalysts
            </span>
            {catalystList.slice(0, 3).map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', padding: '2px 0' }}>
                <span style={{ fontSize: '12px', color: '#00e59f' }}>→</span>
                <span style={{ fontSize: '12px', color: '#a3a3a3', lineHeight: 1.4 }}>
                  {c.length > 80 ? c.slice(0, 80) + '...' : c}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid #1e1e1e',
          }}
        >
          <span style={{ fontSize: '16px', color: '#00e59f', fontStyle: 'italic' }}>
            before
          </span>
          <span style={{ fontSize: '11px', color: '#525252', letterSpacing: '1px' }}>
            b4enews.com — Know before it matters
          </span>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 630,
    }
  );
}
