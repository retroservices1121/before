# before — Base Mini App

AI intelligence briefs for prediction markets, running as a mini app inside Base App and Farcaster clients.

## How it works

1. User opens the before mini app in Base App
2. Browses trending prediction markets
3. Taps a market, pays $0.50 USDC via x402 to generate a brief
4. Reads the AI intelligence brief (factors, catalysts, base rate)
5. Taps "Trade this market" to deep-link into Limitless or other prediction market mini apps

## Payment

Briefs are paid per-request via x402 micropayments in USDC on Base. No subscription, no API key, no signup. The wallet is already connected in the mini app context.

## Setup

```bash
cd mini-app
npm install
cp .env.example .env.local
# Fill in your env vars
npm run dev
```

## Deploy

1. Deploy to Vercel
2. Run the Base Build account association tool with your domain
3. Copy the `accountAssociation` credentials into `minikit.config.ts`
4. Push to production
5. Validate at base.dev/preview
6. Create a post in Base App with your app URL to publish

## Architecture

The mini app proxies brief requests through its own `/api/context` endpoint, which:
- Wraps the request with x402 payment requirement ($0.50 USDC per brief)
- Forwards to the main B4E API with an admin key (bypasses rate limits)
- Returns the brief only after payment is confirmed

```
User → Mini App → x402 payment → /api/context → B4E API → Brief
                                                     ↓
                                              Deep link to trade
                                              (Limitless, etc.)
```
