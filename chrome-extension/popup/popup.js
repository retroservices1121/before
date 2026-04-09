// before Chrome Extension - Popup Logic

const API_URL = 'https://before-production.up.railway.app';
const SUPPORTED_HOSTS = [
  'polymarket.com', 'www.polymarket.com',
  'limitless.exchange', 'www.limitless.exchange',
  'dflow.net', 'www.dflow.net', 'app.dflow.net',
  'kalshi.com', 'www.kalshi.com',
  'matchr.xyz', 'www.matchr.xyz', 'app.matchr.xyz',
  'polynance.ag', 'www.polynance.ag',
  'metamask.io', 'portfolio.metamask.io',
  'alphaarcade.com', 'www.alphaarcade.com',
];

// DOM references
const els = {
  headerRight: document.getElementById('header-right'),
  authPanel: document.getElementById('auth-panel'),
  authEmail: document.getElementById('auth-email'),
  authEmailInput: document.getElementById('auth-email-input'),
  authSendCode: document.getElementById('auth-send-code'),
  authEmailError: document.getElementById('auth-email-error'),
  authCode: document.getElementById('auth-code'),
  authCodeInput: document.getElementById('auth-code-input'),
  authVerify: document.getElementById('auth-verify'),
  authCodeHint: document.getElementById('auth-code-hint'),
  authCodeError: document.getElementById('auth-code-error'),
  authBack: document.getElementById('auth-back'),
  stateUnsupported: document.getElementById('state-unsupported'),
  stateNoTitle: document.getElementById('state-no-title'),
  stateLoading: document.getElementById('state-loading'),
  stateError: document.getElementById('state-error'),
  stateRatelimit: document.getElementById('state-ratelimit'),
  stateBrief: document.getElementById('state-brief'),
  loadingMarket: document.getElementById('loading-market'),
  errorDetail: document.getElementById('error-detail'),
  retryBtn: document.getElementById('retry-btn'),
  ratelimitDetail: document.getElementById('ratelimit-detail'),
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
let apiKey = '';
let userEmail = '';
let authEmailValue = '';

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
  const labels = {
    polymarket: 'Polymarket',
    limitless: 'Limitless',
    dflow: 'DFlow',
    kalshi: 'Kalshi',
    matchr: 'Matchr',
    polynance: 'Polynance',
    metamask: 'MetaMask',
    alphaarcade: 'Alpha Arcade',
  };
  return labels[platform] || platform;
}

// --- Auth UI ---

function renderHeaderAuth() {
  if (userEmail) {
    els.headerRight.innerHTML = `
      <div class="user-info">
        <span class="user-email">${userEmail.split('@')[0]}</span>
        <button id="logout-btn" class="auth-link">Log out</button>
      </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
  } else {
    els.headerRight.innerHTML = `
      <button id="signin-btn" class="auth-link">Sign in</button>
    `;
    document.getElementById('signin-btn').addEventListener('click', () => {
      els.authPanel.classList.toggle('hidden');
    });
  }
}

async function handleSendCode() {
  const email = els.authEmailInput.value.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    els.authEmailError.textContent = 'Enter a valid email';
    els.authEmailError.classList.remove('hidden');
    return;
  }

  authEmailValue = email;
  els.authSendCode.textContent = 'Sending...';
  els.authSendCode.disabled = true;
  els.authEmailError.classList.add('hidden');

  try {
    const res = await fetch(`${API_URL}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to send code');
    }

    // Switch to code step
    els.authEmail.classList.add('hidden');
    els.authCode.classList.remove('hidden');
    els.authCodeHint.textContent = `Sent to ${email}`;
    els.authCodeInput.focus();
  } catch (err) {
    els.authEmailError.textContent = err.message;
    els.authEmailError.classList.remove('hidden');
  } finally {
    els.authSendCode.textContent = 'Send code';
    els.authSendCode.disabled = false;
  }
}

async function handleVerify() {
  const code = els.authCodeInput.value.trim();
  if (code.length !== 6) return;

  els.authVerify.textContent = 'Verifying...';
  els.authVerify.disabled = true;
  els.authCodeError.classList.add('hidden');

  try {
    const res = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmailValue, code, ref: 'extension' }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Invalid code');
    }

    const data = await res.json();

    // Fetch the API key from the /me endpoint using the session cookie
    // Since we can't use cookies cross-origin, we need to get the API key directly
    // The verify response gives us the user info, but we need the API key
    // So we'll make a follow-up call to get it
    const meRes = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });

    let fetchedApiKey = '';
    if (meRes.ok) {
      const meData = await meRes.json();
      if (meData.user?.apiKey) {
        fetchedApiKey = meData.user.apiKey;
      }
    }

    // If we couldn't get the API key via cookie (cross-origin), fall back
    // The verify endpoint should return it directly for extension use
    if (!fetchedApiKey && data.apiKey) {
      fetchedApiKey = data.apiKey;
    }

    if (fetchedApiKey) {
      apiKey = fetchedApiKey;
      userEmail = authEmailValue;
      await chrome.storage.sync.set({
        b4eApiKey: apiKey,
        b4eEmail: userEmail,
      });
    } else {
      // Even without API key, store the email as signed in
      userEmail = authEmailValue;
      await chrome.storage.sync.set({ b4eEmail: userEmail });
    }

    // Hide auth panel, update header
    els.authPanel.classList.add('hidden');
    renderHeaderAuth();

    // Reload brief if we were on a market page
    if (currentMarketInfo) {
      loadBrief(currentMarketInfo);
    }
  } catch (err) {
    els.authCodeError.textContent = err.message;
    els.authCodeError.classList.remove('hidden');
  } finally {
    els.authVerify.textContent = 'Verify';
    els.authVerify.disabled = false;
  }
}

async function handleLogout() {
  apiKey = '';
  userEmail = '';
  await chrome.storage.sync.remove(['b4eApiKey', 'b4eEmail']);
  renderHeaderAuth();
}

// --- State management ---

function showState(stateName) {
  const allStates = ['stateUnsupported', 'stateNoTitle', 'stateLoading', 'stateError', 'stateRatelimit', 'stateBrief'];
  allStates.forEach((s) => els[s].classList.add('hidden'));
  if (els[stateName]) {
    els[stateName].classList.remove('hidden');
  }
}

// --- Render brief ---

function renderBrief(brief, marketInfo) {
  els.briefPlatform.textContent = platformLabel(marketInfo.platform);
  els.briefPlatform.className = `platform-badge ${marketInfo.platform}`;
  els.briefTitle.textContent = marketInfo.title;
  els.briefSummary.textContent = brief.summary;

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

  if (brief.historicalBaseRate) {
    els.briefBaserate.textContent = brief.historicalBaseRate;
    els.briefBaserateWrap.classList.remove('hidden');
  } else {
    els.briefBaserateWrap.classList.add('hidden');
  }

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

  els.briefTime.textContent = brief.generatedAt ? timeAgo(brief.generatedAt) : '';

  const slug = slugify(marketInfo.title);
  els.briefOpenB4e.href = `${API_URL}/market/${slug}`;

  showState('stateBrief');
}

// --- API ---

async function fetchBrief(marketInfo) {
  const slug = slugify(marketInfo.title);
  const url = `${API_URL}/api/context?slug=${encodeURIComponent(slug)}`;

  const headers = {};
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 429) {
    const body = await response.json().catch(() => ({}));
    const err = new Error(body.upgrade || 'Daily limit reached');
    err.rateLimited = true;
    err.tier = body.tier;
    err.upgrade = body.upgrade;
    throw err;
  }

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
    if (err.rateLimited) {
      els.ratelimitDetail.textContent = err.upgrade || 'You have reached your daily brief limit.';
      showState('stateRatelimit');
    } else {
      els.errorDetail.textContent = err.message;
      showState('stateError');
    }
  }
}

// --- Init ---

async function init() {
  // Load saved session
  const stored = await chrome.storage.sync.get(['b4eApiKey', 'b4eEmail']);
  if (stored.b4eApiKey) apiKey = stored.b4eApiKey;
  if (stored.b4eEmail) userEmail = stored.b4eEmail;

  renderHeaderAuth();

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

els.authSendCode.addEventListener('click', handleSendCode);
els.authEmailInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSendCode();
});

els.authVerify.addEventListener('click', handleVerify);
els.authCodeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleVerify();
});
els.authCodeInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});

els.authBack.addEventListener('click', () => {
  els.authCode.classList.add('hidden');
  els.authEmail.classList.remove('hidden');
  els.authCodeInput.value = '';
  els.authCodeError.classList.add('hidden');
});

els.retryBtn.addEventListener('click', () => {
  if (currentMarketInfo) {
    loadBrief(currentMarketInfo);
  }
});

// Start
init();
