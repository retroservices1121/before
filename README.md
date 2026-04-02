# B4E — Know Before It Matters

AI-powered context engine for prediction markets. B4E auto-generates real-time intelligence briefs for markets on Polymarket and Limitless, showing you WHY a probability is where it is and what to watch next.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (custom dark theme)
- **Spredd API** (aggregated market data)
- **TinyFish Web Agent** (real-time web intelligence)
- **Tokens API** (live crypto price, OHLCV, and risk data)
- **Google Gemini** (context brief synthesis)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and add your keys
cp .env.example .env

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs with mock market data out of the box. Add your API keys to `.env` to connect live data.

## Deploy to Railway

1. Push to GitHub
2. Connect repo in Railway
3. Set environment variables in Railway dashboard
4. Railway auto-detects Next.js and deploys

The `start` script uses `PORT` env var which Railway sets automatically.

## Environment Variables

| Variable | Description |
|---|---|
| `SPREDD_API_URL` | Spredd API base URL |
| `SPREDD_API_KEY` | Spredd API key |
| `TINYFISH_API_URL` | TinyFish Web Agent API URL |
| `TINYFISH_API_KEY` | TinyFish API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model (default: gemini-2.0-flash) |
| `TOKENS_API_URL` | Tokens API URL (optional, default: https://api.tokens.xyz) |
| `TOKENS_API_KEY` | Tokens API key (optional, for crypto enrichment) |

## License

Proprietary. All rights reserved.
