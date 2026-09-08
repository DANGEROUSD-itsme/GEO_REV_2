/* ==========================================================================
   boot.js, startup order for every page.

   Page modules register themselves as GEO.pages[<name>] and are initialised
   BEFORE the reveal pass, so anything they inject is picked up by
   ScrollTrigger rather than sitting invisible.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.pages = GEO.pages || {};

(function () {
  function start() {
    /* 1. Uncover the page (or cut straight to it). */
    GEO.transition.reveal();

    /* 2. Header + routing. */
    GEO.nav.init();

    /* 3. Page-specific content and interactivity. */
    var name = document.body.getAttribute('data-page');
    var page = name && GEO.pages[name];
    if (page && typeof page.init === 'function') {
      try { page.init(); }
      catch (e) {
        /* A broken page module must not take the whole site with it, the
           static HTML underneath stays readable. */
        if (window.console) console.error('[geo] page module "' + name + '" failed:', e);
      }
    }

    /* 4. Motion layers, after the DOM is final. */
    GEO.reveal.init();
    GEO.counters.init();
    GEO.cursor.init();
    GEO.magnetic.init();
    GEO.interact.init();
    GEO.smooth.init();
    wireAnchors();
    if (GEO.scene && GEO.scene.bindSections) GEO.scene.bindSections();

    /* 5. The motion switch, and a diagnostics panel behind ?debug so a
          problem on someone else's device can be read off the screen. */
    wireMotionToggle();
    if (/[?&]debug/.test(location.search)) showDiagnostics();

    /* 6. Anything that measures layout needs one refresh once webfonts land. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { GEO.reveal.refresh(); });
    }
    window.addEventListener('load', function () { GEO.reveal.refresh(); });
  }

  /* In-page links ease to their target instead of teleporting. */
  function wireAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var node = document.getElementById(id);
      if (!node) return;
      e.preventDefault();
      var y = node.getBoundingClientRect().top + (window.pageYOffset || 0) - 90;
      GEO.smooth.scrollTo(y);
      /* Keep the target focusable for keyboard and screen-reader users. */
      node.setAttribute('tabindex', '-1');
      node.focus({ preventScroll: true });
    });
  }

  function wireMotionToggle() {
    var btn = document.querySelector('[data-motion-toggle]');
    if (!btn) return;
    function paint() {
      var on = !GEO.env.reducedMotion;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.title = on ? 'Motion is on. Tap to turn it off.' : 'Motion is off. Tap to turn it on.';
    }
    btn.addEventListener('click', function () { GEO.env.toggleMotion(); paint(); });
    GEO.env.on('motionchange', paint);
    paint();
  }

  function showDiagnostics() {
    var yes = function (v) { return v ? '<span class="ok">yes</span>' : '<span class="bad">NO</span>'; };
    var el = document.createElement('div');
    el.className = 'debug-panel';
    el.innerHTML =
      '<b>Diagnostics</b><br>' +
      'THREE loaded: ' + yes(typeof THREE !== 'undefined') + '<br>' +
      'GSAP loaded: ' + yes(!!window.gsap) + '<br>' +
      'ScrollTrigger: ' + yes(!!window.ScrollTrigger) + '<br>' +
      'WebGL available: ' + yes(GEO.env.webgl) + '<br>' +
      'Scene running: ' + yes(GEO.scene.ready) + ' (' + GEO.scene.mode + ')<br>' +
      'Reduced motion: ' + (GEO.env.reducedMotion ? '<span class="bad">ON, animation off</span>' : '<span class="ok">off</span>') + '<br>' +
      'Motion setting: ' + GEO.env.motionPref + '<br>' +
      'Performance tier: ' + GEO.env.tier + '<br>' +
      'Pointer: ' + (GEO.env.coarse ? 'touch' : 'mouse') + '<br>' +
      'Storage: ' + yes(GEO.store.available);
    document.body.appendChild(el);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
