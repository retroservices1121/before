// before Content Script - Limitless
// Extracts market title from the current Limitless page
// Limitless is also a SPA, so DOM may not be ready immediately

function getMarketTitle() {
  // Try h1 first
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    return h1.textContent.trim();
  }

  // Try common heading selectors
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

  // Fallback: og:title meta tag
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    return ogTitle.content.replace(/\s*[-|]\s*Limitless\s*$/i, '').trim();
  }

  // Fallback: document title
  const pageTitle = document.title.replace(/\s*[-|]\s*Limitless\s*$/i, '').trim();
  if (pageTitle && pageTitle.length > 3) {
    return pageTitle;
  }

  // Last resort: extract from URL slug
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

function waitForTitle(callback, attempts = 0) {
  const title = getMarketTitle();
  if (title || attempts >= 20) {
    callback(title);
    return;
  }
  setTimeout(() => waitForTitle(callback, attempts + 1), 250);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMarketInfo') {
    const title = getMarketTitle();
    if (title) {
      sendResponse({
        platform: 'limitless',
        title,
        url: getMarketUrl(),
      });
    } else {
      waitForTitle((resolvedTitle) => {
        sendResponse({
          platform: 'limitless',
          title: resolvedTitle,
          url: getMarketUrl(),
        });
      });
    }
    return true;
  }
});
