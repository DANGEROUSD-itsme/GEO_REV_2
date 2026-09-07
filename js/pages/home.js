/* ==========================================================================
   home.js — the overview page.

   Renders the saved-progress strip, the mark-allocation bars and the T.E.E.T
   legend from data. The rest of the page is authored HTML so it reads fine
   with scripts unavailable.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.pages = GEO.pages || {};

GEO.pages.home = (function () {

  function tile(label, value, sub, pct, tone) {
    var el = document.createElement('div');
    el.className = 'card reveal reveal--up';
    el.innerHTML =
      '<p class="eyebrow">' + label + '</p>' +
      '<p class="stat__value">' + value + '</p>' +
      '<p class="small body-dim">' + sub + '</p>' +
      '<div class="meter' + (tone ? ' meter--' + tone : '') + '"><div class="meter__fill"></div></div>';
    /* Fill after insertion so the width transition actually plays. */
    requestAnimationFrame(function () {
      var f = el.querySelector('.meter__fill');
      if (f) f.style.width = Math.max(0, Math.min(100, pct)) + '%';
    });
    return el;
  }

  function renderProgress() {
    var host = document.getElementById('progress-strip');
    if (!host || !GEO.data) return;

    var cards = GEO.store.cardStats(GEO.data.DECKS);
    var score = GEO.store.testScore(GEO.data.PART_A, GEO.data.PART_B, GEO.data.PART_C);
    var teet = GEO.store.teetDone();
    var total = GEO.data.EXAM.total;

    host.innerHTML = '';
    host.appendChild(tile('Flashcards mastered', cards.known + ' / ' + cards.total,
      cards.learning + ' still learning · ' + (cards.total - cards.known - cards.learning) + ' unseen',
      cards.total ? cards.known / cards.total * 100 : 0, 'pos'));

    host.appendChild(tile('TEET paragraphs', teet + ' / ' + GEO.data.TEET_QUESTIONS.length,
      'Compiled in the builder', teet / GEO.data.TEET_QUESTIONS.length * 100));

    host.appendChild(tile('Part A answered', score.answered + ' / ' + GEO.data.PART_A.length,
      score.a + ' correct so far', score.answered / GEO.data.PART_A.length * 100, 'warn'));

    host.appendChild(tile('Mock test score', score.total + ' / ' + total,
      'A ' + score.a + '/12 · B ' + score.b + '/13 · C ' + score.c + '/12',
      score.total / total * 100));

    var note = document.getElementById('progress-note');
    if (note) {
      note.textContent = GEO.store.available
        ? 'Progress is saved in this browser, so you can close the tab and pick up where you left off.'
        : 'Your browser is blocking site storage, so progress will last only until you leave the page.';
    }
  }

  function renderMarks() {
    var host = document.getElementById('mark-split');
    if (!host || !GEO.data) return;
    var EXAM = GEO.data.EXAM;

    host.innerHTML = EXAM.parts.map(function (p) {
      var pct = p.marks / EXAM.total * 100;
      return '<div class="mark-row">' +
        '<span>' + p.name + '<br><span class="small body-dim">' + p.note + '</span></span>' +
        '<span class="mark-row__v">' + p.marks + ' / ' + EXAM.total + '</span>' +
        '<div class="mark-row__bar meter"><div class="meter__fill" data-w="' + pct + '" style="background:' + p.color + '"></div></div>' +
        '</div>';
    }).join('');

    /* Bars grow when the block scrolls in — or immediately without GSAP. */
    var fills = host.querySelectorAll('.meter__fill');
    function grow() { fills.forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; }); }

    if (window.gsap && window.ScrollTrigger && !GEO.env.reducedMotion) {
      ScrollTrigger.create({ trigger: host, start: 'top 85%', once: true, onEnter: grow });
    } else {
      grow();
    }
  }

  function renderTeetLegend() {
    var host = document.getElementById('teet-legend');
    if (!host) return;
    var parts = [
      ['T', 'Topic sentence', 'State your main point clearly.', '#7b6cff'],
      ['E', 'Explanation', 'Explain how or why it occurs.', '#35d29a'],
      ['E', 'Example', 'Give specific, concrete evidence.', '#f0b45f'],
      ['T', 'Tie-back', 'Answer the question again.', '#ff5f7e']
    ];
    host.innerHTML = parts.map(function (p) {
      return '<div>' +
        '<span class="teet-box__tag" style="background:' + p[3] + '22;color:' + p[3] + '">' + p[0] + '</span>' +
        '<p style="margin-top:.6rem;font-weight:600;font-size:var(--step--1)">' + p[1] + '</p>' +
        '<p class="small body-dim">' + p[2] + '</p>' +
        '</div>';
    }).join('');
  }

  return {
    init: function () {
      renderProgress();
      renderMarks();
      renderTeetLegend();
    }
  };
})();
