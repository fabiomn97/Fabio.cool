/* fabio.cool — interactive features: language toggle (EN/ES), command menu,
   live version from GitHub, and the case-study trade-off simulator. */
(function () {
  'use strict';
  var root = document.documentElement;
  var REPO = 'fabiomn97/Who-I-Am';

  /* ------------------------------------------------------------------ */
  /* Strings used by the scripts themselves                              */
  /* ------------------------------------------------------------------ */
  var T = {
    en: {
      langBtn: 'ES', langLabel: 'Ver en español',
      cmdPlaceholder: 'Type a command or search…', cmdEmpty: 'No results',
      cmdNav: 'Go to', cmdActions: 'Actions',
      cmdFoot: ['↑↓ to move', '↵ to select', 'esc to close'],
      copyEmail: 'Copy email', emailCopied: 'Email copied: fabiom97@mit.edu',
      sendEmail: 'Send an email', downloadCv: 'Download CV', linkedin: 'Open LinkedIn',
      call: 'Call +1 (857) 250-8074', theme: 'Toggle light / dark', lang: 'Ver en español',
      top: 'Top', sections: {feature: 'Case study', decision: 'Product decision', reviews: 'Reviews', specs: 'By the numbers', changelog: 'Changelog', roadmap: 'Roadmap', labs: 'Labs', off: 'Interests', build: 'How I built this', contact: 'Contact'},
      ver: function (ago) { return 'v5 · updated ' + ago; },
      build: function (n, ago, msg, url) { return 'Build #' + n + ' · updated ' + ago + ' · <a href="' + url + '" target="_blank" rel="noopener" title="' + esc(msg) + '">latest change ↗</a> · built with <a href="#build">Claude Code</a>'; },
      simRead: function (s) {
        if (s < 35) return 'Most of the budget still rewards sales that would happen anyway.';
        if (s <= 78) return 'Near the peak: more total purchases and far more first-time ones.';
        return 'Too far: first-time purchases keep rising, but easy sales start to slip.';
      }
    },
    es: {
      langBtn: 'EN', langLabel: 'View in English',
      cmdPlaceholder: 'Escribe un comando o busca…', cmdEmpty: 'Sin resultados',
      cmdNav: 'Ir a', cmdActions: 'Acciones',
      cmdFoot: ['↑↓ para moverte', '↵ para elegir', 'esc para cerrar'],
      copyEmail: 'Copiar email', emailCopied: 'Email copiado: fabiom97@mit.edu',
      sendEmail: 'Enviar un email', downloadCv: 'Descargar CV', linkedin: 'Abrir LinkedIn',
      call: 'Llamar al +1 (857) 250-8074', theme: 'Cambiar modo claro / oscuro', lang: 'View in English',
      top: 'Inicio', sections: {feature: 'Caso de estudio', decision: 'Decisión de producto', reviews: 'Recomendaciones', specs: 'En números', changelog: 'Trayectoria', roadmap: 'Objetivos', labs: 'Labs', off: 'Intereses', build: 'Cómo lo construí', contact: 'Contacto'},
      ver: function (ago) { return 'v5 · actualizado ' + ago; },
      build: function (n, ago, msg, url) { return 'Build #' + n + ' · actualizado ' + ago + ' · <a href="' + url + '" target="_blank" rel="noopener" title="' + esc(msg) + '">último cambio ↗</a> · hecho con <a href="#build">Claude Code</a>'; },
      simRead: function (s) {
        if (s < 35) return 'Casi todo el presupuesto sigue premiando ventas que igual iban a ocurrir.';
        if (s <= 78) return 'Cerca del óptimo: más compras totales y muchas más primeras compras.';
        return 'Demasiado lejos: las primeras compras siguen subiendo, pero se pierden ventas fáciles.';
      }
    }
  };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var lang = 'en';
  function t() { return T[lang]; }

  /* ------------------------------------------------------------------ */
  /* 1. Language toggle                                                   */
  /*    Every text block is keyed by its English text; translations live  */
  /*    in assets/i18n-es.js. Anything without a translation stays in     */
  /*    English, and quotes from recommendations are never translated.    */
  /* ------------------------------------------------------------------ */
  var SEL = '.context,.announce>span:not(.pulse):not(.go),h1,h2,h3,h4,p,li,dt,dd,figcaption,.chip,.kicker,.btn,.nav-links a,.nav-strip a,.str-head>div,.str-name,.str-how,.str-proof,.spec-src,.result span,.kpi-l,.demo-title,.seg label,.app-bar b,.app-bar span,.fold,.see-more,.key>span,.invest-h span,.legend span,.flow-h,.step-b,.col-h b,.lab .link,.lnk b,.tool b,.tool span,.ft h3,.rv-src,.rel-tag,.trust-label,.ver-date,.rel-org,.lvl,.reviews-foot a,.cta-links small,.sim-lbl>span,.sim-mark,.sim-axis span,.sim-kl,.spec-label,.dc-result span,.patch-h,.ver,.gal-item figcaption';
  var SKIP = '[data-noi18n],.rv blockquote,.rv .more,.who,pre,.brand,script,.cmdk,.sim-kv,.toast';
  var blocks = null;
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function collect() {
    var all = Array.prototype.slice.call(document.querySelectorAll(SEL)).filter(function (el) { return !el.matches('.rel,.step,.results'); });
    var set = new Set(all);
    blocks = all.filter(function (el) {
      if (el.closest(SKIP)) return false;
      for (var p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
      return norm(el.textContent) !== '';
    }).map(function (el) { return {el: el, key: norm(el.textContent), en: el.innerHTML}; });
  }
  function applyLang(next) {
    lang = next;
    root.setAttribute('lang', lang);
    if (!blocks) collect();
    var map = (lang === 'es' && window.I18N_ES) || null;
    blocks.forEach(function (b) {
      var es = map && map[b.key];
      if (es && es.indexOf('{svg}') > -1) es = es.replace('{svg}', (b.en.match(/<svg[\s\S]*?<\/svg>/) || [''])[0]);
      b.el.innerHTML = es ? es : b.en;
    });
    var tEl = document.querySelector('title');
    if (!tEl.dataset.en) tEl.dataset.en = tEl.textContent;
    tEl.textContent = lang === 'es' ? 'Fabio Macedo · Product Manager' : tEl.dataset.en;
    var lb = document.getElementById('lang');
    if (lb) { lb.textContent = t().langBtn; lb.setAttribute('aria-label', t().langLabel); }
    renderVersion(); renderSim();
    if (cmd.list) cmd.render();
    store('lang', lang);
  }
  var langBtn = document.getElementById('lang');
  if (langBtn) langBtn.addEventListener('click', function () { applyLang(lang === 'en' ? 'es' : 'en'); });

  /* ------------------------------------------------------------------ */
  /* 2. Live version from GitHub                                          */
  /* ------------------------------------------------------------------ */
  var gh = null;
  function ago(date) {
    var s = (date - Date.now()) / 1000, rtf = new Intl.RelativeTimeFormat(lang, {numeric: 'auto'});
    var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (var i = 0; i < units.length; i++) if (Math.abs(s) >= units[i][1]) return rtf.format(Math.round(s / units[i][1]), units[i][0]);
    return rtf.format(0, 'minute');
  }
  function short(date) {
    var m = Math.max(1, Math.round((Date.now() - date) / 60000)), u = lang === 'es' ? ['min', 'h', 'd', 'sem'] : ['m', 'h', 'd', 'w'];
    if (m < 60) return m + u[0]; var h = Math.round(m / 60); if (h < 24) return h + u[1];
    var d = Math.round(h / 24); return d < 14 ? d + u[2] : Math.round(d / 7) + u[3];
  }
  function renderVersion() {
    if (!gh) return;
    var v = document.getElementById('ver'), b = document.getElementById('build-info');
    if (v) { v.textContent = 'v5 · ' + short(gh.date); v.title = t().ver(ago(gh.date)) + ' — ' + gh.msg; }
    if (b) b.innerHTML = t().build(gh.n, ago(gh.date), gh.msg, gh.url);
  }
  function loadVersion() {
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('gh')); } catch (e) {}
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) { gh = {n: cached.n, date: new Date(cached.date), msg: cached.msg, url: cached.url}; renderVersion(); return; }
    fetch('https://api.github.com/repos/' + REPO + '/commits?per_page=1', {headers: {Accept: 'application/vnd.github+json'}})
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        var link = r.headers.get('Link') || '', m = link.match(/[?&]page=(\d+)>; rel="last"/);
        return r.json().then(function (j) { return {n: m ? +m[1] : j.length, c: j[0]}; });
      })
      .then(function (d) {
        gh = {n: d.n, date: new Date(d.c.commit.committer.date), msg: d.c.commit.message.split('\n')[0], url: d.c.html_url};
        try { sessionStorage.setItem('gh', JSON.stringify({n: gh.n, date: gh.date.toISOString(), msg: gh.msg, url: gh.url, at: Date.now()})); } catch (e) {}
        renderVersion();
      })
      .catch(function () { /* keep the static fallback */ });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Command menu (⌘K / Ctrl+K)                                         */
  /* ------------------------------------------------------------------ */
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var hint = document.getElementById('cmdk-hint');
  if (hint) hint.textContent = isMac ? '⌘K' : 'Ctrl K';
  function toast(msg) {
    var el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }
  function go(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({behavior: 'smooth'}); }
  var cmd = {
    open: false, items: [], sel: 0,
    actions: function () {
      var s = t().sections, out = [];
      ['feature', 'decision', 'reviews', 'specs', 'changelog', 'roadmap', 'labs', 'off', 'build', 'contact'].forEach(function (id) {
        if (document.getElementById(id)) out.push({g: t().cmdNav, ic: '→', label: s[id], run: function () { go(id); }});
      });
      out.push(
        {g: t().cmdActions, ic: '@', label: t().copyEmail, run: function () { (navigator.clipboard ? navigator.clipboard.writeText('fabiom97@mit.edu') : Promise.reject()).then(function () { toast(t().emailCopied); }, function () { location.href = 'mailto:fabiom97@mit.edu'; }); }},
        {g: t().cmdActions, ic: '✉', label: t().sendEmail, run: function () { location.href = 'mailto:fabiom97@mit.edu'; }},
        {g: t().cmdActions, ic: '↓', label: t().downloadCv, run: function () { var a = document.createElement('a'); a.href = 'assets/Fabio-Macedo-CV.pdf'; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); }},
        {g: t().cmdActions, ic: 'in', label: t().linkedin, run: function () { window.open('https://www.linkedin.com/in/fabiomacedonaters', '_blank', 'noopener'); }},
        {g: t().cmdActions, ic: '☏', label: t().call, run: function () { location.href = 'tel:+18572508074'; }},
        {g: t().cmdActions, ic: '◐', label: t().theme, hint: 'T', run: function () { document.getElementById('theme').click(); }},
        {g: t().cmdActions, ic: 'Aa', label: t().lang, hint: 'L', run: function () { applyLang(lang === 'en' ? 'es' : 'en'); }}
      );
      return out;
    },
    build: function () {
      var wrap = document.createElement('div');
      wrap.className = 'cmdk'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', 'Command menu');
      wrap.innerHTML = '<div class="cmdk-box"><div class="cmdk-in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg><input type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" autocomplete="off" spellcheck="false"><kbd>esc</kbd></div><ul class="cmdk-list" id="cmdk-list" role="listbox"></ul><div class="cmdk-foot"></div></div>';
      document.body.appendChild(wrap);
      this.wrap = wrap; this.input = wrap.querySelector('input'); this.list = wrap.querySelector('.cmdk-list'); this.foot = wrap.querySelector('.cmdk-foot');
      var self = this;
      wrap.addEventListener('mousedown', function (e) { if (e.target === wrap) self.close(); });
      this.input.addEventListener('input', function () { self.sel = 0; self.render(); });
      this.input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); self.move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); self.move(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); self.exec(self.sel); }
        else if (e.key === 'Escape') { e.preventDefault(); self.close(); }
        else if (e.key === 'Tab') { e.preventDefault(); }
      });
    },
    render: function () {
      var q = norm(this.input.value).toLowerCase(), self = this;
      this.input.placeholder = t().cmdPlaceholder;
      this.foot.innerHTML = t().cmdFoot.map(function (x) { return '<span>' + x + '</span>'; }).join('');
      this.items = this.actions().filter(function (a) { return !q || a.label.toLowerCase().indexOf(q) > -1 || a.g.toLowerCase().indexOf(q) > -1; });
      if (this.sel >= this.items.length) this.sel = Math.max(0, this.items.length - 1);
      if (!this.items.length) { this.list.innerHTML = '<li class="cmdk-empty">' + t().cmdEmpty + '</li>'; this.input.removeAttribute('aria-activedescendant'); return; }
      var html = '', last = '';
      this.items.forEach(function (a, i) {
        if (a.g !== last) { html += '<li class="cmdk-group" role="presentation">' + a.g + '</li>'; last = a.g; }
        html += '<li class="cmdk-item" role="option" id="cmdk-' + i + '" data-i="' + i + '" aria-selected="' + (i === self.sel) + '"><span class="ic" aria-hidden="true">' + a.ic + '</span>' + esc(a.label) + (a.hint ? '<span class="hint">' + a.hint + '</span>' : '') + '</li>';
      });
      this.list.innerHTML = html;
      this.input.setAttribute('aria-activedescendant', 'cmdk-' + this.sel);
      Array.prototype.forEach.call(this.list.querySelectorAll('.cmdk-item'), function (li) {
        li.addEventListener('mousemove', function () { if (self.sel !== +li.dataset.i) { self.sel = +li.dataset.i; self.paint(); } });
        li.addEventListener('click', function () { self.exec(+li.dataset.i); });
      });
    },
    paint: function () {
      var self = this;
      Array.prototype.forEach.call(this.list.querySelectorAll('.cmdk-item'), function (li) { li.setAttribute('aria-selected', +li.dataset.i === self.sel); });
      this.input.setAttribute('aria-activedescendant', 'cmdk-' + this.sel);
      var cur = this.list.querySelector('[aria-selected="true"]'); if (cur) cur.scrollIntoView({block: 'nearest'});
    },
    move: function (d) { if (!this.items.length) return; this.sel = (this.sel + d + this.items.length) % this.items.length; this.paint(); },
    exec: function (i) { var a = this.items[i]; if (!a) return; this.close(); a.run(); },
    show: function () {
      if (!this.wrap) this.build();
      this.last = document.activeElement; this.input.value = ''; this.sel = 0; this.render();
      this.wrap.classList.add('open'); this.open = true; document.body.style.overflow = 'hidden';
      this.input.focus();
    },
    close: function () {
      if (!this.wrap) return;
      this.wrap.classList.remove('open'); this.open = false; document.body.style.overflow = '';
      if (this.last && this.last.focus) this.last.focus();
    }
  };
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); cmd.open ? cmd.close() : cmd.show(); }
  });
  var openBtn = document.getElementById('cmdk-open');
  if (openBtn) openBtn.addEventListener('click', function () { cmd.show(); });

  /* ------------------------------------------------------------------ */
  /* 4. Trade-off simulator (illustrative model, not BEES data)           */
  /*    s = share of the discount budget on medium/hard recommendations.  */
  /*    Easy recs mostly convert anyway; hard ones need the discount.     */
  /* ------------------------------------------------------------------ */
  var range = document.getElementById('sim-range');
  function model(s) {
    var easy = 0.55 + 0.12 * (1 - Math.exp(-3 * (1 - s)));
    var hard = 0.03 + 0.30 * (1 - Math.exp(-2.4 * s));
    return {total: easy + hard, first: hard * 0.6 + 0.03, waste: (1 - s) * 0.80 + s * 0.12};
  }
  var BASE = model(0.2);
  function pct(x) { var v = Math.round(x * 100); return (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v) + '%'; }
  function drawChart() {
    var pts = [], lo = Infinity, hi = -Infinity, i;
    for (i = 0; i <= 100; i++) { var y = model(i / 100).total; pts.push(y); lo = Math.min(lo, y); hi = Math.max(hi, y); }
    function Y(v) { return 100 - (v - lo) / (hi - lo) * 88; }
    var d = pts.map(function (v, i) { return (i ? 'L' : 'M') + (i * 3).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
    document.getElementById('sim-line').setAttribute('d', d);
    document.getElementById('sim-area').setAttribute('d', d + ' L300 110 L0 110 Z');
    drawChart.Y = Y;
  }
  function renderSim() {
    if (!range) return;
    var v = +range.value, s = v / 100, m = model(s);
    document.getElementById('sim-pct').textContent = v + '%';
    var kt = document.getElementById('k-total'), kf = document.getElementById('k-first'), kw = document.getElementById('k-waste');
    kt.textContent = pct(m.total / BASE.total - 1); kt.className = 'sim-kv ' + (m.total >= BASE.total ? 'up' : 'down');
    kf.textContent = pct(m.first / BASE.first - 1); kf.className = 'sim-kv ' + (m.first >= BASE.first ? 'up' : 'down');
    kw.textContent = Math.round(m.waste * 100) + '%'; kw.className = 'sim-kv ' + (m.waste <= BASE.waste ? 'up' : 'down');
    document.getElementById('sim-read').textContent = t().simRead(v);
    var x = v * 3, y = drawChart.Y(m.total);
    var c = document.getElementById('sim-cursor'); c.setAttribute('x1', x); c.setAttribute('x2', x);
    var dot = document.getElementById('sim-dot'); dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    range.setAttribute('aria-valuetext', v + '%');
  }
  if (range) {
    drawChart();
    range.addEventListener('input', renderSim);
    Array.prototype.forEach.call(document.querySelectorAll('.sim-mark'), function (b) {
      b.addEventListener('click', function () { range.value = b.dataset.v; renderSim(); });
    });
    renderSim();
  }

  /* ------------------------------------------------------------------ */
  /* Start                                                               */
  /* ------------------------------------------------------------------ */
  loadVersion();
  if (store('lang') === 'es') applyLang('es');
})();
