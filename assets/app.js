/* fabio.cool — interactive features: language toggle (EN/ES), command menu,
   live version from GitHub. */
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
      build: function (n, ago, msg, url) { return 'Build #' + n + ' · updated ' + ago + ' · <a href="' + url + '" target="_blank" rel="noopener" title="' + esc(msg) + '">latest change ↗</a> · built with <a href="#build">Claude Code</a>'; }
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
      build: function (n, ago, msg, url) { return 'Build #' + n + ' · actualizado ' + ago + ' · <a href="' + url + '" target="_blank" rel="noopener" title="' + esc(msg) + '">último cambio ↗</a> · hecho con <a href="#build">Claude Code</a>'; }
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
  var SEL = '.mbox-txt>span,.mbox-go,.context,.announce>span:not(.pulse):not(.go),h1,h2,h3,h4,p,li,dt,dd,figcaption,.chip,.kicker,.btn,.nav-links a,.nav-strip a,.str-head>div,.str-name,.str-how,.str-proof,.spec-src,.result span,.kpi-l,.demo-title,.seg label,.app-bar b,.app-bar span,.fold,.see-more,.key>span,.invest-h span,.legend span,.flow-h,.step-b,.col-h b,.lab .link,.lnk b,.tool b,.tool span,.ft h3,.rv-src,.rel-tag,.trust-label,.ver-date,.rel-org,.lvl,.reviews-foot a,.cta-links small,.spec-label,.dc-result span,.patch-h,.ver,.gal-item figcaption';
  var SKIP = '[data-noi18n],.mbox,.rv blockquote,.rv .more,.who,pre,.brand,script,.cmdk,.toast';
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
    renderVersion();
    if (cmd.list) cmd.render();
    if (MB.w && MB.w.classList.contains('open')) { if (MB.cur === null) MB.intro(); else MB.paint(); }
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
  var cmdBtn = document.getElementById('cmdk-open'); if (cmdBtn) cmdBtn.title = 'Search (' + (isMac ? '⌘K' : 'Ctrl+K') + ')';
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
        {g: t().cmdActions, ic: '?', label: MB.L[lang].cmd, run: function () { MB.show(); }},
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
  /* 4. Mystery Box: random fun facts, no repeats until the deck is empty */
  /* ------------------------------------------------------------------ */
  var FACTS = [
    {en: '<strong>I became an Arsenal fan because of the alphabet.</strong> Playing Winning Eleven as a kid, Arsenal was the first team on the list, so I always picked them. Years later, I still do, now for the right reasons.', es: '<strong>Me hice hincha del Arsenal por el abecedario.</strong> De niño, jugando Winning Eleven, el Arsenal era el primer equipo de la lista, así que siempre lo elegía. Años después lo sigo eligiendo, ahora por las razones correctas.', v: ['Loyalty', 'Lealtad']},
    {en: '<strong>I turned my dad into an Arsenal fan.</strong> We even traveled to London together once to watch them at the Emirates. My best stakeholder alignment to date.', es: '<strong>Convertí a mi papá en hincha del Arsenal.</strong> Hasta viajamos juntos una vez a Londres para verlos en el Emirates. Mi mejor alineamiento de stakeholders hasta hoy.', v: ['Influence', 'Influencia']},
    {en: '<strong>The day I left Lima to start my MBA, the team I support won a trophy.</strong> I watched Arsenal lift the Community Shield with my dad, on my last day at home.', es: '<strong>El día que dejé Lima para empezar mi MBA, mi equipo ganó un trofeo.</strong> Vi al Arsenal levantar la Community Shield con mi papá, en mi último día en casa.', v: ['Family', 'Familia']},
    {en: '<strong>My personal motto is Arsenal’s: <em>Victoria Concordia Crescit</em>,</strong> “victory through harmony.” It’s also how I like to run a team.', es: '<strong>Mi lema personal es el del Arsenal: <em>Victoria Concordia Crescit</em>,</strong> “la victoria a través de la armonía”. También es como me gusta liderar un equipo.', v: ['Collaboration', 'Colaboración']},
    {en: '<strong>My record in Call of Duty: Zombies is round 39</strong> on Kino der Toten, the classic map. Round 40 is on my roadmap.', es: '<strong>Mi récord en Call of Duty: Zombies es la ronda 39</strong> en Kino der Toten, el mapa clásico. La ronda 40 está en mi roadmap.', v: ['Persistence', 'Persistencia']},
    {en: '<strong>Call of Duty: Zombies is how I stay close to my high school friends.</strong> Different cities, same lobby.', es: '<strong>Call of Duty: Zombies es mi forma de seguir cerca de mis amigos del colegio.</strong> Distintas ciudades, el mismo lobby.', v: ['Keeping people close', 'Mantener a la gente cerca']},
    {en: '<strong>I love to cook. If you want to eat well, ask me for lomo saltado,</strong> a classic Peruvian stir-fry, always with a pisco sour.', es: '<strong>Me encanta cocinar. Si quieres comer bien, pídeme un lomo saltado,</strong> un clásico salteado peruano, siempre con un pisco sour.', v: ['Craft', 'Oficio']},
    {en: '<strong>I cook two cuisines, Peruvian and Italian.</strong> My Italian signature is a bell pepper pasta.', es: '<strong>Cocino dos cocinas, peruana e italiana.</strong> Mi plato italiano estrella es una pasta de pimiento.', v: ['Range', 'Versatilidad']},
    {en: '<strong>Before choosing business, I wanted to be a psychologist.</strong> That curiosity about why people do what they do never left; it’s always on my mind when I think about users and teammates.', es: '<strong>Antes de elegir negocios, quería ser psicólogo.</strong> Esa curiosidad por entender por qué la gente hace lo que hace nunca se fue; siempre la tengo presente cuando pienso en usuarios y en mi equipo.', v: ['Empathy', 'Empatía']},
    {en: '<strong>My best product insight started with a hypothesis I got wrong.</strong> The data said no, so I dropped it and kept digging until I found the real problem.', es: '<strong>Mi mejor insight de producto empezó con una hipótesis equivocada.</strong> Los datos dijeron que no, así que la descarté y seguí investigando hasta encontrar el problema real.', v: ['Intellectual honesty', 'Honestidad intelectual']},
    {en: '<strong>I’m a debate world champion.</strong> I was head delegate of the Peruvian team that won Harvard World Model United Nations in 2018. What stuck with me: losing an argument gracefully and changing my mind fast.', es: '<strong>Soy campeón mundial de debate.</strong> Fui jefe de delegación del equipo peruano que ganó Harvard World Model United Nations en 2018. Lo que me quedó: perder una discusión con elegancia y cambiar de opinión rápido.', v: ['Open-mindedness', 'Mente abierta']},
    {en: '<strong>I’ve trained 80+ students for Model UN, and 1,000+ sales reps for an app I helped build.</strong> Teaching is one of my favorite parts of any job.', es: '<strong>He entrenado a más de 80 estudiantes para Modelo ONU y a más de 1,000 vendedores para una app que ayudé a construir.</strong> Enseñar es de las partes que más disfruto de cualquier trabajo.', v: ['Teaching', 'Enseñar']},
    {en: '<strong>For 8 months, I led my manager’s team</strong> while also doing my own job.', es: '<strong>Durante 8 meses lideré el equipo de mi jefe</strong> mientras hacía mi propio trabajo.', v: ['Trust', 'Confianza']},
    {en: '<strong>I was 1 of 3 people chosen from 1,700+ applicants</strong> for AB InBev’s global trainee program, then spent six years earning it.', es: '<strong>Fui 1 de 3 personas elegidas entre más de 1,700 postulantes</strong> para el programa global de trainees de AB InBev, y pasé seis años ganándome ese lugar.', v: ['Work ethic', 'Ética de trabajo']},
    {en: '<strong>I built a bot so I’d never miss a class deadline.</strong> 15+ MIT classmates asked how to build their own.', es: '<strong>Construí un bot para no perderme nunca una entrega de clase.</strong> Más de 15 compañeros del MIT me pidieron cómo hacer el suyo.', v: ['Solve your own problems', 'Resolver tus propios problemas']},
    {en: '<strong>This website’s domain failed for 24 hours because of one invisible character.</strong> Finding it was its own little product investigation.', es: '<strong>El dominio de este sitio falló durante 24 horas por un solo carácter invisible.</strong> Encontrarlo fue su propia pequeña investigación de producto.', v: ['Attention to detail', 'Atención al detalle']},
    {en: '<strong>My first product job was an internship building a training app for a sales force.</strong> Years later, I’m still building tools for salespeople and shopkeepers.', es: '<strong>Mi primer trabajo de producto fue una práctica construyendo una app de capacitación para una fuerza de ventas.</strong> Años después, sigo construyendo herramientas para vendedores y bodegueros.', v: ['Consistency', 'Consistencia']},
    {en: '<strong>In college, I helped a mental-health nonprofit double its yearly donations,</strong> just by fixing how they collected and used their data.', es: '<strong>En la universidad ayudé a una ONG de salud mental a duplicar sus donaciones anuales,</strong> solo arreglando cómo recolectaban y usaban sus datos.', v: ['Impact', 'Impacto']},
    {en: '<strong>I helped create a beer-loving digital influencer from scratch.</strong> The character hit 5M+ views and 200K followers on Instagram and TikTok in three months.', es: '<strong>Ayudé a crear desde cero un influencer digital amante de la cerveza.</strong> El personaje superó 5M de vistas y 200K seguidores en Instagram y TikTok en tres meses.', v: ['Creativity', 'Creatividad']}
  ];
  var MB = {
    L: {
      en: {title: 'Mystery Box', prompt: 'Click the box for a fun fact about me', again: 'Another one', again2: 'Shuffle again', of: ' of ', close: 'Close', spin: ['Rolling the box…', 'Shaking it…', 'Almost…'], done: 'You found all of them. Shuffling the box again.', cmd: 'Open the Mystery Box'},
      es: {title: 'Mystery Box', prompt: 'Haz clic en la caja para un dato curioso sobre mí', again: 'Otro más', again2: 'Mezclar de nuevo', of: ' de ', close: 'Cerrar', spin: ['Girando la caja…', 'Agitándola…', 'Casi…'], done: 'Los encontraste todos. Mezclando la caja otra vez.', cmd: 'Abrir la Mystery Box'}
    },
    deck: [], seen: 0, cur: null, busy: false,
    shuffle: function () { var a = FACTS.map(function (_, i) { return i; }); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } this.deck = a; this.seen = 0; },
    build: function () {
      var w = document.createElement('div');
      w.className = 'mbox'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-labelledby', 'mbox-title');
      w.innerHTML = '<div class="mbox-card"><div class="mbox-top"><span class="mbox-kick" id="mbox-title"><i aria-hidden="true">?</i><span></span></span><button class="mbox-x" type="button">×</button></div><div class="mbox-stage" aria-live="polite"></div><div class="mbox-foot"><span class="mbox-count"></span><button class="mbox-again" type="button"></button></div></div>';
      document.body.appendChild(w);
      this.w = w; this.stage = w.querySelector('.mbox-stage'); this.count = w.querySelector('.mbox-count'); this.btn = w.querySelector('.mbox-again');
      var self = this;
      w.addEventListener('mousedown', function (e) { if (e.target === w) self.close(); });
      w.querySelector('.mbox-x').addEventListener('click', function () { self.close(); });
      this.btn.addEventListener('click', function () { self.draw(); });
      w.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); self.close(); }
        if (e.key === 'Tab') { var f = [w.querySelector('.mbox-x'), self.big && self.big.isConnected ? self.big : self.btn], i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
      });
    },
    labels: function () {
      var L = this.L[lang];
      this.w.querySelector('.mbox-kick span').textContent = L.title;
      this.w.querySelector('.mbox-x').setAttribute('aria-label', L.close);
      this.btn.textContent = this.seen >= FACTS.length ? L.again2 : L.again;
      this.count.textContent = this.seen ? this.seen + L.of + FACTS.length : '';
    },
    paint: function () {
      if (this.cur === null) return;
      var f = FACTS[this.cur];
      this.stage.innerHTML = '<p class="mbox-fact">' + f[lang] + '</p>';
      this.labels();
    },
    draw: function () {
      if (this.busy) return;
      if (this.seen >= FACTS.length) this.shuffle();
      var self = this, L = this.L[lang], reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var next = this.deck[this.seen++];
      if (reduce) { this.btn.hidden = false; this.cur = next; this.paint(); return; }
      this.busy = true; this.btn.disabled = true; this.btn.hidden = false; var k = 0;
      var el;
      if (this.big && this.big.isConnected) { this.big.classList.add('shake'); el = this.stage.querySelector('.mbox-prompt'); }
      else { this.stage.innerHTML = '<p class="mbox-spin"></p>'; el = this.stage.firstChild; }
      var timer = setInterval(function () { el.textContent = L.spin[k % L.spin.length]; k++; }, 220);
      el.textContent = L.spin[0];
      setTimeout(function () { clearInterval(timer); self.busy = false; self.btn.disabled = false; self.cur = next; self.paint(); self.btn.focus(); }, 700);
    },
    intro: function () {
      var self = this, L = this.L[lang];
      this.cur = null;
      this.stage.innerHTML = '<div class="mbox-intro"><button class="mbox-big" type="button" aria-label="' + L.prompt + '">?</button><p class="mbox-prompt">' + L.prompt + '</p></div>';
      this.big = this.stage.querySelector('.mbox-big');
      this.big.addEventListener('click', function () { self.draw(); });
      this.btn.hidden = true; this.labels();
    },
    show: function () {
      if (!this.w) this.build();
      if (!this.deck.length) this.shuffle();
      this.last = document.activeElement;
      this.w.classList.add('open'); document.body.style.overflow = 'hidden';
      this.intro(); this.big.focus();
    },
    close: function () {
      if (!this.w) return;
      this.w.classList.remove('open'); document.body.style.overflow = '';
      if (this.last && this.last.focus) this.last.focus();
    }
  };
  ['mbox-open', 'mbox-nav'].forEach(function (id) { var b = document.getElementById(id); if (b) b.addEventListener('click', function () { MB.show(); }); });

  /* ------------------------------------------------------------------ */
  /* Start                                                               */
  /* ------------------------------------------------------------------ */
  loadVersion();
  if (store('lang') === 'es') applyLang('es');
})();
