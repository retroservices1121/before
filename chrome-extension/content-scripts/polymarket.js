// before Content Script - Polymarket
// Extracts market title and injects inline B4E widget

function getMarketTitle() {
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    return h1.textContent.trim();
  }

  const selectors = [
    '[data-testid="market-title"]',
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
    '[class*="EventTitle"]',
    '[class*="event-title"]',
    'h2',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    return ogTitle.content.replace(/\s*[-|]\s*Polymarket\s*$/i, '').trim();
  }

  const pageTitle = document.title
    .replace(/\s*[-|]\s*Polymarket\s*$/i, '')
    .replace(/\s*[-|]\s*Will\s.*$/, '')
    .trim();
  if (pageTitle && pageTitle.length > 3) {
    return pageTitle;
  }

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    const slug = pathParts[pathParts.length - 1];
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return null;
}

function getMarketUrl() {
  return window.location.href;
}

// Find the best anchor element to inject the widget after
function findAnchor() {
  // Try after the market title h1
  const h1 = document.querySelector('h1');
  if (h1) return h1;

  // Try after the market header area
  const selectors = [
    '[data-testid="market-title"]',
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
    '[class*="EventTitle"]',
    '[class*="MarketHeader"]',
    '[class*="market-header"]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }

  return null;
}

// Polymarket market pages: /event/{slug} with a slug segment
// Skip: /, /markets, /browse, /portfolio, /activity, etc.
function isMarketPage() {
  return /^\/event\/[^/]+/i.test(window.location.pathname);
}

// Wait for DOM to be ready, then inject widget
function waitAndInject(attempts = 0) {
  if (!isMarketPage()) return;

  const title = getMarketTitle();
  const anchor = findAnchor();

  if (title && anchor && window.__b4e) {
    window.__b4e.injectB4EWidget(anchor, title, 'polymarket');
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
