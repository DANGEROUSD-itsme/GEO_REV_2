/* ==========================================================================
   flashcards.js — deck picker + 3D flip card.

   Mouse, touch and keyboard all drive the same state: Space/Enter flips,
   arrows move, and the mark buttons write straight to the persistent store so
   the overview page and the other tools see the same progress.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.pages = GEO.pages || {};

GEO.pages.flashcards = (function () {
  var DECKS, deckId, pos = 0, filterLearning = false;
  var order = {};                 // deckId -> index order (shuffle lives here)
  var flipped = false;

  function deck() { return DECKS.filter(function (d) { return d.id === deckId; })[0]; }
  function baseOrder(d) { return order[d.id] || d.cards.map(function (_, i) { return i; }); }

  function visible() {
    var d = deck();
    var idx = baseOrder(d);
    if (!filterLearning) return idx;
    var saved = GEO.store.get().cards;
    return idx.filter(function (i) { return saved[d.id + ':' + i] === 'learning'; });
  }

  function knownIn(d) {
    var saved = GEO.store.get().cards;
    return d.cards.filter(function (_, i) { return saved[d.id + ':' + i] === 'known'; }).length;
  }

  /* --------------------------------------------------------- deck picker */
  function renderDecks() {
    var host = document.getElementById('deck-grid');
    host.innerHTML = DECKS.map(function (d) {
      var k = knownIn(d);
      return '<button class="deck reveal reveal--up" data-deck="' + d.id + '" aria-pressed="' + (d.id === deckId) + '">' +
        '<span class="deck__t">' + d.name + '<span>' + k + '/' + d.cards.length + '</span></span>' +
        '<span class="deck__d">' + d.blurb + '</span>' +
        '<span class="meter meter--pos"><span class="meter__fill" style="width:' + (k / d.cards.length * 100) + '%"></span></span>' +
        '</button>';
    }).join('');

    var learning = DECKS.reduce(function (n, d) {
      var saved = GEO.store.get().cards;
      return n + d.cards.filter(function (_, i) { return saved[d.id + ':' + i] === 'learning'; }).length;
    }, 0);
    var sum = document.getElementById('fc-summary');
    if (sum) sum.textContent = learning + ' card' + (learning === 1 ? '' : 's') + ' flagged as still learning across all decks';
  }

  /* ---------------------------------------------------------- card stage */
  function renderCard() {
    var host = document.getElementById('card-stage');
    var d = deck();
    var idx = visible();

    if (!idx.length) {
      host.innerHTML = '<div class="card card--pad" style="text-align:center">' +
        '<p class="h3">Nothing flagged as “still learning” in this deck.</p>' +
        '<p class="small body-dim" style="margin-top:.5rem">Turn the filter off to see all ' + d.cards.length + ' cards again.</p></div>';
      return;
    }

    if (pos >= idx.length) pos = 0;
    if (pos < 0) pos = idx.length - 1;

    var i = idx[pos];
    var c = d.cards[i];
    var status = GEO.store.get().cards[d.id + ':' + i];
    flipped = false;

    host.innerHTML =
      '<div class="card-bar">' +
        '<span>Card ' + (pos + 1) + ' of ' + idx.length + ' · ' + d.name + '</span>' +
        (status ? '<span class="chip ' + (status === 'known' ? 'chip--pos' : 'chip--warn') + '">' +
          (status === 'known' ? 'Know it' : 'Still learning') + '</span>' : '') +
        '<span class="meter"><span class="meter__fill" style="width:' + ((pos + 1) / idx.length * 100) + '%"></span></span>' +
      '</div>' +
      '<div class="flip" id="flip" tabindex="0" role="button" aria-pressed="false" data-cursor-text="Flip"' +
        ' aria-label="Flashcard. Activate to flip between question and answer.">' +
        '<div class="flip__inner">' +
          '<div class="flip__face">' +
            '<span class="chip chip--accent">Question</span>' +
            '<p class="flip__q" style="margin-top:1.2rem">' + c.q + '</p>' +
            '<p class="small" style="color:var(--text-faint);margin-top:1.6rem">Click, or press <span class="kbd">Space</span>, to flip</p>' +
          '</div>' +
          '<div class="flip__face flip__face--back">' +
            '<span class="chip chip--pos">Answer</span>' +
            '<p class="flip__a" style="margin-top:1.2rem">' + c.a + '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="btn btn--sm btn--ghost" data-fc="prev">← Previous</button>' +
        '<button class="btn btn--sm btn--ghost" data-fc="next">Next →</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--sm" data-mark="learning" style="border-color:rgba(240,180,95,.4);color:var(--warn)">Still learning</button>' +
        '<button class="btn btn--sm" data-mark="known" style="border-color:rgba(53,210,154,.4);color:var(--pos)" data-magnetic="0.25">Know it</button>' +
      '</div>';

    fitCard();
    GEO.magnetic.refresh();
  }

  /* The two faces are absolutely positioned, so the card has to be told how
     tall it is — measured from whichever face is longer. */
  function fitCard() {
    var inner = document.querySelector('.flip__inner');
    if (!inner) return;
    var faces = inner.querySelectorAll('.flip__face');
    inner.style.height = 'auto';
    var h = 0;
    faces.forEach(function (f) { h = Math.max(h, f.scrollHeight); });
    inner.style.height = Math.max(h, 300) + 'px';
  }

  function flip() {
    var f = document.getElementById('flip');
    if (!f) return;
    flipped = !flipped;
    f.classList.toggle('is-flipped', flipped);
    f.setAttribute('aria-pressed', String(flipped));
  }

  function move(step) { pos += step; renderCard(); }

  function mark(status) {
    var d = deck(), idx = visible();
    if (!idx.length) return;
    var cardKey = d.id + ':' + idx[pos];

    GEO.store.mutate(function (s) { s.cards[cardKey] = status; });
    if (status === 'known') GEO.scene.pulse(0.4);

    /* When filtering to "still learning", a card marked known leaves the
       filtered set — so stay put rather than skipping the next card. */
    if (!(filterLearning && status === 'known')) pos++;
    renderDecks();
    renderCard();
  }

  /* ---------------------------------------------------------------- init */
  return {
    init: function () {
      DECKS = GEO.data.DECKS;
      deckId = DECKS[0].id;

      renderDecks();
      renderCard();

      document.getElementById('deck-grid').addEventListener('click', function (e) {
        var b = e.target.closest('[data-deck]');
        if (!b) return;
        deckId = b.getAttribute('data-deck');
        pos = 0;
        renderDecks();
        renderCard();
      });

      document.getElementById('card-stage').addEventListener('click', function (e) {
        var n;
        if ((n = e.target.closest('[data-fc]'))) { move(n.getAttribute('data-fc') === 'next' ? 1 : -1); return; }
        if ((n = e.target.closest('[data-mark]'))) { mark(n.getAttribute('data-mark')); return; }
        if (e.target.closest('#flip')) flip();
      });

      document.getElementById('fc-shuffle').addEventListener('click', function () {
        var d = deck(), o = baseOrder(d).slice();
        for (var i = o.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = o[i]; o[i] = o[j]; o[j] = tmp;
        }
        order[d.id] = o;
        pos = 0;
        renderCard();
      });

      var fbtn = document.getElementById('fc-filter');
      fbtn.addEventListener('click', function () {
        filterLearning = !filterLearning;
        fbtn.setAttribute('aria-pressed', String(filterLearning));
        fbtn.classList.toggle('is-on', filterLearning);
        pos = 0;
        renderCard();
      });

      /* Keyboard: the card is a real focusable control, and the arrows work
         from anywhere on the page that is not a text field. */
      document.addEventListener('keydown', function (e) {
        var tag = (document.activeElement && document.activeElement.tagName) || '';
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
      });

      window.addEventListener('resize', fitCard);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCard);
    }
  };
})();
