/**
 * before (B4E) — Embeddable Intelligence Widget
 * Drop this script on any prediction market page to show AI-powered context briefs.
 *
 * Usage:
 *   <script
 *     src="https://b4enews.com/embed.js"
 *     data-b4e-key="bk_your_api_key"
 *   ></script>
 *
 * Options (data attributes on the script tag):
 *   data-b4e-key       — API key for authenticated access (optional, higher rate limits)
 *   data-b4e-target    — CSS selector for the element to inject the widget after (optional)
 *   data-b4e-title     — Market title override (optional, auto-detected if omitted)
 *   data-b4e-slug      — Market slug override (optional, derived from title if omitted)
 *   data-b4e-theme     — "dark" (default) or "light"
 *   data-b4e-collapsed — "true" to start collapsed (default: expanded)
 *   data-b4e-position  — "after" (default) or "before" the target element
 */
(function () {
  'use strict';

  // Prevent double-init
  if (window.__b4eEmbed) return;
  window.__b4eEmbed = true;

  var B4E_HOST = 'https://b4enews.com';
  var API_URL = B4E_HOST + '/api/context';
  var AUTH_SEND_URL = B4E_HOST + '/api/auth/send-code';
  var AUTH_VERIFY_URL = B4E_HOST + '/api/auth/verify';
  var STORAGE_KEY = 'b4e_api_key';
  var STORAGE_EMAIL = 'b4e_email';

  // --- Read config from script tag ---
  var scriptTag = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var config = {
    key: scriptTag.getAttribute('data-b4e-key') || '',
    target: scriptTag.getAttribute('data-b4e-target') || '',
    title: scriptTag.getAttribute('data-b4e-title') || '',
    slug: scriptTag.getAttribute('data-b4e-slug') || '',
    theme: scriptTag.getAttribute('data-b4e-theme') || 'dark',
    collapsed: scriptTag.getAttribute('data-b4e-collapsed') === 'true',
    position: scriptTag.getAttribute('data-b4e-position') || 'after',
    platform: scriptTag.getAttribute('data-b4e-platform') || location.hostname.replace(/^www\./, '').split('.')[0],
  };

  // --- Styles ---
  var DARK = {
    bg: '#0a0a0a', surface: '#111111', border: '#1e1e1e',
    accent: '#00e59f', text: '#e5e5e5', dim: '#a3a3a3', muted: '#525252',
    warm: '#ff6b6b', amber: '#f59e0b',
  };

  var LIGHT = {
    bg: '#ffffff', surface: '#f5f5f5', border: '#e5e5e5',
    accent: '#059669', text: '#171717', dim: '#525252', muted: '#a3a3a3',
    warm: '#dc2626', amber: '#d97706',
  };

  var t = config.theme === 'light' ? LIGHT : DARK;

  var STYLES = '\
    .b4e-embed{font-family:-apple-system,system-ui,sans-serif;background:' + t.bg + ';border:1px solid ' + t.border + ';border-radius:12px;margin:16px 0;overflow:hidden;color:' + t.text + ';font-size:13px;line-height:1.6;box-shadow:0 0 20px rgba(0,229,159,0.05);max-width:100%}\
    .b4e-embed *{box-sizing:border-box;margin:0;padding:0}\
    .b4e-e-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:' + t.surface + ';border-bottom:1px solid ' + t.border + ';cursor:pointer;user-select:none;transition:background .2s}\
    .b4e-e-header:hover{background:' + (config.theme === 'light' ? '#ebebeb' : '#161616') + '}\
    .b4e-e-left{display:flex;align-items:center;gap:8px}\
    .b4e-e-pulse{width:6px;height:6px;border-radius:50%;background:' + t.accent + ';animation:b4eEPulse 2s ease-in-out infinite;box-shadow:0 0 6px ' + t.accent + '40}\
    @keyframes b4eEPulse{0%,100%{opacity:1}50%{opacity:.3}}\
    .b4e-e-logo{font-family:Georgia,serif;font-style:italic;font-size:14px;color:' + t.accent + ';letter-spacing:2px}\
    .b4e-e-tag{font-family:monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:' + t.muted + '}\
    .b4e-e-toggle{font-family:monospace;font-size:10px;color:' + t.muted + ';transition:transform .3s}\
    .b4e-e-toggle.open{transform:rotate(180deg)}\
    .b4e-e-body{max-height:0;overflow:hidden;transition:max-height .4s ease}\
    .b4e-e-body.open{max-height:2000px}\
    .b4e-e-inner{padding:14px}\
    .b4e-e-loading{display:flex;align-items:center;gap:10px;padding:20px 14px}\
    .b4e-e-spinner{width:16px;height:16px;border:2px solid ' + t.border + ';border-top-color:' + t.accent + ';border-radius:50%;animation:b4eESpin .8s linear infinite}\
    @keyframes b4eESpin{to{transform:rotate(360deg)}}\
    .b4e-e-loading-text{font-family:monospace;font-size:11px;color:' + t.muted + ';letter-spacing:.5px}\
    .b4e-e-error{padding:16px 14px;text-align:center}\
    .b4e-e-error-text{font-family:monospace;font-size:11px;color:' + t.muted + '}\
    .b4e-e-retry{background:' + t.accent + '18;border:1px solid ' + t.accent + '40;color:' + t.accent + ';font-family:monospace;font-size:10px;padding:4px 12px;border-radius:4px;cursor:pointer;margin-top:8px;letter-spacing:.5px}\
    .b4e-e-retry:hover{background:' + t.accent + '30}\
    .b4e-e-chart{padding:0 14px 10px}\
    .b4e-e-chart-label{font-family:monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:' + t.muted + ';margin-bottom:6px}\
    .b4e-e-chart canvas{width:100%;height:80px;border-radius:4px}\
    .b4e-e-generate{padding:20px 14px;text-align:center}\
    .b4e-e-generate-btn{background:' + t.accent + '18;border:1px solid ' + t.accent + '40;color:' + t.accent + ';font-family:monospace;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:10px 24px;border-radius:6px;cursor:pointer;transition:background .2s,box-shadow .2s}\
    .b4e-e-generate-btn:hover{background:' + t.accent + '30;box-shadow:0 0 16px ' + t.accent + '25}\
    .b4e-e-generate-hint{font-family:monospace;font-size:9px;color:' + t.muted + ';margin-top:8px;letter-spacing:.5px}\
    .b4e-e-label{font-family:monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:' + t.muted + ';margin-bottom:6px}\
    .b4e-e-summary{font-size:13px;line-height:1.7;color:' + t.dim + ';margin-bottom:14px}\
    .b4e-e-divider{border:none;border-top:1px solid ' + t.border + ';margin:12px 0}\
    .b4e-e-factor{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:5px 0}\
    .b4e-e-factor-name{font-family:monospace;font-size:11px;color:' + t.dim + '}\
    .b4e-e-factor-detail{font-size:11px;color:' + t.muted + ';margin-top:2px;line-height:1.5}\
    .b4e-e-sentiment{font-family:monospace;font-size:10px;font-weight:600;text-transform:capitalize;white-space:nowrap;flex-shrink:0}\
    .b4e-e-sentiment.bullish{color:' + t.accent + '}\
    .b4e-e-sentiment.bearish{color:' + t.warm + '}\
    .b4e-e-sentiment.neutral{color:' + t.amber + '}\
    .b4e-e-sentiment.pending{color:' + t.muted + '}\
    .b4e-e-catalyst{display:flex;align-items:flex-start;gap:6px;padding:3px 0}\
    .b4e-e-catalyst-arrow{font-family:monospace;color:' + t.accent + ';font-size:11px;margin-top:1px;flex-shrink:0}\
    .b4e-e-catalyst-text{font-size:12px;color:' + t.dim + ';line-height:1.5}\
    .b4e-e-baserate{font-size:12px;color:' + t.dim + ';line-height:1.6}\
    .b4e-e-footer{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-top:1px solid ' + t.border + ';background:' + t.surface + '}\
    .b4e-e-time{font-family:monospace;font-size:9px;color:' + t.muted + '}\
    .b4e-e-link{font-family:monospace;font-size:10px;color:' + t.accent + ';text-decoration:none;letter-spacing:.5px}\
    .b4e-e-link:hover{text-decoration:underline}\
    .b4e-e-ratelimit{padding:16px 14px;text-align:center}\
    .b4e-e-ratelimit-text{font-family:monospace;font-size:11px;color:' + t.amber + ';margin-bottom:8px}\
    .b4e-e-upgrade{display:inline-block;background:' + t.accent + '18;border:1px solid ' + t.accent + '40;color:' + t.accent + ';font-family:monospace;font-size:10px;padding:5px 14px;border-radius:4px;text-decoration:none;letter-spacing:.5px}\
    .b4e-e-upgrade:hover{background:' + t.accent + '30}\
    .b4e-e-powered{font-family:monospace;font-size:9px;color:' + t.muted + ';text-align:center;padding:6px 14px;border-top:1px solid ' + t.border + ';background:' + t.surface + '}\
    .b4e-e-powered a{color:' + t.accent + ';text-decoration:none}\
    .b4e-e-powered a:hover{text-decoration:underline}\
  ';

  // --- Helpers ---
  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function timeAgo(dateStr) {
    var diff = Date.now() - new Date(dateStr).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + 'm ago';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.floor(hours / 24) + 'd ago';
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  // --- Auto-detect market title from page ---
  function detectTitle() {
    if (config.title) return config.title;

    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) return h1.textContent.trim();

    var selectors = [
      '[data-testid="market-title"]',
      '[class*="MarketTitle"]',
      '[class*="market-title"]',
      '[class*="EventTitle"]',
      '[class*="event-title"]',
      'h2',
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) return ogTitle.content.trim();

    var pageTitle = document.title.trim();
    if (pageTitle.length > 3) return pageTitle;

    return null;
  }

  // --- Find injection target ---
  function findTarget() {
    if (config.target) {
      var el = document.querySelector(config.target);
      if (el) return el;
    }

    var h1 = document.querySelector('h1');
    if (h1) return h1;

    var selectors = [
      '[data-testid="market-title"]',
      '[class*="MarketTitle"]',
      '[class*="market-title"]',
      '[class*="EventTitle"]',
      '[class*="MarketHeader"]',
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) return el;
    }

    return null;
  }

  // --- Build widget inside an iframe for full isolation ---
  function createWidget() {
    var container = document.createElement('div');
    container.id = 'b4e-embed-widget';
    container.style.cssText = 'margin:16px 0;max-width:100%;';

    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;border:none;overflow:hidden;display:block;min-height:44px;';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('title', 'before Intelligence Brief');

    container.appendChild(iframe);

    // Write the iframe content after it's in the DOM
    container._iframe = iframe;
    container._ready = false;

    container._initIframe = function () {
      if (container._ready) return;
      container._ready = true;

      var doc = iframe.contentDocument || iframe.contentWindow.document;
      var collapsed = config.collapsed;

      doc.open();
      doc.write('<!DOCTYPE html><html><head><style>' +
        'html,body{margin:0;padding:0;overflow:hidden;background:transparent;}' +
        STYLES +
        '.b4e-embed{margin:0;}' +
        '.b4e-e-body.open{display:block;}' +
        '.b4e-e-body{display:none;}' +
        '</style></head><body>' +
        '<div class="b4e-embed">' +
        '<div class="b4e-e-header">' +
        '<div class="b4e-e-left">' +
        '<span class="b4e-e-pulse"></span>' +
        '<span class="b4e-e-logo">before</span>' +
        '<span class="b4e-e-tag">Intelligence Brief</span>' +
        '</div>' +
        '<span class="b4e-e-toggle">\u25BC</span>' +
        '</div>' +
        '<div class="b4e-e-body' + (collapsed ? '' : ' open') + '">' +
        '<div class="b4e-e-generate">' +
        '<button class="b4e-e-generate-btn">Generate Brief</button>' +
        '<div class="b4e-e-generate-hint">Uses 1 credit</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</body></html>');
      doc.close();

      // Auto-resize iframe to fit content
      function resizeIframe() {
        try {
          var h = doc.documentElement.scrollHeight;
          iframe.style.height = h + 'px';
        } catch (e) {}
      }

      // Toggle collapse
      var header = doc.querySelector('.b4e-e-header');
      var body = doc.querySelector('.b4e-e-body');
      var toggle = doc.querySelector('.b4e-e-toggle');

      header.addEventListener('click', function () {
        body.classList.toggle('open');
        toggle.classList.toggle('open');
        setTimeout(resizeIframe, 10);
      });

      // Observe content changes to auto-resize
      var ro = new ResizeObserver(resizeIframe);
      ro.observe(doc.body);
      resizeIframe();

      // Store refs for render functions
      container._doc = doc;
      container._resize = resizeIframe;
    };

    return container;
  }

  function renderBrief(widget, brief, slug) {
    var body = widget._doc.querySelector('.b4e-e-body');
    var html = '<div class="b4e-e-inner">';

    if (brief.summary) {
      html += '<div class="b4e-e-label">Why This Probability</div>';
      html += '<div class="b4e-e-summary">' + esc(brief.summary) + '</div>';
    }

    if (brief.keyFactors && brief.keyFactors.length > 0) {
      html += '<hr class="b4e-e-divider">';
      html += '<div class="b4e-e-label">Key Factors</div>';
      for (var i = 0; i < brief.keyFactors.length; i++) {
        var f = brief.keyFactors[i];
        html += '<div class="b4e-e-factor"><div>';
        html += '<div class="b4e-e-factor-name">' + esc(f.name) + '</div>';
        if (f.detail) html += '<div class="b4e-e-factor-detail">' + esc(f.detail) + '</div>';
        html += '</div>';
        html += '<span class="b4e-e-sentiment ' + esc(f.sentiment || '') + '">' + esc(f.sentiment || '') + '</span>';
        html += '</div>';
      }
    }

    if (brief.historicalBaseRate) {
      html += '<hr class="b4e-e-divider">';
      html += '<div class="b4e-e-label">Historical Base Rate</div>';
      html += '<div class="b4e-e-baserate">' + esc(brief.historicalBaseRate) + '</div>';
    }

    if (brief.upcomingCatalysts && brief.upcomingCatalysts.length > 0) {
      html += '<hr class="b4e-e-divider">';
      html += '<div class="b4e-e-label">Upcoming Catalysts</div>';
      for (var j = 0; j < brief.upcomingCatalysts.length; j++) {
        html += '<div class="b4e-e-catalyst">';
        html += '<span class="b4e-e-catalyst-arrow">\u2192</span>';
        html += '<span class="b4e-e-catalyst-text">' + esc(brief.upcomingCatalysts[j]) + '</span>';
        html += '</div>';
      }
    }

    html += '</div>';

    // Usage nudge bar
    if (brief._usage && brief._usage.limit !== Infinity) {
      var remaining = brief._usage.remaining;
      var nudge = '';

      if (remaining === 0) {
        nudge = '<span style="color:' + t.amber + '">Beta limit reached. Come back tomorrow!</span>';
      } else if (remaining === 1) {
        nudge = '<span style="color:' + t.amber + '">Last free brief today</span>';
      } else {
        nudge = '<span style="color:' + t.muted + '">' + remaining + ' free briefs left today</span>';
      }

      nudge += ' <span style="color:' + t.muted + '">BETA</span>';

      html += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 14px;border-top:1px solid ' + t.border + ';font-family:monospace;font-size:10px;letter-spacing:.5px">' + nudge + '</div>';
    }

    // Footer
    html += '<div class="b4e-e-footer">';
    html += '<span class="b4e-e-time">' + (brief.generatedAt ? timeAgo(brief.generatedAt) : '') + '</span>';
    html += '<a class="b4e-e-link" href="' + B4E_HOST + '/market/' + esc(slug) + '" target="_blank">Open in before \u2192</a>';
    html += '</div>';

    // Powered by
    html += '<div class="b4e-e-powered">Powered by <a href="' + B4E_HOST + '" target="_blank">before</a> \u2014 Know before it matters</div>';

    body.innerHTML = html;
    if (widget._resize) setTimeout(widget._resize, 10);
  }

  function loadChartInEmbed(widget, title) {
    var url = B4E_HOST + '/api/chart?title=' + encodeURIComponent(title);
    fetch(url).then(function (res) {
      if (!res.ok) return null;
      return res.json();
    }).then(function (data) {
      if (!data || !data.candles || data.candles.length < 2) return;

      var inner = widget._doc.querySelector('.b4e-e-inner');
      if (!inner) return;

      var chartDiv = widget._doc.createElement('div');
      chartDiv.className = 'b4e-e-chart';
      chartDiv.innerHTML = '<div class="b4e-e-chart-label">Price \u2014 30D</div>';

      var canvas = widget._doc.createElement('canvas');
      canvas.width = 500;
      canvas.height = 80;
      canvas.style.cssText = 'width:100%;height:80px;border-radius:4px;background:' + t.bg;
      chartDiv.appendChild(canvas);

      inner.parentNode.insertBefore(chartDiv, inner);

      var ctx = canvas.getContext('2d');
      var prices = data.candles.map(function (c) { return c.close; });
      var min = Math.min.apply(null, prices);
      var max = Math.max.apply(null, prices);
      var range = max - min || 1;
      var w = canvas.width;
      var h = canvas.height;
      var pad = 4;

      var grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, t.accent + '40');
      grad.addColorStop(1, t.accent + '00');

      ctx.beginPath();
      for (var i = 0; i < prices.length; i++) {
        var x = (i / (prices.length - 1)) * (w - pad * 2) + pad;
        var y = h - pad - ((prices[i] - min) / range) * (h - pad * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      var lastX = (w - pad * 2) + pad;
      ctx.lineTo(lastX, h);
      ctx.lineTo(pad, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      for (var j = 0; j < prices.length; j++) {
        var x2 = (j / (prices.length - 1)) * (w - pad * 2) + pad;
        var y2 = h - pad - ((prices[j] - min) / range) * (h - pad * 2);
        if (j === 0) ctx.moveTo(x2, y2);
        else ctx.lineTo(x2, y2);
      }
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (widget._resize) setTimeout(widget._resize, 10);
    }).catch(function () {});
  }

  function renderError(widget, message, retryFn) {
    var body = widget._doc.querySelector('.b4e-e-body');
    body.innerHTML = '<div class="b4e-e-error">\
      <div class="b4e-e-error-text">' + esc(message) + '</div>\
      <button class="b4e-e-retry">Retry</button>\
    </div>';
    body.querySelector('.b4e-e-retry').addEventListener('click', retryFn);
    if (widget._resize) setTimeout(widget._resize, 10);
  }

  function renderRateLimit(widget, message, reloadFn) {
    var doc = widget._doc;
    var body = doc.querySelector('.b4e-e-body');
    var savedEmail = '';
    try { savedEmail = localStorage.getItem(STORAGE_EMAIL) || ''; } catch (e) {}

    // If already signed in, just show the limit
    if (savedEmail) {
      body.innerHTML = '<div class="b4e-e-ratelimit">\
        <div class="b4e-e-ratelimit-text">' + esc(message || 'Beta limit: 2 free briefs per day') + '</div>\
        <span class="b4e-e-upgrade" style="cursor:default">Come back tomorrow</span>\
      </div>';
      if (widget._resize) setTimeout(widget._resize, 10);
      return;
    }

    // Show sign-in form for anon users
    body.innerHTML = '<div class="b4e-e-ratelimit">\
      <div class="b4e-e-ratelimit-text">' + esc(message || 'Beta limit: 2 free briefs per day') + '</div>\
      <div id="b4e-auth-form" style="margin-top:10px">\
        <div id="b4e-auth-email-step">\
          <div style="display:flex;gap:6px">\
            <input id="b4e-auth-email" type="email" placeholder="you@example.com" style="flex:1;background:' + t.bg + ';border:1px solid ' + t.border + ';border-radius:4px;padding:5px 8px;font-family:monospace;font-size:11px;color:' + t.dim + ';outline:none">\
            <button id="b4e-auth-send" style="background:' + t.accent + '18;border:1px solid ' + t.accent + '40;color:' + t.accent + ';font-family:monospace;font-size:10px;padding:5px 10px;border-radius:4px;cursor:pointer;white-space:nowrap">Sign in</button>\
          </div>\
          <div id="b4e-auth-email-err" style="font-family:monospace;font-size:9px;color:' + t.warm + ';margin-top:4px;display:none"></div>\
        </div>\
        <div id="b4e-auth-code-step" style="display:none">\
          <div style="display:flex;gap:6px">\
            <input id="b4e-auth-code" type="text" placeholder="000000" maxlength="6" style="flex:1;background:' + t.bg + ';border:1px solid ' + t.border + ';border-radius:4px;padding:5px 8px;font-family:monospace;font-size:11px;color:' + t.dim + ';outline:none;text-align:center;letter-spacing:4px">\
            <button id="b4e-auth-verify" style="background:' + t.accent + '18;border:1px solid ' + t.accent + '40;color:' + t.accent + ';font-family:monospace;font-size:10px;padding:5px 10px;border-radius:4px;cursor:pointer">Verify</button>\
          </div>\
          <div id="b4e-auth-code-hint" style="font-family:monospace;font-size:9px;color:' + t.muted + ';margin-top:4px"></div>\
          <div id="b4e-auth-code-err" style="font-family:monospace;font-size:9px;color:' + t.warm + ';margin-top:4px;display:none"></div>\
        </div>\
      </div>\
    </div>';

    if (widget._resize) setTimeout(widget._resize, 10);

    var emailInput = body.querySelector('#b4e-auth-email');
    var sendBtn = body.querySelector('#b4e-auth-send');
    var emailErr = body.querySelector('#b4e-auth-email-err');
    var emailStep = body.querySelector('#b4e-auth-email-step');
    var codeStep = body.querySelector('#b4e-auth-code-step');
    var codeInput = body.querySelector('#b4e-auth-code');
    var verifyBtn = body.querySelector('#b4e-auth-verify');
    var codeHint = body.querySelector('#b4e-auth-code-hint');
    var codeErr = body.querySelector('#b4e-auth-code-err');
    var authEmail = '';

    sendBtn.addEventListener('click', function () {
      authEmail = emailInput.value.trim().toLowerCase();
      if (!authEmail || authEmail.indexOf('@') === -1) {
        emailErr.textContent = 'Enter a valid email';
        emailErr.style.display = 'block';
        return;
      }
      emailErr.style.display = 'none';
      sendBtn.textContent = 'Sending...';
      sendBtn.disabled = true;

      fetch(AUTH_SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail }),
      }).then(function (res) {
        if (!res.ok) throw new Error('Failed');
        emailStep.style.display = 'none';
        codeStep.style.display = 'block';
        codeHint.textContent = 'Code sent to ' + authEmail;
        codeInput.focus();
      }).catch(function () {
        emailErr.textContent = 'Failed to send code';
        emailErr.style.display = 'block';
        sendBtn.textContent = 'Sign in';
        sendBtn.disabled = false;
      });
    });

    verifyBtn.addEventListener('click', function () {
      var code = codeInput.value.replace(/\D/g, '').slice(0, 6);
      if (code.length !== 6) return;
      codeErr.style.display = 'none';
      verifyBtn.textContent = 'Verifying...';
      verifyBtn.disabled = true;

      fetch(AUTH_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, code: code, ref: config.platform }),
      }).then(function (res) {
        if (!res.ok) throw new Error('Invalid code');
        return res.json();
      }).then(function (data) {
        if (data.apiKey) {
          try {
            localStorage.setItem(STORAGE_KEY, data.apiKey);
            localStorage.setItem(STORAGE_EMAIL, authEmail);
          } catch (e) {}
        }
        // Reload the brief with the new key
        if (reloadFn) reloadFn();
      }).catch(function (err) {
        codeErr.textContent = err.message || 'Invalid code';
        codeErr.style.display = 'block';
        verifyBtn.textContent = 'Verify';
        verifyBtn.disabled = false;
      });
    });
  }

  // --- Fetch ---
  function getApiKey() {
    // Partner key takes priority, then user's saved key
    if (config.key) return config.key;
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (e) { return ''; }
  }

  function fetchBrief(slug, callback) {
    var url = API_URL + '?slug=' + encodeURIComponent(slug);
    var headers = {};
    var key = getApiKey();
    if (key) {
      headers['Authorization'] = 'Bearer ' + key;
    }

    fetch(url, { headers: headers })
      .then(function (res) {
        if (res.status === 429) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            var err = new Error(data.upgrade || 'Daily limit reached');
            err.rateLimited = true;
            throw err;
          });
        }
        if (!res.ok) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            throw new Error(data.error || 'API returned ' + res.status);
          });
        }
        return res.json();
      })
      .then(function (brief) {
        callback(null, brief);
      })
      .catch(function (err) {
        callback(err);
      });
  }

  // --- Init ---
  function init() {
    // Don't inject twice
    if (document.getElementById('b4e-embed-widget')) return;

    var title = detectTitle();
    var target = findTarget();

    if (!title || !target) return;

    var slug = config.slug || slugify(title);

    // Create and insert widget (iframe-based)
    var widget = createWidget();
    if (config.position === 'before') {
      target.parentNode.insertBefore(widget, target);
    } else {
      target.parentNode.insertBefore(widget, target.nextSibling);
    }

    // Initialize iframe content after it's in the DOM
    // Small delay to ensure iframe is ready
    setTimeout(function () {
      widget._initIframe();

      // Fetch and render (triggered by user click)
      function loadBrief() {
        var body = widget._doc.querySelector('.b4e-e-body');
        body.innerHTML = '<div class="b4e-e-loading"><div class="b4e-e-spinner"></div><span class="b4e-e-loading-text">Generating context brief...</span></div>';
        if (widget._resize) setTimeout(widget._resize, 10);

        fetchBrief(slug, function (err, brief) {
          if (err) {
            if (err.rateLimited) {
              renderRateLimit(widget, err.message, loadBrief);
            } else {
              renderError(widget, err.message, loadBrief);
            }
            return;
          }
          renderBrief(widget, brief, slug);
          loadChartInEmbed(widget, title);
        });
      }

      // Wire generate button instead of auto-fetching
      var genBtn = widget._doc.querySelector('.b4e-e-generate-btn');
      if (genBtn) {
        genBtn.addEventListener('click', loadBrief);
      }
    }, 100);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // Delay slightly for SPAs that render after DOMContentLoaded
      setTimeout(init, 500);
    });
  } else {
    setTimeout(init, 500);
  }

  // Re-check for SPA navigation (title/URL changes)
  var lastHref = location.href;
  var observer = new MutationObserver(function () {
    if (location.href !== lastHref) {
      lastHref = location.href;
      var old = document.getElementById('b4e-embed-widget');
      if (old) old.remove();
      setTimeout(init, 1000);
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Expose manual API for partners who want programmatic control
  window.B4E = {
    /**
     * Manually inject a brief widget for a specific market.
     * @param {Object} opts
     * @param {HTMLElement} opts.target - Element to inject after
     * @param {string} opts.title - Market title
     * @param {string} [opts.slug] - Market slug (derived from title if omitted)
     * @param {string} [opts.position] - "after" or "before" (default: "after")
     */
    inject: function (opts) {
      if (!opts || !opts.target || !opts.title) return;

      var slug = opts.slug || slugify(opts.title);
      var widgetId = 'b4e-embed-' + slug;

      if (document.getElementById(widgetId)) return;

      var widget = createWidget();
      widget.id = widgetId;

      if (opts.position === 'before') {
        opts.target.parentNode.insertBefore(widget, opts.target);
      } else {
        opts.target.parentNode.insertBefore(widget, opts.target.nextSibling);
      }

      setTimeout(function () {
        widget._initIframe();

        function loadBrief() {
          var body = widget._doc.querySelector('.b4e-e-body');
          body.innerHTML = '<div class="b4e-e-loading"><div class="b4e-e-spinner"></div><span class="b4e-e-loading-text">Generating context brief...</span></div>';
          if (widget._resize) setTimeout(widget._resize, 10);

          fetchBrief(slug, function (err, brief) {
            if (err) {
              if (err.rateLimited) {
                renderRateLimit(widget, err.message, loadBrief);
              } else {
                renderError(widget, err.message, loadBrief);
              }
              return;
            }
            renderBrief(widget, brief, slug);
            loadChartInEmbed(widget, opts.title);
          });
        }

        var genBtn = widget._doc.querySelector('.b4e-e-generate-btn');
        if (genBtn) {
          genBtn.addEventListener('click', loadBrief);
        }
      }, 100);
    },
  };
})();
