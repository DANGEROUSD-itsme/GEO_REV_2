/* ==========================================================================
   env.js: capability detection, the single shared rAF ticker, and scroll state.

   Everything else in the site reads from here rather than making its own
   decisions, so "reduced motion", "no WebGL", "low-power device" and "tab
   hidden" are handled once, consistently.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.env = (function () {
  var mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqCoarse = window.matchMedia('(pointer: coarse)');
  var listeners = {};

  function emit(name, value) {
    (listeners[name] || []).forEach(function (fn) { try { fn(value); } catch (e) { /* never let a listener break the loop */ } });
  }

  /* ---------------------------------------------------------- capability */
  function detectWebGL() {
    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return false;
      // A context that reports no max texture size is effectively unusable.
      return !!gl.getParameter(gl.MAX_TEXTURE_SIZE);
    } catch (e) { return false; }
  }

  /* Performance tier decides particle counts, geometry detail, DPR cap and
     antialiasing. Deliberately conservative: a smooth low tier beats a
     stuttering high one. */
  function detectTier() {
    var mem = navigator.deviceMemory || 4;
    var cores = navigator.hardwareConcurrency || 4;
    var small = Math.min(window.innerWidth, window.innerHeight) < 700;
    if (mqCoarse.matches || small || mem <= 2 || cores <= 2) return 'low';
    if (mem <= 4 || cores <= 4 || window.innerWidth < 1200) return 'medium';
    return 'high';
  }

  /* Motion preference: 'auto' follows the operating system, but the visitor
     can force it on or off from the nav. Someone with Reduce Motion enabled
     system-wide would otherwise get a completely static site with no way to
     ask for the animation, which is the single most common reason this looks
     "rigid" on a phone. */
  var motionPref = 'auto';
  try { motionPref = localStorage.getItem('geo:motion') || 'auto'; } catch (e) {}

  function computeReduced() {
    if (motionPref === 'off') return true;
    if (motionPref === 'on') return false;
    return mqMotion.matches;
  }

  var env = {
    webgl: detectWebGL(),
    motionPref: motionPref,
    reducedMotion: computeReduced(),
    coarse: mqCoarse.matches,
    tier: detectTier(),
    hidden: document.hidden,

    /* Cap device pixel ratio, full DPR on a 3x phone is the single biggest
       cause of dropped frames in a fullscreen shader. */
    dpr: function () {
      var cap = this.tier === 'high' ? 2 : this.tier === 'medium' ? 1.6 : 1.25;
      return Math.min(window.devicePixelRatio || 1, cap);
    },

    /* Should we run continuous animation at all? */
    animate: function () { return !this.reducedMotion && !this.hidden; },

    on: function (name, fn) {
      (listeners[name] = listeners[name] || []).push(fn);
      return function () {
        listeners[name] = (listeners[name] || []).filter(function (f) { return f !== fn; });
      };
    }
  };

  /* --------------------------------------------------- live media queries */
  function bindMQ(mq, handler) {
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);   // Safari < 14
  }
  function applyMotion() {
    env.reducedMotion = computeReduced();
    env.motionPref = motionPref;
    document.documentElement.classList.toggle('reduced-motion', env.reducedMotion);
    /* CSS needs to know when motion was forced ON, so the reduced-motion
       media query stops flattening every transition. */
    document.documentElement.classList.toggle('force-motion', motionPref === 'on');
    emit('motionchange', env.reducedMotion);
  }

  env.setMotion = function (pref) {
    motionPref = pref;
    try { localStorage.setItem('geo:motion', pref); } catch (e) {}
    applyMotion();
  };
  env.toggleMotion = function () { env.setMotion(env.reducedMotion ? 'on' : 'off'); };

  bindMQ(mqMotion, applyMotion);
  bindMQ(mqCoarse, function (e) { env.coarse = e.matches; emit('pointerchange', e.matches); });
  applyMotion();

  /* ------------------------------------------------------------ visibility
     Rendering is fully paused while the tab is hidden, no wasted GPU. */
  document.addEventListener('visibilitychange', function () {
    env.hidden = document.hidden;
    emit('visibility', !document.hidden);
  });

  /* ----------------------------------------------------------- scroll state
     Position, 0..1 document progress, and a smoothed signed velocity that the
     background shader and parallax layers both consume. */
  var scroll = { y: 0, prev: 0, progress: 0, velocity: 0, raw: 0 };
  env.scroll = scroll;

  function readScroll() {
    scroll.y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scroll.progress = Math.min(1, scroll.y / max);
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll);
  readScroll();

  /* ------------------------------------------------------------- pointer */
  var pointer = { x: 0, y: 0, nx: 0, ny: 0, ex: 0, ey: 0 };   // ex/ey are eased
  env.pointer = pointer;
  function movePointer(x, y) {
    pointer.x = x; pointer.y = y;
    pointer.nx = (x / window.innerWidth) * 2 - 1;
    pointer.ny = -((y / window.innerHeight) * 2 - 1);
  }
  window.addEventListener('pointermove', function (e) { movePointer(e.clientX, e.clientY); }, { passive: true });

  /* A finger dragging across the screen moves the scene too, so the 3D layer
     is not dead on a phone just because there is no mouse. */
  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length) movePointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  /* ------------------------------------------------- single shared ticker
     One rAF loop for the whole site. Subscribers get (dt, time). The loop
     keeps running while hidden only long enough to stop cleanly. */
  var subs = [];
  var last = performance.now();

  env.onTick = function (fn) {
    subs.push(fn);
    return function () { subs = subs.filter(function (f) { return f !== fn; }); };
  };

  function frame(now) {
    requestAnimationFrame(frame);

    var dt = Math.min((now - last) / 1000, 0.05);   // clamp after a tab stall
    last = now;

    if (document.hidden) return;                     // paused: no work at all

    /* Velocity is derived here so every consumer shares one definition. */
    var delta = scroll.y - scroll.prev;
    scroll.prev = scroll.y;
    scroll.raw = delta;
    var target = Math.max(-1, Math.min(1, delta / 55));
    scroll.velocity += (target - scroll.velocity) * Math.min(1, dt * 6);

    pointer.ex += (pointer.nx - pointer.ex) * Math.min(1, dt * 3.2);
    pointer.ey += (pointer.ny - pointer.ey) * Math.min(1, dt * 3.2);

    for (var i = 0; i < subs.length; i++) {
      try { subs[i](dt, now / 1000); } catch (e) { /* one bad subscriber must not kill the loop */ }
    }
  }
  requestAnimationFrame(frame);

  /* ------------------------------------------------------------- helpers */
  env.lerp = function (a, b, t) { return a + (b - a) * t; };
  env.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  env.damp = function (a, b, lambda, dt) { return env.lerp(a, b, 1 - Math.exp(-lambda * dt)); };

  return env;
})();
