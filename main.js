// Price section entrance animation
(function() {
  const card = document.getElementById('priceCard');
  const ctx  = document.getElementById('priceContext');
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { 
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  if (card) obs.observe(card);
  if (ctx)  obs.observe(ctx);
})();

  function openConfirm() {
    var wa = document.getElementById('waConfirm');
    var link = document.getElementById('waLink');
    var subject = encodeURIComponent('Tanzania Julio 2026 — Marina, Blanca, Patricia, Casilda y Sevi');
    var body = encodeURIComponent('Hola Baraka,\n\nHemos revisado el itinerario y nos gustaría hablar del viaje.\n\nGracias.');
    link.href = 'mailto:barakaaloyce750@gmail.com?subject=' + subject + '&body=' + body;
    wa.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeConfirm(e) {
    if (e && e.target !== document.getElementById('waConfirm')) return;
    document.getElementById('waConfirm').classList.remove('show');
    document.body.style.overflow = '';
  }


  // Scroll-driven entrance animations
  function initScrollAnimations() {
    // Chapter header elements
    var chEls = document.querySelectorAll('.ch-label,.ch-rule,.ch-title,.ch-pull,.ch-sub,.ch-badge,.rhythm-note');
    // Day rows
    var dayRows = document.querySelectorAll('.day-row');

    var animObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          animObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    chEls.forEach(function(el) { animObs.observe(el); });

    // Day rows with staggered delay
    dayRows.forEach(function(row, i) {
      row.style.transitionDelay = (i % 6 * 0.08) + 's';
      animObs.observe(row);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }

  function toggleDay(id, triggerEl) {
    var body = document.getElementById(id);
    var lbl  = document.getElementById('lbl' + id);
    var isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    triggerEl.classList.toggle('is-open', !isOpen);
    lbl.textContent = isOpen ? 'ver el día completo' : 'cerrar';
    if (!isOpen) {
      setTimeout(function() {
        var rect = body.getBoundingClientRect();
        var navH = 56;
        if (rect.bottom > window.innerHeight - 20) {
          window.scrollBy({ top: rect.bottom - window.innerHeight + 80, behavior: 'smooth' });
        }
      }, 320);
    }
  }

// ── SIDE-RAIL PROGRESS ───────────────────────────────────────────────────
(function() {
  var rail      = document.getElementById('sideRail');
  var traveller = document.getElementById('srTraveller');
  var spmFill   = document.getElementById('spmFill');
  if (!rail) return;

  var CHAPTERS = ['kili','savanna','rift','prep','zanzibar'];

  // Gather segment elements and their fill bars
  var segments = CHAPTERS.map(function(id) {
    var seg = rail.querySelector('[data-chapter="' + id + '"]');
    return {
      id:   id,
      el:   document.getElementById(id),
      seg:  seg,
      fill: seg ? seg.querySelector('.sr-seg-fill') : null,
    };
  }).filter(function(s) { return s.el && s.seg; });

  var trackEl = rail.querySelector('.sr-track');

  // Show rail after first meaningful scroll
  var shown = false;
  function maybeShow() {
    if (!shown && window.scrollY > 80) {
      shown = true;
      rail.classList.add('sr-visible');
    }
  }

  function update() {
    maybeShow();

    var d   = document.documentElement;
    var scrolled = d.scrollTop;
    var total    = d.scrollHeight - d.clientHeight;
    var globalPct = total > 0 ? scrolled / total : 0;

    // Mobile thin bar
    if (spmFill) spmFill.style.width = (globalPct * 100).toFixed(1) + '%';

    // Work out per-segment fill & traveller position
    var trackRect   = trackEl.getBoundingClientRect();
    var trackTop    = trackRect.top + scrolled;   // absolute
    var trackHeight = trackRect.height;

    var activeId = CHAPTERS[0];
    var travTop  = 0; // relative to track top, in px

    segments.forEach(function(s) {
      var secRect  = s.el.getBoundingClientRect();
      var secTop   = secRect.top + scrolled;
      var secH     = s.el.offsetHeight;
      var segRect  = s.seg.getBoundingClientRect();
      var segTop   = segRect.top + scrolled;
      var segH     = segRect.height;

      // Viewport midpoint
      var mid = scrolled + window.innerHeight * 0.45;
      var progress = (mid - secTop) / secH; // 0..1 within section
      var clamped  = Math.max(0, Math.min(1, progress));

      if (s.fill) s.fill.style.height = (clamped * 100).toFixed(1) + '%';

      s.seg.classList.toggle('sr-seg-done',   clamped >= 1);
      s.seg.classList.toggle('sr-seg-active', clamped > 0 && clamped < 1);

      if (clamped > 0) {
        activeId = s.id;
        // Traveller position: absolute top within the track
        var segRelTop = segTop - trackTop;
        travTop = segRelTop + clamped * segH;
      }
    });

    rail.dataset.active = activeId;

    // Place traveller
    if (traveller) {
      traveller.style.top = Math.max(0, Math.min(trackHeight, travTop)) + 'px';
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();


  function sendEnquiry() {
    const subject = encodeURIComponent("Marina · Blanca · Patricia · Casilda · Sevi — Tanzania Julio 2026");
    const body = encodeURIComponent(
      "Hola,\n\nHemos visto el itinerario y nos interesa.\n\nResumen:\n• 3 Jul (noche): Llegada a Kilimanjaro\n• 4–5 Jul: Kilimanjaro World\n• 6–11 Jul: Savanna World\n• 12 Jul: Rift Valley Escape (Selela)\n• 13–14 Jul: Zanzíbar\n• 15 Jul (19:10): Salida desde JRO\n\nNos gustaría hablar de fechas, alojamiento y detalles.\n\nGracias."
    );
    window.location.href = "mailto:?subject=" + subject + "&body=" + body;
  }

  var navSections = [
    { id: 'kili',    dot: document.querySelector('.kili-dot') },
    { id: 'savanna', dot: document.querySelector('.sav-dot') },
    { id: 'rift',    dot: document.querySelector('.rift-dot') },
    { id: 'prep',    dot: document.querySelector('.prep-dot') },
  ];

  function updateNav() {
    var mid = window.scrollY + window.innerHeight * 0.45;
    var active = null;
    navSections.forEach(function(s) {
      var el = document.getElementById(s.id);
      if (!el) return;
      var top = el.getBoundingClientRect().top + window.scrollY;
      var bot = top + el.offsetHeight;
      if (mid >= top && mid < bot) active = s.id;
    });
    navSections.forEach(function(s) {
      if (s.dot) s.dot.classList.toggle('active', s.id === active);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

// ── Chapter header entrance observer ──
const headerObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); headerObs.unobserve(e.target); }});
}, {threshold: 0.15});
document.querySelectorAll('.chapter-header').forEach(h => headerObs.observe(h));

// ── Day row stagger entrance ──
const dayObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if(e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), (e.target.dataset.idx||0) * 60);
      dayObs.unobserve(e.target);
    }
  });
}, {threshold: 0.1, rootMargin: '0px 0px -30px 0px'});
document.querySelectorAll('.day-row').forEach((r, i) => { r.dataset.idx = i % 12; dayObs.observe(r); });

// ── Active chapter tracking → nav dot + label ──
const chapterSections = [
  {id: 'kili',    dot: document.querySelector('.kili-dot'),  label: 'I · Kilimanjaro World',   color: 'var(--kili-mid)'},
  {id: 'savanna', dot: document.querySelector('.sav-dot'),   label: 'II · Savanna World',       color: 'var(--sav-mid)'},
  {id: 'rift',    dot: document.querySelector('.rift-dot'),  label: 'III · Rift Valley Escape', color: 'var(--rift-mid)'},
  {id: 'prep',    dot: document.querySelector('.prep-dot'),  label: 'IV · Antes de salir',      color: 'var(--prep-mid)'},
  {id: 'zanzibar',dot: document.querySelector('.zan-dot'),   label: 'V · Zanzíbar',             color: 'var(--zan-mid)'},
];
const navLabel = document.getElementById('navChapterLabel');
const progressBar = document.querySelector('.scroll-progress');
const chapterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    const ch = chapterSections.find(c => c.id === e.target.id);
    if(!ch) return;
    if(e.isIntersecting) {
      chapterSections.forEach(c => c.dot && c.dot.classList.remove('active'));
      ch.dot && ch.dot.classList.add('active');
      if(navLabel) navLabel.textContent = ch.label;
      if(progressBar) progressBar.style.background = ch.color;
    }
  });
}, {threshold: 0.2});
chapterSections.forEach(c => { const el = document.getElementById(c.id); if(el) chapterObs.observe(el); });


// Prep card stagger
const prepObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), (parseInt(e.target.dataset.pidx)||0) * 80); prepObs.unobserve(e.target); }
  });
}, {threshold: 0.1});
document.querySelectorAll('.prep-card').forEach((c,i) => { c.dataset.pidx = i; prepObs.observe(c); });


// ── Packing checklist ──
const PACK_KEY = 'enkiama_packing_v1';
const packItems = [
  {cat:'Documentación', items:['Pasaporte (6 meses validez)', 'E-Visa Tanzania impresa', 'Seguro de viaje', 'Tarjetas y efectivo USD']},
  {cat:'Ropa · Safari', items:['Camisas manga larga (tonos tierra)', 'Pantalón ligero/convertible', 'Capa abrigada para amaneceres', 'Sombrero de ala ancha', 'Zapatillas cómodas']},
  {cat:'Ropa · Zanzíbar', items:['Bañador y pareo', 'Vestidos ligeros', 'Sandalia cómoda', 'Chal/bufanda para mezquitas']},
  {cat:'Salud', items:['Antipalúdico (prescrito)', 'Repelente DEET alto', 'Protector solar 50+', 'Botiquín básico', 'Antidiarreico']},
  {cat:'Tecnología', items:['Adaptador universal', 'Power bank', 'Cámara + cargador', 'Auriculares']},
  {cat:'Varios', items:['Linterna de cabeza', 'Gafas de sol polarizadas', 'Bolsa de tela plegable', 'Libro o kindle']},
];
function renderPacking() {
  const list = document.getElementById('packList');
  if(!list) return;
  const done = JSON.parse(localStorage.getItem(PACK_KEY)||'{}');
  let html = '';
  let total = 0, checked = 0;
  packItems.forEach(section => {
    html += '<p class="pack-cat">' + section.cat + '</p>';
    section.items.forEach(item => {
      total++;
      const key = section.cat + ':' + item;
      const isDone = done[key];
      if(isDone) checked++;
      html += '<div class="pack-item' + (isDone?' done':'') + '" onclick="togglePack(' + JSON.stringify(key) + ')">' +
        '<div class="pack-box">' + (isDone ? '<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') + '</div>' +
        '<span class="pack-label">' + item + '</span></div>';
    });
  });
  list.innerHTML = html;
  const pct = total ? (checked/total*100) : 0;
  const prog = document.getElementById('packProgress');
  const count = document.getElementById('packCount');
  if(prog) prog.style.width = pct.toFixed(0) + '%';
  if(count) count.textContent = checked + ' de ' + total + ' preparados';
}
function togglePack(key) {
  const done = JSON.parse(localStorage.getItem(PACK_KEY)||'{}');
  done[key] = !done[key];
  localStorage.setItem(PACK_KEY, JSON.stringify(done));
  renderPacking();
}
function resetPacking() {
  localStorage.removeItem(PACK_KEY);
  renderPacking();
}
renderPacking();


// Dark mode toggle
const darkBtn = document.getElementById('darkToggle');
if(darkBtn) {
  const isDark = localStorage.getItem('enkiama_theme') !== 'light';
  if(!isDark) document.body.classList.add('light-mode');
  darkBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('enkiama_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
  });
}


// Back to top button
const backTop = document.getElementById('backTop');
if(backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('visible', window.scrollY > 600);
  }, {passive:true});
}


// Countdown to Tanzania
(function() {
  const TRIP_DATE = new Date('2026-07-03T20:00:00');
  function updateCountdown() {
    const now = new Date();
    const diff = TRIP_DATE - now;
    const boxOld = document.getElementById('cdCells');
    const boxNew = document.getElementById('cdCellsFooter');
    const box = boxOld || boxNew;
    const lbl = document.getElementById('cdLabel');
    if(!box) return;
    if(diff <= 0) {
      box.innerHTML = '<span class="cd-num" style="font-size:1.1rem;">¡Tanzania os espera!</span>';
      if(lbl) lbl.textContent = '';
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    box.innerHTML = [
      [days, 'días'],
      [hours, 'h'],
      [mins, 'min'],
    ].map(r => '<div><div class="cd-num">' + String(r[0]).padStart(2,'0') + '</div><div class="cd-unit">' + r[1] + '</div></div>').join('');
    if(lbl) lbl.textContent = 'hasta Tanzania · Julio 2026';
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();


// ── #8  Nav-dot scroll-progress arcs ─────────────────────────────────
(function() {
  const arcs = {
    kili: document.querySelector('.kili-dot .nav-arc circle'),
    savanna: document.querySelector('.sav-dot .nav-arc circle'),
    rift: document.querySelector('.rift-dot .nav-arc circle'),
    prep: document.querySelector('.prep-dot .nav-arc circle'),
    zanzibar: document.querySelector('.zan-dot .nav-arc circle'),
  };
  const CIRC = 106.8;
  function updateArcs() {
    Object.keys(arcs).forEach(function(id) {
      const sec = document.getElementById(id);
      const arc = arcs[id];
      if (!sec || !arc) return;
      const rect = sec.getBoundingClientRect();
      const total = sec.offsetHeight;
      // progress 0..1 within section based on viewport center
      const top = rect.top;
      const visibleProgress = (-top + window.innerHeight * 0.45) / total;
      const clamped = Math.max(0, Math.min(1, visibleProgress));
      arc.style.strokeDashoffset = (CIRC * (1 - clamped)).toFixed(1);
    });
  }
  window.addEventListener('scroll', updateArcs, { passive: true });
  updateArcs();
})();

// ── #10  Route atlas — replaced by new full atlas section ──





// ── Lodges card entrance ───────────────────────────────────────────
(function() {
  const cards = document.querySelectorAll('.lodge-card');
  if (!cards.length) return;
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  cards.forEach(function(c) { obs.observe(c); });
})();



// ── Lodge spreads in-view animation (Phase 2) ────────────────────────
(function() {
  const spreads = document.querySelectorAll('.spread');
  if (!spreads.length) return;
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  spreads.forEach(function(s) { obs.observe(s); });
})();

// ── #2  Trigger handwritten signature draw on visibility ────────────
(function() {
  const sig = document.querySelector('.sig-handwritten');
  if (!sig) return;
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        sig.classList.add('draw');
        obs.unobserve(sig);
      }
    });
  }, { threshold: 0.4 });
  obs.observe(sig);
})();
