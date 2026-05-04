# before — Base Mini App

AI intelligence briefs for prediction markets, running as a mini app inside Base App and Farcaster clients.

## How it works

1. User opens the before mini app in Base App
2. Browses trending prediction markets
3. Buys a USDC credit pack (10 for $0.99, 50 for $3.99) on Base
4. Taps a market, spends 1 credit to generate a brief
5. Reads the AI intelligence brief (factors, catalysts, base rate)
6. Taps "Trade this market" to deep-link into Limitless or other prediction market mini apps

## Payment

Briefs are paid in credits. Credit packs are purchased once with USDC on Base mainnet (10 credits for $0.99, 50 for $3.99). 1 credit = 1 brief. No subscription, no API key, no signup. The wallet is already connected in the mini app context.

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
- Checks the wallet's credit balance and deducts 1 credit per brief
- Forwards to the main B4E API with an admin key (bypasses rate limits)
- Returns the brief only after a credit is successfully deducted

Credit purchases hit `/api/credits`, which verifies the on-chain USDC transfer to the configured `EVM_ADDRESS` before adding credits to the wallet's balance.

```
User → Mini App → spend 1 credit → /api/context → B4E API → Brief
         │                                           ↓
         └─ buy pack (USDC on Base) → /api/credits   Deep link to trade
                                                     (Limitless, etc.)
```
