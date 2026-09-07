/* ==========================================================================
   cursor.js, the persistent custom cursor.

   A hard dot that tracks the pointer almost exactly, and a ring that eases
   toward it at a slower rate, so the two separate under acceleration and
   settle together at rest. The ring expands over interactive elements and can
   carry contextual text via `data-cursor-text`.

   Only ever enabled for fine pointers with motion allowed. On touch/coarse
   devices, or with prefers-reduced-motion, the native cursor is left alone.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.cursor = (function () {
  var dot, ring, label, stop;
  var active = false;
  var rx = 0, ry = 0, dx = 0, dy = 0;      // ring / dot positions
  var scale = 1, targetScale = 1;

  function shouldRun() { return !GEO.env.coarse && !GEO.env.reducedMotion && window.matchMedia('(hover: hover)').matches; }

  function build() {
    dot = document.createElement('div');
    dot.className = 'cursor-dot';
    ring = document.createElement('div');
    ring.className = 'cursor-ring';
    label = document.createElement('span');
    label.className = 'cursor-ring__label';
    ring.appendChild(label);
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    document.body.appendChild(dot);
  }

  /* What counts as interactive, links, controls, and anything opting in. */
  var SEL = 'a[href], button, input, select, textarea, summary, [data-cursor], [tabindex]:not([tabindex="-1"])';

  function onOver(e) {
    var t = e.target.closest && e.target.closest(SEL);
    if (!t) return;
    ring.classList.add('is-hover');
    targetScale = 1.75;
    var txt = t.getAttribute('data-cursor-text');
    if (txt) { label.textContent = txt; label.style.opacity = '1'; targetScale = 2.5; }
  }
  function onOut(e) {
    var t = e.target.closest && e.target.closest(SEL);
    if (!t) return;
    if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(SEL)) return;
    ring.classList.remove('is-hover');
    targetScale = 1;
    label.textContent = '';
    label.style.opacity = '0';
  }

  function enable() {
    if (active) return;
    active = true;
    if (!dot) build();
    document.body.classList.add('cursor-active');
    dot.style.opacity = '1';
    ring.style.opacity = '1';

    document.addEventListener('pointerover', onOver, true);
    document.addEventListener('pointerout', onOut, true);
    document.addEventListener('pointerdown', down);
    document.addEventListener('pointerup', up);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);

    var p = GEO.env.pointer;
    rx = dx = p.x; ry = dy = p.y;

    stop = GEO.env.onTick(function (dt) {
      var pt = GEO.env.pointer;
      /* Two different rates is the whole effect: the dot is nearly rigid,
         the ring lags and catches up. */
      dx = GEO.env.damp(dx, pt.x, 42, dt);
      dy = GEO.env.damp(dy, pt.y, 42, dt);
      rx = GEO.env.damp(rx, pt.x, 11, dt);
      ry = GEO.env.damp(ry, pt.y, 11, dt);
      scale = GEO.env.damp(scale, targetScale, 12, dt);

      dot.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) scale(' + scale.toFixed(3) + ')';
    });
  }

  function disable() {
    if (!active) return;
    active = false;
    document.body.classList.remove('cursor-active');
    if (dot) { dot.style.opacity = '0'; ring.style.opacity = '0'; }
    document.removeEventListener('pointerover', onOver, true);
    document.removeEventListener('pointerout', onOut, true);
    document.removeEventListener('pointerdown', down);
    document.removeEventListener('pointerup', up);
    if (stop) { stop(); stop = null; }
  }

  function down() { ring.classList.add('is-down'); targetScale *= 0.8; }
  function up() { ring.classList.remove('is-down'); targetScale = ring.classList.contains('is-hover') ? 1.75 : 1; }
  function leave() { if (dot) { dot.style.opacity = '0'; ring.style.opacity = '0'; } }
  function enter() { if (dot && active) { dot.style.opacity = '1'; ring.style.opacity = '1'; } }

  return {
    init: function () {
      if (shouldRun()) enable();
      /* React live if the user changes their motion preference or plugs in a
         mouse, no reload needed. */
      GEO.env.on('motionchange', function () { shouldRun() ? enable() : disable(); });
      GEO.env.on('pointerchange', function () { shouldRun() ? enable() : disable(); });
    },
    /* Let pages set contextual text imperatively (e.g. "flip" over a card). */
    setText: function (t) {
      if (!active) return;
      label.textContent = t || '';
      label.style.opacity = t ? '1' : '0';
      targetScale = t ? 2.5 : 1;
    }
  };
})();
