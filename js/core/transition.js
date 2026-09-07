/* ==========================================================================
   transition.js, shader-driven page transitions.

   This is a multi-page site, so a navigation is: play the wipe OUT, then let
   the browser navigate; on the next page, play the wipe IN from the same
   direction. Travel direction is carried across the navigation in
   sessionStorage, so moving "forward" through the nav sweeps one way and
   moving "back" sweeps the other, the transition communicates direction.

   Falls back cleanly: no WebGL, no THREE, or reduced motion => a plain cut
   (navigate immediately, reveal instantly). Content is never gated on this.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.transition = (function () {
  var DIR_KEY = 'geo:nav-dir';
  var canvas = document.getElementById('fx-canvas');

  var usable = !!canvas && GEO.env.webgl && typeof THREE !== 'undefined';
  var renderer, scene, cam, mat, stopTick;
  var navigating = false;

  function unboot() { document.documentElement.classList.remove('is-booting'); }

  /* ------------------------------------------------------------- build */
  if (usable) {
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(GEO.env.dpr(), 1.5));   // the wipe never needs full DPR
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();
      cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      mat = new THREE.ShaderMaterial({
        vertexShader: GEO.shaders.transition.vertex,
        fragmentShader: GEO.shaders.transition.fragment,
        transparent: true,
        depthTest: false,
        uniforms: {
          uProgress: { value: 0 },
          uInvert:   { value: 0 },
          uTime:     { value: 0 },
          uAspect:   { value: window.innerWidth / window.innerHeight },
          uDir:      { value: new THREE.Vector2(0, 1) },
          uColor:    { value: new THREE.Color('#05070c') },
          uEdge:     { value: new THREE.Color('#7b6cff') }
        }
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

      window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        mat.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
      });
    } catch (e) {
      usable = false;
    }
  }

  function show() { canvas.classList.add('is-active'); }
  function hide() { canvas.classList.remove('is-active'); }

  function draw() { try { renderer.render(scene, cam); } catch (e) {} }

  /* Run the wipe. `invert` 0 = cover the page, 1 = uncover it. */
  function play(invert, dirY, duration) {
    return new Promise(function (resolve) {
      mat.uniforms.uInvert.value = invert;
      mat.uniforms.uDir.value.set(0.12, dirY);
      mat.uniforms.uProgress.value = 0;
      show();
      draw();

      var t0 = performance.now();
      var dur = duration || 900;

      if (stopTick) stopTick();
      stopTick = GEO.env.onTick(function (dt, time) {
        var k = Math.min(1, (performance.now() - t0) / dur);
        /* Matches --e-inout in CSS so shader and DOM motion share a curve. */
        var eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        mat.uniforms.uProgress.value = eased;
        mat.uniforms.uTime.value = time;
        draw();
        if (k >= 1) { stopTick(); stopTick = null; resolve(); }
      });
    });
  }

  /* -------------------------------------------------------------- public */
  var api = {
    enabled: function () { return usable && !GEO.env.reducedMotion; },

    /* Called on every page load. Uncovers the page in the direction of travel. */
    reveal: function () {
      var dir = 1;
      try {
        var stored = sessionStorage.getItem(DIR_KEY);
        if (stored) dir = parseFloat(stored);
        sessionStorage.removeItem(DIR_KEY);
      } catch (e) {}

      if (!api.enabled()) { unboot(); hide(); return Promise.resolve(); }

      /* Start fully covered so there is no flash of the incoming page. */
      mat.uniforms.uInvert.value = 1;
      mat.uniforms.uProgress.value = 0;
      show();
      draw();
      unboot();

      /* The incoming page settles up into place as the wipe clears. */
      if (window.gsap) {
        var blocks = document.querySelectorAll('.shell > section');
        gsap.fromTo(blocks,
          { y: dir > 0 ? 40 : -40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.25, clearProps: 'transform,opacity' });
      }

      return play(1, dir, 950).then(hide);
    },

    /* Cover the page, remember the direction, then navigate. The content
       itself lifts away first, so the page leaves rather than just being
       painted over. */
    go: function (href, dir) {
      if (navigating) return;
      navigating = true;

      if (!api.enabled()) { window.location.href = href; return; }

      try { sessionStorage.setItem(DIR_KEY, String(dir || 1)); } catch (e) {}

      if (window.gsap) {
        var blocks = document.querySelectorAll('.shell > section, .footer');
        gsap.to(blocks, {
          y: (dir || 1) > 0 ? -46 : 46,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
          stagger: { each: 0.045, from: (dir || 1) > 0 ? 'start' : 'end' }
        });
      }

      play(0, dir || 1, 760).then(function () {
        window.location.href = href;
        /* If navigation stalls (slow network, blocked), release the curtain
           rather than leaving the visitor staring at an opaque screen. */
        setTimeout(function () { navigating = false; hide(); }, 4000);
      });
    }
  };

  /* A page restored from bfcache re-runs the reveal, otherwise it would come
     back still covered. */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { navigating = false; api.reveal(); }
  });

  return api;
})();
