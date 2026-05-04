# Handoff: before — Pre-Seed Pitch Deck

## Overview
A 15-slide pitch deck for **before (B4E)**, the AI-powered intelligence layer for prediction markets. The website is **b4enews.com**. The deck is designed in a **Bloomberg-terminal aesthetic** — dark mode, monospace-forward, dense data tables, terminal chrome with live ticker tape.

Pre-seed raise: **$2M on $8M pre-money**.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in your target codebase's existing environment** (or, if starting fresh, in the framework most appropriate for the project). Use established patterns, component libraries, and design tokens from the existing codebase where possible.

## Fidelity
**High-fidelity.** All colors, typography, spacing, layouts, and content are final. Reproduce pixel-perfectly.

## Files in this Bundle
- `index.html` — main entry point (loads deck-stage + tweaks panel + slides). Served at `b4enews.com/pitch`.
- `slides.jsx` — **canonical source** for all 15 slides (React, plain JSX)
- `slides.compiled.js` — pre-Babel-compiled version of slides.jsx (used to avoid runtime transform delay)
- `deck-stage.js` — slide-deck shell web component (scaling, keyboard nav, slide-counter, print-to-PDF)
- `before-pitch-deck-print.html` — print-optimized variant for PDF export

`slides.jsx` is the source of truth for layout. The compiled JS is a build artifact — regenerate if you change the JSX.

---

## Design System

### Colors
```
bg          #0a0d0c   (page background)
bgPanel     #0f1412   (card / panel)
bgPanel2    #141a18   (inset card)
border      #1f2a26   (subtle dividers)
borderStrong#2b3a35   (emphasized borders)

ink         #e6efe9   (primary text)
inkDim      #8a9a93   (secondary text)
inkMute     #55625c   (tertiary / labels)

green       #00ff9c   (PRIMARY ACCENT — terminal green)
greenDim    #00b56f   (muted green for chart fills)
amber       #ffb347   (caution / "in flight" status)
red         #ff5a5a   (negative deltas / "doesn't")
blue        #7ab8ff   (alt accent — alternate brand color)
```

The accent color is tweakable via the in-page Tweaks panel (4 swatches: green/amber/blue/red). Default is green.

### Typography
**Two families, both from Google Fonts:**
- `IBM Plex Sans` — body copy, titles, big stat numbers (when not mono)
- `IBM Plex Mono` — kickers, status bars, ticker, all data/numeric callouts

**Type scale (px, designed at 1920×1080):**
```
mega      180   (cover wordmark, big stats like "$2M")
hero      120   (final-slide headlines)
title      64   (slide titles)
subtitle   44   (sub-headlines)
body       34   (paragraphs)
small      28   (secondary copy)
micro      22   (mono kickers, status text)
tick       18   (ticker tape, status bar)
```

Letter-spacing for mono text is generous (0.08em–0.20em) — track everything in IBM Plex Mono.

### Spacing
```
paddingTop      100px
paddingBottom    80px
paddingX        120px
titleGap         52px (between kicker → title → body)
itemGap          28px (between list items, cards)
tickerH          44px (top ticker bar height)
chromeH          64px (bottom status bar height)
```

### Slide Dimensions
**1920 × 1080** (16:9). The `<deck-stage>` web component handles scaling to any viewport via CSS transforms while keeping layout at native resolution.

---

## Slide Structure

Every slide has:
1. **Top ticker tape** (44px) — scrolling fake market ticker (B4E · LIVE label + tickers like "POLY 72.4 +1.8")
2. **Slide content** (between ticker and status bar)
3. **Bottom status bar** (64px) — left: `● before/<section>`, right: `b4enews.com  │  @b4e  │  NN / 15`

Section labels: `cover`, `problem`, `solution`, `how-it-works`, `product`, `distribution`, `business-model`, `market`, `competition`, `traction`, `team`, `why-now`, `use-of-funds`, `fundraise`, `ask`.

### The 15 Slides

| # | Section | Title | Key Visual |
|---|---|---|---|
| 1 | cover | `before.` (mega wordmark with green period) + "know before it matters." | Right-side bar chart of $1.2B → $21.4B monthly volume + 4-stat grid |
| 2 | problem | "Traders see a number, not a story." | Big "72%" probability with "no context_" caption + 3 problem rows |
| 3 | solution | "An intelligence brief for every market, in seconds." | 4-row brief structure (WHY/WHAT FACTORS/BASE RATE/CATALYSTS) + mock JSON brief |
| 4 | how-it-works | "Four inputs. One synthesis. Structured out." | Pipeline diagram (4 sources → AI engine → output) + 4 step cards |
| 5 | product | "Four surfaces, one engine." | 4-column card grid (Web app · Chrome ext · Embed · Base mini app) |
| 6 | distribution | "Meet traders where they trade." | 3-column (Extension platforms list · Embed code mock · Base stats) |
| 7 | business-model | "Four revenue channels. Zero conflict with platforms." | Table of 4 revenue channels + "NEVER" callout (touch funds / execute trades / show order books) |
| 8 | market | "The fastest-growing segment in crypto." | 4-stat grid + TAM calc card + "WHO'S IN THE MARKET" player list |
| 9 | competition | "Data, yes. Intelligence, no." | 4 competitor rows (DOES/DOESN'T) + feature matrix table |
| 10 | traction | "Built — not a pitch deck." | 7-item shipped list + 4 partnership rows |
| 11 | team | "Founders & advisors." | 2-column founder/advisor cards (with photo placeholders) |
| 12 | why-now | "Five conditions, all true for the first time." | Numbered list (01 VOLUME · 02 REGULATION · 03 DISTRIBUTION · 04 MONETIZATION · 05 AI COSTS) |
| 13 | use-of-funds | "Where the $2M goes." | 5 allocation rows with progress bars + giant "$2M" display |
| 14 | fundraise | "Pre-seed terms." | 4 term cards ($2M · $8M · SAFE · 20%) + 6-point "WHY $8M PRE-MONEY" list |
| 15 | ask | "Every trader deserves context, not just a number." | Large headline + 4 milestone stat cards + footer wordmark |

---

## Interactions & Behavior

### Navigation
- **Arrow keys** ← / → to navigate
- **Click left/right edges** of slide for prev/next
- **Slide counter** in bottom-right of viewport
- **URL hash** persists current slide index for refresh-safety
- **Print** (Cmd/Ctrl+P) emits one page per slide

### Tweaks Panel
Floating panel (bottom-right) with two controls:
- **Accent color** — 4 swatches (green/amber/blue/red); changes `--accent` CSS variable globally
- **Ticker on/off** — toggles top ticker tape

The panel auto-shows when the host enables edit mode (postMessage protocol). Persistence is handled via `__edit_mode_set_keys` posting back to the host so values survive reload.

### Animations
**None.** The deck is static. The ticker is a fake (no real motion). Keep it that way for the implementation — no marquee/scroll/blink that distracts during a pitch.

---

## State Management

Minimal. The deck-stage component owns:
- `index` — current slide number (0-indexed)
- `length` — total slide count

Tweaks state:
- `accent` — hex color string
- `ticker` — `'on' | 'off'`

Speaker notes (currently empty `[]`) are loaded from `<script type="application/json" id="speaker-notes">`.

---

## Implementation Notes

### Recreating in a Production Stack
- **Framework**: React/Next.js, Vue, Svelte all work fine. The slides are pure presentational components.
- **Routing**: One route per slide is overkill for a deck — use a single page with a slide index in the URL hash or query (`?slide=5`).
- **Slide chrome**: extract `Ticker`, `StatusBar`, `Header`, `Slide` (wrapper) into shared components. Each individual slide should be a standalone component that receives `idx` and `total` props.
- **Type families**: Self-host IBM Plex Sans/Mono for production rather than relying on Google Fonts CDN.
- **Print stylesheet**: page size `1920px × 1080px landscape`, one slide per `@page`, no margins.
- **Accessibility**: dark theme contrast is good (ink #e6efe9 on bg #0a0d0c is 16:1). Add focus styles for keyboard nav. Make ticker `aria-hidden` since it's decorative.

### Assets
**No external images, icons, or fonts** beyond Google Fonts (IBM Plex). All visuals — bars, charts, stats, brief mock — are rendered in HTML/CSS/SVG. Photo placeholders on the team slide should be replaced with real headshots.

### Brand wordmark
`before.` set in IBM Plex Sans (regular weight, not bold) at 180px. The period is the green accent color; the rest is `ink`. Track tightly.

---

## Delivery Checklist
- [ ] All 15 slides rendered at 1920×1080
- [ ] Dark mode with terminal green accent
- [ ] IBM Plex Sans + Mono loaded
- [ ] Keyboard navigation (← →) works
- [ ] Slide counter visible
- [ ] Print-to-PDF emits 15 pages, one per slide
- [ ] Tweaks panel (accent + ticker toggle) functional
- [ ] Status bar shows correct section + slide number on every slide
