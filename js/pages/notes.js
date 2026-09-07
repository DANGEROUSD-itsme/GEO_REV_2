/* ==========================================================================
   notes.js — the Study Notes page.

   Renders seven modules from GEO.data, builds the contents rail with
   scroll-spy, and wires the two interactive pieces:
     · the Toyota supply-chain grid (explore / recall-quiz, self-check saved)
     · the Paris strategy cards (height-animated expand)
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.pages = GEO.pages || {};

GEO.pages.notes = (function () {
  var D = null;

  /* ------------------------------------------------------------- helpers */
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function list(items, cls) {
    return '<ul class="list ' + (cls || '') + '">' + items.map(function (i) { return '<li><span>' + i + '</span></li>'; }).join('') + '</ul>';
  }
  /* Positive/negative blocks carry a +/− glyph as well as colour, so the
     distinction survives colour blindness and greyscale printing. */
  function pn(title, items, tone) {
    var glyph = tone === 'pos' ? '+' : '−';
    return '<div class="pn pn--' + tone + '">' +
      '<p class="pn__head"><span class="pn__glyph">' + glyph + '</span>' + title + '</p>' +
      '<ul class="list">' + items.map(function (i) {
        return '<li><b>' + glyph + '</b><span>' + i + '</span></li>';
      }).join('') + '</ul></div>';
  }
  function module(id, n, title, body) {
    return '<section class="module" id="' + id + '" aria-labelledby="h-' + id + '">' +
      '<header class="module__head">' +
        '<span class="module__n">' + n + '</span>' +
        '<h2 class="module__t" id="h-' + id + '">' + title + '</h2>' +
      '</header>' + body + '</section>';
  }

  /* ------------------------------------------------------------- modules */
  function exam() {
    var E = D.EXAM;
    return '<div class="grid grid-3 reveal reveal--up">' + E.parts.map(function (p) {
      return '<div class="card"><p class="eyebrow" style="color:' + p.color + '">Part ' + p.id + '</p>' +
        '<p class="stat__value" style="margin-top:.4rem">' + p.marks + '</p>' +
        '<p class="small body-dim">' + p.note + '</p></div>';
    }).join('') + '</div>' +
    '<div class="card card--pad reveal reveal--up" style="margin-top:1rem">' +
      '<p><b>Duration:</b> ' + E.duration + ' minutes for ' + E.total + ' marks — about one minute per mark, plus reading time.</p>' +
      '<p style="margin-top:.6rem"><b>Core writing model:</b> ' + E.model + '</p>' +
    '</div>';
  }

  function definitions() {
    return '<div class="grid grid-2" data-stagger>' + D.DEFINITIONS.map(function (d) {
      return '<div class="card reveal reveal--up"><h3 class="h3">' + d.term + '</h3>' +
        '<p class="small body-dim" style="margin-top:.6rem">' + d.text + '</p></div>';
    }).join('') + '</div>';
  }

  function perception() {
    var P = D.PERCEPTION, L = P.twoLenses;
    return '<div class="card card--pad reveal reveal--up definition">' +
        '<p><b>Perception:</b> ' + P.definition + '</p>' +
        '<p class="eyebrow" style="margin:1.2rem 0 .6rem">Factors that shape it</p>' +
        '<div class="hint-chips">' + P.factors.map(function (f) { return '<span class="chip">' + f + '</span>'; }).join('') + '</div>' +
      '</div>' +

      '<h3 class="h3" style="margin:2.5rem 0 1rem">The four connection criteria</h3>' +
      '<div class="grid grid-2" data-stagger>' + P.criteria.map(function (c) {
        return '<div class="card reveal reveal--up">' +
          '<h4 class="h3">' + c.name + '</h4>' +
          '<p class="small body-dim" style="margin:.5rem 0 1rem">' + c.desc + '</p>' +
          '<div class="note note--accent"><div><b class="small">' + c.caseTitle + '</b>' +
          '<p class="small" style="margin-top:.3rem">' + c.caseText + '</p></div></div>' +
          '</div>';
      }).join('') + '</div>' +

      '<h3 class="h3" style="margin:2.5rem 0 .4rem">Two lenses, one place</h3>' +
      '<p class="small body-dim" style="margin-bottom:1.2rem">' + L.place + '</p>' +
      '<div class="lenses reveal reveal--up">' +
        '<div class="lens lens--a"><p class="eyebrow eyebrow--accent">' + L.left.label + '</p>' +
          '<p class="lens__who">' + L.left.who + '</p>' + list(L.left.points) + '</div>' +
        '<div class="lenses__vs" aria-hidden="true">versus</div>' +
        '<div class="lens lens--b"><p class="eyebrow" style="color:var(--warn)">' + L.right.label + '</p>' +
          '<p class="lens__who">' + L.right.who + '</p>' + list(L.right.points) + '</div>' +
      '</div>' +
      '<div class="note note--accent reveal reveal--up" style="margin-top:1rem"><p>' + L.takeaway + '</p></div>' +
      '<div class="note reveal reveal--up" style="margin-top:.6rem"><p>' + P.dualNaming + '</p></div>';
  }

  function ict() {
    return '<p class="lede small reveal reveal--up" style="max-width:60ch;margin-bottom:1.6rem">' + D.ICT.intro + '</p>' +
      '<div class="grid grid-2" data-stagger>' + D.ICT.cases.map(function (c) {
        return '<div class="card reveal reveal--up"><h3 class="h3">' + c.name + '</h3>' +
          '<p class="small body-dim" style="margin:.6rem 0 .8rem">' + c.desc + '</p>' +
          '<p class="small" style="color:var(--pos)">' + c.matters + '</p></div>';
      }).join('') + '</div>';
  }

  function transport() {
    var T = D.TRANSPORT;
    var html = '<div class="grid grid-2" data-stagger>' + T.modes.map(function (m) {
      return '<div class="card reveal reveal--up">' +
        '<div class="card__label"><h3 class="h3">' + m.name + '</h3>' +
        '<span class="stat__value" style="margin-left:auto;font-size:var(--step-2)">' + m.stat + '</span></div>' +
        '<p class="small body-dim">' + m.desc + '</p>' +
        '<p class="small" style="margin-top:.5rem;color:var(--text-faint)">' + m.extra + '</p></div>';
    }).join('') + '</div>';

    html += '<h3 class="h3" style="margin:2.5rem 0 .4rem">The Toyota car supply chain</h3>' +
      '<p class="small body-dim" style="max-width:62ch;margin-bottom:1.2rem">' + T.toyota.intro + '</p>' +
      '<div class="supply-controls">' +
        '<button class="btn btn--sm" data-supply-mode="explore">Explore</button>' +
        '<button class="btn btn--sm" data-supply-mode="quiz">Quiz me</button>' +
        '<span style="width:1px;height:22px;background:var(--line)"></span>' +
        '<button class="btn btn--sm btn--ghost" data-supply-all="1">Reveal all</button>' +
        '<button class="btn btn--sm btn--ghost" data-supply-all="0">Hide all</button>' +
        '<span class="small body-dim" id="supply-status" style="margin-left:auto" role="status"></span>' +
      '</div>' +
      '<div class="supply-grid" id="supply-grid"></div>';

    html += '<h3 class="h3" style="margin:2.5rem 0 1rem">' + T.trade.title + '</h3>' +
      '<div class="grid grid-2" data-stagger>' + T.trade.items.map(function (it) {
        var tone = it.tone === 'pos' ? 'pos' : 'neg';
        return '<div class="card reveal reveal--up" style="border-color:' + (tone === 'pos' ? 'rgba(53,210,154,.32)' : 'rgba(255,95,126,.32)') + '">' +
          '<p class="eyebrow" style="color:var(--' + tone + ')">' + it.label + '</p>' +
          '<h4 class="h3" style="margin:.4rem 0 1rem">' + it.region + '</h4>' + list(it.reasons) + '</div>';
      }).join('') + '</div>';

    return html;
  }

  function tourismTypes() {
    return '<div class="grid grid-4" data-stagger>' + D.TOURISM_TYPES.map(function (t) {
      return '<div class="card reveal reveal--up"><h3 class="h3">' + t.name + '</h3>' +
        '<p class="small body-dim" style="margin-top:.6rem">' + t.desc + '</p></div>';
    }).join('') + '</div>';
  }

  function paris() {
    var P = D.PARIS;
    var html = '<div class="card card--pad reveal reveal--up">' +
      '<div class="grid grid-2" style="align-items:start">' +
        '<div><p class="eyebrow">Annual arrivals</p><p class="stat__value">' + P.profile.arrivals + '</p>' +
        '<p class="small body-dim" style="margin-top:.8rem">' + P.profile.infrastructure + '</p></div>' +
        '<div><p class="eyebrow" style="margin-bottom:.6rem">Key attractions</p>' +
        '<div class="hint-chips">' + P.profile.attractions.map(function (a) { return '<span class="chip">' + a + '</span>'; }).join('') + '</div></div>' +
      '</div></div>';

    html += '<h3 class="h3" style="margin:2.5rem 0 .3rem">Triple Bottom Line — impacts of overtourism</h3>' +
      '<p class="small body-dim" style="margin-bottom:1.2rem">Positives are marked <b style="color:var(--pos)">+</b>, negatives <b style="color:var(--neg)">−</b>, as well as colour-coded.</p>' +
      '<div class="tbl" data-stagger>' + P.tbl.map(function (col) {
        return '<div class="tbl__col reveal reveal--up">' +
          '<h4 class="tbl__pillar">' + col.pillar + '</h4>' +
          pn('Positive', col.positives, 'pos') +
          pn('Negative', col.negatives, 'neg') +
          (col.policy ? '<div class="note"><p>' + col.policy + '</p></div>' : '') +
          '</div>';
      }).join('') + '</div>';

    html += '<h3 class="h3" style="margin:2.5rem 0 .3rem">Management strategies</h3>' +
      '<p class="small body-dim" style="margin-bottom:1.2rem">Effectiveness at a glance — expand any strategy for its mechanism, pros and cons.</p>' +
      '<div id="strategies">' + P.strategies.map(function (s, i) {
        return '<div class="strategy" data-strategy="' + i + '">' +
          '<button class="strategy__head" aria-expanded="false" aria-controls="strat-' + i + '">' +
            '<span class="strategy__name">' + s.name + '</span>' +
            '<span class="rating" data-level="' + s.level + '" aria-hidden="true"><i></i><i></i><i></i></span>' +
            '<span class="chip ' + (s.level === 3 ? 'chip--pos' : 'chip--warn') + '">' + s.rating + '</span>' +
            '<span class="acc__sign" aria-hidden="true"></span>' +
          '</button>' +
          '<div class="strategy__body" id="strat-' + i + '"><div class="strategy__inner">' +
            '<div class="note note--accent"><div><b class="small">Mechanism</b><p class="small" style="margin-top:.3rem">' + s.mechanism + '</p></div></div>' +
            '<div class="grid grid-2">' + pn('Pros', s.pros, 'pos') + pn('Cons', s.cons, 'neg') + '</div>' +
            (s.support ? '<p class="small" style="color:var(--pos)">' + s.support + '</p>' : '') +
          '</div></div></div>';
      }).join('') + '</div>';

    return html;
  }

  /* --------------------------------------------- Toyota supply-chain grid */
  var supplyMode = 'explore';
  var revealed = {};

  function renderSupply() {
    var host = document.getElementById('supply-grid');
    if (!host) return;
    var rows = D.TRANSPORT.toyota.rows;
    var saved = GEO.store.get().supply;
    var quiz = supplyMode === 'quiz';

    document.querySelectorAll('[data-supply-mode]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-supply-mode') === supplyMode);
    });
    document.querySelectorAll('[data-supply-all]').forEach(function (b) { b.style.display = quiz ? 'none' : ''; });

    host.innerHTML = rows.map(function (r, i) {
      var open = !!revealed[i];
      var res = saved[i];
      var head = '<span class="node__c"><b>' + String(i + 1).padStart(2, '0') + '</b>' + r.country + '</span>';

      if (quiz) {
        var body = open
          ? '<p class="node__p">' + r.parts + '</p>' +
            '<div class="node__actions">' +
              '<button class="btn btn--sm" data-supply-mark="' + i + '" data-v="1">✓ Got it</button>' +
              '<button class="btn btn--sm" data-supply-mark="' + i + '" data-v="0">✕ Missed</button>' +
            '</div>'
          : '<p class="node__hint">Which component(s) does this country supply?</p>' +
            '<div class="node__actions"><button class="btn btn--sm btn--ghost" data-supply-open="' + i + '">Reveal answer</button></div>';
        var mark = res === 1 ? ' is-right' : res === 0 ? ' is-wrong' : '';
        return '<div class="node' + mark + '">' + head + body +
          (res !== undefined ? '<p class="node__hint" style="color:var(--' + (res ? 'pos' : 'neg') + ')">' +
            (res ? 'Marked correct' : 'Marked as missed — revise this one') + '</p>' : '') + '</div>';
      }

      return '<button class="node' + (open ? ' is-open' : '') + '" data-supply-open="' + i + '" aria-expanded="' + open + '">' +
        head + (open ? '<p class="node__p">' + r.parts + '</p>' : '<p class="node__hint">Tap to reveal components</p>') +
        '</button>';
    }).join('');

    var status = document.getElementById('supply-status');
    if (status) {
      if (quiz) {
        var keys = Object.keys(saved);
        var right = keys.filter(function (k) { return saved[k] === 1; }).length;
        status.innerHTML = 'Recall: <b>' + right + '</b> correct of ' + keys.length + ' attempted · ' + rows.length + ' countries' +
          ' <button class="btn btn--sm btn--ghost" data-supply-reset="1" style="margin-left:.6rem">Reset</button>';
      } else {
        status.textContent = rows.length + ' supplying countries';
      }
    }
    GEO.magnetic.refresh();
  }

  /* ----------------------------------------------------- contents + spy */
  function buildTOC(mods) {
    var toc = document.getElementById('toc');
    if (!toc) return;
    toc.innerHTML = mods.map(function (m) {
      return '<a href="#' + m.id + '" data-spy="' + m.id + '">' + m.short + '</a>';
    }).join('');

    var links = toc.querySelectorAll('a');
    function setCurrent(id) {
      links.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-spy') === id); });
    }
    setCurrent(mods[0].id);

    if (window.ScrollTrigger) {
      mods.forEach(function (m) {
        ScrollTrigger.create({
          trigger: '#' + m.id, start: 'top 40%', end: 'bottom 40%',
          onToggle: function (s) { if (s.isActive) setCurrent(m.id); }
        });
      });
    } else if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
      }, { rootMargin: '-40% 0px -55% 0px' });
      mods.forEach(function (m) { var n = document.getElementById(m.id); if (n) io.observe(n); });
    }
  }

  /* --------------------------------------------------- expand animation */
  function toggleStrategy(wrap) {
    var body = wrap.querySelector('.strategy__body');
    var head = wrap.querySelector('.strategy__head');
    var open = wrap.classList.toggle('is-open');
    head.setAttribute('aria-expanded', String(open));

    var target = open ? body.scrollHeight : 0;
    if (window.gsap && !GEO.env.reducedMotion) {
      gsap.to(body, {
        height: target, duration: 0.55, ease: 'expo.out',
        onComplete: function () {
          body.style.height = open ? 'auto' : '0px';
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }
      });
    } else {
      body.style.height = open ? 'auto' : '0px';
    }
  }

  /* ---------------------------------------------------------------- init */
  return {
    init: function () {
      D = GEO.data;
      var host = document.getElementById('modules');
      if (!host || !D) return;

      var mods = [
        { id: 'm-exam',        short: 'Exam specs',     title: 'Exam specifications',            body: exam },
        { id: 'm-definitions', short: 'Definitions',    title: 'Core definitions',               body: definitions },
        { id: 'm-perception',  short: 'Perceptions',    title: 'Perceptions of place',           body: perception },
        { id: 'm-ict',         short: 'ICT',            title: 'ICT global interconnections',    body: ict },
        { id: 'm-transport',   short: 'Transport',      title: 'Transport &amp; global logistics', body: transport },
        { id: 'm-tourism',     short: 'Tourism types',  title: 'Types of tourism',               body: tourismTypes },
        { id: 'm-paris',       short: 'Paris',          title: 'Overtourism in Paris',           body: paris }
      ];

      host.innerHTML = mods.map(function (m, i) {
        return module(m.id, String(i + 1).padStart(2, '0'), m.title, m.body());
      }).join('');

      buildTOC(mods);
      renderSupply();

      /* -------- delegated interaction -------- */
      host.addEventListener('click', function (e) {
        var t = e.target;
        var n;

        if ((n = t.closest('[data-supply-open]'))) {
          var i = n.getAttribute('data-supply-open');
          revealed[i] = !revealed[i];
          renderSupply();
          return;
        }
        if ((n = t.closest('[data-supply-mark]'))) {
          var idx = n.getAttribute('data-supply-mark');
          var v = Number(n.getAttribute('data-v'));
          GEO.store.mutate(function (s) { s.supply[idx] = v; });
          revealed[idx] = false;
          if (v === 1) GEO.scene.pulse(0.35);
          renderSupply();
          return;
        }
        if ((n = t.closest('.strategy__head'))) { toggleStrategy(n.closest('.strategy')); return; }
      });

      document.addEventListener('click', function (e) {
        var n;
        if ((n = e.target.closest('[data-supply-mode]'))) {
          supplyMode = n.getAttribute('data-supply-mode');
          revealed = {};
          renderSupply();
        } else if ((n = e.target.closest('[data-supply-all]'))) {
          var on = n.getAttribute('data-supply-all') === '1';
          revealed = {};
          if (on) D.TRANSPORT.toyota.rows.forEach(function (_, i) { revealed[i] = true; });
          renderSupply();
        } else if (e.target.closest('[data-supply-reset]')) {
          GEO.store.mutate(function (s) { s.supply = {}; });
          revealed = {};
          renderSupply();
        }
      });
    }
  };
})();
