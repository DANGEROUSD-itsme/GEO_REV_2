/* ==========================================================================
   test.js, the 37-mark mock paper.

   A four-state machine (Part A → Part B → Part C → Results) rather than a
   show/hide toggle: each transition animates, updates the step rail, moves
   focus to the new step heading, and re-checks the clock.

   The 45-minute timer starts on the first interaction. At zero it submits
   Parts A and B (locking answers and revealing the rubrics) but deliberately
   leaves Part C open, since an extended response is self-marked anyway.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.pages = GEO.pages || {};

GEO.pages.test = (function () {
  var A, B, C, EXAM;
  var step = 'a';
  var timer = null, remaining = 0, started = false, locked = false;

  var STEPS = [
    { id: 'a', label: 'Part A', sub: 'Multiple choice' },
    { id: 'b', label: 'Part B', sub: 'Short answer' },
    { id: 'c', label: 'Part C', sub: 'Extended response' },
    { id: 'results', label: 'Results', sub: 'Score' }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function T() { return GEO.store.get().test; }
  function score() { return GEO.store.testScore(A, B, C); }
  function fmt(sec) {
    sec = Math.max(0, sec);
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  /* ============================================================== render */
  function shell() {
    return '' +
      '<div class="test-bar">' +
        '<div class="test-bar__row">' +
          '<span><span class="eyebrow">Time</span> <b class="test-bar__time" id="clock">' + fmt(remaining) + '</b></span>' +
          '<span><span class="eyebrow">Marks</span> <b id="tally">0 / ' + EXAM.total + '</b></span>' +
          '<span class="small body-dim" id="subtally"></span>' +
          '<button class="btn btn--sm btn--ghost" id="reset" style="margin-left:auto">Reset test</button>' +
        '</div>' +
        '<div class="meter"><div class="meter__fill" id="test-progress"></div></div>' +
        '<div class="note note--neg" id="timeup" style="margin-top:.8rem;display:none">' +
          '<p>Time is up. Parts A and B are submitted and their answers revealed: Part C stays open so you can finish the extended response.</p></div>' +
      '</div>' +

      '<nav class="steps-nav" id="steps" aria-label="Test sections">' +
        STEPS.map(function (s) {
          return '<button class="step-dot" data-step="' + s.id + '"><i>' + s.label + '</i> ' + s.sub + '</button>';
        }).join('') +
      '</nav>' +

      '<section class="step" data-step="a" tabindex="-1" aria-labelledby="sh-a">' + partA() + '</section>' +
      '<section class="step" data-step="b" tabindex="-1" aria-labelledby="sh-b">' + partB() + '</section>' +
      '<section class="step" data-step="c" tabindex="-1" aria-labelledby="sh-c">' + partC() + '</section>' +
      '<section class="step" data-step="results" tabindex="-1" aria-labelledby="sh-r"><div id="results"></div></section>';
  }

  function stepHead(id, n, title, marks, note) {
    return '<header style="margin-bottom:1.4rem">' +
      '<p class="eyebrow eyebrow--accent">' + n + '</p>' +
      '<h2 class="h2" id="sh-' + id + '" style="margin:.3rem 0 .6rem">' + title + ' <span class="body-dim" style="font-size:var(--step-1)">' + marks + '</span></h2>' +
      '<p class="small body-dim" style="max-width:60ch">' + note + '</p></header>';
  }

  /* ---------------------------------------------------------- part A */
  function partA() {
    return stepHead('a', 'Part A', 'Multiple choice', '12 marks',
      'One answer per question. Feedback appears immediately and your answer locks in: just as it would once you had written it on the paper.') +
      '<div id="qa">' + A.map(qaHTML).join('') + '</div>' +
      '<div class="card-actions" style="margin-top:2rem">' +
        '<button class="btn btn--primary" data-go="b" data-magnetic="0.3">Continue to Part B →</button></div>';
  }

  function qaHTML(q, i) {
    var chosen = T().answers[i];
    var answered = chosen !== undefined;

    var opts = q.options.map(function (o, j) {
      var cls = 'option';
      if (answered) {
        if (j === q.answer) cls += ' is-correct';
        else if (j === chosen) cls += ' is-wrong';
        else cls += ' is-muted';
      }
      var key = answered ? (j === q.answer ? '✓' : j === chosen ? '✕' : String.fromCharCode(65 + j))
                         : String.fromCharCode(65 + j);
      return '<button class="' + cls + '" data-a="' + i + '" data-o="' + j + '"' + (answered || locked ? ' disabled' : '') + '>' +
        '<span class="option__k">' + key + '</span><span>' + o + '</span></button>';
    }).join('');

    var fb = '';
    if (answered) {
      var right = chosen === q.answer;
      fb = '<div class="feedback feedback--' + (right ? 'pos' : 'neg') + '">' +
        '<b>' + (right ? 'Correct' : 'Not quite') + '</b>' + q.explain + '</div>';
    }

    return '<div class="q" id="qa-' + i + '">' +
      '<div class="q__head"><span class="q__n">Q' + (i + 1) + '</span>' +
      '<span class="q__text">' + q.q + '</span><span class="q__marks">1 mark</span></div>' +
      '<div class="options">' + opts + '</div>' + fb + '</div>';
  }

  /* ---------------------------------------------------------- part B */
  function partB() {
    return stepHead('b', 'Part B', 'Short answer &amp; data analysis', '13 marks',
      'These are <b>self-marked</b>. Write your answer first, then reveal the rubric and the model answer and award yourself marks honestly: the rubric is the same one a marker would use.') +
      '<div id="qb">' + B.map(qbHTML).join('') + '</div>' +
      '<div class="card-actions" style="margin-top:2rem">' +
        '<button class="btn btn--sm btn--ghost" data-go="a">← Back to Part A</button>' +
        '<button class="btn btn--primary" data-go="c" data-magnetic="0.3">Continue to Part C →</button></div>';
  }

  function qbHTML(q, i) {
    var t = T();
    var open = !!t.bRevealed && t.bRevealed[i];
    return '<div class="q" id="qb-' + i + '">' +
      '<div class="q__head"><span class="q__n">Q' + (i + 1) + '</span>' +
        '<span class="q__text">' + q.q + '</span><span class="q__marks">' + q.marks + ' marks</span></div>' +
      '<label class="visually-hidden" for="tb-' + i + '">Answer to Part B question ' + (i + 1) + '</label>' +
      '<textarea class="textarea" id="tb-' + i + '" data-b="' + i + '" rows="' + (q.marks > 4 ? 9 : 6) + '" ' +
        'placeholder="Write your answer here…">' + esc((t.bText && t.bText[i]) || '') + '</textarea>' +
      '<div class="card-actions" style="margin-top:.8rem">' +
        '<button class="btn btn--sm btn--ghost" data-breveal="' + i + '" aria-expanded="' + open + '">' +
          (open ? 'Hide rubric &amp; model answer' : 'Reveal marking rubric &amp; model answer') + '</button>' +
        '<span class="selfmark"><label for="bs-' + i + '">Marks you awarded</label>' + sel('bs-' + i, 'b', i, q.marks, (t.bSelf || {})[i]) + '</span>' +
      '</div>' +
      (open ? rubricHTML(q) : '') + '</div>';
  }

  function rubricHTML(q) {
    return '<div class="rubric">' +
      '<div class="note note--accent"><div><p class="eyebrow eyebrow--accent">Marking rubric: ' + q.marks + ' marks</p>' +
        '<ul class="list" style="margin-top:.6rem">' + q.rubric.map(function (r) { return '<li><span>' + r + '</span></li>'; }).join('') + '</ul></div></div>' +
      '<div class="note note--pos"><div><p class="eyebrow" style="color:var(--pos)">Model answer</p>' +
        q.model.split('\n\n').map(function (p) { return '<p class="small" style="margin-top:.6rem">' + p + '</p>'; }).join('') + '</div></div>' +
      '</div>';
  }

  function sel(id, kind, key, max, val) {
    var o = '';
    for (var m = 0; m <= max; m++) {
      o += '<option value="' + m + '"' + (Number(val) === m ? ' selected' : '') + '>' + m + ' / ' + max + '</option>';
    }
    return '<select class="select" id="' + id + '" data-self="' + kind + '" data-key="' + key + '">' + o + '</select>';
  }

  /* ---------------------------------------------------------- part C */
  function partC() {
    var t = T();
    return stepHead('c', 'Part C', 'Extended response', '12 marks',
      'Also <b>self-marked</b>, against the exemplar below. Aim for a complete T.E.E.T cycle in every paragraph.') +
      '<div class="card card--pad" style="margin-bottom:1.4rem"><p style="font-size:var(--step-1);line-height:1.45">' + C.question + '</p></div>' +
      C.parts.map(function (p) {
        return '<div class="q">' +
          '<div class="q__head"><span class="chip chip--accent">' + p.marks + ' marks</span>' +
            '<span class="q__text"><b>' + p.name + '</b><br><span class="small body-dim">' + p.prompt + '</span></span>' +
            '<span class="selfmark"><label for="cs-' + p.id + '">Self-marked</label>' + sel('cs-' + p.id, 'c', p.id, p.marks, (t.cSelf || {})[p.id]) + '</span></div>' +
          (p.id === 'structure' ? '' :
            '<label class="visually-hidden" for="tc-' + p.id + '">' + p.name + '</label>' +
            '<textarea class="textarea" id="tc-' + p.id + '" data-c="' + p.id + '" rows="8" ' +
            'placeholder="Write this section of your extended response here…">' + esc((t.cText || {})[p.id] || '') + '</textarea>') +
          '</div>';
      }).join('') +
      '<div class="card-actions" style="margin-top:1.6rem">' +
        '<button class="btn btn--ghost" id="exemplar-btn" aria-expanded="false" data-magnetic="0.25">Reveal perfect-score exemplar</button>' +
      '</div>' +
      '<div id="exemplar" style="margin-top:1rem"></div>' +
      '<div class="card-actions" style="margin-top:2rem">' +
        '<button class="btn btn--sm btn--ghost" data-go="b">← Back to Part B</button>' +
        '<button class="btn btn--primary" data-go="results" data-magnetic="0.3">Finish &amp; score my test →</button></div>';
  }

  var TAGNAME = { T: 'Topic sentence', E1: 'Explanation', E2: 'Example', T2: 'Tie-back' };

  function exemplarHTML() {
    return '<div class="card card--pad exemplar">' +
      '<p class="eyebrow" style="color:var(--warn)">Perfect-score exemplar, 12 / 12</p>' +
      '<div class="exemplar__legend" style="margin-top:.8rem">' +
        Object.keys(TAGNAME).map(function (k) {
          return '<span class="chip tag tag--' + k + '">' + k.charAt(0) + ', ' + TAGNAME[k] + '</span>';
        }).join('') + '</div>' +
      C.exemplar.map(function (p) {
        return '<div style="margin-bottom:1.6rem">' +
          '<p class="eyebrow eyebrow--accent" style="margin-bottom:.5rem">' + p.heading + '</p>' +
          '<p>' + p.body.map(function (seg) {
            /* Colour is backed by a screen-reader label, so the T/E/E/T
               structure is never carried by colour alone. */
            return '<span class="tag tag--' + seg.tag + '">' +
              '<span class="visually-hidden">' + TAGNAME[seg.tag] + ': </span>' + seg.text + '</span>';
          }).join(' ') + '</p></div>';
      }).join('') +
      '<p class="small body-dim">Every paragraph completes the full cycle, and every Example carries specific data. That is what separates 12/12 from a mid-range response.</p>' +
      '</div>';
  }

  /* ---------------------------------------------------------- results */
  function renderResults() {
    var s = score();
    var pct = Math.round(s.total / EXAM.total * 100);

    var parts = [
      { label: 'Part A: Multiple choice', got: s.a, max: 12,
        nudge: 'Re-read the definitions, connection criteria and ICT case studies in the notes, then run the “Core Definitions” and “ICT Case Studies” decks.',
        link: 'flashcards.html' },
      { label: 'Part B: Short answer', got: s.b, max: 13,
        nudge: 'Go back to Transport &amp; global logistics, the Toyota supply chain and the Figure 1 trade-flow reasoning, then drill the “Car Supply Chain” deck.',
        link: 'notes.html#m-transport' },
      { label: 'Part C: Extended response', got: s.c, max: 12,
        nudge: 'Work through the Paris case study and the two Paris decks, then build all three paragraphs in the TEET builder.',
        link: 'teet.html' }
    ];
    var weakest = parts.slice().sort(function (x, y) { return (x.got / x.max) - (y.got / y.max); })[0];

    document.getElementById('results').innerHTML =
      stepHead('r', 'Results', 'Your score', s.total + ' / ' + EXAM.total,
        'Part A is marked automatically. Parts B and C use the marks you awarded yourself against the rubrics.') +
      '<div class="results">' +
        '<div class="card card--pad">' +
          '<p class="results__score">' + s.total + ' <span class="body-dim" style="font-size:var(--step-2)">/ ' + EXAM.total + '</span></p>' +
          '<p class="chip ' + (pct >= 75 ? 'chip--pos' : pct >= 50 ? 'chip--warn' : 'chip--neg') + '" style="margin-top:.8rem">' + pct + '%</p>' +
        '</div>' +
        '<div class="results__grid">' + parts.map(function (p) {
          var r = p.got / p.max;
          return '<div class="card"><p class="small body-dim">' + p.label + '</p>' +
            '<p class="stat__value" style="margin:.3rem 0 .8rem">' + p.got + ' / ' + p.max + '</p>' +
            '<div class="meter"><div class="meter__fill" style="width:' + (r * 100) + '%;background:' +
              (r >= 0.75 ? 'var(--pos)' : r >= 0.5 ? 'var(--warn)' : 'var(--neg)') + '"></div></div></div>';
        }).join('') + '</div>' +
        '<div class="note note--accent"><div><p><b>Revise next: ' + weakest.label + '.</b> ' + weakest.nudge + '</p>' +
          '<p style="margin-top:.8rem"><a class="btn btn--sm" href="' + weakest.link + '">Go there →</a></p></div></div>' +
        '<div class="card-actions">' +
          '<button class="btn btn--sm btn--ghost" data-go="a">Review Part A</button>' +
          '<button class="btn btn--sm btn--ghost" data-go="c">Back to Part C</button>' +
          '<a class="btn btn--sm btn--ghost" href="notes.html">Study notes</a>' +
        '</div>' +
      '</div>';
  }

  /* ============================================================ machine */
  function setStep(next, focus) {
    if (next === step) return;
    step = next;
    if (next === 'results') {
      renderResults();
      var sc = score();
      GEO.scene.setProgress(sc.total / EXAM.total);
      GEO.scene.pulse(1.0);
      GEO.scene.shock(sc.total / EXAM.total >= 0.5 ? 'pos' : 'warn');
    }

    var nodes = document.querySelectorAll('.step');
    nodes.forEach(function (n) { n.classList.toggle('is-active', n.getAttribute('data-step') === next); });

    document.querySelectorAll('#steps .step-dot').forEach(function (b) {
      var on = b.getAttribute('data-step') === next;
      if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    markDone();

    var active = document.querySelector('.step.is-active');
    if (active && window.gsap && !GEO.env.reducedMotion) {
      gsap.fromTo(active, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65, ease: 'expo.out' });
    }
    GEO.scene.setMix(next === 'results' ? 1 : 0.55);
    GEO.magnetic.refresh();
    GEO.interact.refresh();

    /* Move focus to the new section so keyboard and screen-reader users are
       taken with the transition rather than left behind. */
    if (focus !== false && active) active.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: GEO.env.reducedMotion ? 'auto' : 'smooth' });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function markDone() {
    var s = score();
    var done = { a: s.answered === A.length, b: Object.keys(T().bSelf || {}).length === B.length, c: Object.keys(T().cSelf || {}).length === C.parts.length };
    document.querySelectorAll('#steps .step-dot').forEach(function (b) {
      var id = b.getAttribute('data-step');
      b.classList.toggle('is-done', !!done[id]);
    });
  }

  /* -------------------------------------------------------------- clock */
  function tick() {
    remaining--;
    GEO.store.mutate(function (s) { s.test.remaining = remaining; });
    paintClock();
    if (remaining <= 0) {
      clearInterval(timer); timer = null;
      autoSubmit();
    }
  }

  function paintClock() {
    var c = document.getElementById('clock');
    if (!c) return;
    c.textContent = fmt(remaining);
    c.classList.toggle('is-low', remaining <= 300);
  }

  function startClock() {
    if (started || locked) return;
    started = true;
    timer = setInterval(tick, 1000);
    paintClock();
  }

  function autoSubmit() {
    locked = true;
    GEO.store.mutate(function (s) {
      B.forEach(function (_, i) { s.test.bRevealed[i] = true; });
    });
    document.getElementById('qa').innerHTML = A.map(qaHTML).join('');
    document.getElementById('qb').innerHTML = B.map(qbHTML).join('');
    var note = document.getElementById('timeup');
    if (note) note.style.display = '';
    updateBar();
  }

  function updateBar() {
    var s = score();
    /* The three rings in the scene are the three parts of the paper. */
    GEO.scene.charge(0, s.answered / A.length);
    GEO.scene.charge(1, s.b / 13);
    GEO.scene.charge(2, s.c / 12);
    var tally = document.getElementById('tally');
    var sub = document.getElementById('subtally');
    var bar = document.getElementById('test-progress');
    if (tally) tally.textContent = s.total + ' / ' + EXAM.total;
    if (sub) sub.textContent = 'Part A ' + s.a + '/12 · Part B ' + s.b + '/13 · Part C ' + s.c + '/12';
    if (bar) bar.style.width = (s.answered / A.length * 100) + '%';
    markDone();
  }

  /* --------------------------------------------------------------- init */
  return {
    init: function () {
      A = GEO.data.PART_A; B = GEO.data.PART_B; C = GEO.data.PART_C; EXAM = GEO.data.EXAM;

      var saved = T();
      remaining = (saved.remaining === null || saved.remaining === undefined) ? EXAM.duration * 60 : saved.remaining;
      locked = remaining <= 0;

      var root = document.getElementById('test-root');
      root.classList.add('object-room');
      root.innerHTML = shell();

      document.querySelector('.step[data-step="a"]').classList.add('is-active');
      document.querySelector('#steps .step-dot[data-step="a"]').setAttribute('aria-current', 'step');
      if (locked) { document.getElementById('timeup').style.display = ''; }
      updateBar();
      paintClock();

      /* The clock starts on the first real interaction with the paper. */
      ['pointerdown', 'keydown'].forEach(function (ev) {
        root.addEventListener(ev, startClock, { once: false });
      });

      root.addEventListener('click', function (e) {
        var n;

        if ((n = e.target.closest('[data-go]'))) { setStep(n.getAttribute('data-go')); return; }
        if ((n = e.target.closest('#steps .step-dot'))) { setStep(n.getAttribute('data-step')); return; }

        /* ---- Part A answer ---- */
        if ((n = e.target.closest('[data-a]'))) {
          if (locked) return;
          var i = Number(n.getAttribute('data-a'));
          if (T().answers[i] !== undefined) return;
          var chosen = Number(n.getAttribute('data-o'));
          GEO.store.mutate(function (s) { s.test.answers[i] = chosen; });
          /* Right and wrong each get their own shockwave through the field. */
          if (chosen === A[i].answer) {
            GEO.scene.pulse(0.5);
            GEO.scene.shock('pos');
            GEO.scene.burst(e.clientX, e.clientY, '#35d29a');
          } else {
            GEO.scene.shock('neg');
          }
          var host = document.getElementById('qa-' + i);
          host.outerHTML = qaHTML(A[i], i);
          updateBar();
          return;
        }

        /* ---- Part B rubric ---- */
        if ((n = e.target.closest('[data-breveal]'))) {
          var bi = n.getAttribute('data-breveal');
          GEO.store.mutate(function (s) { s.test.bRevealed[bi] = !s.test.bRevealed[bi]; });
          document.getElementById('qb-' + bi).outerHTML = qbHTML(B[bi], Number(bi));
          var again = document.querySelector('[data-breveal="' + bi + '"]');
          if (again) again.focus();
          return;
        }

        /* ---- Part C exemplar ---- */
        if (e.target.closest('#exemplar-btn')) {
          var btn = document.getElementById('exemplar-btn');
          var box = document.getElementById('exemplar');
          var open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!open));
          btn.textContent = open ? 'Reveal perfect-score exemplar' : 'Hide exemplar';
          box.innerHTML = open ? '' : exemplarHTML();
          if (!open && window.gsap && !GEO.env.reducedMotion) {
            gsap.from(box.firstElementChild, { opacity: 0, y: 20, duration: 0.7, ease: 'expo.out' });
          }
          return;
        }

        /* ---- reset ---- */
        if (e.target.closest('#reset')) {
          if (timer) { clearInterval(timer); timer = null; }
          GEO.store.mutate(function (s) {
            s.test = { answers: {}, bText: {}, bSelf: {}, bRevealed: {}, cText: {}, cSelf: {}, remaining: null, finished: false };
          });
          started = false; locked = false; step = 'a';
          GEO.pages.test.init();
          return;
        }
      });

      root.addEventListener('input', function (e) {
        var t = e.target;
        if (t.matches('[data-b]')) GEO.store.mutate(function (s) { s.test.bText[t.dataset.b] = t.value; });
        else if (t.matches('[data-c]')) GEO.store.mutate(function (s) { s.test.cText[t.dataset.c] = t.value; });
      });

      root.addEventListener('change', function (e) {
        var t = e.target;
        if (!t.matches('[data-self]')) return;
        var kind = t.getAttribute('data-self'), key = t.getAttribute('data-key'), v = Number(t.value);
        GEO.store.mutate(function (s) {
          if (kind === 'b') s.test.bSelf[key] = v; else s.test.cSelf[key] = v;
        });
        updateBar();
      });

      /* Leaving the page stops the clock rather than letting it run down in
         the background. */
      window.addEventListener('pagehide', function () { if (timer) clearInterval(timer); });
    }
  };
})();
