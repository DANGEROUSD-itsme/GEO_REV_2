/* ==========================================================================
   magnetic.js — magnetic attraction for primary interactive elements.

   Any element with [data-magnetic] drifts toward the pointer once it enters a
   radius around it, and springs back when the pointer leaves. Strength and
   radius are per-element via data-magnetic="0.4" and data-magnetic-radius.

   Disabled entirely for coarse pointers and reduced motion. Nothing here is
   required to operate the element — it is decoration on top of a real button.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.magnetic = (function () {
  var items = [];
  var stop = null;

  function collect() {
    items = Array.prototype.slice.call(document.querySelectorAll('[data-magnetic]')).map(function (el) {
      return {
        el: el,
        strength: parseFloat(el.getAttribute('data-magnetic')) || 0.35,
        radius: parseFloat(el.getAttribute('data-magnetic-radius')) || 110,
        x: 0, y: 0, tx: 0, ty: 0,
        rect: null
      };
    });
    measure();
  }

  function measure() {
    items.forEach(function (it) { it.rect = it.el.getBoundingClientRect(); });
  }

  function run() {
    if (stop) return;
    stop = GEO.env.onTick(function (dt) {
      var p = GEO.env.pointer;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.rect) continue;

        /* Rects are viewport-relative, so they must be refreshed as the page
           scrolls; doing it here keeps it to one pass per frame. */
        var r = it.el.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;

        var dx = p.x - cx, dy = p.y - cy;
        var dist = Math.hypot(dx, dy);
        var reach = it.radius + Math.max(r.width, r.height) / 2;

        if (dist < reach) {
          var falloff = 1 - dist / reach;          // 1 at centre, 0 at the edge
          it.tx = dx * it.strength * falloff;
          it.ty = dy * it.strength * falloff;
        } else {
          it.tx = 0; it.ty = 0;
        }

        /* Springy return: attraction is quick, release is softer. */
        var lambda = (it.tx || it.ty) ? 14 : 8;
        it.x = GEO.env.damp(it.x, it.tx, lambda, dt);
        it.y = GEO.env.damp(it.y, it.ty, lambda, dt);

        it.el.style.transform = (Math.abs(it.x) < 0.01 && Math.abs(it.y) < 0.01)
          ? ''
          : 'translate3d(' + it.x.toFixed(2) + 'px,' + it.y.toFixed(2) + 'px,0)';
      }
    });
  }

  function halt() {
    if (stop) { stop(); stop = null; }
    items.forEach(function (it) { it.el.style.transform = ''; });
  }

  function shouldRun() { return !GEO.env.coarse && !GEO.env.reducedMotion; }

  return {
    init: function () {
      collect();
      if (shouldRun()) run();
      window.addEventListener('resize', measure);
      GEO.env.on('motionchange', function () { shouldRun() ? run() : halt(); });
      GEO.env.on('pointerchange', function () { shouldRun() ? run() : halt(); });
    },
    /* Pages that inject markup call this to pick up new magnetic elements. */
    refresh: function () { collect(); }
  };
})();
