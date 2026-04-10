// before Content Script - Kalshi
// Extracts market title and injects inline B4E widget on Kalshi
// URL patterns:
//   /markets/{series}/{event}/{ticker}
//   /markets/{series}/{event}
//   /events/{event}

function getKalshiTicker() {
  // Extract ticker from URL: /markets/kxpgatour/pga-tour/kxpgatour-mast26
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'markets' && pathParts.length >= 3) {
    return pathParts[pathParts.length - 1]; // last segment is the ticker
  }
  if (pathParts[0] === 'events' && pathParts.length >= 2) {
    return pathParts[1];
  }
  return null;
}

function getMarketTitle() {
  // Try h1 first
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim().length > 3) {
    return h1.textContent.trim();
  }

  // Broader selectors - Kalshi uses various class patterns
  const selectors = [
    '[data-testid="market-title"]',
    '[data-testid="event-title"]',
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
    '[class*="EventTitle"]',
    '[class*="event-title"]',
    '[class*="ContractTitle"]',
    '[class*="contract-title"]',
    'h2',
    'h3',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim().length > 3) {
      return el.textContent.trim();
    }
  }

  // Try main content headings
  const candidates = document.querySelectorAll('main h1, main h2, main h3, [role="main"] h1, [role="main"] h2');
  for (const el of candidates) {
    if (el.textContent.trim().length > 3) {
      return el.textContent.trim();
    }
  }

  // Try og:title meta tag (set server-side, available before React renders)
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    return ogTitle.content.replace(/\s*[-|]\s*Kalshi\s*$/i, '').trim();
  }

  // Try document title
  const pageTitle = document.title.replace(/\s*[-|]\s*Kalshi\s*$/i, '').trim();
  if (pageTitle && pageTitle.length > 3) {
    return pageTitle;
  }

  // Fallback: derive from URL path segments
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  // Use the event segment (e.g., "pga-tour") which is more readable than the ticker
  if (pathParts.length >= 3 && pathParts[0] === 'markets') {
    const eventSlug = pathParts[2]; // "pga-tour"
    return eventSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (pathParts.length >= 2) {
    const slug = pathParts[pathParts.length - 1];
    return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return null;
}

function getMarketUrl() {
  return window.location.href;
}

function findAnchor() {
  const h1 = document.querySelector('h1');
  if (h1) return h1;

  const selectors = [
    '[data-testid="market-title"]',
    '[data-testid="event-title"]',
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
    '[class*="EventTitle"]',
    '[class*="MarketHeader"]',
    '[class*="EventHeader"]',
    'h2',
    'h3',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }

  // Try main content area
  const candidates = document.querySelectorAll('main h1, main h2, main h3, [role="main"] h1');
  for (const el of candidates) {
    return el;
  }

  const mainEl = document.querySelector('main') || document.querySelector('[role="main"]');
  if (mainEl) return mainEl;

  return null;
}

function waitAndInject(attempts = 0) {
  const title = getMarketTitle();
  const anchor = findAnchor();

  if (title && anchor && window.__b4e) {
    // Pass the Kalshi ticker as extra context for better market matching
    const ticker = getKalshiTicker();
    window.__b4e.injectB4EWidget(anchor, title, 'kalshi', { ticker, platform: 'kalshi' });
    return;
  }

  // Kalshi is a React SPA, give it more time (up to 30s)
  if (attempts < 60) {
    setTimeout(() => waitAndInject(attempts + 1), 500);
  }
}

// Watch for SPA navigation
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    const old = document.getElementById('b4e-inline-widget');
    if (old) old.remove();
    setTimeout(() => waitAndInject(), 1000);
  }
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}

waitAndInject();

// Popup backward compat
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMarketInfo') {
    const title = getMarketTitle();
    if (title) {
      sendResponse({ platform: 'kalshi', title, url: getMarketUrl(), ticker: getKalshiTicker() });
    } else {
      function waitForTitle(cb, att = 0) {
        const t = getMarketTitle();
        if (t || att >= 20) { cb(t); return; }
        setTimeout(() => waitForTitle(cb, att + 1), 250);
      }
      waitForTitle((t) => sendResponse({ platform: 'kalshi', title: t, url: getMarketUrl(), ticker: getKalshiTicker() }));
    }
    return true;
  }
});
