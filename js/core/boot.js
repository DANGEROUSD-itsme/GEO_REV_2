/* ==========================================================================
   boot.js — startup order for every page.

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
        /* A broken page module must not take the whole site with it — the
           static HTML underneath stays readable. */
        if (window.console) console.error('[geo] page module "' + name + '" failed:', e);
      }
    }

    /* 4. Motion layers, after the DOM is final. */
    GEO.reveal.init();
    GEO.counters.init();
    GEO.cursor.init();
    GEO.magnetic.init();
    if (GEO.scene && GEO.scene.bindSections) GEO.scene.bindSections();

    /* 5. Anything that measures layout needs one refresh once webfonts land. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { GEO.reveal.refresh(); });
    }
    window.addEventListener('load', function () { GEO.reveal.refresh(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
