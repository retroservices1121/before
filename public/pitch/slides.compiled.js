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
  tick: 18
};
const SPACING = {
  paddingTop: 100,
  paddingBottom: 80,
  paddingX: 120,
  titleGap: 52,
  itemGap: 28,
  tickerH: 0,
  chromeH: 64
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
  blue: '#7ab8ff'
};
const FONT_MONO = `'IBM Plex Mono', 'JetBrains Mono', ui-monospace, Menlo, monospace`;
const FONT_SANS = `'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, sans-serif`;

// ─────────────────────────────────────────────────────────────
// Chrome: top ticker + bottom status bar (on every slide)
// ─────────────────────────────────────────────────────────────
function Ticker() {
  return null;
}
function formatET(d) {
  const t = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(d);
  return `${t} ET`;
}
function useLiveClock() {
  const [ts, setTs] = React.useState(() => formatET(new Date()));
  React.useEffect(() => {
    const id = setInterval(() => setTs(formatET(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return ts;
}
function StatusBar({
  idx,
  total,
  section
}) {
  const ts = useLiveClock();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: SPACING.chromeH,
      background: '#070a09',
      borderTop: `1px solid ${C.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${SPACING.paddingX}px`,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.08em'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 32,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "\u25CF"), /*#__PURE__*/React.createElement("span", null, "before", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.inkMute
    }
  }, "/"), section)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("span", null, "b4enews.com"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.inkMute
    }
  }, "\u2502"), /*#__PURE__*/React.createElement("span", null, "@b4e"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.inkMute
    }
  }, "\u2502"), /*#__PURE__*/React.createElement("span", null, ts), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.inkMute
    }
  }, "\u2502"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, String(idx).padStart(2, '0'), " / ", String(total).padStart(2, '0'))));
}
function Frame({
  idx,
  total,
  section,
  children,
  pad = true,
  bg = C.bg
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: bg,
      color: C.ink,
      fontFamily: FONT_SANS,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Ticker, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: SPACING.tickerH,
      left: 0,
      right: 0,
      bottom: SPACING.chromeH,
      padding: pad ? `${SPACING.paddingTop - SPACING.tickerH}px ${SPACING.paddingX}px ${SPACING.paddingBottom - SPACING.chromeH}px` : 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, children), /*#__PURE__*/React.createElement(StatusBar, {
    idx: idx,
    total: total,
    section: section
  }));
}

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────
function SlideHeader({
  number,
  title,
  kicker
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: SPACING.titleGap
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.green,
      letterSpacing: '0.18em',
      marginBottom: 16
    }
  }, "[", String(number).padStart(2, '0'), "] ", kicker), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: FONT_SANS,
      fontSize: TYPE_SCALE.title,
      fontWeight: 600,
      margin: 0,
      letterSpacing: '-0.02em',
      lineHeight: 1.02,
      color: C.ink
    }
  }, title));
}
function Tag({
  children,
  tone = 'neutral'
}) {
  const map = {
    green: {
      bg: 'rgba(0,255,156,0.1)',
      fg: C.green,
      bd: 'rgba(0,255,156,0.3)'
    },
    amber: {
      bg: 'rgba(255,179,71,0.1)',
      fg: C.amber,
      bd: 'rgba(255,179,71,0.3)'
    },
    red: {
      bg: 'rgba(255,90,90,0.1)',
      fg: C.red,
      bd: 'rgba(255,90,90,0.3)'
    },
    neutral: {
      bg: 'transparent',
      fg: C.inkDim,
      bd: C.borderStrong
    }
  };
  const t = map[tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      letterSpacing: '0.1em',
      padding: '6px 12px',
      border: `1px solid ${t.bd}`,
      background: t.bg,
      color: t.fg,
      textTransform: 'uppercase'
    }
  }, children);
}

// ─────────────────────────────────────────────────────────────
// 01 — COVER
// ─────────────────────────────────────────────────────────────
function SlideCover({
  idx,
  total
}) {
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "cover",
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: '1.15fr 1fr'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `${SPACING.paddingTop}px ${SPACING.paddingX}px ${SPACING.paddingBottom}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      letterSpacing: '0.2em'
    }
  }, "PRE-SEED / 2026 / CONFIDENTIAL"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_SANS,
      fontSize: TYPE_SCALE.mega,
      fontWeight: 500,
      letterSpacing: '-0.05em',
      lineHeight: 0.88,
      color: C.ink
    }
  }, "before", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, ".")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.subtitle,
      color: C.green,
      marginTop: 28,
      letterSpacing: '-0.01em'
    }
  }, "know before it matters."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_SANS,
      fontSize: TYPE_SCALE.body,
      color: C.inkDim,
      marginTop: 36,
      maxWidth: 680,
      lineHeight: 1.35
    }
  }, "The AI-powered intelligence layer for prediction markets.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "green"
  }, "LIVE \xB7 BETA"), /*#__PURE__*/React.createElement(Tag, null, "b4enews.com"), /*#__PURE__*/React.createElement(Tag, null, "@b4e"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgPanel,
      position: 'relative',
      padding: `${SPACING.paddingTop}px 80px ${SPACING.paddingBottom}px`,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.12em'
    }
  }, /*#__PURE__*/React.createElement("span", null, "MONTHLY_VOL \xB7 PREDICTION_MARKETS"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "+1,650% \xB7 18M")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      marginTop: 32,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(GrowthChart, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 2,
      background: C.border
    }
  }, [['$1.2B', 'EARLY 2025'], ['$21B+', 'APR 2026'], ['17×', 'GROWTH'], ['0', 'DOMINANT ANALYTICS PLAYER']].map(([v, l], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: C.bgPanel,
      padding: '24px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: 44,
      color: C.green,
      fontWeight: 500
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.14em',
      marginTop: 6
    }
  }, l)))))));
}
function GrowthChart() {
  // stylized bars, month over month
  const data = [1.2, 1.8, 2.4, 3.1, 3.8, 4.6, 5.9, 7.2, 8.8, 10.4, 12.1, 14.3, 16.0, 17.8, 18.9, 19.6, 20.4, 21.4];
  const max = 22;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 600 360",
    style: {
      width: '100%',
      height: '100%'
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: "0",
    x2: "600",
    y1: i * 72,
    y2: i * 72,
    stroke: C.border,
    strokeDasharray: "2 4"
  })), [5, 10, 15, 20].map((v, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: "4",
    y: 360 - v / max * 340 - 4,
    fill: C.inkMute,
    fontSize: "12",
    fontFamily: FONT_MONO
  }, v, "B")), data.map((v, i) => {
    const h = v / max * 340;
    const x = 40 + i * 30;
    return /*#__PURE__*/React.createElement("rect", {
      key: i,
      x: x,
      y: 360 - h,
      width: 20,
      height: h,
      fill: i === data.length - 1 ? C.green : C.greenDim,
      opacity: 0.3 + i / data.length * 0.7
    });
  }), /*#__PURE__*/React.createElement("polyline", {
    points: data.map((v, i) => `${40 + i * 30 + 10},${360 - v / max * 340}`).join(' '),
    stroke: C.green,
    strokeWidth: "2",
    fill: "none"
  }));
}

// ─────────────────────────────────────────────────────────────
// 02 — PROBLEM
// ─────────────────────────────────────────────────────────────
function SlideProblem({
  idx,
  total
}) {
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "problem"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 2,
    kicker: "PROBLEM",
    title: "Traders see a number, not a story."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      gap: 64,
      flex: 1,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.body,
      lineHeight: 1.45,
      color: C.ink,
      maxWidth: 720
    }
  }, "Prediction markets crossed ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green,
      fontFamily: FONT_MONO
    }
  }, "$21B"), " in monthly volume. Polymarket, Kalshi, Limitless and dozens of new platforms are onboarding millions of traders, all staring at probabilities with ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.amber
    }
  }, "zero context"), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 48,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, [['A market says 72%.', 'Nobody explains why.'], ['Odds move 8% overnight.', 'Nobody explains what happened.'], ['Resolution is 3 weeks away.', 'Nobody tells you what to watch.']].map(([q, a], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '56px 1fr 1fr',
      alignItems: 'baseline',
      gap: 24,
      borderBottom: `1px solid ${C.border}`,
      paddingBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.inkMute
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink
    }
  }, q), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.red,
      letterSpacing: '0.02em'
    }
  }, "\u2192 ", a))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgPanel,
      border: `1px solid ${C.border}`,
      padding: 48,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.18em'
    }
  }, "MKT \xB7 ELECTION_2026_SENATE_PA"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: 220,
      color: C.green,
      fontWeight: 400,
      letterSpacing: '-0.04em',
      lineHeight: 1
    }
  }, "72%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.amber,
      marginTop: 8
    }
  }, "\u0394 +8.0 \xB7 24H")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px dashed ${C.borderStrong}`,
      paddingTop: 28,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.inkMute,
      textAlign: 'center',
      letterSpacing: '0.05em'
    }
  }, "> no context_", /*#__PURE__*/React.createElement("span", {
    style: {
      animation: 'blink 1s step-end infinite'
    }
  }, "\u25AE")))));
}

// ─────────────────────────────────────────────────────────────
// 03 — SOLUTION
// ─────────────────────────────────────────────────────────────
function SlideSolution({
  idx,
  total
}) {
  const items = [['WHY', 'the probability is where it is'], ['WHAT FACTORS', 'are driving movement: bullish, bearish, neutral'], ['BASE RATE', 'historical frequency for similar events'], ['CATALYSTS', 'upcoming events that could move the market']];
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "solution"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 3,
    kicker: "SOLUTION",
    title: "An intelligence brief for every market, in seconds."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.05fr',
      gap: 72,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.body,
      lineHeight: 1.45,
      color: C.inkDim,
      maxWidth: 640
    }
  }, "For any market on any platform, ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, "before"), " auto-generates a real-time, analyst-grade brief that explains:"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 48,
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, items.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: 32,
      padding: '26px 0',
      borderTop: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.green,
      letterSpacing: '0.08em'
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      lineHeight: 1.4
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${C.border}`
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "green"
  }, "GENERATED IN SECONDS"), /*#__PURE__*/React.createElement(Tag, {
    tone: "green"
  }, "ANALYST-GRADE"), /*#__PURE__*/React.createElement(Tag, null, "NOT CHATBOT-Y"))), /*#__PURE__*/React.createElement(BriefMock, null)));
}
function BriefMock() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgPanel,
      border: `1px solid ${C.border}`,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.ink,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      borderBottom: `1px solid ${C.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      color: C.inkDim,
      letterSpacing: '0.12em',
      fontSize: TYPE_SCALE.tick
    }
  }, /*#__PURE__*/React.createElement("span", null, "BRIEF.JSON \xB7 2026-04-22 08:42 ET"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "\u25CF GENERATED 4.2s")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 32px',
      lineHeight: 1.65,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.green,
      fontSize: TYPE_SCALE.small,
      fontFamily: FONT_SANS,
      fontWeight: 600,
      letterSpacing: '-0.01em'
    }
  }, "Will the Fed cut rates by June?"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.inkDim,
      marginTop: 6,
      fontSize: TYPE_SCALE.tick
    }
  }, "kalshi \xB7 FEDCUT-JUN26 \xB7 vol $14.2M"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      display: 'flex',
      gap: 24,
      fontSize: TYPE_SCALE.tick
    }
  }, /*#__PURE__*/React.createElement("span", null, "PROB ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green,
      fontSize: TYPE_SCALE.small
    }
  }, "38%")), /*#__PURE__*/React.createElement("span", null, "\u039424H ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.red
    }
  }, "\u22124.2")), /*#__PURE__*/React.createElement("span", null, "BASE_RATE ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, "42%"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      borderTop: `1px dashed ${C.borderStrong}`,
      paddingTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.inkDim,
      letterSpacing: '0.12em',
      fontSize: 14
    }
  }, "// WHY"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.ink,
      marginTop: 6
    }
  }, "Probability fell 4.2pts after CPI print came in hot at 3.4% YoY. Powell's Mar 20 remarks emphasized \"patience\". Market priced in delay.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.inkDim,
      letterSpacing: '0.12em',
      fontSize: 14
    }
  }, "// DRIVERS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.red
    }
  }, "\u25BC BEARISH"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, "CPI 3.4% \xB7 labor tightness \xB7 wage growth 4.1%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "\u25B2 BULLISH"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, "Services PMI softening \xB7 credit stress in CRE")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.amber
    }
  }, "\u25C6 WATCH"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, "May 15 CPI \xB7 Jun 11 FOMC \xB7 Apr NFP")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.inkDim,
      letterSpacing: '0.12em',
      fontSize: 14
    }
  }, "// CATALYSTS \xB7 NEXT 30D"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.ink,
      marginTop: 6
    }
  }, "3 macro prints, 1 FOMC meeting, 2 Fed speaker events."))));
}

// ─────────────────────────────────────────────────────────────
// 04 — HOW IT WORKS
// ─────────────────────────────────────────────────────────────
function SlideHow({
  idx,
  total
}) {
  const steps = [['AGGREGATE', 'Real-time data', 'Spredd + direct Polymarket · Kalshi · Limitless'], ['CRAWL', 'AI web agents', 'News · social signals · alt-data sources'], ['ENRICH', 'Live market data', 'Pricing · OHLCV · risk for crypto markets'], ['SYNTHESIZE', 'AI generation', 'Structured brief via Gemini · < 5s']];
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "how-it-works"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 4,
    kicker: "HOW IT WORKS",
    title: "Four inputs. One synthesis. Structured out."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 56
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px 1fr 80px 1fr',
      alignItems: 'center',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, ['MARKET DATA · Spredd', 'WEB INTELLIGENCE', 'CRYPTO DATA · Tokens', 'PLATFORM APIs'].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '18px 20px',
      background: C.bgPanel,
      border: `1px solid ${C.border}`,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.ink,
      letterSpacing: '0.06em',
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, s), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "\u25CF")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      color: C.green,
      fontFamily: FONT_MONO,
      fontSize: 36
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 28px',
      background: C.bgPanel2,
      border: `1px solid ${C.green}`,
      textAlign: 'center',
      boxShadow: `0 0 0 6px rgba(0,255,156,0.06)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.2em'
    }
  }, "AI SYNTHESIS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_SANS,
      fontSize: TYPE_SCALE.title,
      fontWeight: 500,
      color: C.ink,
      margin: '18px 0',
      letterSpacing: '-0.02em'
    }
  }, "Gemini")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      color: C.green,
      fontFamily: FONT_MONO,
      fontSize: 36
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 28px',
      background: C.bgPanel,
      border: `1px solid ${C.green}`,
      textAlign: 'center',
      minHeight: 240,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.2em'
    }
  }, "OUTPUT"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_SANS,
      fontSize: TYPE_SCALE.subtitle,
      color: C.ink,
      marginTop: 18,
      fontWeight: 500,
      letterSpacing: '-0.02em'
    }
  }, "Structured brief"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      marginTop: 10
    }
  }, "why \xB7 drivers \xB7 base rate \xB7 catalysts"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 2,
      background: C.border
    }
  }, steps.map(([k, t, d], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: C.bg,
      padding: '28px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.15em'
    }
  }, "0", i + 1, " \xB7 ", k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      marginTop: 12,
      fontWeight: 500
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      marginTop: 8,
      lineHeight: 1.4
    }
  }, d))))));
}

// ─────────────────────────────────────────────────────────────
// 05 — PRODUCT SURFACES
// ─────────────────────────────────────────────────────────────
function SlideProduct({
  idx,
  total
}) {
  const surfaces = [{
    k: 'CHROME EXTENSION',
    t: 'Briefs injected into 6 platforms',
    d: 'Appears natively inside Polymarket, Kalshi, Limitless + 3 more. Primary acquisition surface.',
    s: 'LIVE · v1.3.0',
    tone: 'green',
    mock: 'ext'
  }, {
    k: 'EMBEDDABLE WIDGET',
    t: 'One <script> tag, instant briefs',
    d: 'Partners drop one line. Their users get briefs, attribution tracked, rev share kicks in.',
    s: 'LIVE',
    tone: 'green',
    mock: 'widget'
  }, {
    k: 'WEB APP',
    t: 'Browse markets, read briefs',
    d: 'The b4enews.com flagship. Watchlists, history, search, account.',
    s: 'LIVE',
    tone: 'green',
    mock: 'web'
  }, {
    k: 'BASE MINI APP',
    t: 'Wallet-native · USDC credits',
    d: 'Future channel for Base App and Farcaster. Built, gated to roadmap until extension + embed scale. Pricing TBD.',
    s: 'ROADMAP',
    tone: 'amber',
    mock: 'mini'
  }];
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "product"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 5,
    kicker: "PRODUCT",
    title: "Extension + embed today. Web + mini app alongside."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 2,
      background: C.border
    }
  }, surfaces.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: C.bgPanel,
      padding: '32px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.14em'
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement(Tag, {
    tone: s.tone
  }, s.s)), /*#__PURE__*/React.createElement(SurfaceMock, {
    kind: s.mock
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.12em'
    }
  }, s.k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      marginTop: 10,
      fontWeight: 500,
      lineHeight: 1.2
    }
  }, s.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      marginTop: 10,
      lineHeight: 1.45
    }
  }, s.d))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 36,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.inkDim,
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "\u25B8"), /*#__PURE__*/React.createElement("span", null, "One intelligence engine powers all four surfaces.")));
}
function SurfaceMock({
  kind
}) {
  const box = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    height: 200,
    position: 'relative',
    overflow: 'hidden'
  };
  if (kind === 'web') {
    return /*#__PURE__*/React.createElement("div", {
      style: box
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 22,
        background: C.bgPanel2,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: 6
      }
    }, ['#ff5a5a', '#ffb347', '#00ff9c'].map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: 8,
        height: 8,
        borderRadius: 4,
        background: c,
        opacity: 0.7
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: C.inkDim,
        marginLeft: 12
      }
    }, "b4enews.com")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: C.ink,
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.green
      }
    }, "\u25B8 Fed cuts by June?"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.inkDim
      }
    }, "PROB 38% \xB7 \u0394 \u22124.2"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.green
      }
    }, "\u25B8 BTC > $120k EOY"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.inkDim
      }
    }, "PROB 61% \xB7 \u0394 +1.1"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.green
      }
    }, "\u25B8 Senate PA 2026"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.inkDim
      }
    }, "PROB 72% \xB7 \u0394 +8.0")));
  }
  if (kind === 'ext') {
    return /*#__PURE__*/React.createElement("div", {
      style: box
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: C.inkDim
      }
    }, "polymarket.com / markets /..."), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '0 12px',
        border: `1px solid ${C.green}`,
        background: 'rgba(0,255,156,0.04)',
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT_MONO,
        fontSize: 10,
        color: C.green,
        letterSpacing: '0.15em'
      }
    }, "\u25B8 BEFORE INJECTED"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT_SANS,
        fontSize: 13,
        color: C.ink,
        marginTop: 6,
        fontWeight: 500
      }
    }, "Why 72%?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT_MONO,
        fontSize: 10,
        color: C.inkDim,
        marginTop: 4,
        lineHeight: 1.5
      }
    }, "8pt move on polling release. GOP +3 in independent tracker.")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        fontFamily: FONT_MONO,
        fontSize: 10,
        color: C.inkMute
      }
    }, "\u2193 order book continues..."));
  }
  if (kind === 'widget') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        ...box,
        padding: 16,
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: C.ink,
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.inkDim
      }
    }, "<!-- partner.com -->"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.ink
      }
    }, "<script src="), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.green,
        paddingLeft: 12
      }
    }, "\"b4enews.com/embed.js\""), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.ink
      }
    }, "></script>"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        padding: 10,
        background: C.bgPanel2,
        border: `1px dashed ${C.borderStrong}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.green,
        fontSize: 10,
        letterSpacing: '0.12em'
      }
    }, "\u25B8 BRIEF"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.ink,
        marginTop: 4
      }
    }, "...rendered here.")));
  }
  // mini app
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...box,
      display: 'flex',
      justifyContent: 'center',
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 110,
      background: C.bgPanel2,
      border: `1px solid ${C.border}`,
      padding: 10,
      fontFamily: FONT_MONO,
      fontSize: 10,
      color: C.ink,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.inkDim,
      fontSize: 9
    }
  }, "BASE \xB7 WALLET"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.green,
      marginTop: 4
    }
  }, "\u25B8 Fed cut"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.inkDim
    }
  }, "PROB 38%"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: 4,
      background: C.green,
      color: '#000',
      textAlign: 'center',
      fontWeight: 600
    }
  }, "USE 1 CREDIT"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.inkMute,
      marginTop: 4,
      fontSize: 8,
      textAlign: 'center'
    }
  }, "USDC \xB7 BASE")));
}

// ─────────────────────────────────────────────────────────────
// 06 — DISTRIBUTION
// ─────────────────────────────────────────────────────────────
function SlideDistribution({
  idx,
  total
}) {
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "distribution"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 6,
    kicker: "DISTRIBUTION",
    title: "Two live channels. One drives users; the other drives partners."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 2,
      background: C.border,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgPanel,
      padding: 36,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.2em'
    }
  }, "CHANNEL \xB7 01"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.subtitle,
      color: C.ink,
      marginTop: 16,
      fontWeight: 500,
      letterSpacing: '-0.02em'
    }
  }, "Chrome Extension"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      marginTop: 10,
      letterSpacing: '0.06em'
    }
  }, "LIVE ON 6 PLATFORMS"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      flex: 1
    }
  }, [['Polymarket', 'BIG-3'], ['Kalshi', 'BIG-3'], ['Limitless', 'BIG-3'], ['DFlow', 'SOL'], ['Alpha Arcade', '#3 VOL'], ['MetaMask PM', 'NEW']].map(([p, t], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: `1px solid ${C.border}`,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green,
      marginRight: 10
    }
  }, "\u25B8"), p), t && /*#__PURE__*/React.createElement("span", {
    style: {
      color: t === 'NEW' ? C.amber : C.inkDim,
      fontSize: TYPE_SCALE.tick,
      letterSpacing: '0.1em'
    }
  }, t))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgPanel,
      padding: 36,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.2em'
    }
  }, "CHANNEL \xB7 02"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.subtitle,
      color: C.ink,
      marginTop: 16,
      fontWeight: 500,
      letterSpacing: '-0.02em'
    }
  }, "Embeddable Widget"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      marginTop: 10,
      letterSpacing: '0.06em'
    }
  }, "ONE LINE \xB7 REV SHARE"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      padding: 22,
      background: C.bg,
      border: `1px solid ${C.borderStrong}`,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.ink,
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.inkDim
    }
  }, '<!-- partner drops this -->'), /*#__PURE__*/React.createElement("div", null, "<script src="), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.green,
      paddingLeft: 18
    }
  }, "\"b4enews.com/embed.js\""), /*#__PURE__*/React.createElement("div", null, "></script>")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      fontSize: TYPE_SCALE.small,
      color: C.inkDim,
      lineHeight: 1.45,
      flex: 1
    }
  }, "Partner gets the widget free. ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, "Their users pay."), "\xA0Every signup carries a ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "ref_platform"), " tag, so attribution flows straight to rev share.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgPanel,
      padding: 36,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.amber,
      letterSpacing: '0.2em'
    }
  }, "CHANNEL \xB7 03 \xB7 ROADMAP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.subtitle,
      color: C.ink,
      marginTop: 16,
      fontWeight: 500,
      letterSpacing: '-0.02em'
    }
  }, "Base Mini App"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      marginTop: 10,
      letterSpacing: '0.06em'
    }
  }, "BUILT \xB7 GATED UNTIL EXT + EMBED SCALE"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      flex: 1
    }
  }, [['10', 'PM mini apps on Base'], ['0', 'Intelligence layers, until now'], ['TBD', 'USDC credit pricing on Base']].map(([n, l], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '110px 1fr',
      alignItems: 'baseline',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: 44,
      color: C.green,
      fontWeight: 500
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      lineHeight: 1.4
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 16,
      borderTop: `1px dashed ${C.borderStrong}`,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim
    }
  }, "\u25B8 Deep-links into Limitless & peers to trade."))));
}

// ─────────────────────────────────────────────────────────────
// 07 — BUSINESS MODEL
// ─────────────────────────────────────────────────────────────
function SlideModel({
  idx,
  total
}) {
  const rows = [['CREDITS', 'Extension + Web', 'Pay-per-brief credits', 'Pricing TBD'], ['REV SHARE', 'Partner Embeds', 'ref_platform attribution', '% of partner-sourced credits'], ['DEEP-LINK', 'Trading volume', 'Referral attribution', '% of volume routed to platforms'], ['USDC CREDITS · ROADMAP', 'Base Mini App', 'On-chain USDC', 'Pricing TBD']];
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "business-model"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 7,
    kicker: "BUSINESS MODEL",
    title: "Subs + partner rev share now. Credits + deep-link compound it."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1.2fr 1fr 1.6fr',
      padding: '14px 24px',
      background: '#070a09',
      border: `1px solid ${C.border}`,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.15em'
    }
  }, /*#__PURE__*/React.createElement("span", null, "CHANNEL"), /*#__PURE__*/React.createElement("span", null, "SURFACE"), /*#__PURE__*/React.createElement("span", null, "MECHANIC"), /*#__PURE__*/React.createElement("span", null, "PRICING")), rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1.2fr 1fr 1.6fr',
      padding: '26px 24px',
      borderBottom: `1px solid ${C.border}`,
      borderLeft: `1px solid ${C.border}`,
      borderRight: `1px solid ${C.border}`,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_SANS,
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      fontWeight: 600
    }
  }, r[0])), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.inkDim
    }
  }, r[1]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.ink,
      letterSpacing: '0.05em'
    }
  }, r[2]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.green
    }
  }, r[3]))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      padding: '28px 32px',
      background: C.bgPanel,
      borderLeft: `3px solid ${C.green}`,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 48
    }
  }, [['NEVER', 'touch funds'], ['NEVER', 'execute trades'], ['NEVER', 'show order books']].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.red,
      letterSpacing: '0.2em'
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      marginTop: 6
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      fontSize: TYPE_SCALE.small,
      color: C.inkDim,
      maxWidth: 1100
    }
  }, "Every trading platform is a distribution partner, not a competitor.")));
}

// ─────────────────────────────────────────────────────────────
// 08 — MARKET
// ─────────────────────────────────────────────────────────────
function SlideMarket({
  idx,
  total
}) {
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "market"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 8,
    kicker: "MARKET",
    title: "The fastest-growing segment in crypto."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: 64,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 2,
      background: C.border
    }
  }, [{
    v: '$1.2B',
    l: 'MONTHLY VOLUME · EARLY 2025',
    t: ''
  }, {
    v: '$21B+',
    l: 'MONTHLY VOLUME · APR 2026',
    t: 'green'
  }, {
    v: '17×',
    l: 'GROWTH · 18 MONTHS',
    t: 'green'
  }, {
    v: '1M+',
    l: 'POLYMARKET MAU',
    t: ''
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: C.bgPanel,
      padding: '32px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: 72,
      color: s.t === 'green' ? C.green : C.ink,
      fontWeight: 500,
      letterSpacing: '-0.03em',
      lineHeight: 1
    }
  }, s.v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.14em',
      marginTop: 14
    }
  }, s.l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      padding: '28px 32px',
      borderLeft: `3px solid ${C.green}`,
      background: 'rgba(0,255,156,0.05)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.18em'
    }
  }, "TAM CALC"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.subtitle,
      color: C.ink,
      marginTop: 16,
      letterSpacing: '-0.01em'
    }
  }, "$21B/mo \xD7 0.5% = ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "$105M/mo")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      marginTop: 8
    }
  }, "addressable intelligence spend"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.18em'
    }
  }, "WHO'S IN THE MARKET"), [['POLYMARKET', '1M+ monthly traders'], ['KALSHI', 'CFTC-regulated · expanding to sports'], ['LIMITLESS', 'Leading prediction market on Base'], ['METAMASK', 'New entrant · wallet-native'], ['BINANCE WALLET', 'New entrant'], ['ALPHA ARCADE', '#3 by volume · Algorand']].map(([n, d], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '20px 24px',
      border: `1px solid ${C.border}`,
      background: C.bgPanel,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      letterSpacing: '0.05em'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '18px 24px',
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.amber,
      border: `1px dashed ${C.amber}`,
      letterSpacing: '0.06em'
    }
  }, "\u25B8 No dominant analytics/intelligence product exists."))));
}

// ─────────────────────────────────────────────────────────────
// 09 — COMPETITION
// ─────────────────────────────────────────────────────────────
function SlideCompetition({
  idx,
  total
}) {
  const rows = [['POLYMARKET ANALYTICS', 'Charts, volume data', 'No AI intelligence · no context'], ['PREDLY', 'AI-identified mispricings', 'No real-time briefs · single platform'], ['VERSO', 'Bloomberg-style terminal', 'No AI analysis · no distribution'], ['PREDICTOS', 'Open-source trading framework', 'No intelligence layer']];
  const features = [['AI intelligence briefs', [false, 'partial', false, false, true]], ['Multi-platform coverage', [false, false, 'partial', false, true]], ['Extension + embed + mini app', [false, false, false, false, true]], ['USDC micropayments', [false, false, false, false, true]]];
  const cols = ['POLY', 'PREDLY', 'VERSO', 'PREDICT·OS', 'BEFORE'];
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "competition"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 9,
    kicker: "COMPETITION",
    title: "Data, yes. Intelligence, no."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      gap: 56,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '22px 24px',
      background: C.bgPanel,
      border: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      letterSpacing: '0.05em'
    }
  }, r[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.12em'
    }
  }, "0", i + 1)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: 11,
      color: C.green,
      letterSpacing: '0.16em'
    }
  }, "DOES"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.micro,
      color: C.ink,
      marginTop: 6,
      lineHeight: 1.4
    }
  }, r[1])), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: 11,
      color: C.red,
      letterSpacing: '0.16em'
    }
  }, "DOESN'T"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      marginTop: 6,
      lineHeight: 1.4
    }
  }, r[2])))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgPanel,
      border: `1px solid ${C.border}`,
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.18em'
    }
  }, "FEATURE MATRIX"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'grid',
      gridTemplateColumns: '1.6fr repeat(5, 1fr)',
      rowGap: 0
    }
  }, /*#__PURE__*/React.createElement("div", null), cols.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center',
      padding: '8px 4px',
      fontFamily: FONT_MONO,
      fontSize: 13,
      color: c === 'BEFORE' ? C.green : C.inkDim,
      letterSpacing: '0.1em',
      fontWeight: c === 'BEFORE' ? 600 : 400
    }
  }, c)), features.map(([name, vals], i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 0',
      borderTop: `1px solid ${C.border}`,
      fontSize: TYPE_SCALE.micro,
      color: C.ink
    }
  }, name), vals.map((v, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      padding: '16px 0',
      borderTop: `1px solid ${C.border}`,
      textAlign: 'center',
      fontFamily: FONT_MONO,
      fontSize: 18,
      color: v === true ? C.green : v === 'partial' ? C.amber : C.inkMute
    }
  }, v === true ? '●' : v === 'partial' ? '◐' : '○'))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      paddingTop: 20,
      borderTop: `1px dashed ${C.borderStrong}`,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.1em'
    }
  }, "\u25CF YES \xA0\xA0 \u25D0 PARTIAL \xA0\xA0 \u25CB NO"))));
}

// ─────────────────────────────────────────────────────────────
// 10 — TRACTION
// ─────────────────────────────────────────────────────────────
function SlideTraction({
  idx,
  total
}) {
  const built = ['Chrome extension v1.3.0 · live on 6 platforms · primary acquisition surface', 'Embeddable widget · ref_platform attribution + inline auth · partner rev share live', 'Working web app at b4enews.com', 'Direct API integrations · Polymarket · Kalshi · Limitless', 'Auth · Stripe · rate limiting · caching', 'GitBook docs for partner onboarding', 'Base mini app · built, gated to roadmap until ext + embed scale'];
  const partners = [['Inflectiv', 'Data marketplace partnership · inbound', 'green'], ['Base Ecosystem', 'Outreach · David Tso · Base Batches', 'amber']];
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "traction"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 10,
    kicker: "TRACTION",
    title: "Built. Not a pitch deck."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 56,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.2em'
    }
  }, "SHIPPED"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, built.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '48px 1fr auto',
      alignItems: 'center',
      gap: 16,
      padding: '16px 0',
      borderBottom: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkMute
    }
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink
    }
  }, b), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.12em'
    }
  }, "\u2713 LIVE"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.2em'
    }
  }, "PARTNERSHIPS"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, partners.map(([n, d, t], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '20px 24px',
      background: C.bgPanel,
      border: `1px solid ${C.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      fontWeight: 500
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      marginTop: 4,
      letterSpacing: '0.04em'
    }
  }, d)), /*#__PURE__*/React.createElement(Tag, {
    tone: t
  }, t === 'green' ? 'ACTIVE' : 'IN FLIGHT')))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      padding: '24px 28px',
      borderLeft: `3px solid ${C.green}`,
      background: 'rgba(0,255,156,0.05)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.18em'
    }
  }, "STATUS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.subtitle,
      color: C.ink,
      marginTop: 10,
      letterSpacing: '-0.01em',
      fontWeight: 500
    }
  }, "In beta \xB7 2 free briefs/day")))));
}

// ─────────────────────────────────────────────────────────────
// 11 — TEAM
// ─────────────────────────────────────────────────────────────
function SlideTeam({
  idx,
  total
}) {
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "team"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 11,
    kicker: "TEAM",
    title: "Founder."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 56,
      background: C.bgPanel,
      border: `1px solid ${C.border}`,
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: 56,
      alignItems: 'center',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "/pitch/founder.jpg",
    alt: "Joseph Perez",
    style: {
      width: 320,
      height: 320,
      objectFit: 'cover',
      border: `1px solid ${C.borderStrong}`,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.2em'
    }
  }, "FOUNDER \xB7 CEO"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_SANS,
      fontSize: 72,
      color: C.ink,
      fontWeight: 500,
      letterSpacing: '-0.02em',
      marginTop: 14,
      lineHeight: 1.05
    }
  }, "Joseph Perez")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      lineHeight: 1.45,
      maxWidth: 720
    }
  }, "21-year U.S. military veteran. Background in finance, 10+ years in web3. Non-tech founder building in the prediction markets space since early 2025 across multiple prediction platforms and infra projects."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      marginTop: 8,
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.micro,
      color: C.inkDim,
      letterSpacing: '0.06em'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "TG "), "@Game4Charity"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.inkMute
    }
  }, "│"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green
    }
  }, "X "), "@jprz1321")))));
}

// ─────────────────────────────────────────────────────────────
// 13 — USE OF FUNDS
// ─────────────────────────────────────────────────────────────
function SlideFunds({
  idx,
  total
}) {
  const rows = [{
    k: 'INFRA + API',
    pct: 40,
    amt: '$800K',
    note: 'Gemini · Railway/Vercel · TinyFish crawl · DB scaling'
  }, {
    k: 'GROWTH',
    pct: 25,
    amt: '$500K',
    note: 'Partner onboarding · Chrome Web Store · Base grants · content'
  }, {
    k: 'ENGINEERING',
    pct: 15,
    amt: '$300K',
    note: '2 engineers · scale pipeline · alerts · watchlist'
  }, {
    k: 'OPS + LEGAL',
    pct: 10,
    amt: '$200K',
    note: 'Operations · legal · compliance'
  }, {
    k: 'RESERVE',
    pct: 10,
    amt: '$200K',
    note: 'Runway buffer'
  }];
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "use-of-funds"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 13,
    kicker: "USE OF FUNDS",
    title: "Where the $2M goes."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 72,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkMute
    }
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_SANS,
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      fontWeight: 600,
      letterSpacing: '0.04em'
    }
  }, r.k)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.green
    }
  }, r.pct, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.ink
    }
  }, r.amt))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: C.bgPanel,
      marginTop: 10,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      right: `${100 - r.pct}%`,
      background: C.green
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      marginTop: 8,
      letterSpacing: '0.04em'
    }
  }, r.note)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgPanel,
      border: `1px solid ${C.border}`,
      padding: 48,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkDim,
      letterSpacing: '0.18em'
    }
  }, "TOTAL RAISE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: 180,
      color: C.green,
      fontWeight: 500,
      letterSpacing: '-0.04em',
      lineHeight: 0.9,
      marginTop: 12
    }
  }, "$2M"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Donut, {
    rows: rows
  })))));
}
function Donut({
  rows
}) {
  const total = rows.reduce((s, r) => s + r.pct, 0);
  let acc = 0;
  const r = 90,
    cx = 120,
    cy = 120,
    stroke = 26;
  const colors = [C.green, '#00c580', '#008f5c', '#006944', '#00432c'];
  return /*#__PURE__*/React.createElement("svg", {
    width: "240",
    height: "240",
    viewBox: "0 0 240 240",
    style: {
      fontFamily: FONT_MONO
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: r,
    fill: "none",
    stroke: C.border,
    strokeWidth: stroke
  }), rows.map((row, i) => {
    const frac = row.pct / total;
    const len = 2 * Math.PI * r;
    const dash = `${frac * len} ${len}`;
    const offset = -acc * len;
    acc += frac;
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: cx,
      cy: cy,
      r: r,
      fill: "none",
      stroke: colors[i],
      strokeWidth: stroke,
      strokeDasharray: dash,
      strokeDashoffset: offset,
      transform: `rotate(-90 ${cx} ${cy})`
    });
  }), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy - 4,
    textAnchor: "middle",
    fill: C.ink,
    fontSize: "14",
    letterSpacing: "0.15em"
  }, "ALLOCATION"), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy + 18,
    textAnchor: "middle",
    fill: C.inkDim,
    fontSize: "12"
  }, "100%"));
}

// ─────────────────────────────────────────────────────────────
// 14 — FUNDRAISE
// ─────────────────────────────────────────────────────────────
function SlideFundraise({
  idx,
  total
}) {
  const terms = [['RAISING', '$2,000,000'], ['PRE-MONEY', '$8,000,000'], ['INSTRUMENT', 'SAFE (Post-Money)'], ['DILUTION', '20%']];
  const why = ['Working product across 4 surfaces (web · extension · embed · mini app)', '6 platform integrations built and tested', 'Novel revenue model: USDC credits, partner rev share, deep-link referrals', '$21B+ and growing TAM · no dominant intelligence player', 'Non-dilutive capital pipeline · Base ecosystem outreach in motion'];
  return /*#__PURE__*/React.createElement(Frame, {
    idx: idx,
    total: total,
    section: "fundraise"
  }, /*#__PURE__*/React.createElement(SlideHeader, {
    number: 12,
    kicker: "FUNDRAISE",
    title: "Pre-seed terms."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.1fr',
      gap: 72,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      background: C.border
    }
  }, terms.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: C.bgPanel,
      padding: '36px 36px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.small,
      color: C.inkDim,
      letterSpacing: '0.14em'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.title,
      color: C.green,
      fontWeight: 500,
      letterSpacing: '-0.02em'
    }
  }, v)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.green,
      letterSpacing: '0.2em'
    }
  }, "WHY $8M PRE-MONEY"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: 'flex',
      flexDirection: 'column'
    }
  }, why.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '22px 0',
      borderBottom: `1px solid ${C.border}`,
      display: 'grid',
      gridTemplateColumns: '40px 1fr',
      gap: 20,
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT_MONO,
      fontSize: TYPE_SCALE.tick,
      color: C.inkMute
    }
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: TYPE_SCALE.small,
      color: C.ink,
      lineHeight: 1.4
    }
  }, w)))))));
}

// ─────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────
const SLIDES = [{
  label: '01 Cover',
  Comp: SlideCover
}, {
  label: '02 Problem',
  Comp: SlideProblem
}, {
  label: '03 Solution',
  Comp: SlideSolution
}, {
  label: '04 How It Works',
  Comp: SlideHow
}, {
  label: '05 Product',
  Comp: SlideProduct
}, {
  label: '06 Distribution',
  Comp: SlideDistribution
}, {
  label: '07 Business Model',
  Comp: SlideModel
}, {
  label: '08 Market',
  Comp: SlideMarket
}, {
  label: '09 Competition',
  Comp: SlideCompetition
}, {
  label: '10 Traction',
  Comp: SlideTraction
}, {
  label: '11 Team',
  Comp: SlideTeam
}, {
  label: '12 Fundraise',
  Comp: SlideFundraise
}, {
  label: '13 Use of Funds',
  Comp: SlideFunds
}];
Object.assign(window, {
  SLIDES,
  SlideCover,
  SlideProblem,
  SlideSolution,
  SlideHow,
  SlideProduct,
  SlideDistribution,
  SlideModel,
  SlideMarket,
  SlideCompetition,
  SlideTraction,
  SlideTeam,
  SlideFunds,
  SlideFundraise,
  B4E_C: C,
  B4E_TYPE_SCALE: TYPE_SCALE,
  B4E_SPACING: SPACING
});