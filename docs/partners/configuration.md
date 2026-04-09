# Configuration Options

The embed widget is configured via `data-` attributes on the script tag.

## All options

| Attribute | Type | Default | Description |
|---|---|---|---|
| `data-b4e-target` | CSS selector | Auto-detect | Element to inject the widget after (or before). If omitted, the widget auto-detects the market title area. |
| `data-b4e-title` | String | Auto-detect | Override the market title. If omitted, the widget reads it from the page's `<h1>`, `og:title`, or common DOM patterns. |
| `data-b4e-slug` | String | Derived from title | Override the market slug used for the API request. If omitted, it's generated from the title. |
| `data-b4e-theme` | `"dark"` or `"light"` | `"dark"` | Widget color theme. Dark matches most trading interfaces. |
| `data-b4e-collapsed` | `"true"` or `"false"` | `"false"` | Whether the widget starts collapsed. Users can always toggle by clicking the header. |
| `data-b4e-position` | `"after"` or `"before"` | `"after"` | Whether to inject the widget after or before the target element. |
| `data-b4e-platform` | String | Auto-detect from hostname | Platform identifier for attribution. Auto-detected from your domain if omitted. |

## Auto-detection

The widget tries to detect the market title and injection target automatically. It looks for these elements in order:

**Title detection:**
1. `<h1>` text content
2. `[data-testid="market-title"]`
3. `[class*="MarketTitle"]` or `[class*="market-title"]`
4. `[class*="EventTitle"]` or `[class*="event-title"]`
5. `<h2>` text content
6. `<meta property="og:title">` content
7. `document.title`

**Target detection (injection point):**
1. `<h1>` element
2. `[data-testid="market-title"]`
3. `[class*="MarketTitle"]` or `[class*="MarketHeader"]`

If auto-detection doesn't find the right element on your platform, use `data-b4e-target` with a CSS selector that points to the correct container.

## Theme colors

### Dark theme (default)
- Background: `#0a0a0a`
- Surface: `#111111`
- Accent: `#00e59f`
- Text: `#e5e5e5`

### Light theme
- Background: `#ffffff`
- Surface: `#f5f5f5`
- Accent: `#059669`
- Text: `#171717`

## Multiple widgets on one page

Use the `B4E.inject()` API to add briefs for multiple markets on a single page:

```javascript
document.querySelectorAll('.market-card').forEach(function(card) {
  B4E.inject({
    target: card,
    title: card.getAttribute('data-market-title'),
  });
});
```

Each widget gets a unique ID based on the market slug, so duplicates are prevented automatically.
