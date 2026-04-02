# CLAUDE.md - B4E App

## Project Overview
B4E is an AI-powered context engine for prediction markets. It auto-generates real-time intelligence briefs for markets on Polymarket and Limitless, showing users WHY a probability is where it is, what factors are driving it, and what to watch next.

## Architecture
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom B4E theme (dark, terminal-aesthetic)
- **Data**: Spredd API for aggregated market data from Polymarket + Limitless
- **Web Intelligence**: TinyFish Web Agent API for real-time news crawling
- **Crypto Data**: Tokens API (tokens.xyz) for live price, OHLCV, and risk data on crypto markets
- **AI Synthesis**: Google Gemini API for context brief generation
- **Deploy**: Railway with GitHub auto-deploys

## Data Pipeline
1. Spredd API provides market data (odds, volume, price history)
2. TinyFish Web Agent crawls relevant news/data for each market
3. Tokens API enriches crypto markets with live price/OHLCV/risk data (optional)
4. Gemini synthesizes all data sources into structured briefs
5. Briefs are cached and served to the frontend

## Key Files
- `src/lib/spredd.ts` - Spredd API client (market data)
- `src/lib/tinyfish.ts` - TinyFish Web Agent client (web crawling)
- `src/lib/tokens.ts` - Tokens API client (crypto market enrichment)
- `src/lib/ai.ts` - Gemini API integration (brief generation)
- `src/lib/types.ts` - TypeScript types for markets and briefs
- `src/lib/utils.ts` - Formatting and utility functions
- `src/app/page.tsx` - Homepage (trending markets feed)
- `src/app/market/[slug]/page.tsx` - Market detail page with AI brief
- `src/components/MarketCard.tsx` - Market card for the feed
- `src/components/ContextBrief.tsx` - AI context brief display

## Environment Variables
- `SPREDD_API_URL` - Spredd API base URL
- `SPREDD_API_KEY` - Spredd API key
- `TINYFISH_API_URL` - TinyFish API base URL
- `TINYFISH_API_KEY` - TinyFish API key
- `GEMINI_API_KEY` - Google Gemini API key
- `GEMINI_MODEL` - Gemini model name (default: gemini-2.0-flash)
- `TOKENS_API_URL` - Tokens API base URL (optional, for crypto enrichment)
- `TOKENS_API_KEY` - Tokens API key (optional)

## Dev Notes
- Mock data is built into `src/lib/spredd.ts` for development without API access
- The AI brief generator falls back gracefully when TinyFish or Claude APIs are unavailable
- Market slugs are used for routing (e.g., `/market/fed-holds-rates-june-2026`)
- The context API endpoint at `/api/context?slug=xxx` can be used for client-side brief fetching
- ISR is set to 60s on the homepage, market detail pages are dynamic

## Writing Style Rules
- Never use em dashes
- Avoid ". But" sentence fragments; use a comma before "but"
- Avoid ". And" sentence fragments; use a comma before "and"
- Tone should be punchy, analyst-grade, not chatbot-y

## Brand
- X handle: @b4e
- Tagline: "Know before it matters"
- Theme: Dark terminal aesthetic, green (#00e59f) accent
- Fonts: JetBrains Mono (mono), Instrument Serif (display), DM Sans (body)

## Next Steps
- [ ] Wire Spredd API endpoints to real data
- [ ] Get TinyFish accelerator API credits and test web crawling
- [ ] Add category filtering on homepage
- [ ] Add market search functionality
- [ ] Build onboarding chat agent (phase 2)
- [ ] Build discovery recommendation engine (phase 3)
