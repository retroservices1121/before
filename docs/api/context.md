# Context API

The Context API generates AI intelligence briefs for prediction markets.

## Endpoint

```
GET https://b4enews.com/api/context?slug={market-slug}
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `slug` | String | Yes | The market slug (e.g., `fed-holds-rates-june-2026`) |

## Authentication

Include an API key in the `Authorization` header for authenticated access:

```
Authorization: Bearer bk_your_api_key
```

Without authentication, requests are rate-limited as anonymous users.

## Response

```json
{
  "summary": "The Fed is expected to hold rates at the June 2026 meeting...",
  "keyFactors": [
    {
      "name": "Inflation Data",
      "detail": "Core CPI remains above the 2% target at 2.8%",
      "sentiment": "bearish"
    },
    {
      "name": "Labor Market",
      "detail": "Unemployment steady at 3.9%, no urgency to cut",
      "sentiment": "neutral"
    }
  ],
  "historicalBaseRate": "The Fed has held rates at 8 of the last 10 meetings...",
  "upcomingCatalysts": [
    "May CPI report (June 11)",
    "FOMC meeting (June 17-18)",
    "Fed Chair press conference (June 18)"
  ],
  "generatedAt": "2026-04-09T14:30:00.000Z",
  "_usage": {
    "remaining": 1,
    "limit": 2,
    "tier": "anon"
  }
}

```

## Response fields

| Field | Type | Description |
|---|---|---|
| `summary` | String | Why the probability is where it is |
| `keyFactors` | Array | Key factors with `name`, `detail`, and `sentiment` (bullish/bearish/neutral) |
| `historicalBaseRate` | String or null | How similar situations have played out |
| `upcomingCatalysts` | Array of strings | Events that could move the market |
| `generatedAt` | ISO date string | When the brief was generated |
| `_usage` | Object | Remaining briefs, limit, and tier for the current user |

## Rate limiting

| Tier | Briefs/Day |
|---|---|
| Anonymous | 2 |
| Lite ($4.99/mo) | 5 |
| Pro ($9.99/mo) | Unlimited |

During beta, all tiers are limited to 2 briefs/day.

When rate limited, the API returns a `429` status:

```json
{
  "error": "Daily brief limit reached",
  "limit": 2,
  "remaining": 0,
  "tier": "anon",
  "upgrade": "Go Lite for 5 briefs/day at $4.99/mo, or Pro for unlimited at $9.99/mo"
}
```

## Caching

Briefs are cached server-side for 5 minutes. Cached responses include an `X-Cache: HIT` header and do not count against rate limits.

## CORS

The API supports cross-origin requests from any domain (`Access-Control-Allow-Origin: *`).
