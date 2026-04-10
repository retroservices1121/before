// before Content Script - Polymarket
// Extracts market title and injects inline B4E widget

function getMarketTitle() {
  // Try h1 first (regular event pages)
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim().length > 3) {
    return h1.textContent.trim();
  }

  // Try common selectors
  const selectors = [
    '[data-testid="market-title"]',
    '[data-testid="event-title"]',
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
    '[class*="EventTitle"]',
    '[class*="event-title"]',
    '[class*="GameTitle"]',
    '[class*="game-title"]',
    '[class*="MatchTitle"]',
    'h2',
    'h3',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim().length > 3) {
      return el.textContent.trim();
    }
  }

  // og:title is set server-side and works even before React renders
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    return ogTitle.content.replace(/\s*[-|]\s*Polymarket\s*$/i, '').trim();
  }

  // document.title
  const pageTitle = document.title
    .replace(/\s*[-|]\s*Polymarket\s*$/i, '')
    .replace(/\s*[-|]\s*Will\s.*$/, '')
    .trim();
  if (pageTitle && pageTitle.length > 3) {
    return pageTitle;
  }

  // Derive from URL slug (last path segment)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    const slug = pathParts[pathParts.length - 1];
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return null;
}

function getPolymarketSlug() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  // /event/{slug} or /sports/{sport}/{slug}
  return pathParts[pathParts.length - 1] || null;
}

function getMarketUrl() {
  return window.location.href;
}

// Find the best anchor element to inject the widget after
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
    '[class*="market-header"]',
    '[class*="GameTitle"]',
    '[class*="MatchTitle"]',
    'h2',
    'h3',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }

  // Fallback: main content area
  const mainEl = document.querySelector('main') || document.querySelector('[role="main"]');
  if (mainEl) return mainEl;

  return null;
}

// Polymarket market pages:
//   /event/{slug}
//   /sports/{sport}/{slug}
// Skip: /, /markets, /browse, /portfolio, /activity, /sports (listing), /sports/{sport} (category)
function isMarketPage() {
  const path = window.location.pathname;
  // /event/{slug}
  if (/^\/event\/[^/]+/.test(path)) return true;
  // /sports/{sport}/{slug} - needs 3 segments minimum
  if (/^\/sports\/[^/]+\/[^/]+/.test(path)) return true;
  return false;
}

// Wait for DOM to be ready, then inject widget
function waitAndInject(attempts = 0) {
  if (!isMarketPage()) return;

  const title = getMarketTitle();
  const anchor = findAnchor();

  if (title && anchor && window.__b4e) {
    const slug = getPolymarketSlug();
    window.__b4e.injectB4EWidget(anchor, title, 'polymarket', { slug, platform: 'polymarket' });
    return;
  }

  if (attempts < 30) {
    setTimeout(() => waitAndInject(attempts + 1), 500);
  }
}

// Watch for SPA navigation (Polymarket is a React SPA)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // Remove old widget on navigation
    const old = document.getElementById('b4e-inline-widget');
    if (old) old.remove();
    // Re-inject for new page
    setTimeout(() => waitAndInject(), 1000);
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
waitAndInject();

// Listen for messages from the popup (keep backward compat)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMarketInfo') {
    const title = getMarketTitle();
    if (title) {
      sendResponse({ platform: 'polymarket', title, url: getMarketUrl() });
    } else {
      function waitForTitle(cb, att = 0) {
        const t = getMarketTitle();
        if (t || att >= 20) { cb(t); return; }
        setTimeout(() => waitForTitle(cb, att + 1), 250);
      }
      waitForTitle((t) => sendResponse({ platform: 'polymarket', title: t, url: getMarketUrl() }));
    }
    return true;
  }
});
