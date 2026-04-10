// before Content Script - Limitless
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
    return ogTitle.content.replace(/\s*[-|]\s*Limitless\s*$/i, '').trim();
  }

  const pageTitle = document.title.replace(/\s*[-|]\s*Limitless\s*$/i, '').trim();
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
  // Limitless uses Chakra UI - find the trade card by looking for
  // the "Set to 1 USDC" button or trade-related elements
  const buttons = document.querySelectorAll('button.chakra-button');
  for (const btn of buttons) {
    const text = btn.textContent || '';
    if (text.includes('USDC') || text.includes('Buy') || text.includes('Sell')) {
      // Walk up to find the trade card container
      let parent = btn.parentElement;
      for (let i = 0; i < 6 && parent; i++) {
        // Look for a container that has the trade form elements
        if (parent.querySelector('[class*="chakra-stack"]') && parent.children.length >= 2) {
          return parent;
        }
        parent = parent.parentElement;
      }
    }
  }

  // Fallback to h1
  const h1 = document.querySelector('h1');
  if (h1) return h1;

  const selectors = [
    '[data-testid="market-title"]',
    '[class*="MarketTitle"]',
    '[class*="market-title"]',
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
    window.__b4e.injectB4EWidget(anchor, title, 'limitless');
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
observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
waitAndInject();

// Listen for messages from the popup (backward compat)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMarketInfo') {
    const title = getMarketTitle();
    if (title) {
      sendResponse({ platform: 'limitless', title, url: getMarketUrl() });
    } else {
      function waitForTitle(cb, att = 0) {
        const t = getMarketTitle();
        if (t || att >= 20) { cb(t); return; }
        setTimeout(() => waitForTitle(cb, att + 1), 250);
      }
      waitForTitle((t) => sendResponse({ platform: 'limitless', title: t, url: getMarketUrl() }));
    }
    return true;
  }
});
