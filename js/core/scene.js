/* ==========================================================================
   scene.js — the persistent WebGL layer.

   One renderer draws two passes into #bg-canvas:
     1. an orthographic fullscreen quad running the atmospheric background
        shader (scroll position + velocity + pointer driven);
     2. a perspective scene holding the particle field and, on pages that ask
        for it, the displaced "world" object.

   The camera drifts continuously with pointer and scroll — it never starts
   and stops per section. Sections declare a palette weight with
   `data-scene-mix`, which cross-fades the background field as they pass.

   Degradation: if WebGL is missing, THREE failed to load, or the context is
   lost, this module quietly does nothing and the CSS `.backdrop` gradient
   remains — no blank page, no thrown error.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.scene = (function () {
  var api = {
    ready: false,
    setMix: function () {}, pulse: function () {}, dispose: function () {}
  };

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return api;

  if (!GEO.env.webgl || typeof THREE === 'undefined') {
    canvas.style.display = 'none';
    return api;                                   // CSS backdrop carries the page
  }

  var tier = GEO.env.tier;
  var renderer, sceneBG, camBG, sceneMain, camMain, bgMat, points, pointsMat, hero, heroMat;
  var dead = false;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: tier === 'high',
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
  } catch (e) {
    canvas.style.display = 'none';
    return api;
  }

  renderer.setPixelRatio(GEO.env.dpr());
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.autoClear = false;

  /* ----------------------------------------------------- background pass */
  sceneBG = new THREE.Scene();
  camBG = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  var C = {
    a: new THREE.Color('#04050a'),
    b: new THREE.Color('#131a33'),
    c: new THREE.Color('#7b6cff')
  };

  bgMat = new THREE.ShaderMaterial({
    vertexShader: GEO.shaders.background.vertex,
    fragmentShader: GEO.shaders.background.fragment,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime:      { value: 0 },
      uScroll:    { value: 0 },
      uVelocity:  { value: 0 },
      uMouse:     { value: new THREE.Vector2(0, 0) },
      uAspect:    { value: window.innerWidth / window.innerHeight },
      uMix:       { value: 0 },
      uColorA:    { value: C.a },
      uColorB:    { value: C.b },
      uColorC:    { value: C.c },
      uIntensity: { value: tier === 'low' ? 0.9 : 1.0 }
    }
  });
  sceneBG.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

  /* ----------------------------------------------------------- main pass */
  sceneMain = new THREE.Scene();
  camMain = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
  camMain.position.set(0, 0, 6);

  /* --- particle field ---------------------------------------------------- */
  var COUNT = tier === 'high' ? 900 : tier === 'medium' ? 480 : 200;
  (function buildPoints() {
    var g = new THREE.BufferGeometry();
    var pos = new Float32Array(COUNT * 3);
    var scale = new Float32Array(COUNT);
    var seed = new Float32Array(COUNT);
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = -Math.random() * 20 - 1;
      scale[i] = 0.35 + Math.random() * 1.5;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    pointsMat = new THREE.ShaderMaterial({
      vertexShader: GEO.shaders.points.vertex,
      fragmentShader: GEO.shaders.points.fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime:   { value: 0 },
        uSize:   { value: tier === 'low' ? 1.6 : 2.1 },
        uScroll: { value: 0 },
        uMouse:  { value: new THREE.Vector2(0, 0) },
        uColor:  { value: new THREE.Color('#8f86ff') }
      }
    });
    points = new THREE.Points(g, pointsMat);
    sceneMain.add(points);
  })();

  /* --- displaced world object (opt-in per page via <body data-scene="hero">) */
  var wantsHero = document.body.getAttribute('data-scene') === 'hero';
  if (wantsHero) {
    /* A UV sphere (smooth, indexed normals) rather than an icosahedron — the
       polyhedron builds flat-shaded faces, which turns noise displacement into
       visible facets instead of a soft, molten surface. */
    var seg = tier === 'high' ? 160 : tier === 'medium' ? 110 : 56;
    heroMat = new THREE.ShaderMaterial({
      vertexShader: GEO.shaders.displaced.vertex,
      fragmentShader: GEO.shaders.displaced.fragment,
      transparent: true,
      uniforms: {
        uTime:    { value: 0 },
        uAmp:     { value: 0.0 },        // animated up on intro
        uFreq:    { value: 0.95 },
        uHover:   { value: 0 },
        /* Dark body, bright rim: the object reads as a lit volume in space
           rather than a saturated flat disc. */
        uColorA:  { value: new THREE.Color('#05060f') },
        uColorB:  { value: new THREE.Color('#221c56') },
        uRim:     { value: new THREE.Color('#8f86ff') },
        uOpacity: { value: 1 }
      }
    });
    hero = new THREE.Mesh(new THREE.SphereGeometry(1.3, seg, seg), heroMat);
    sceneMain.add(hero);
  }

  /* ------------------------------------------------------------- sizing */
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(GEO.env.dpr());
    renderer.setSize(w, h, false);
    camMain.aspect = w / h;
    camMain.updateProjectionMatrix();
    bgMat.uniforms.uAspect.value = w / h;
    layoutHero();
    if (!GEO.env.animate()) render();      // keep a correct static frame
  }

  function layoutHero() {
    if (!hero) return;
    var wide = window.innerWidth > 900;
    hero.position.x = wide ? 2.05 : 0;
    hero.position.y = wide ? 0.1 : 0.6;
    hero.scale.setScalar(wide ? 1 : 0.72);
  }
  layoutHero();

  window.addEventListener('resize', resize);
  resize();

  /* ------------------------------------------------------- context loss */
  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    dead = true;
    canvas.style.opacity = '0';        // fall back to the CSS backdrop
  });
  canvas.addEventListener('webglcontextrestored', function () {
    dead = false;
    canvas.style.opacity = '';
    resize();
  });

  /* ------------------------------------------------- section palette mix */
  var mixTarget = 0, mixCurrent = 0;
  api.setMix = function (v) { mixTarget = GEO.env.clamp(v, 0, 1); };

  function bindSectionMix() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-scene-mix]'));
    if (!nodes.length) return;

    if (window.ScrollTrigger) {
      nodes.forEach(function (el) {
        var v = parseFloat(el.getAttribute('data-scene-mix')) || 0;
        ScrollTrigger.create({
          trigger: el, start: 'top 65%', end: 'bottom 35%',
          onToggle: function (s) { if (s.isActive) api.setMix(v); }
        });
      });
    } else {
      // No GSAP? Fall back to a plain IntersectionObserver.
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) api.setMix(parseFloat(en.target.getAttribute('data-scene-mix')) || 0);
        });
      }, { rootMargin: '-35% 0px -35% 0px' });
      nodes.forEach(function (el) { io.observe(el); });
    }
  }

  /* An impulse the UI can fire on a meaningful event (correct answer, card
     mastered) — the field brightens and settles. */
  var pulse = 0;
  api.pulse = function (amount) { pulse = Math.min(1, pulse + (amount || 0.5)); };

  /* --------------------------------------------------------------- loop */
  var heroHover = 0, introAmp = 0;

  function render() {
    if (dead) return;
    renderer.clear();
    renderer.render(sceneBG, camBG);
    renderer.clearDepth();
    renderer.render(sceneMain, camMain);
  }

  function update(dt, time) {
    if (dead) return;

    var reduced = GEO.env.reducedMotion;
    var s = GEO.env.scroll, p = GEO.env.pointer;

    /* With reduced motion the field holds still: time stops advancing and the
       camera does not drift. Scroll position still updates so the page reads
       correctly, it simply does not animate. */
    var t = reduced ? 12.0 : time;

    mixCurrent = GEO.env.damp(mixCurrent, mixTarget, 2.2, dt);
    pulse = GEO.env.damp(pulse, 0, 2.6, dt);

    bgMat.uniforms.uTime.value = t;
    bgMat.uniforms.uScroll.value = s.progress;
    bgMat.uniforms.uVelocity.value = reduced ? 0 : s.velocity;
    bgMat.uniforms.uMix.value = mixCurrent + pulse * 0.5;
    bgMat.uniforms.uMouse.value.set(reduced ? 0 : p.ex, reduced ? 0 : p.ey);
    bgMat.uniforms.uIntensity.value = (tier === 'low' ? 0.9 : 1.0) + pulse * 0.28;

    pointsMat.uniforms.uTime.value = t;
    pointsMat.uniforms.uScroll.value = s.progress;
    pointsMat.uniforms.uMouse.value.set(reduced ? 0 : p.ex, reduced ? 0 : p.ey);

    if (hero) {
      introAmp = GEO.env.damp(introAmp, 0.26, 1.1, dt);
      heroMat.uniforms.uTime.value = t;
      heroMat.uniforms.uAmp.value = introAmp;

      /* Pointer proximity to the object inflates it slightly. */
      var targetHover = reduced ? 0 : GEO.env.clamp(1 - Math.hypot(p.ex - 0.45, p.ey) * 0.9, 0, 1);
      heroHover = GEO.env.damp(heroHover, targetHover, 3.0, dt);
      heroMat.uniforms.uHover.value = heroHover;

      if (!reduced) {
        hero.rotation.y += dt * 0.14;
        hero.rotation.x = Math.sin(t * 0.22) * 0.14;
      }
      /* Sink and fade the object as the hero section leaves. */
      hero.position.y = (window.innerWidth > 900 ? 0.1 : 0.6) - s.progress * 3.2;
      heroMat.uniforms.uOpacity.value = GEO.env.clamp(1 - s.progress * 2.4, 0, 1);
      hero.visible = heroMat.uniforms.uOpacity.value > 0.01;
    }

    /* Continuous camera drift — pointer parallax plus a slow scroll push. */
    if (!reduced) {
      camMain.position.x = GEO.env.damp(camMain.position.x, p.ex * 0.55, 2.0, dt);
      camMain.position.y = GEO.env.damp(camMain.position.y, p.ey * 0.35 + s.progress * -0.9, 2.0, dt);
      camMain.position.z = GEO.env.damp(camMain.position.z, 6 - s.progress * 1.4, 2.0, dt);
      camMain.lookAt(0, s.progress * -0.6, 0);
    }

    render();
  }

  /* Reduced motion still gets one correct frame, and re-renders on scroll so
     scroll-linked values stay truthful — it just never animates on its own. */
  GEO.env.onTick(function (dt, time) {
    if (GEO.env.reducedMotion) return;
    update(dt, time);
  });

  function staticFrame() { update(0.016, 12.0); }
  GEO.env.on('motionchange', function (reduced) { if (reduced) staticFrame(); });
  window.addEventListener('scroll', function () { if (GEO.env.reducedMotion) staticFrame(); }, { passive: true });
  if (GEO.env.reducedMotion) staticFrame();

  /* --------------------------------------------------------------- teardown */
  api.dispose = function () {
    try {
      renderer.dispose();
      if (points) { points.geometry.dispose(); pointsMat.dispose(); }
      if (hero) { hero.geometry.dispose(); heroMat.dispose(); }
      bgMat.dispose();
    } catch (e) {}
  };
  window.addEventListener('pagehide', api.dispose);

  api.ready = true;
  api.bindSections = bindSectionMix;
  return api;
})();
