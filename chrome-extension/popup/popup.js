// before Chrome Extension - Popup Logic

const API_URL = 'https://before-production.up.railway.app';
const SUPPORTED_HOSTS = ['polymarket.com', 'www.polymarket.com', 'limitless.exchange', 'www.limitless.exchange'];

// DOM references
const els = {
  stateUnsupported: document.getElementById('state-unsupported'),
  stateNoTitle: document.getElementById('state-no-title'),
  stateLoading: document.getElementById('state-loading'),
  stateError: document.getElementById('state-error'),
  stateBrief: document.getElementById('state-brief'),
  loadingMarket: document.getElementById('loading-market'),
  errorDetail: document.getElementById('error-detail'),
  retryBtn: document.getElementById('retry-btn'),
  briefPlatform: document.getElementById('brief-platform'),
  briefTitle: document.getElementById('brief-title'),
  briefSummary: document.getElementById('brief-summary'),
  briefFactors: document.getElementById('brief-factors'),
  briefBaserateWrap: document.getElementById('brief-baserate-wrap'),
  briefBaserate: document.getElementById('brief-baserate'),
  briefCatalystsWrap: document.getElementById('brief-catalysts-wrap'),
  briefCatalysts: document.getElementById('brief-catalysts'),
  briefTime: document.getElementById('brief-time'),
  briefOpenB4e: document.getElementById('brief-open-b4e'),
};

// State
let currentMarketInfo = null;

// --- Utilities ---

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

function platformLabel(platform) {
  if (platform === 'polymarket') return 'Polymarket';
  if (platform === 'limitless') return 'Limitless';
  return platform;
}

// --- State management ---

function showState(stateName) {
  const allStates = ['stateUnsupported', 'stateNoTitle', 'stateLoading', 'stateError', 'stateBrief'];
  allStates.forEach((s) => els[s].classList.add('hidden'));
  if (els[stateName]) {
    els[stateName].classList.remove('hidden');
  }
}

// --- Render brief ---

function renderBrief(brief, marketInfo) {
  // Platform badge
  els.briefPlatform.textContent = platformLabel(marketInfo.platform);
  els.briefPlatform.className = `platform-badge ${marketInfo.platform}`;

  // Title
  els.briefTitle.textContent = marketInfo.title;

  // Summary
  els.briefSummary.textContent = brief.summary;

  // Key Factors
  els.briefFactors.innerHTML = '';
  if (brief.keyFactors && brief.keyFactors.length > 0) {
    brief.keyFactors.forEach((factor) => {
      const row = document.createElement('div');
      row.className = 'factor-row';

      const info = document.createElement('div');
      info.className = 'factor-info';

      const name = document.createElement('div');
      name.className = 'factor-name';
      name.textContent = factor.name;
      info.appendChild(name);

      if (factor.detail) {
        const detail = document.createElement('div');
        detail.className = 'factor-detail';
        detail.textContent = factor.detail;
        info.appendChild(detail);
      }

      const sentiment = document.createElement('span');
      sentiment.className = `factor-sentiment ${factor.sentiment}`;
      sentiment.textContent = factor.sentiment;

      row.appendChild(info);
      row.appendChild(sentiment);
      els.briefFactors.appendChild(row);
    });
  }

  // Historical Base Rate
  if (brief.historicalBaseRate) {
    els.briefBaserate.textContent = brief.historicalBaseRate;
    els.briefBaserateWrap.classList.remove('hidden');
  } else {
    els.briefBaserateWrap.classList.add('hidden');
  }

  // Upcoming Catalysts
  if (brief.upcomingCatalysts && brief.upcomingCatalysts.length > 0) {
    els.briefCatalysts.innerHTML = '';
    brief.upcomingCatalysts.forEach((catalyst) => {
      const row = document.createElement('div');
      row.className = 'catalyst-row';

      const arrow = document.createElement('span');
      arrow.className = 'catalyst-arrow';
      arrow.innerHTML = '&rarr;';

      const text = document.createElement('span');
      text.className = 'catalyst-text';
      text.textContent = catalyst;

      row.appendChild(arrow);
      row.appendChild(text);
      els.briefCatalysts.appendChild(row);
    });
    els.briefCatalystsWrap.classList.remove('hidden');
  } else {
    els.briefCatalystsWrap.classList.add('hidden');
  }

  // Footer
  els.briefTime.textContent = brief.generatedAt ? timeAgo(brief.generatedAt) : '';

  const slug = slugify(marketInfo.title);
  els.briefOpenB4e.href = `${API_URL}/market/${slug}`;

  showState('stateBrief');
}

// --- API ---

async function fetchBrief(marketInfo) {
  const slug = slugify(marketInfo.title);
  const url = `${API_URL}/api/context?slug=${encodeURIComponent(slug)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API returned ${response.status}`);
  }

  return response.json();
}

async function loadBrief(marketInfo) {
  currentMarketInfo = marketInfo;
  els.loadingMarket.textContent = marketInfo.title;
  showState('stateLoading');

  try {
    const brief = await fetchBrief(marketInfo);
    renderBrief(brief, marketInfo);
  } catch (err) {
    els.errorDetail.textContent = err.message;
    showState('stateError');
  }
}

// --- Init ---

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url) {
    showState('stateUnsupported');
    return;
  }

  const url = new URL(tab.url);
  if (!SUPPORTED_HOSTS.includes(url.hostname)) {
    showState('stateUnsupported');
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getMarketInfo' });

    if (!response || !response.title) {
      showState('stateNoTitle');
      return;
    }

    loadBrief(response);
  } catch (err) {
    showState('stateNoTitle');
  }
}

// --- Event listeners ---

els.retryBtn.addEventListener('click', () => {
  if (currentMarketInfo) {
    loadBrief(currentMarketInfo);
  }
});

// Start
init();
