// before Content Script - DFlow
// Extracts market title and injects inline B4E widget on DFlow prediction markets

function getMarketTitle() {
  // DFlow prediction market pages - try common heading patterns
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
    '[class*="prediction"]',
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
    return ogTitle.content.replace(/\s*[-|]\s*DFlow\s*$/i, '').trim();
  }

  const pageTitle = document.title.replace(/\s*[-|]\s*DFlow\s*$/i, '').trim();
  if (pageTitle && pageTitle.length > 3) {
    return pageTitle;
  }

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 1) {
    const slug = pathParts[pathParts.length - 1];
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
    '[class*="EventTitle"]',
    '[class*="MarketHeader"]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }

  return null;
}

function waitAndInject(attempts = 0) {
  const title = getMarketTitle();
  const anchor = findAnchor();

  if (title && anchor && window.__b4e) {
    window.__b4e.injectB4EWidget(anchor, title, 'dflow');
    return;
  }

  if (attempts < 30) {
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
