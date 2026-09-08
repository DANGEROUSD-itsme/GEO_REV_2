/* ==========================================================================
   smooth.js: inertial scrolling, on Lenis.

   Lenis (vendored in /vendor, so no CDN is involved) scrolls the real
   document rather than transforming a wrapper, which means position: sticky,
   the scrollbar, anchor links and scroll-into-view all keep working.

   Three things are wired up here:
     1. Lenis is driven from the site's single shared rAF ticker rather than
        starting a second loop of its own.
     2. ScrollTrigger is told to update on every Lenis frame, so scrubbed
        animations stay locked to the eased position instead of lagging.
     3. The nav's motion switch starts and stops it, and it never runs for
        touch (the platform's own momentum is better) or reduced motion.

   Panes that scroll on their own, the textareas and the horizontal contents
   rail, carry `data-lenis-prevent` so a wheel over them is left alone.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.smooth = (function () {
  var lenis = null, stopTick = null;

  function allowed() {
    return typeof Lenis !== 'undefined' && !GEO.env.coarse && !GEO.env.reducedMotion;
  }

  function markInnerScrollers() {
    /* Anything that scrolls internally must keep its native wheel handling. */
    var nodes = document.querySelectorAll('textarea, .table-scroll, .toc, .flip__face, .nav__links');
    Array.prototype.forEach.call(nodes, function (el) { el.setAttribute('data-lenis-prevent', ''); });
  }

  function start() {
    if (lenis || !allowed()) return;

    lenis = new Lenis({
      duration: 1.15,               // weight of the glide
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      syncTouch: false,             // leave real touch scrolling to the OS
      wheelMultiplier: 1,
      autoRaf: false                // we drive it from the shared ticker
    });

    markInnerScrollers();

    /* Scrubbed ScrollTrigger animations must read the eased position, not the
       browser's idea of it, or they trail a frame behind the content. */
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      ScrollTrigger.refresh();
    }

    stopTick = GEO.env.onTick(function (dt, time) {
      lenis.raf(time * 1000);
    });
  }

  function stop() {
    if (!lenis) return;
    if (stopTick) { stopTick(); stopTick = null; }
    lenis.destroy();
    lenis = null;
  }

  return {
    init: function () {
      start();
      GEO.env.on('motionchange', function (reduced) { reduced ? stop() : start(); });
      GEO.env.on('pointerchange', function () { GEO.env.coarse ? stop() : start(); });
      /* Content injected by a page module can add new inner scrollers. */
      window.addEventListener('load', markInnerScrollers);
    },

    /* In-page anchors ease to their target instead of teleporting. */
    scrollTo: function (y) {
      if (lenis) lenis.scrollTo(y, { duration: 1.2 });
      else window.scrollTo({ top: y, behavior: GEO.env.reducedMotion ? 'auto' : 'smooth' });
    },

    refresh: function () { if (lenis) { markInnerScrollers(); lenis.resize(); } },
    isRunning: function () { return !!lenis; }
  };
})();
