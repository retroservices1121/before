# Chrome Extension

The before Chrome extension injects AI intelligence briefs directly into prediction market pages. No tab switching, no copy-pasting. The context is right where you trade.

## Installation

1. Install the before extension from the Chrome Web Store *(coming soon)*
2. Navigate to any supported prediction market page
3. The before widget appears inline on the page with an intelligence brief

## Supported platforms

The extension works on:

- **Polymarket** (polymarket.com)
- **Limitless** (limitless.exchange)
- **Kalshi** (kalshi.com)
- **DFlow** (dflow.net)
- **Matchr** (matchr.xyz)
- **Polynance** (polynance.ag)
- **MetaMask Prediction Markets** (metamask.io/prediction-markets)

## Inline widget

When you visit a market page on any supported platform, the extension automatically:

1. Detects the market from the page
2. Fetches an AI intelligence brief from the before API
3. Injects a collapsible widget inline on the page, near the market title

The widget shows the full brief (summary, key factors, catalysts) and can be collapsed or expanded by clicking the header.

## Signing in

Click the extension icon to open the popup. Click "Sign in" in the header to authenticate with your email. Once signed in, your session is stored and all brief requests use your account (higher rate limits when available).

## Popup

Clicking the extension icon also shows a popup with the brief for the current market. This works as a quick-access alternative to the inline widget.

## Rate limits

During beta, all users get **2 free briefs per day**. Cached briefs don't count against your limit.
