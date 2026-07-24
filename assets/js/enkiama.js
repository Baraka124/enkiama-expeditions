/* ══════════════════════════════════════════════════════════
   Enkiama — shared client
   Supabase connection, privacy-respecting analytics,
   and helpers used by the public forms.
   ══════════════════════════════════════════════════════════ */
(function () {
  var URL_  = 'https://trhwjbavwiiqujcsjppo.supabase.co';
  var ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyaHdqYmF2d2lpcXVqY3NqcHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzcyMDgsImV4cCI6MjEwMDQ1MzIwOH0.mUudEPwBTBR8paCM2Zd0NH5eX61YJ10DP6k9SXejwPQ';

  /* minimal REST helper — no SDK needed for insert/select */
  function api(table, method, body, query) {
    return fetch(URL_ + '/rest/v1/' + table + (query || ''), {
      method: method,
      headers: {
        'apikey': ANON,
        'Authorization': 'Bearer ' + ANON,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }

  window.Enkiama = {
    url: URL_,
    key: ANON,
    insert: function (table, row) { return api(table, 'POST', row); },
    select: function (table, query) {
      return fetch(URL_ + '/rest/v1/' + table + (query || ''), {
        headers: { 'apikey': ANON, 'Authorization': 'Bearer ' + ANON }
      }).then(function (r) { return r.ok ? r.json() : []; });
    }
  };


  /* ── HONEYPOT ──────────────────────────────────────────
     A field only a bot will fill. Invisible, unlabelled,
     never focusable, and ignored by password managers.     */
  window.Enkiama.honeypot = function (formEl) {
    if (!formEl || formEl.querySelector('.enk-hp')) return;
    var wrap = document.createElement('div');
    wrap.className = 'enk-hp';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden;';
    wrap.innerHTML = '<label>Do not fill this in<input type="text" name="company_website" tabindex="-1" autocomplete="off"></label>';
    formEl.appendChild(wrap);
  };
  window.Enkiama.isBot = function (formEl) {
    if (!formEl) return false;
    var f = formEl.querySelector('.enk-hp input');
    return !!(f && f.value);
  };

  /* ── ANALYTICS ────────────────────────────────────────
     No cookies. No persistent identifier. A random key per
     browser session only, so repeat views in one visit are
     not double-counted. Nothing personal is recorded.      */
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

    var KEY = 'enk_s';
    var sess = sessionStorage.getItem(KEY);
    if (!sess) {
      sess = (Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 18);
      sessionStorage.setItem(KEY, sess);
    }

    var ref = '';
    try {
      if (document.referrer) {
        var h = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (h && h !== location.hostname.replace(/^www\./, '')) ref = h;
      }
    } catch (e) {}

    var w = window.innerWidth;
    var device = w < 700 ? 'mobile' : (w < 1100 ? 'tablet' : 'desktop');

    var path = location.pathname.replace(/\/index\.html$/, '/') || '/';

    /* fire and forget — never block the page */
    var send = function () {
      api('page_views', 'POST', {
        path: path,
        referrer_host: ref,
        device: device,
        session_key: sess
      }).catch(function () {});
    };
    if ('requestIdleCallback' in window) requestIdleCallback(send, { timeout: 2500 });
    else setTimeout(send, 1200);
  } catch (e) {}
})();
