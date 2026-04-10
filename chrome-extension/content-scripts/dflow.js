// before Content Script - DFlow
// Extracts market title and injects inline B4E widget on DFlow prediction markets
// URL pattern: dflow.net/prediction/{TICKER}

function isMarketPage() {
  // Must have a ticker segment after /prediction/ (e.g., /prediction/KXPGATOUR-MAST26)
  // Exclude category pages like /prediction or /prediction/
  const ticker = getTickerFromUrl();
  return ticker !== null && ticker.length > 0;
}

function getTickerFromUrl() {
  const match = window.location.pathname.match(/\/prediction\/([A-Za-z0-9][\w-]+)/);
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

  // Do NOT fall back to the ticker as a title - it produces meaningless
  // strings like "Kxpresnomr 28" that match the wrong market in search.
  // Return null so waitAndInject keeps retrying until the real title renders.
  return null;
}

function getMarketUrl() {
  return window.location.href;
}

function findAnchor() {
  // DFlow: find the buy/sell card by looking for its distinctive button
  const tradeBtns = document.querySelectorAll('button.bg-grey-700, button[class*="bg-green"], button[class*="bg-red"], button[class*="rounded-2xl"]');
  for (const btn of tradeBtns) {
    // Walk up to find the card container
    let container = btn.closest('[class*="rounded"]');
    if (container && container !== btn) return container;
    // Try parent with mt-3 or similar card wrapper
    let parent = btn.parentElement;
    for (let i = 0; i < 5 && parent; i++) {
      if (parent.children.length >= 2 || parent.classList.contains('mt-3')) {
        return parent;
      }
      parent = parent.parentElement;
    }
  }

  // Try h1 as fallback
  const h1 = document.querySelector('h1');
  if (h1) return h1;

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

  const mainEl = document.querySelector('main') || document.querySelector('[role="main"]');
  if (mainEl) return mainEl;

  return null;
}

function waitAndInject(attempts = 0) {
  // Only inject on prediction market pages
  if (!isMarketPage()) return;

  const title = getMarketTitle();

  if (title && window.__b4e) {
    // DFlow tokenizes Kalshi markets, so pass the ticker with platform 'kalshi'
    const ticker = getTickerFromUrl();
    window.__b4e.injectB4EWidget(anchor, title, 'dflow', { ticker, platform: 'kalshi' });
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
