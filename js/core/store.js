/* ==========================================================================
   store.js — revision progress, persisted across pages.

   This is a multi-page site, so progress has to survive navigation. It is
   written to localStorage under one namespaced key, with an in-memory
   fallback for private windows or blocked storage — every read and write is
   wrapped, and the app behaves correctly when nothing can be saved.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.store = (function () {
  var KEY = 'geo-rev-2:v1';
  var memory = null;          // fallback when storage is unavailable
  var available = (function () {
    try {
      var t = '__geo_probe__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  })();

  function blank() {
    return {
      cards: {},        // "deckId:index" -> "known" | "learning"
      supply: {},       // Toyota recall self-check: index -> 1 | 0
      teet: {},         // questionId -> { t, e1, e2, t2, compiled }
      test: {           // mock test state
        answers: {},    // part A index -> chosen option
        bText: {}, bSelf: {}, bRevealed: {},
        cText: {}, cSelf: {},
        remaining: null, finished: false
      },
      visited: {}
    };
  }

  function read() {
    if (!available) return memory || (memory = blank());
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var parsed = JSON.parse(raw);
      var base = blank();
      // Shallow-merge so a schema addition never breaks an existing save.
      Object.keys(base).forEach(function (k) {
        if (parsed[k] && typeof parsed[k] === 'object') {
          base[k] = Object.assign(base[k], parsed[k]);
        }
      });
      return base;
    } catch (e) { return blank(); }
  }

  var state = read();
  var subs = [];

  function persist() {
    if (!available) { memory = state; return; }
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { available = false; memory = state; }   // quota or blocked mid-session
  }

  function notify() { subs.forEach(function (fn) { try { fn(state); } catch (e) {} }); }

  return {
    available: available,
    get: function () { return state; },

    /* mutate(fn) — run a mutation, persist, then notify subscribers. */
    mutate: function (fn) {
      fn(state);
      persist();
      notify();
      return state;
    },

    on: function (fn) {
      subs.push(fn);
      return function () { subs = subs.filter(function (f) { return f !== fn; }); };
    },

    reset: function () {
      state = blank();
      persist();
      notify();
    },

    /* ---------------------------------------------------- derived summaries
       Used by the dashboard strip on the home page and each tool's header. */
    cardStats: function (decks) {
      var total = 0, known = 0, learning = 0;
      decks.forEach(function (d) {
        d.cards.forEach(function (_, i) {
          total++;
          var s = state.cards[d.id + ':' + i];
          if (s === 'known') known++;
          else if (s === 'learning') learning++;
        });
      });
      return { total: total, known: known, learning: learning };
    },

    testScore: function (partA, partB, partC) {
      var a = partA.reduce(function (n, q, i) { return n + (state.test.answers[i] === q.answer ? 1 : 0); }, 0);
      var b = partB.reduce(function (n, q, i) { return n + (Number(state.test.bSelf[i]) || 0); }, 0);
      var c = partC.parts.reduce(function (n, p) { return n + (Number(state.test.cSelf[p.id]) || 0); }, 0);
      return { a: a, b: b, c: c, total: a + b + c, answered: Object.keys(state.test.answers).length };
    },

    teetDone: function () {
      return Object.keys(state.teet).filter(function (k) { return state.teet[k] && state.teet[k].compiled; }).length;
    }
  };
})();
