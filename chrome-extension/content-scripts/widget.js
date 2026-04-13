// before - Inline Widget
// Shared module injected by platform content scripts
// Renders a collapsible B4E intelligence brief inline on any prediction market page

const B4E_API = 'https://before-production.up.railway.app';

const WIDGET_STYLES = `
  /* Theme variables — overridden by .b4e-light */
  .b4e-widget {
    --b4e-bg: #0a0a0a;
    --b4e-surface: #111111;
    --b4e-border: #1e1e1e;
    --b4e-accent: #00e59f;
    --b4e-text: #e5e5e5;
    --b4e-dim: #a3a3a3;
    --b4e-muted: #525252;
    --b4e-warm: #ff6b6b;
    --b4e-amber: #f59e0b;
    --b4e-hover: #161616;
    --b4e-nudge-bg: #0d0d0d;
  }

  .b4e-widget.b4e-light {
    --b4e-bg: #ffffff;
    --b4e-surface: #f5f5f5;
    --b4e-border: #e5e5e5;
    --b4e-accent: #059669;
    --b4e-text: #171717;
    --b4e-dim: #525252;
    --b4e-muted: #a3a3a3;
    --b4e-warm: #dc2626;
    --b4e-amber: #d97706;
    --b4e-hover: #ebebeb;
    --b4e-nudge-bg: #fafafa;
  }

  .b4e-widget {
    font-family: -apple-system, 'DM Sans', sans-serif;
    background: var(--b4e-bg);
    border: 1px solid var(--b4e-border);
    border-radius: 12px;
    margin: 16px 0;
    overflow: visible;
    color: var(--b4e-text);
    font-size: 13px;
    line-height: 1.6;
    box-shadow: 0 0 20px rgba(0, 229, 159, 0.05);
    max-width: 100%;
    touch-action: auto;
  }

  .b4e-widget * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .b4e-widget, .b4e-widget * {
    overscroll-behavior: auto;
    transform: none !important;
    zoom: 1 !important;
  }

  /* Header bar - always visible */
  .b4e-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--b4e-surface);
    border-bottom: 1px solid var(--b4e-border);
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
  }

  .b4e-header:hover {
    background: var(--b4e-hover);
  }

  .b4e-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .b4e-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--b4e-accent);
    animation: b4ePulse 2s ease-in-out infinite;
    box-shadow: 0 0 6px rgba(0, 229, 159, 0.5);
  }

  @keyframes b4ePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .b4e-logo {
    font-family: Georgia, 'Instrument Serif', serif;
    font-style: italic;
    font-size: 14px;
    color: var(--b4e-accent);
    letter-spacing: 2px;
  }

  .b4e-tagline {
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--b4e-muted);
  }

  .b4e-toggle {
    font-family: monospace;
    font-size: 10px;
    color: var(--b4e-muted);
    transition: transform 0.3s;
  }

  .b4e-toggle.open {
    transform: rotate(180deg);
  }

  /* Body - collapsible */
  .b4e-body {
    display: none;
  }

  .b4e-body.open {
    display: block;
  }

  .b4e-inner {
    padding: 14px;
  }

  /* Loading state */
  .b4e-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 14px;
  }

  .b4e-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--b4e-border);
    border-top-color: var(--b4e-accent);
    border-radius: 50%;
    animation: b4eSpin 0.8s linear infinite;
  }

  @keyframes b4eSpin {
    to { transform: rotate(360deg); }
  }

  .b4e-loading-text {
    font-family: monospace;
    font-size: 11px;
    color: var(--b4e-muted);
    letter-spacing: 0.5px;
  }

  /* Error state */
  .b4e-error {
    padding: 16px 14px;
    text-align: center;
  }

  .b4e-error-text {
    font-family: monospace;
    font-size: 11px;
    color: var(--b4e-muted);
  }

  .b4e-retry {
    background: rgba(0, 229, 159, 0.1);
    border: 1px solid rgba(0, 229, 159, 0.25);
    color: var(--b4e-accent);
    font-family: monospace;
    font-size: 10px;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 8px;
    letter-spacing: 0.5px;
  }

  .b4e-retry:hover {
    background: rgba(0, 229, 159, 0.2);
  }

  /* Section labels */
  .b4e-label {
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--b4e-muted);
    margin-bottom: 6px;
  }

  /* Summary */
  .b4e-summary {
    font-size: 13px;
    line-height: 1.7;
    color: var(--b4e-dim);
    margin-bottom: 14px;
  }

  /* Divider */
  .b4e-divider {
    border: none;
    border-top: 1px solid var(--b4e-border);
    margin: 12px 0;
  }

  /* Factors */
  .b4e-factor {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 5px 0;
  }

  .b4e-factor-name {
    font-family: monospace;
    font-size: 11px;
    color: var(--b4e-dim);
  }

  .b4e-factor-detail {
    font-size: 11px;
    color: var(--b4e-muted);
    margin-top: 2px;
    line-height: 1.5;
  }

  .b4e-sentiment {
    font-family: monospace;
    font-size: 10px;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .b4e-sentiment.bullish { color: var(--b4e-accent); }
  .b4e-sentiment.bearish { color: var(--b4e-warm); }
  .b4e-sentiment.neutral { color: var(--b4e-amber); }
  .b4e-sentiment.pending { color: var(--b4e-muted); }

  /* Catalysts */
  .b4e-catalyst {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 3px 0;
  }

  .b4e-catalyst-arrow {
    font-family: monospace;
    color: var(--b4e-accent);
    font-size: 11px;
    margin-top: 1px;
    flex-shrink: 0;
  }

  .b4e-catalyst-text {
    font-size: 12px;
    color: var(--b4e-dim);
    line-height: 1.5;
  }

  /* Base rate */
  .b4e-baserate {
    font-size: 12px;
    color: var(--b4e-dim);
    line-height: 1.6;
  }

  /* Footer */
  .b4e-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-top: 1px solid var(--b4e-border);
    background: var(--b4e-surface);
  }

  .b4e-time {
    font-family: monospace;
    font-size: 9px;
    color: var(--b4e-muted);
  }

  .b4e-link {
    font-family: monospace;
    font-size: 10px;
    color: var(--b4e-accent);
    text-decoration: none;
    letter-spacing: 0.5px;
  }

  .b4e-link:hover {
    text-decoration: underline;
  }

  .b4e-refresh {
    background: none;
    border: none;
    color: var(--b4e-muted);
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.2s;
  }

  .b4e-refresh:hover {
    color: var(--b4e-accent);
  }

  .b4e-share {
    background: none;
    border: none;
    color: var(--b4e-muted);
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.2s;
  }

  .b4e-share:hover {
    color: var(--b4e-accent);
  }

  .b4e-share-toast {
    position: absolute;
    bottom: 40px;
    right: 14px;
    background: var(--b4e-accent);
    color: var(--b4e-bg);
    font-family: monospace;
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .b4e-share-toast.show {
    opacity: 1;
  }

  /* Rate limit */
  .b4e-ratelimit {
    padding: 16px 14px;
    text-align: center;
  }

  .b4e-ratelimit-text {
    font-family: monospace;
    font-size: 11px;
    color: var(--b4e-amber);
    margin-bottom: 8px;
  }

  .b4e-upgrade {
    display: inline-block;
    background: rgba(0, 229, 159, 0.1);
    border: 1px solid rgba(0, 229, 159, 0.25);
    color: var(--b4e-accent);
    font-family: monospace;
    font-size: 10px;
    padding: 5px 14px;
    border-radius: 4px;
    text-decoration: none;
    letter-spacing: 0.5px;
  }

  .b4e-upgrade:hover {
    background: rgba(0, 229, 159, 0.2);
  }

  /* Usage nudge bar */
  .b4e-nudge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 14px;
    border-top: 1px solid var(--b4e-border);
    background: var(--b4e-nudge-bg);
    font-family: monospace;
    font-size: 10px;
    letter-spacing: 0.5px;
  }

  .b4e-nudge-count {
    color: var(--b4e-muted);
  }

  .b4e-nudge-warn {
    color: var(--b4e-amber);
  }

  .b4e-nudge-link {
    color: var(--b4e-accent);
    text-decoration: none;
  }

  .b4e-nudge-link:hover {
    text-decoration: underline;
  }
`;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Detect if the page uses a light theme by checking background luminance
function isPageLight() {
  const el = document.body;
  const bg = window.getComputedStyle(el).backgroundColor;
  const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return false;
  // Relative luminance formula
  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5;
}

// Inject styles once
function injectStyles() {
  if (document.getElementById('b4e-widget-styles')) return;
  const style = document.createElement('style');
  style.id = 'b4e-widget-styles';
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
}

// Create the widget as a fixed-position overlay panel
// Uses Shadow DOM on a body-level element to avoid host page layout/scroll issues
function createWidget() {
  // The host sits directly on document.body, position fixed
  const host = document.createElement('div');
  host.id = 'b4e-inline-widget';
  host.style.cssText = 'position: fixed; bottom: 16px; right: 16px; z-index: 2147483647; width: 380px; max-height: 80vh;';

  const shadow = host.attachShadow({ mode: 'open' });

  const themeClass = isPageLight() ? 'b4e-widget b4e-light' : 'b4e-widget';

  shadow.innerHTML = `
    <style>
      ${WIDGET_STYLES}
      .b4e-widget {
        margin: 0;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(0,229,159,0.08);
      }
      .b4e-body.open {
        display: block;
        overflow-y: auto;
        max-height: calc(80vh - 80px);
      }
      @media (max-width: 480px) {
        .b4e-widget {
          border-radius: 12px 12px 0 0;
        }
      }
    </style>
    <div class="${themeClass}">
      <div class="b4e-header">
        <div class="b4e-header-left">
          <span class="b4e-pulse"></span>
          <span class="b4e-logo">before</span>
          <span class="b4e-tagline">Intelligence Brief</span>
        </div>
        <span class="b4e-toggle" style="cursor:pointer;">✕</span>
      </div>
      <div class="b4e-body">
        <div class="b4e-loading">
          <div class="b4e-spinner"></div>
          <span class="b4e-loading-text">Generating context brief...</span>
        </div>
      </div>
    </div>
  `;

  const header = shadow.querySelector('.b4e-header');
  const body = shadow.querySelector('.b4e-body');
  const toggle = shadow.querySelector('.b4e-toggle');

  // Close/minimize the panel
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (body.classList.contains('open')) {
      body.classList.remove('open');
      toggle.textContent = '▲';
    } else {
      body.classList.add('open');
      toggle.textContent = '✕';
    }
  });

  // Clicking header (not toggle) also toggles
  header.addEventListener('click', () => {
    if (body.classList.contains('open')) {
      body.classList.remove('open');
      toggle.textContent = '▲';
    } else {
      body.classList.add('open');
      toggle.textContent = '✕';
    }
  });

  host._shadow = shadow;
  host._widget = shadow.querySelector('.b4e-widget');

  return host;
}

// Render brief into widget body
function renderBrief(host, brief, platform, refreshFn) {
  const shadow = host._shadow;
  const body = shadow.querySelector('.b4e-body');
  const slug = brief._slug || '';
  const refParam = platform ? `?ref=${encodeURIComponent(platform)}` : '';

  let html = '<div class="b4e-inner">';

  // Summary
  if (brief.summary) {
    html += `
      <div class="b4e-label">Why This Probability</div>
      <div class="b4e-summary">${escapeHtml(brief.summary)}</div>
    `;
  }

  // Key Factors
  if (brief.keyFactors && brief.keyFactors.length > 0) {
    html += '<hr class="b4e-divider">';
    html += '<div class="b4e-label">Key Factors</div>';
    brief.keyFactors.forEach((factor) => {
      html += `
        <div class="b4e-factor">
          <div>
            <div class="b4e-factor-name">${escapeHtml(factor.name)}</div>
            ${factor.detail ? `<div class="b4e-factor-detail">${escapeHtml(factor.detail)}</div>` : ''}
          </div>
          <span class="b4e-sentiment ${factor.sentiment || ''}">${escapeHtml(factor.sentiment || '')}</span>
        </div>
      `;
    });
  }

  // Historical Base Rate
  if (brief.historicalBaseRate) {
    html += '<hr class="b4e-divider">';
    html += `
      <div class="b4e-label">Historical Base Rate</div>
      <div class="b4e-baserate">${escapeHtml(brief.historicalBaseRate)}</div>
    `;
  }

  // Upcoming Catalysts
  if (brief.upcomingCatalysts && brief.upcomingCatalysts.length > 0) {
    html += '<hr class="b4e-divider">';
    html += '<div class="b4e-label">Upcoming Catalysts</div>';
    brief.upcomingCatalysts.forEach((catalyst) => {
      html += `
        <div class="b4e-catalyst">
          <span class="b4e-catalyst-arrow">&rarr;</span>
          <span class="b4e-catalyst-text">${escapeHtml(catalyst)}</span>
        </div>
      `;
    });
  }

  html += '</div>'; // close .b4e-inner

  // Usage nudge bar (between content and footer)
  if (brief._usage && brief._usage.limit !== Infinity) {
    const remaining = brief._usage.remaining;
    let nudgeHtml = '';

    if (remaining === 0) {
      nudgeHtml = '<span class="b4e-nudge-warn">Beta limit reached. Come back tomorrow!</span>';
    } else if (remaining === 1) {
      nudgeHtml = '<span class="b4e-nudge-warn">Last free brief today</span>';
    } else {
      nudgeHtml = '<span class="b4e-nudge-count">' + remaining + ' free briefs left today</span>';
    }

    nudgeHtml += ' <span class="b4e-nudge-count">BETA</span>';

    html += '<div class="b4e-nudge">' + nudgeHtml + '</div>';
  }

  // Market URL for sharing (always use production domain)
  const marketUrl = `https://b4enews.com/market/${slug}`;

  // Footer
  html += `
    <div class="b4e-footer" style="position:relative;">
      <span class="b4e-time">${brief.generatedAt ? timeAgo(brief.generatedAt) : ''}</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="b4e-share" title="Copy link">&#x1F517;</button>
        <button class="b4e-refresh" title="Refresh brief">&#x21bb;</button>
        <a class="b4e-link" href="${marketUrl}" target="_blank">
          Open in before &rarr;
        </a>
      </div>
      <span class="b4e-share-toast">Link copied!</span>
    </div>
  `;

  body.innerHTML = html;

  // Wire refresh button
  const refreshBtn = body.querySelector('.b4e-refresh');
  if (refreshBtn && refreshFn) {
    refreshBtn.addEventListener('click', refreshFn);
  }

  // Wire share button - copy market URL to clipboard
  const shareBtn = body.querySelector('.b4e-share');
  const toast = body.querySelector('.b4e-share-toast');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(marketUrl).then(() => {
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2000);
        }
      });
    });
  }
}

function renderError(host, message, retryFn) {
  const body = host._shadow.querySelector('.b4e-body');
  body.innerHTML = `
    <div class="b4e-error">
      <div class="b4e-error-text">${escapeHtml(message)}</div>
      <button class="b4e-retry">Retry</button>
    </div>
  `;
  body.querySelector('.b4e-retry').addEventListener('click', retryFn);
}

function renderRateLimit(host, message, platform) {
  const body = host._shadow.querySelector('.b4e-body');
  body.innerHTML = `
    <div class="b4e-ratelimit">
      <div class="b4e-ratelimit-text">${escapeHtml(message || 'Beta limit: 2 free briefs per day')}</div>
      <span class="b4e-upgrade" style="cursor: default;">Come back tomorrow</span>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Fetch brief from B4E API
async function fetchBrief(title, extra, refresh) {
  // Use ticker as the primary identifier when available (more reliable than title)
  const slug = (extra && extra.ticker) ? slugify(extra.ticker) : slugify(title);
  let url = `${B4E_API}/api/context?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`;
  if (refresh) url += '&refresh=1';

  // Pass extra context for better matching
  if (extra) {
    if (extra.ticker) url += `&ticker=${encodeURIComponent(extra.ticker)}`;
    if (extra.platform) url += `&platform=${encodeURIComponent(extra.platform)}`;
    if (extra.slug) url += `&eventSlug=${encodeURIComponent(extra.slug)}`;
  }

  // Check for stored API key
  const stored = await chrome.storage.sync.get(['b4eApiKey']);
  const headers = {};
  if (stored.b4eApiKey) {
    headers['Authorization'] = `Bearer ${stored.b4eApiKey}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 429) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.upgrade || 'Daily limit reached');
    err.rateLimited = true;
    throw err;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `API returned ${response.status}`);
  }

  const brief = await response.json();
  brief._slug = slug;
  return brief;
}

// Main entry point - called by platform content scripts
// anchorEl: ignored (widget is now a fixed overlay appended to body)
// title: market title string
// platform: platform identifier for attribution (e.g., 'polymarket', 'dflow')
// extra: optional object with { ticker, platform } for better market matching
async function injectB4EWidget(anchorEl, title, platform, extra) {
  if (!title) return;

  // Don't inject twice
  if (document.getElementById('b4e-inline-widget')) return;

  // Delay slightly so SPAs have time to apply their styles (for theme detection)
  await new Promise((r) => setTimeout(r, 200));

  const host = createWidget();
  document.body.appendChild(host);

  // Auto-expand on first load
  const body = host._shadow.querySelector('.b4e-body');
  const toggle = host._shadow.querySelector('.b4e-toggle');
  body.classList.add('open');
  toggle.textContent = '✕';
  const widget = host;

  // Fetch and render
  async function loadBrief(refresh) {
    // Show loading state
    const body = widget._shadow.querySelector('.b4e-body');
    body.innerHTML = `
      <div class="b4e-loading">
        <div class="b4e-spinner"></div>
        <span class="b4e-loading-text">${refresh ? 'Refreshing brief...' : 'Generating context brief...'}</span>
      </div>
    `;

    try {
      const brief = await fetchBrief(title, extra, refresh);
      renderBrief(widget, brief, platform, () => loadBrief(true));
    } catch (err) {
      if (err.rateLimited) {
        renderRateLimit(widget, err.message, platform);
      } else {
        renderError(widget, err.message, () => loadBrief(false));
      }
    }
  }

  loadBrief(false);
}

// Export for use by content scripts
window.__b4e = { injectB4EWidget, slugify };
