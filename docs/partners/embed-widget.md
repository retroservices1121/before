# Embed Widget

Add AI-powered intelligence briefs to your prediction market platform with a single line of code. The before embeddable widget works on any website, no backend integration required.

## Quick start

Add this script tag to your page:

```html
<script src="https://b4enews.com/embed.js"></script>
```

That's it. The widget will:

1. Auto-detect the market title from the page (via `<h1>`, `og:title`, or common DOM patterns)
2. Fetch an AI intelligence brief from the before API
3. Render a collapsible widget inline on the page

## What your users see

The widget renders with before branding and includes:

- A collapsible header with the before logo and "Intelligence Brief" label
- Full brief content (summary, key factors with sentiment, historical base rate, upcoming catalysts)
- A usage bar showing remaining free briefs
- "Open in before" link driving traffic to b4enews.com
- "Powered by before" footer

## How users authenticate

Users on your platform get **2 free briefs per day** without any account. When they hit the rate limit, the widget shows an inline sign-in form directly in the widget. Users enter their email, receive a 6-digit code, and verify, all without leaving your page.

Their session is saved in `localStorage`, so they stay signed in on return visits.

## Pricing for your users

Partners embed the widget for free. Your users pay for higher tiers when they want more briefs:

| Tier | Briefs/Day | Price |
|---|---|---|
| Anonymous | 2 | Free |
| Lite | 5 | $4.99/mo |
| Pro | Unlimited | $9.99/mo |

During beta, all users get 2 free briefs/day regardless of tier.

## Attribution

Every signup through your embedded widget is automatically attributed to your platform. The widget detects your domain and passes it as a referral parameter when users sign up.

This attribution data powers rev share conversations. You can see how many users signed up through your platform and at what tier. See [Attribution and Rev Share](attribution.md) for details.

## Example integrations

### Basic (auto-detect everything)

```html
<script src="https://b4enews.com/embed.js"></script>
```

### With a specific injection target

```html
<script
  src="https://b4enews.com/embed.js"
  data-b4e-target="#market-header"
></script>
```

### With a market title override

```html
<script
  src="https://b4enews.com/embed.js"
  data-b4e-title="Will BTC hit 120k by July 2026?"
></script>
```

### Light theme

```html
<script
  src="https://b4enews.com/embed.js"
  data-b4e-theme="light"
></script>
```

### Start collapsed

```html
<script
  src="https://b4enews.com/embed.js"
  data-b4e-collapsed="true"
></script>
```

### Programmatic injection (advanced)

For SPAs or dynamic pages where you need to inject briefs for specific markets:

```javascript
// After embed.js is loaded, the B4E global is available
B4E.inject({
  target: document.getElementById('my-market-container'),
  title: 'Will the Fed cut rates in June 2026?',
  slug: 'fed-cut-rates-june-2026',  // optional
  position: 'after',                 // or 'before'
});
```

This lets you inject multiple briefs on a single page (e.g., a market listing) by calling `B4E.inject()` for each one.

## SPA support

The embed script automatically detects URL changes (via MutationObserver) and re-injects the widget when the user navigates to a new market page. This works with React, Next.js, Vue, and other SPA frameworks out of the box.

## Need help?

Reach out on X at [@b4e](https://x.com/b4e) or email us to discuss integration.
