# Supported Platforms

before generates intelligence briefs for prediction markets across multiple platforms. The underlying market data comes from Polymarket, Limitless, and Kalshi via the Spredd API.

## Primary platforms

| Platform | URL | Market Types |
|---|---|---|
| **Polymarket** | polymarket.com | Crypto, politics, sports, culture, science |
| **Limitless** | limitless.exchange | Crypto, politics, events |
| **Kalshi** | kalshi.com | Economics, weather, politics, finance |

## Aggregators and derivative platforms

These platforms surface markets from the primary platforms. Since the underlying market data is the same, before briefs work seamlessly.

| Platform | URL | Sources | Notes |
|---|---|---|---|
| **DFlow** | dflow.net | Kalshi (tokenized on Solana) | Prediction markets API |
| **Matchr** | matchr.xyz | Polymarket, Kalshi | Cross-platform aggregator |
| **Polynance** | polynance.ag | Polymarket | Aggregator |
| **MetaMask** | metamask.io/prediction-markets | Polymarket | Wallet-native trading |

## Chrome extension coverage

The Chrome extension automatically injects the before widget on all platforms listed above. When you navigate to a market page on any supported site, the widget appears inline.

## Embed widget coverage

The embeddable widget works on any website, regardless of platform. It auto-detects market titles from the page DOM. If your platform isn't listed above, the widget will still work as long as the market title matches a known market in the before database.

## Adding a new platform

If you're building a prediction market frontend and want before support:

1. **Chrome extension** - We add a content script for your domain (lightweight, typically a few hours of work)
2. **Embed widget** - You drop a single `<script>` tag on your site (instant, no work from our side)

Reach out on X at [@b4e](https://x.com/b4e) to discuss integration.
