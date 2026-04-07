// before Content Script - Polymarket
// Extracts market title from the current Polymarket page
// Polymarket is a React SPA, so DOM may not be ready immediately

function getMarketTitle() {
  // Try h1 first (main market title)
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    return h1.textContent.trim();
  }

  // Try common heading selectors Polymarket uses
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

  // Fallback: og:title meta tag (set server-side, always available)
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    return ogTitle.content.replace(/\s*[-|]\s*Polymarket\s*$/i, '').trim();
  }

  // Fallback: document title
  const pageTitle = document.title
    .replace(/\s*[-|]\s*Polymarket\s*$/i, '')
    .replace(/\s*[-|]\s*Will\s.*$/, '')
    .trim();
  if (pageTitle && pageTitle.length > 3) {
    return pageTitle;
  }

  // Last resort: extract from URL slug
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    // Use the last slug segment, convert hyphens to spaces
    const slug = pathParts[pathParts.length - 1];
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return null;
}

function getMarketUrl() {
  return window.location.href;
}

// Wait for SPA content to render, then respond to messages
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
    // Try immediately first
    const title = getMarketTitle();
    if (title) {
      sendResponse({
        platform: 'polymarket',
        title,
        url: getMarketUrl(),
      });
    } else {
      // SPA might still be rendering — wait and retry
      waitForTitle((resolvedTitle) => {
        sendResponse({
          platform: 'polymarket',
          title: resolvedTitle,
          url: getMarketUrl(),
        });
      });
    }
    return true; // keep message channel open for async response
  }
});
