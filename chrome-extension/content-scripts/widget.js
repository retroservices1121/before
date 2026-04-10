// before - Inline Widget
// Shared module injected by platform content scripts
// Renders a collapsible B4E intelligence brief inline on any prediction market page

const B4E_API = 'https://before-production.up.railway.app';

const WIDGET_STYLES = `
  .b4e-widget {
    font-family: -apple-system, 'DM Sans', sans-serif;
    background: #0a0a0a;
    border: 1px solid #1e1e1e;
    border-radius: 12px;
    margin: 16px 0;
    overflow: hidden;
    color: #e5e5e5;
    font-size: 13px;
    line-height: 1.6;
    box-shadow: 0 0 20px rgba(0, 229, 159, 0.05);
    max-width: 100%;
  }

  .b4e-widget * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Header bar - always visible */
  .b4e-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #111111;
    border-bottom: 1px solid #1e1e1e;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
  }

  .b4e-header:hover {
    background: #161616;
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
    background: #00e59f;
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
    color: #00e59f;
    letter-spacing: 2px;
  }

  .b4e-tagline {
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #525252;
  }

  .b4e-toggle {
    font-family: monospace;
    font-size: 10px;
    color: #525252;
    transition: transform 0.3s;
  }

  .b4e-toggle.open {
    transform: rotate(180deg);
  }

  /* Body - collapsible */
  .b4e-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease;
  }

  .b4e-body.open {
    max-height: 2000px;
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
    border: 2px solid #1e1e1e;
    border-top-color: #00e59f;
    border-radius: 50%;
    animation: b4eSpin 0.8s linear infinite;
  }

  @keyframes b4eSpin {
    to { transform: rotate(360deg); }
  }

  .b4e-loading-text {
    font-family: monospace;
    font-size: 11px;
    color: #525252;
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
    color: #525252;
  }

  .b4e-retry {
    background: rgba(0, 229, 159, 0.1);
    border: 1px solid rgba(0, 229, 159, 0.25);
    color: #00e59f;
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
    color: #525252;
    margin-bottom: 6px;
  }

  /* Summary */
  .b4e-summary {
    font-size: 13px;
    line-height: 1.7;
    color: #a3a3a3;
    margin-bottom: 14px;
  }

  /* Divider */
  .b4e-divider {
    border: none;
    border-top: 1px solid #1e1e1e;
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
    color: #a3a3a3;
  }

  .b4e-factor-detail {
    font-size: 11px;
    color: #525252;
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

  .b4e-sentiment.bullish { color: #00e59f; }
  .b4e-sentiment.bearish { color: #ff6b6b; }
  .b4e-sentiment.neutral { color: #f59e0b; }
  .b4e-sentiment.pending { color: #525252; }

  /* Catalysts */
  .b4e-catalyst {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 3px 0;
  }

  .b4e-catalyst-arrow {
    font-family: monospace;
    color: #00e59f;
    font-size: 11px;
    margin-top: 1px;
    flex-shrink: 0;
  }

  .b4e-catalyst-text {
    font-size: 12px;
    color: #a3a3a3;
    line-height: 1.5;
  }

  /* Base rate */
  .b4e-baserate {
    font-size: 12px;
    color: #a3a3a3;
    line-height: 1.6;
  }

  /* Footer */
  .b4e-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-top: 1px solid #1e1e1e;
    background: #111111;
  }

  .b4e-time {
    font-family: monospace;
    font-size: 9px;
    color: #525252;
  }

  .b4e-link {
    font-family: monospace;
    font-size: 10px;
    color: #00e59f;
    text-decoration: none;
    letter-spacing: 0.5px;
  }

  .b4e-link:hover {
    text-decoration: underline;
  }

  /* Rate limit */
  .b4e-ratelimit {
    padding: 16px 14px;
    text-align: center;
  }

  .b4e-ratelimit-text {
    font-family: monospace;
    font-size: 11px;
    color: #f59e0b;
    margin-bottom: 8px;
  }

  .b4e-upgrade {
    display: inline-block;
    background: rgba(0, 229, 159, 0.1);
    border: 1px solid rgba(0, 229, 159, 0.25);
    color: #00e59f;
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
    border-top: 1px solid #1e1e1e;
    background: #0d0d0d;
    font-family: monospace;
    font-size: 10px;
    letter-spacing: 0.5px;
  }

  .b4e-nudge-count {
    color: #525252;
  }

  .b4e-nudge-warn {
    color: #f59e0b;
  }

  .b4e-nudge-link {
    color: #00e59f;
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

// Inject styles once
function injectStyles() {
  if (document.getElementById('b4e-widget-styles')) return;
  const style = document.createElement('style');
  style.id = 'b4e-widget-styles';
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
}

// Create the widget DOM
function createWidget() {
  const widget = document.createElement('div');
  widget.className = 'b4e-widget';
  widget.id = 'b4e-inline-widget';

  widget.innerHTML = `
    <div class="b4e-header">
      <div class="b4e-header-left">
        <span class="b4e-pulse"></span>
        <span class="b4e-logo">before</span>
        <span class="b4e-tagline">Intelligence Brief</span>
      </div>
      <span class="b4e-toggle">▼</span>
    </div>
    <div class="b4e-body">
      <div class="b4e-loading">
        <div class="b4e-spinner"></div>
        <span class="b4e-loading-text">Generating context brief...</span>
      </div>
    </div>
  `;

  // Toggle collapse
  const header = widget.querySelector('.b4e-header');
  const body = widget.querySelector('.b4e-body');
  const toggle = widget.querySelector('.b4e-toggle');

  header.addEventListener('click', () => {
    body.classList.toggle('open');
    toggle.classList.toggle('open');
  });

  return widget;
}

// Render brief into widget body
function renderBrief(widget, brief, platform) {
  const body = widget.querySelector('.b4e-body');
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

  // Footer
  html += `
    <div class="b4e-footer">
      <span class="b4e-time">${brief.generatedAt ? timeAgo(brief.generatedAt) : ''}</span>
      <a class="b4e-link" href="${B4E_API}/market/${slug}" target="_blank">
        Open in before &rarr;
      </a>
    </div>
  `;

  body.innerHTML = html;
}

function renderError(widget, message, retryFn) {
  const body = widget.querySelector('.b4e-body');
  body.innerHTML = `
    <div class="b4e-error">
      <div class="b4e-error-text">${escapeHtml(message)}</div>
      <button class="b4e-retry">Retry</button>
    </div>
  `;
  body.querySelector('.b4e-retry').addEventListener('click', retryFn);
}

function renderRateLimit(widget, message, platform) {
  const body = widget.querySelector('.b4e-body');
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
async function fetchBrief(title) {
  const slug = slugify(title);
  const url = `${B4E_API}/api/context?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`;

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
// anchorEl: DOM element to inject the widget after
// title: market title string
// platform: platform identifier for attribution (e.g., 'polymarket', 'dflow')
async function injectB4EWidget(anchorEl, title, platform) {
  if (!anchorEl || !title) return;

  // Don't inject twice
  if (document.getElementById('b4e-inline-widget')) return;

  injectStyles();
  const widget = createWidget();
  anchorEl.parentNode.insertBefore(widget, anchorEl.nextSibling);

  // Auto-expand on first load
  const body = widget.querySelector('.b4e-body');
  const toggle = widget.querySelector('.b4e-toggle');
  body.classList.add('open');
  toggle.classList.add('open');

  // Fetch and render
  async function loadBrief() {
    try {
      const brief = await fetchBrief(title);
      renderBrief(widget, brief, platform);
    } catch (err) {
      if (err.rateLimited) {
        renderRateLimit(widget, err.message, platform);
      } else {
        renderError(widget, err.message, loadBrief);
      }
    }
  }

  loadBrief();
}

// Export for use by content scripts
window.__b4e = { injectB4EWidget, slugify };
