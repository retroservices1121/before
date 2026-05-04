/* before (B4E) — Pre-Seed Pitch Deck slides
   Bloomberg-terminal aesthetic: dark, monospace-forward, green tape accent */

const TYPE_SCALE = {
  mega: 180,
  hero: 120,
  title: 64,
  subtitle: 44,
  body: 34,
  small: 28,
  micro: 22,
  tick: 18,
};

const SPACING = {
  paddingTop: 100,
  paddingBottom: 80,
  paddingX: 120,
  titleGap: 52,
  itemGap: 28,
  tickerH: 0,
  chromeH: 64,
};

const C = {
  bg: '#0a0d0c',
  bgPanel: '#0f1412',
  bgPanel2: '#141a18',
  border: '#1f2a26',
  borderStrong: '#2b3a35',
  ink: '#e6efe9',
  inkDim: '#8a9a93',
  inkMute: '#55625c',
  green: '#00ff9c',
  greenDim: '#00b56f',
  amber: '#ffb347',
  red: '#ff5a5a',
  blue: '#7ab8ff',
};

const FONT_MONO = `'IBM Plex Mono', 'JetBrains Mono', ui-monospace, Menlo, monospace`;
const FONT_SANS = `'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, sans-serif`;

// ─────────────────────────────────────────────────────────────
// Chrome: top ticker + bottom status bar (on every slide)
// ─────────────────────────────────────────────────────────────
function Ticker() {
  return null;
}

function useLiveClock() {
  const [ts, setTs] = React.useState(() => formatET(new Date()));
  React.useEffect(() => {
    const id = setInterval(() => setTs(formatET(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return ts;
}

function formatET(d) {
  const t = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(d);
  return `${t} ET`;
}

function StatusBar({ idx, total, section }) {
  const ts = useLiveClock();
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: SPACING.chromeH,
      background: '#070a09', borderTop: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `0 ${SPACING.paddingX}px`,
      fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim,
      letterSpacing: '0.08em',
    }}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <span style={{ color: C.green }}>●</span>
        <span>before<span style={{ color: C.inkMute }}>/</span>{section}</span>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <span>b4enews.com</span>
        <span style={{ color: C.inkMute }}>│</span>
        <span>@b4e</span>
        <span style={{ color: C.inkMute }}>│</span>
        <span>{ts}</span>
        <span style={{ color: C.inkMute }}>│</span>
        <span style={{ color: C.ink }}>{String(idx).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

function Frame({ idx, total, section, children, pad = true, bg = C.bg }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg, color: C.ink,
      fontFamily: FONT_SANS, overflow: 'hidden',
    }}>
      <Ticker />
      <div style={{
        position: 'absolute',
        top: SPACING.tickerH, left: 0, right: 0, bottom: SPACING.chromeH,
        padding: pad ? `${SPACING.paddingTop - SPACING.tickerH}px ${SPACING.paddingX}px ${SPACING.paddingBottom - SPACING.chromeH}px` : 0,
        display: 'flex', flexDirection: 'column',
      }}>
        {children}
      </div>
      <StatusBar idx={idx} total={total} section={section} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────
function SlideHeader({ number, title, kicker }) {
  return (
    <div style={{ marginBottom: SPACING.titleGap }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.green,
        letterSpacing: '0.18em', marginBottom: 16,
      }}>
        [{String(number).padStart(2, '0')}] {kicker}
      </div>
      <h1 style={{
        fontFamily: FONT_SANS, fontSize: TYPE_SCALE.title, fontWeight: 600,
        margin: 0, letterSpacing: '-0.02em', lineHeight: 1.02, color: C.ink,
      }}>{title}</h1>
    </div>
  );
}

function Tag({ children, tone = 'neutral' }) {
  const map = {
    green: { bg: 'rgba(0,255,156,0.1)', fg: C.green, bd: 'rgba(0,255,156,0.3)' },
    amber: { bg: 'rgba(255,179,71,0.1)', fg: C.amber, bd: 'rgba(255,179,71,0.3)' },
    red:   { bg: 'rgba(255,90,90,0.1)', fg: C.red, bd: 'rgba(255,90,90,0.3)' },
    neutral: { bg: 'transparent', fg: C.inkDim, bd: C.borderStrong },
  };
  const t = map[tone];
  return (
    <span style={{
      fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, letterSpacing: '0.1em',
      padding: '6px 12px', border: `1px solid ${t.bd}`, background: t.bg, color: t.fg,
      textTransform: 'uppercase',
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// 01 — COVER
// ─────────────────────────────────────────────────────────────
function SlideCover({ idx, total }) {
  return (
    <Frame idx={idx} total={total} section="cover" pad={false}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1.15fr 1fr' }}>
        {/* Left */}
        <div style={{
          padding: `${SPACING.paddingTop}px ${SPACING.paddingX}px ${SPACING.paddingBottom}px`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          borderRight: `1px solid ${C.border}`,
        }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.inkDim, letterSpacing: '0.2em' }}>
            PRE-SEED / 2026 / CONFIDENTIAL
          </div>
          <div>
            <div style={{
              fontFamily: FONT_SANS, fontSize: TYPE_SCALE.mega, fontWeight: 500,
              letterSpacing: '-0.05em', lineHeight: 0.88, color: C.ink,
            }}>
              before<span style={{ color: C.green }}>.</span>
            </div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: TYPE_SCALE.subtitle, color: C.green,
              marginTop: 28, letterSpacing: '-0.01em',
            }}>
              know before it matters.
            </div>
            <div style={{
              fontFamily: FONT_SANS, fontSize: TYPE_SCALE.body, color: C.inkDim,
              marginTop: 36, maxWidth: 680, lineHeight: 1.35,
            }}>
              The AI-powered intelligence layer for prediction markets.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Tag tone="green">LIVE · BETA</Tag>
            <Tag>b4enews.com</Tag>
            <Tag>@b4e</Tag>
          </div>
        </div>

        {/* Right — ASCII-style chart panel */}
        <div style={{
          background: C.bgPanel, position: 'relative',
          padding: `${SPACING.paddingTop}px 80px ${SPACING.paddingBottom}px`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.12em' }}>
            <span>MONTHLY_VOL · PREDICTION_MARKETS</span>
            <span style={{ color: C.green }}>+1,650% · 18M</span>
          </div>
          <div style={{ flex: 1, marginTop: 32, position: 'relative' }}>
            <GrowthChart />
          </div>
          <div style={{
            marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 2, background: C.border,
          }}>
            {[
              ['$1.2B', 'EARLY 2025'],
              ['$21B+', 'APR 2026'],
              ['17×', 'GROWTH'],
              ['0', 'DOMINANT ANALYTICS PLAYER'],
            ].map(([v, l], i) => (
              <div key={i} style={{ background: C.bgPanel, padding: '24px 20px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 44, color: C.green, fontWeight: 500 }}>{v}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.14em', marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function GrowthChart() {
  // stylized bars, month over month
  const data = [1.2, 1.8, 2.4, 3.1, 3.8, 4.6, 5.9, 7.2, 8.8, 10.4, 12.1, 14.3, 16.0, 17.8, 18.9, 19.6, 20.4, 21.4];
  const max = 22;
  return (
    <svg viewBox="0 0 600 360" style={{ width: '100%', height: '100%' }}>
      {/* grid */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1="0" x2="600" y1={i * 72} y2={i * 72} stroke={C.border} strokeDasharray="2 4" />
      ))}
      {[5, 10, 15, 20].map((v, i) => (
        <text key={i} x="4" y={360 - (v / max) * 340 - 4} fill={C.inkMute} fontSize="12" fontFamily={FONT_MONO}>{v}B</text>
      ))}
      {data.map((v, i) => {
        const h = (v / max) * 340;
        const x = 40 + i * 30;
        return (
          <rect key={i} x={x} y={360 - h} width={20} height={h} fill={i === data.length - 1 ? C.green : C.greenDim} opacity={0.3 + i / data.length * 0.7} />
        );
      })}
      {/* trend line */}
      <polyline
        points={data.map((v, i) => `${40 + i * 30 + 10},${360 - (v / max) * 340}`).join(' ')}
        stroke={C.green} strokeWidth="2" fill="none"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 02 — PROBLEM
// ─────────────────────────────────────────────────────────────
function SlideProblem({ idx, total }) {
  return (
    <Frame idx={idx} total={total} section="problem">
      <SlideHeader number={2} kicker="PROBLEM" title="Traders see a number, not a story." />
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, flex: 1, alignItems: 'stretch' }}>
        <div>
          <div style={{ fontSize: TYPE_SCALE.body, lineHeight: 1.45, color: C.ink, maxWidth: 720 }}>
            Prediction markets crossed <span style={{ color: C.green, fontFamily: FONT_MONO }}>$21B</span> in monthly volume.
            Polymarket, Kalshi, Limitless and dozens of new platforms are onboarding millions of traders —
            all staring at probabilities with <span style={{ color: C.amber }}>zero context</span>.
          </div>
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              ['A market says 72%.', 'Nobody explains why.'],
              ['Odds move 8% overnight.', 'Nobody explains what happened.'],
              ['Resolution is 3 weeks away.', 'Nobody tells you what to watch.'],
            ].map(([q, a], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '56px 1fr 1fr', alignItems: 'baseline', gap: 24,
                borderBottom: `1px solid ${C.border}`, paddingBottom: 18,
              }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.inkMute }}>
                  0{i + 1}
                </div>
                <div style={{ fontSize: TYPE_SCALE.small, color: C.ink }}>{q}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.red, letterSpacing: '0.02em' }}>→ {a}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: C.bgPanel, border: `1px solid ${C.border}`, padding: 48,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.18em' }}>
            MKT · ELECTION_2026_SENATE_PA
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 220, color: C.green, fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1 }}>72%</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.amber, marginTop: 8 }}>
              Δ +8.0 · 24H
            </div>
          </div>
          <div style={{
            borderTop: `1px dashed ${C.borderStrong}`, paddingTop: 28,
            fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.inkMute,
            textAlign: 'center', letterSpacing: '0.05em',
          }}>
            &gt; no context_<span style={{ animation: 'blink 1s step-end infinite' }}>▮</span>
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 32, padding: '24px 32px', borderLeft: `3px solid ${C.green}`,
        background: 'rgba(0,255,156,0.05)', fontSize: TYPE_SCALE.subtitle,
        fontFamily: FONT_SANS, color: C.ink, letterSpacing: '-0.01em',
      }}>
        There is no Bloomberg terminal for prediction markets.
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 03 — SOLUTION
// ─────────────────────────────────────────────────────────────
function SlideSolution({ idx, total }) {
  const items = [
    ['WHY', 'the probability is where it is'],
    ['WHAT FACTORS', 'are driving movement — bullish, bearish, neutral'],
    ['BASE RATE', 'historical frequency for similar events'],
    ['CATALYSTS', 'upcoming events that could move the market'],
  ];
  return (
    <Frame idx={idx} total={total} section="solution">
      <SlideHeader number={3} kicker="SOLUTION" title="An intelligence brief for every market, in seconds." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 72, flex: 1 }}>
        <div>
          <div style={{ fontSize: TYPE_SCALE.body, lineHeight: 1.45, color: C.inkDim, maxWidth: 640 }}>
            For any market on any platform, <span style={{ color: C.ink }}>before</span> auto-generates
            a real-time, analyst-grade brief that explains:
          </div>
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {items.map(([k, v], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32,
                padding: '26px 0', borderTop: `1px solid ${C.border}`,
              }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.green, letterSpacing: '0.08em' }}>{k}</div>
                <div style={{ fontSize: TYPE_SCALE.small, color: C.ink, lineHeight: 1.4 }}>{v}</div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}` }} />
          </div>
          <div style={{ marginTop: 40, display: 'flex', gap: 14 }}>
            <Tag tone="green">GENERATED IN SECONDS</Tag>
            <Tag tone="green">ANALYST-GRADE</Tag>
            <Tag>NOT CHATBOT-Y</Tag>
          </div>
        </div>

        <BriefMock />
      </div>
    </Frame>
  );
}

function BriefMock() {
  return (
    <div style={{
      background: C.bgPanel, border: `1px solid ${C.border}`,
      fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.ink,
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <div style={{
        padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', color: C.inkDim,
        letterSpacing: '0.12em', fontSize: TYPE_SCALE.tick,
      }}>
        <span>BRIEF.JSON · 2026-04-22 08:42 ET</span>
        <span style={{ color: C.green }}>● GENERATED 4.2s</span>
      </div>
      <div style={{ padding: '24px 32px', lineHeight: 1.65, flex: 1 }}>
        <div style={{ color: C.green, fontSize: TYPE_SCALE.small, fontFamily: FONT_SANS, fontWeight: 600, letterSpacing: '-0.01em' }}>
          Will the Fed cut rates by June?
        </div>
        <div style={{ color: C.inkDim, marginTop: 6, fontSize: TYPE_SCALE.tick }}>
          kalshi · FEDCUT-JUN26 · vol $14.2M
        </div>
        <div style={{ marginTop: 22, display: 'flex', gap: 24, fontSize: TYPE_SCALE.tick }}>
          <span>PROB <span style={{ color: C.green, fontSize: TYPE_SCALE.small }}>38%</span></span>
          <span>Δ24H <span style={{ color: C.red }}>−4.2</span></span>
          <span>BASE_RATE <span style={{ color: C.ink }}>42%</span></span>
        </div>
        <div style={{ marginTop: 24, borderTop: `1px dashed ${C.borderStrong}`, paddingTop: 18 }}>
          <div style={{ color: C.inkDim, letterSpacing: '0.12em', fontSize: 14 }}>// WHY</div>
          <div style={{ color: C.ink, marginTop: 6 }}>
            Probability fell 4.2pts after CPI print came in hot at 3.4% YoY.
            Powell's Mar 20 remarks emphasized "patience" — market priced in delay.
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ color: C.inkDim, letterSpacing: '0.12em', fontSize: 14 }}>// DRIVERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            <div><span style={{ color: C.red }}>▼ BEARISH</span> <span style={{ color: C.ink }}>CPI 3.4% · labor tightness · wage growth 4.1%</span></div>
            <div><span style={{ color: C.green }}>▲ BULLISH</span> <span style={{ color: C.ink }}>Services PMI softening · credit stress in CRE</span></div>
            <div><span style={{ color: C.amber }}>◆ WATCH</span> <span style={{ color: C.ink }}>May 15 CPI · Jun 11 FOMC · Apr NFP</span></div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ color: C.inkDim, letterSpacing: '0.12em', fontSize: 14 }}>// CATALYSTS · NEXT 30D</div>
          <div style={{ color: C.ink, marginTop: 6 }}>
            3 macro prints, 1 FOMC meeting, 2 Fed speaker events.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 04 — HOW IT WORKS
// ─────────────────────────────────────────────────────────────
function SlideHow({ idx, total }) {
  const steps = [
    ['AGGREGATE', 'Real-time data', 'Spredd + direct Polymarket · Kalshi · Limitless'],
    ['CRAWL', 'AI web agents', 'News · social signals · alt-data sources'],
    ['ENRICH', 'Live market data', 'Pricing · OHLCV · risk for crypto markets'],
    ['SYNTHESIZE', 'AI generation', 'Structured brief via Gemini · < 5s'],
  ];
  return (
    <Frame idx={idx} total={total} section="how-it-works">
      <SlideHeader number={4} kicker="HOW IT WORKS" title="Four inputs. One synthesis. Structured out." />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 56 }}>
        {/* Pipeline diagram */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr 80px 1fr', alignItems: 'center', gap: 0 }}>
          {/* Sources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['MARKET DATA · Spredd', 'WEB INTELLIGENCE', 'CRYPTO DATA · Tokens', 'PLATFORM APIs'].map((s, i) => (
              <div key={i} style={{
                padding: '18px 20px', background: C.bgPanel, border: `1px solid ${C.border}`,
                fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.ink, letterSpacing: '0.06em',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{s}</span>
                <span style={{ color: C.green }}>●</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', color: C.green, fontFamily: FONT_MONO, fontSize: 36 }}>→</div>
          {/* Engine */}
          <div style={{
            padding: '60px 28px', background: C.bgPanel2,
            border: `1px solid ${C.green}`, textAlign: 'center',
            boxShadow: `0 0 0 6px rgba(0,255,156,0.06)`,
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.2em' }}>
              AI SYNTHESIS
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: TYPE_SCALE.title, fontWeight: 500, color: C.ink, margin: '18px 0', letterSpacing: '-0.02em' }}>
              Gemini
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.14em' }}>
              &lt; $0.01 / brief
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', color: C.green, fontFamily: FONT_MONO, fontSize: 36 }}>→</div>
          {/* Output */}
          <div style={{
            padding: '48px 28px', background: C.bgPanel, border: `1px solid ${C.green}`,
            textAlign: 'center', minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.2em' }}>OUTPUT</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: TYPE_SCALE.subtitle, color: C.ink, marginTop: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>
              Structured brief
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.inkDim, marginTop: 10 }}>
              why · drivers · base rate · catalysts
            </div>
          </div>
        </div>

        {/* Step breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: C.border }}>
          {steps.map(([k, t, d], i) => (
            <div key={i} style={{ background: C.bg, padding: '28px 24px' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.15em' }}>
                0{i + 1} · {k}
              </div>
              <div style={{ fontSize: TYPE_SCALE.small, color: C.ink, marginTop: 12, fontWeight: 500 }}>{t}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, marginTop: 8, lineHeight: 1.4 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 05 — PRODUCT SURFACES
// ─────────────────────────────────────────────────────────────
function SlideProduct({ idx, total }) {
  const surfaces = [
    {
      k: 'CHROME EXTENSION', t: 'Briefs injected into 8 platforms',
      d: 'Appears natively inside Polymarket, Kalshi, Limitless + 5 more. Primary acquisition surface.',
      s: 'LIVE · v1.3.0', tone: 'green',
      mock: 'ext',
    },
    {
      k: 'EMBEDDABLE WIDGET', t: 'One <script> tag, instant briefs',
      d: 'Partners drop one line. Their users get briefs, attribution tracked, rev share kicks in.',
      s: 'LIVE', tone: 'green',
      mock: 'widget',
    },
    {
      k: 'WEB APP', t: 'Browse markets, read briefs',
      d: 'The b4enews.com flagship. Watchlists, history, search, account.',
      s: 'LIVE', tone: 'green',
      mock: 'web',
    },
    {
      k: 'BASE MINI APP', t: 'Wallet-native · USDC credits',
      d: 'Future channel for Base App and Farcaster. Built, gated to roadmap until extension + embed scale.',
      s: 'ROADMAP', tone: 'amber',
      mock: 'mini',
    },
  ];
  return (
    <Frame idx={idx} total={total} section="product">
      <SlideHeader number={5} kicker="PRODUCT" title="Extension + embed today. Web + mini app alongside." />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: C.border }}>
        {surfaces.map((s, i) => (
          <div key={i} style={{
            background: C.bgPanel, padding: '32px 28px',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.14em' }}>
                0{i + 1}
              </div>
              <Tag tone={s.tone}>{s.s}</Tag>
            </div>
            <SurfaceMock kind={s.mock} />
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.12em' }}>{s.k}</div>
              <div style={{ fontSize: TYPE_SCALE.small, color: C.ink, marginTop: 10, fontWeight: 500, lineHeight: 1.2 }}>{s.t}</div>
              <div style={{ fontSize: TYPE_SCALE.micro, color: C.inkDim, marginTop: 10, lineHeight: 1.45 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 36, fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.inkDim,
        display: 'flex', gap: 14, alignItems: 'center',
      }}>
        <span style={{ color: C.green }}>▸</span>
        <span>One intelligence engine powers all four surfaces.</span>
      </div>
    </Frame>
  );
}

function SurfaceMock({ kind }) {
  const box = { background: C.bg, border: `1px solid ${C.border}`, height: 200, position: 'relative', overflow: 'hidden' };
  if (kind === 'web') {
    return (
      <div style={box}>
        <div style={{ height: 22, background: C.bgPanel2, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6 }}>
          {['#ff5a5a', '#ffb347', '#00ff9c'].map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: c, opacity: 0.7 }} />)}
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.inkDim, marginLeft: 12 }}>b4enews.com</div>
        </div>
        <div style={{ padding: 14, fontFamily: FONT_MONO, fontSize: 11, color: C.ink, lineHeight: 1.6 }}>
          <div style={{ color: C.green }}>▸ Fed cuts by June?</div>
          <div style={{ color: C.inkDim }}>PROB 38% · Δ −4.2</div>
          <div style={{ height: 4 }} />
          <div style={{ color: C.green }}>▸ BTC &gt; $120k EOY</div>
          <div style={{ color: C.inkDim }}>PROB 61% · Δ +1.1</div>
          <div style={{ height: 4 }} />
          <div style={{ color: C.green }}>▸ Senate PA 2026</div>
          <div style={{ color: C.inkDim }}>PROB 72% · Δ +8.0</div>
        </div>
      </div>
    );
  }
  if (kind === 'ext') {
    return (
      <div style={box}>
        <div style={{ padding: 12, fontFamily: FONT_MONO, fontSize: 11, color: C.inkDim }}>polymarket.com / markets /...</div>
        <div style={{ margin: '0 12px', border: `1px solid ${C.green}`, background: 'rgba(0,255,156,0.04)', padding: 12 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.green, letterSpacing: '0.15em' }}>▸ BEFORE INJECTED</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.ink, marginTop: 6, fontWeight: 500 }}>Why 72%?</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.inkDim, marginTop: 4, lineHeight: 1.5 }}>
            8pt move on polling release. GOP +3 in independent tracker.
          </div>
        </div>
        <div style={{ padding: 12, fontFamily: FONT_MONO, fontSize: 10, color: C.inkMute }}>↓ order book continues...</div>
      </div>
    );
  }
  if (kind === 'widget') {
    return (
      <div style={{ ...box, padding: 16, fontFamily: FONT_MONO, fontSize: 11, color: C.ink, lineHeight: 1.6 }}>
        <div style={{ color: C.inkDim }}>&lt;!-- partner.com --&gt;</div>
        <div style={{ color: C.ink }}>&lt;script src=</div>
        <div style={{ color: C.green, paddingLeft: 12 }}>"b4enews.com/embed.js"</div>
        <div style={{ color: C.ink }}>&gt;&lt;/script&gt;</div>
        <div style={{ marginTop: 14, padding: 10, background: C.bgPanel2, border: `1px dashed ${C.borderStrong}` }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: '0.12em' }}>▸ BRIEF</div>
          <div style={{ color: C.ink, marginTop: 4 }}>...rendered here.</div>
        </div>
      </div>
    );
  }
  // mini app
  return (
    <div style={{ ...box, display: 'flex', justifyContent: 'center', padding: 10 }}>
      <div style={{ width: 110, background: C.bgPanel2, border: `1px solid ${C.border}`, padding: 10, fontFamily: FONT_MONO, fontSize: 10, color: C.ink, lineHeight: 1.6 }}>
        <div style={{ color: C.inkDim, fontSize: 9 }}>BASE · WALLET</div>
        <div style={{ color: C.green, marginTop: 4 }}>▸ Fed cut</div>
        <div style={{ color: C.inkDim }}>PROB 38%</div>
        <div style={{ marginTop: 8, padding: 4, background: C.green, color: '#000', textAlign: 'center', fontWeight: 600 }}>
          USE 1 CREDIT
        </div>
        <div style={{ color: C.inkMute, marginTop: 4, fontSize: 8, textAlign: 'center' }}>USDC · BASE</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 06 — DISTRIBUTION
// ─────────────────────────────────────────────────────────────
function SlideDistribution({ idx, total }) {
  return (
    <Frame idx={idx} total={total} section="distribution">
      <SlideHeader number={6} kicker="DISTRIBUTION" title="Two live channels. One drives users; the other drives partners." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, background: C.border, flex: 1 }}>
        {/* Extension */}
        <div style={{ background: C.bgPanel, padding: 36, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.2em' }}>
            CHANNEL · 01
          </div>
          <div style={{ fontSize: TYPE_SCALE.subtitle, color: C.ink, marginTop: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Chrome Extension
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.inkDim, marginTop: 10, letterSpacing: '0.06em' }}>
            LIVE ON 8 PLATFORMS
          </div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {[
              ['Polymarket', 'BIG-3'],
              ['Kalshi', 'BIG-3'],
              ['Limitless', 'BIG-3'],
              ['DFlow', 'SOL'],
              ['Alpha Arcade', '#3 VOL'],
              ['Matchr', ''],
              ['Polynance', ''],
              ['MetaMask PM', 'NEW'],
            ].map(([p, t], i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: `1px solid ${C.border}`,
                fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro,
              }}>
                <span style={{ color: C.ink }}><span style={{ color: C.green, marginRight: 10 }}>▸</span>{p}</span>
                {t && <span style={{ color: t === 'NEW' ? C.amber : C.inkDim, fontSize: TYPE_SCALE.tick, letterSpacing: '0.1em' }}>{t}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Widget */}
        <div style={{ background: C.bgPanel, padding: 36, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.2em' }}>
            CHANNEL · 02
          </div>
          <div style={{ fontSize: TYPE_SCALE.subtitle, color: C.ink, marginTop: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Embeddable Widget
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.inkDim, marginTop: 10, letterSpacing: '0.06em' }}>
            ONE LINE · REV SHARE
          </div>
          <div style={{
            marginTop: 28, padding: 22, background: C.bg, border: `1px solid ${C.borderStrong}`,
            fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.ink, lineHeight: 1.7,
          }}>
            <div style={{ color: C.inkDim }}>{'<!-- partner drops this -->'}</div>
            <div>&lt;script src=</div>
            <div style={{ color: C.green, paddingLeft: 18 }}>"b4enews.com/embed.js"</div>
            <div>&gt;&lt;/script&gt;</div>
          </div>
          <div style={{ marginTop: 28, fontSize: TYPE_SCALE.small, color: C.inkDim, lineHeight: 1.45, flex: 1 }}>
            Partner gets the widget free. <span style={{ color: C.ink }}>Their users pay.</span>
            &nbsp;Every signup carries a <span style={{ color: C.green }}>ref_platform</span> tag — attribution flows straight to rev share.
          </div>
        </div>

        {/* Mini App */}
        <div style={{ background: C.bgPanel, padding: 36, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.amber, letterSpacing: '0.2em' }}>
            CHANNEL · 03 · ROADMAP
          </div>
          <div style={{ fontSize: TYPE_SCALE.subtitle, color: C.ink, marginTop: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Base Mini App
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.inkDim, marginTop: 10, letterSpacing: '0.06em' }}>
            BUILT · GATED UNTIL EXT + EMBED SCALE
          </div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
            {[
              ['10', 'PM mini apps on Base'],
              ['0', 'Intelligence layers — until now'],
              ['$0.99', '10-credit pack · USDC on Base'],
            ].map(([n, l], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'baseline', gap: 16 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 44, color: C.green, fontWeight: 500 }}>{n}</div>
                <div style={{ fontSize: TYPE_SCALE.micro, color: C.inkDim, lineHeight: 1.4 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16, paddingTop: 16, borderTop: `1px dashed ${C.borderStrong}`,
            fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.inkDim,
          }}>
            ▸ Deep-links into Limitless & peers to trade.
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 07 — BUSINESS MODEL
// ─────────────────────────────────────────────────────────────
function SlideModel({ idx, total }) {
  const rows = [
    ['SUBSCRIPTIONS', 'Extension + Web', 'Stripe SaaS', 'Lite $4.99/mo · Pro $9.99/mo'],
    ['REV SHARE', 'Partner Embeds', 'ref_platform attribution', '% of partner-sourced subs'],
    ['DEEP-LINK', 'Trading volume', 'Referral attribution', '% of volume routed to platforms'],
    ['USDC CREDITS · ROADMAP', 'Base Mini App', 'On-chain USDC', '10 / $0.99 · 50 / $3.99'],
  ];
  return (
    <Frame idx={idx} total={total} section="business-model">
      <SlideHeader number={7} kicker="BUSINESS MODEL" title="Subs + partner rev share now. Credits + deep-link compound it." />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1.6fr',
          padding: '14px 24px', background: '#070a09', border: `1px solid ${C.border}`,
          fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.15em',
        }}>
          <span>CHANNEL</span>
          <span>SURFACE</span>
          <span>MECHANIC</span>
          <span>PRICING</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1.6fr',
            padding: '26px 24px', borderBottom: `1px solid ${C.border}`,
            borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`,
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ color: C.green, fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick }}>0{i + 1}</span>
              <span style={{ fontFamily: FONT_SANS, fontSize: TYPE_SCALE.small, color: C.ink, fontWeight: 600 }}>{r[0]}</span>
            </div>
            <span style={{ fontSize: TYPE_SCALE.small, color: C.inkDim }}>{r[1]}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.ink, letterSpacing: '0.05em' }}>{r[2]}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.green }}>{r[3]}</span>
          </div>
        ))}

        <div style={{
          marginTop: 40, padding: '28px 32px', background: C.bgPanel, borderLeft: `3px solid ${C.green}`,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48,
        }}>
          {[
            ['NEVER', 'touch funds'],
            ['NEVER', 'execute trades'],
            ['NEVER', 'show order books'],
          ].map(([k, v], i) => (
            <div key={i}>
              <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.red, letterSpacing: '0.2em' }}>{k}</div>
              <div style={{ fontSize: TYPE_SCALE.small, color: C.ink, marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, fontSize: TYPE_SCALE.small, color: C.inkDim, maxWidth: 1100 }}>
          Every trading platform is a distribution partner, not a competitor.
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 08 — MARKET
// ─────────────────────────────────────────────────────────────
function SlideMarket({ idx, total }) {
  return (
    <Frame idx={idx} total={total} section="market">
      <SlideHeader number={8} kicker="MARKET" title="The fastest-growing segment in crypto." />
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: C.border }}>
            {[
              { v: '$1.2B', l: 'MONTHLY VOLUME · EARLY 2025', t: '' },
              { v: '$21B+', l: 'MONTHLY VOLUME · APR 2026', t: 'green' },
              { v: '17×', l: 'GROWTH · 18 MONTHS', t: 'green' },
              { v: '1M+', l: 'POLYMARKET MAU', t: '' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.bgPanel, padding: '32px 28px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 72, color: s.t === 'green' ? C.green : C.ink, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.14em', marginTop: 14 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 40, padding: '28px 32px', borderLeft: `3px solid ${C.green}`,
            background: 'rgba(0,255,156,0.05)',
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.18em' }}>TAM CALC</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.subtitle, color: C.ink, marginTop: 16, letterSpacing: '-0.01em' }}>
              $21B/mo × 0.5% = <span style={{ color: C.green }}>$105M/mo</span>
            </div>
            <div style={{ fontSize: TYPE_SCALE.micro, color: C.inkDim, marginTop: 8 }}>addressable intelligence spend</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.18em' }}>
            WHO'S IN THE MARKET
          </div>
          {[
            ['POLYMARKET', '1M+ monthly traders'],
            ['KALSHI', 'CFTC-regulated · expanding to sports'],
            ['LIMITLESS', 'Leading prediction market on Base'],
            ['METAMASK', 'New entrant · wallet-native'],
            ['BINANCE WALLET', 'New entrant'],
            ['ALPHA ARCADE', '#3 by volume · Algorand'],
          ].map(([n, d], i) => (
            <div key={i} style={{
              padding: '20px 24px', border: `1px solid ${C.border}`, background: C.bgPanel,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.ink, letterSpacing: '0.05em' }}>{n}</div>
              <div style={{ fontSize: TYPE_SCALE.micro, color: C.inkDim }}>{d}</div>
            </div>
          ))}
          <div style={{
            marginTop: 8, padding: '18px 24px',
            fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.amber,
            border: `1px dashed ${C.amber}`, letterSpacing: '0.06em',
          }}>
            ▸ No dominant analytics/intelligence product exists.
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 09 — COMPETITION
// ─────────────────────────────────────────────────────────────
function SlideCompetition({ idx, total }) {
  const rows = [
    ['POLYMARKET ANALYTICS', 'Charts, volume data', 'No AI intelligence · no context'],
    ['PREDLY', 'AI-identified mispricings', 'No real-time briefs · single platform'],
    ['VERSO', 'Bloomberg-style terminal', 'No AI analysis · no distribution'],
    ['PREDICTOS', 'Open-source trading framework', 'No intelligence layer'],
  ];
  const features = [
    ['AI intelligence briefs', [false, 'partial', false, false, true]],
    ['Multi-platform coverage', [false, false, 'partial', false, true]],
    ['Extension + embed + mini app', [false, false, false, false, true]],
    ['USDC micropayments', [false, false, false, false, true]],
  ];
  const cols = ['POLY', 'PREDLY', 'VERSO', 'PREDICT·OS', 'BEFORE'];
  return (
    <Frame idx={idx} total={total} section="competition">
      <SlideHeader number={9} kicker="COMPETITION" title="Data, yes. Intelligence, no." />
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rows.map((r, i) => (
            <div key={i} style={{
              padding: '22px 24px', background: C.bgPanel, border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.ink, letterSpacing: '0.05em' }}>{r[0]}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.12em' }}>0{i + 1}</div>
              </div>
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.green, letterSpacing: '0.16em' }}>DOES</div>
                  <div style={{ fontSize: TYPE_SCALE.micro, color: C.ink, marginTop: 6, lineHeight: 1.4 }}>{r[1]}</div>
                </div>
                <div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.red, letterSpacing: '0.16em' }}>DOESN'T</div>
                  <div style={{ fontSize: TYPE_SCALE.micro, color: C.inkDim, marginTop: 6, lineHeight: 1.4 }}>{r[2]}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, padding: 28 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.18em' }}>
            FEATURE MATRIX
          </div>
          <div style={{
            marginTop: 20, display: 'grid',
            gridTemplateColumns: '1.6fr repeat(5, 1fr)',
            rowGap: 0,
          }}>
            <div />
            {cols.map((c, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '8px 4px',
                fontFamily: FONT_MONO, fontSize: 13, color: c === 'BEFORE' ? C.green : C.inkDim,
                letterSpacing: '0.1em', fontWeight: c === 'BEFORE' ? 600 : 400,
              }}>{c}</div>
            ))}
            {features.map(([name, vals], i) => (
              <React.Fragment key={i}>
                <div style={{
                  padding: '16px 0', borderTop: `1px solid ${C.border}`,
                  fontSize: TYPE_SCALE.micro, color: C.ink,
                }}>{name}</div>
                {vals.map((v, j) => (
                  <div key={j} style={{
                    padding: '16px 0', borderTop: `1px solid ${C.border}`, textAlign: 'center',
                    fontFamily: FONT_MONO, fontSize: 18,
                    color: v === true ? C.green : v === 'partial' ? C.amber : C.inkMute,
                  }}>
                    {v === true ? '●' : v === 'partial' ? '◐' : '○'}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div style={{
            marginTop: 28, paddingTop: 20, borderTop: `1px dashed ${C.borderStrong}`,
            fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.1em',
          }}>
            ● YES &nbsp;&nbsp; ◐ PARTIAL &nbsp;&nbsp; ○ NO
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 10 — TRACTION
// ─────────────────────────────────────────────────────────────
function SlideTraction({ idx, total }) {
  const built = [
    'Chrome extension v1.3.0 · live on 8 platforms · primary acquisition surface',
    'Embeddable widget · ref_platform attribution + inline auth · partner rev share live',
    'Working web app at b4enews.com',
    'Direct API integrations · Polymarket · Kalshi · Limitless',
    'Auth · Stripe · rate limiting · caching',
    'GitBook docs for partner onboarding',
    'Base mini app · built, gated to roadmap until ext + embed scale',
  ];
  const partners = [
    ['Inflectiv', 'Data marketplace partnership · inbound', 'green'],
    ['Hyperliquid Builders Program', '$50–100K grant · applied', 'amber'],
    ['Base Ecosystem', 'Outreach · David Tso · Base Batches', 'amber'],
    ['Ex-Coinbase engineer', 'Advisor · committed', 'green'],
  ];
  return (
    <Frame idx={idx} total={total} section="traction">
      <SlideHeader number={10} kicker="TRACTION" title="Built — not a pitch deck." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, flex: 1 }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.2em' }}>
            SHIPPED
          </div>
          <div style={{ marginTop: 20 }}>
            {built.map((b, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'center', gap: 16,
                padding: '16px 0', borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkMute }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontSize: TYPE_SCALE.small, color: C.ink }}>{b}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.12em' }}>✓ LIVE</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.2em' }}>
            PARTNERSHIPS
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {partners.map(([n, d, t], i) => (
              <div key={i} style={{
                padding: '20px 24px', background: C.bgPanel, border: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: TYPE_SCALE.small, color: C.ink, fontWeight: 500 }}>{n}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, marginTop: 4, letterSpacing: '0.04em' }}>{d}</div>
                </div>
                <Tag tone={t}>{t === 'green' ? 'ACTIVE' : 'IN FLIGHT'}</Tag>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 28, padding: '24px 28px', borderLeft: `3px solid ${C.green}`,
            background: 'rgba(0,255,156,0.05)',
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.18em' }}>
              STATUS
            </div>
            <div style={{ fontSize: TYPE_SCALE.subtitle, color: C.ink, marginTop: 10, letterSpacing: '-0.01em', fontWeight: 500 }}>
              In beta · 2 free briefs/day
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 11 — TEAM
// ─────────────────────────────────────────────────────────────
function SlideTeam({ idx, total }) {
  return (
    <Frame idx={idx} total={total} section="team">
      <SlideHeader number={11} kicker="TEAM" title="Founders & advisors." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, flex: 1 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            padding: 48, background: C.bgPanel, border: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <div style={{
                width: 120, height: 120, background: C.bg, border: `1px dashed ${C.borderStrong}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT_MONO, fontSize: 14, color: C.inkMute, letterSpacing: '0.12em',
              }}>
                PHOTO
              </div>
              <div>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.18em' }}>
                  {i === 0 ? 'FOUNDER · CEO' : 'ADVISOR'}
                </div>
                <div style={{
                  fontFamily: FONT_SANS, fontSize: TYPE_SCALE.title, color: C.ink, fontWeight: 500,
                  letterSpacing: '-0.02em', marginTop: 10,
                }}>
                  {i === 0 ? '[ Your Name ]' : 'Ex-Coinbase Engineer'}
                </div>
              </div>
            </div>
            <div style={{
              marginTop: 36, padding: 28, background: C.bg, border: `1px dashed ${C.borderStrong}`,
              flex: 1, fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.inkDim, lineHeight: 1.7,
            }}>
              {i === 0 ? (
                <>
                  <span style={{ color: C.green }}>// TODO</span><br />
                  Drop founder bio here — prior roles, shipped products,<br />
                  domain expertise, why you're building this.
                </>
              ) : (
                <>
                  <span style={{ color: C.green }}>// ADVISOR</span><br />
                  Base ecosystem access · technical credibility ·<br />
                  investor introductions.
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 12 — WHY NOW
// ─────────────────────────────────────────────────────────────
function SlideWhyNow({ idx, total }) {
  const points = [
    ['01', 'VOLUME', 'Monthly volume is 17× what it was 18 months ago — and accelerating.'],
    ['02', 'REGULATION', 'Kalshi CFTC approved. Polymarket with post-election momentum.'],
    ['03', 'DISTRIBUTION', 'Base App, MetaMask, Binance Wallet all adding prediction markets.'],
    ['04', 'MONETIZATION', 'x402 just launched — Coinbase micropayments are a new primitive.'],
    ['05', 'AI COSTS', 'Gemini Flash generates briefs for < $0.01 each.'],
  ];
  return (
    <Frame idx={idx} total={total} section="why-now">
      <SlideHeader number={12} kicker="WHY NOW" title="Five conditions, all true for the first time." />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {points.map(([n, k, v], i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '80px 260px 1fr',
            alignItems: 'baseline', gap: 40,
            padding: '28px 0', borderTop: `1px solid ${C.border}`,
            ...(i === points.length - 1 ? { borderBottom: `1px solid ${C.border}` } : {}),
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.green, letterSpacing: '0.12em' }}>{n}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.ink, letterSpacing: '0.08em' }}>{k}</div>
            <div style={{ fontSize: TYPE_SCALE.small, color: C.inkDim, lineHeight: 1.4 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 32, fontSize: TYPE_SCALE.subtitle, color: C.ink,
        letterSpacing: '-0.01em', maxWidth: 1200,
      }}>
        The intelligence layer needs to exist. <span style={{ color: C.green }}>The question is who builds it.</span>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 13 — USE OF FUNDS
// ─────────────────────────────────────────────────────────────
function SlideFunds({ idx, total }) {
  const rows = [
    { k: 'ENGINEERING', pct: 40, amt: '$800K', note: '2 engineers · scale pipeline · alerts · watchlist' },
    { k: 'GROWTH', pct: 25, amt: '$500K', note: 'Partner onboarding · Chrome Web Store · Base grants · content' },
    { k: 'INFRA + API', pct: 15, amt: '$300K', note: 'Gemini · Railway/Vercel · TinyFish crawl · DB scaling' },
    { k: 'OPS + LEGAL', pct: 10, amt: '$200K', note: 'Operations · legal · compliance' },
    { k: 'RESERVE', pct: 10, amt: '$200K', note: 'Runway buffer' },
  ];
  return (
    <Frame idx={idx} total={total} section="use-of-funds">
      <SlideHeader number={13} kicker="USE OF FUNDS" title="Where the $2M goes." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {rows.map((r, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkMute }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: TYPE_SCALE.small, color: C.ink, fontWeight: 600, letterSpacing: '0.04em' }}>{r.k}</span>
                </div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.green }}>{r.pct}%</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.ink }}>{r.amt}</span>
                </div>
              </div>
              <div style={{ height: 6, background: C.bgPanel, marginTop: 10, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, right: `${100 - r.pct}%`, background: C.green }} />
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, marginTop: 8, letterSpacing: '0.04em' }}>{r.note}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: C.bgPanel, border: `1px solid ${C.border}`,
          padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.18em' }}>
            TOTAL RAISE
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 180, color: C.green, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 0.9, marginTop: 12 }}>
            $2M
          </div>
          {/* Donut */}
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <Donut rows={rows} />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Donut({ rows }) {
  const total = rows.reduce((s, r) => s + r.pct, 0);
  let acc = 0;
  const r = 90, cx = 120, cy = 120, stroke = 26;
  const colors = [C.green, '#00c580', '#008f5c', '#006944', '#00432c'];
  return (
    <svg width="240" height="240" viewBox="0 0 240 240" style={{ fontFamily: FONT_MONO }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
      {rows.map((row, i) => {
        const frac = row.pct / total;
        const len = 2 * Math.PI * r;
        const dash = `${frac * len} ${len}`;
        const offset = -acc * len;
        acc += frac;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={colors[i]} strokeWidth={stroke}
            strokeDasharray={dash} strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={C.ink} fontSize="14" letterSpacing="0.15em">ALLOCATION</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill={C.inkDim} fontSize="12">100%</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 14 — FUNDRAISE
// ─────────────────────────────────────────────────────────────
function SlideFundraise({ idx, total }) {
  const terms = [
    ['RAISING', '$2,000,000'],
    ['PRE-MONEY', '$8,000,000'],
    ['INSTRUMENT', 'SAFE (Post-Money)'],
    ['DILUTION', '20%'],
  ];
  const why = [
    'Working product across 4 surfaces (web · extension · embed · mini app)',
    '8 platform integrations built and tested',
    'Novel revenue model — USDC credits + SaaS + rev share',
    'Ex-Coinbase advisor on cap table',
    '$21B+ and growing TAM · no dominant intelligence player',
    'Non-dilutive capital pipeline · Hyperliquid grant · Base ecosystem',
  ];
  return (
    <Frame idx={idx} total={total} section="fundraise">
      <SlideHeader number={14} kicker="FUNDRAISE" title="Pre-seed terms." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: C.border }}>
          {terms.map(([k, v], i) => (
            <div key={i} style={{
              background: C.bgPanel, padding: '36px 36px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.inkDim, letterSpacing: '0.14em' }}>{k}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.title, color: C.green, fontWeight: 500, letterSpacing: '-0.02em' }}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.green, letterSpacing: '0.2em' }}>
            WHY $8M PRE-MONEY
          </div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column' }}>
            {why.map((w, i) => (
              <div key={i} style={{
                padding: '22px 0', borderBottom: `1px solid ${C.border}`,
                display: 'grid', gridTemplateColumns: '40px 1fr', gap: 20, alignItems: 'baseline',
              }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkMute }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: TYPE_SCALE.small, color: C.ink, lineHeight: 1.4 }}>{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 15 — THE ASK
// ─────────────────────────────────────────────────────────────
function SlideAsk({ idx, total }) {
  const milestones = [
    ['10,000+', 'MONTHLY ACTIVE USERS'],
    ['4', 'REVENUE CHANNELS LIVE'],
    ['20+', 'PLATFORM INTEGRATIONS'],
    ['A', 'SERIES A READY'],
  ];
  return (
    <Frame idx={idx} total={total} section="ask" pad={false}>
      <div style={{
        position: 'absolute', inset: `${SPACING.tickerH}px 0 ${SPACING.chromeH}px 0`,
        padding: `${SPACING.paddingTop - SPACING.tickerH}px ${SPACING.paddingX}px ${SPACING.paddingBottom - SPACING.chromeH}px`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.micro, color: C.green, letterSpacing: '0.18em' }}>
            [15] THE ASK
          </div>
          <div style={{
            marginTop: 40, fontFamily: FONT_SANS, fontSize: 92, fontWeight: 500,
            color: C.ink, lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: 1400,
          }}>
            Every trader deserves context, <br />
            <span style={{ color: C.green }}>not just a number.</span>
          </div>
          <div style={{
            marginTop: 36, fontSize: TYPE_SCALE.subtitle, color: C.inkDim, maxWidth: 1100, lineHeight: 1.3,
          }}>
            We're building the intelligence layer that prediction markets need to go mainstream.
          </div>
        </div>

        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.2em' }}>
            $2M GETS US TO
          </div>
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: C.border }}>
            {milestones.map(([v, l], i) => (
              <div key={i} style={{ background: C.bgPanel, padding: '32px 28px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 72, color: C.green, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.tick, color: C.inkDim, letterSpacing: '0.14em', marginTop: 14 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            borderTop: `1px solid ${C.border}`, paddingTop: 32,
          }}>
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 96, fontWeight: 500, color: C.ink, letterSpacing: '-0.04em', lineHeight: 0.9 }}>
                before<span style={{ color: C.green }}>.</span>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.green, marginTop: 14, letterSpacing: '-0.01em' }}>
                know before it matters.
              </div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: FONT_MONO, fontSize: TYPE_SCALE.small, color: C.inkDim, lineHeight: 1.6, letterSpacing: '0.06em' }}>
              <div style={{ color: C.ink }}>b4enews.com</div>
              <div>@b4e</div>
            </div>
          </div>
        </div>
      </div>
      <Ticker />
      <StatusBar idx={idx} total={total} section="ask" />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────
const SLIDES = [
  { label: '01 Cover', Comp: SlideCover },
  { label: '02 Problem', Comp: SlideProblem },
  { label: '03 Solution', Comp: SlideSolution },
  { label: '04 How It Works', Comp: SlideHow },
  { label: '05 Product', Comp: SlideProduct },
  { label: '06 Distribution', Comp: SlideDistribution },
  { label: '07 Business Model', Comp: SlideModel },
  { label: '08 Market', Comp: SlideMarket },
  { label: '09 Competition', Comp: SlideCompetition },
  { label: '10 Traction', Comp: SlideTraction },
  { label: '11 Team', Comp: SlideTeam },
  { label: '12 Why Now', Comp: SlideWhyNow },
  { label: '13 Use of Funds', Comp: SlideFunds },
  { label: '14 Fundraise', Comp: SlideFundraise },
  { label: '15 The Ask', Comp: SlideAsk },
];

Object.assign(window, {
  SLIDES, SlideCover, SlideProblem, SlideSolution, SlideHow, SlideProduct,
  SlideDistribution, SlideModel, SlideMarket, SlideCompetition, SlideTraction,
  SlideTeam, SlideWhyNow, SlideFunds, SlideFundraise, SlideAsk,
  B4E_C: C, B4E_TYPE_SCALE: TYPE_SCALE, B4E_SPACING: SPACING,
});
