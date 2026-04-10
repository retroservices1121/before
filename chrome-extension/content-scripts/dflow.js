// before Content Script - DFlow
// Extracts market title and injects inline B4E widget on DFlow prediction markets
// URL pattern: dflow.net/prediction/{TICKER}

function isMarketPage() {
  return /^\/prediction\//i.test(window.location.pathname);
}

function getTickerFromUrl() {
  const match = window.location.pathname.match(/\/prediction\/([^/?#]+)/i);
  return match ? match[1] : null;
}

function getMarketTitle() {
  // Try h1 first
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim().length > 3) {
    return h1.textContent.trim();
  }

  // Try common heading patterns
  const selectors = [
    '[data-testid="market-title"]',
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
    '[class*="EventTitle"]',
    '[class*="event-title"]',
    '[class*="prediction"]',
    'h2',
    'h3',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim().length > 3) {
      return el.textContent.trim();
    }
  }

  // Try the largest text element in the main content area
  const candidates = document.querySelectorAll('main h1, main h2, main h3, [role="main"] h1, [role="main"] h2');
  for (const el of candidates) {
    if (el.textContent.trim().length > 3) {
      return el.textContent.trim();
    }
  }

  // Try og:title meta tag
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    return ogTitle.content.replace(/\s*[-|]\s*DFlow\s*$/i, '').trim();
  }

  // Try document title
  const pageTitle = document.title.replace(/\s*[-|]\s*DFlow\s*$/i, '').trim();
  if (pageTitle && pageTitle.length > 3) {
    return pageTitle;
  }

  // Last resort: convert ticker from URL to readable title
  const ticker = getTickerFromUrl();
  if (ticker) {
    // KXPRESPERSON-28 -> "2028 Presidential Election Winner" (Kalshi convention)
    return ticker.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return null;
}

function getMarketUrl() {
  return window.location.href;
}

function findAnchor() {
  // Try h1 first
  const h1 = document.querySelector('h1');
  if (h1) return h1;

  // Try heading patterns
  const selectors = [
    '[data-testid="market-title"]',
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
    '[class*="EventTitle"]',
    '[class*="MarketHeader"]',
    'h2',
    'h3',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }

  // Try main content headings
  const candidates = document.querySelectorAll('main h1, main h2, main h3, [role="main"] h1, [role="main"] h2');
  for (const el of candidates) {
    return el;
  }

  // Fallback: first substantial text block in main or body
  const mainEl = document.querySelector('main') || document.querySelector('[role="main"]');
  if (mainEl) return mainEl;

  return null;
}

function waitAndInject(attempts = 0) {
  // Only inject on prediction market pages
  if (!isMarketPage()) return;

  const title = getMarketTitle();
  const anchor = findAnchor();

  if (title && anchor && window.__b4e) {
    window.__b4e.injectB4EWidget(anchor, title, 'dflow');
    return;
  }

  // DFlow is a heavy React SPA, give it more time to render (up to 30s)
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

// Initial injection
waitAndInject();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMarketInfo') {
    if (!isMarketPage()) {
      sendResponse(null);
      return;
    }

    const title = getMarketTitle();
    if (title) {
      sendResponse({ platform: 'dflow', title, url: getMarketUrl() });
    } else {
      function waitForTitle(cb, att = 0) {
        const t = getMarketTitle();
        if (t || att >= 20) { cb(t); return; }
        setTimeout(() => waitForTitle(cb, att + 1), 250);
      }
      waitForTitle((t) => sendResponse({ platform: 'dflow', title: t, url: getMarketUrl() }));
    }
    return true;
  }
});
