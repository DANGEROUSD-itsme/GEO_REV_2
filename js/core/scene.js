/* ==========================================================================
   scene.js: the persistent, reactive WebGL layer.

   One renderer, two passes into #bg-canvas:
     1. an orthographic fullscreen quad running the atmospheric background
        shader, driven by scroll position, scroll velocity and the pointer;
     2. a perspective scene holding the particle field plus whichever world
        object this page asked for.

   Each page declares its object with <body data-scene="...">:
     hero    a displaced sphere with orbiting satellites (overview)
     globe   the supply-chain globe: dotted planet, supplier pins and
             animated trade routes, which the DOM can spin and light up
     blocks  four T.E.E.T blocks that charge as the writer fills them in
     rings   concentric rings that fill with the mock-test score
     field   particles only

   The scene is reactive: the interface calls pulse(), shock(), charge(),
   setProgress(), burst() and focusCountry(), so what the student does on the
   page is answered in 3D. It all degrades to nothing without WebGL.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.scene = (function () {
  var api = {
    ready: false, mode: 'field',
    setMix: function () {}, pulse: function () {}, shock: function () {},
    charge: function () {}, setProgress: function () {}, focusCountry: function () {},
    litCountries: function () {}, burst: function () {}, bindSections: function () {},
    dispose: function () {}
  };

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return api;
  if (!GEO.env.webgl || typeof THREE === 'undefined') { canvas.style.display = 'none'; return api; }

  var tier = GEO.env.tier;
  var HIGH = tier === 'high', LOW = tier === 'low';
  var renderer, sceneBG, camBG, sceneMain, camMain, bgMat, dead = false;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas, antialias: HIGH, alpha: false,
      powerPreference: 'high-performance', stencil: false, depth: true
    });
  } catch (e) { canvas.style.display = 'none'; return api; }

  renderer.setPixelRatio(GEO.env.dpr());
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.autoClear = false;

  api.mode = document.body.getAttribute('data-scene') || 'field';

  /* ===================================================== background pass */
  sceneBG = new THREE.Scene();
  camBG = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  bgMat = new THREE.ShaderMaterial({
    vertexShader: GEO.shaders.background.vertex,
    fragmentShader: GEO.shaders.background.fragment,
    depthTest: false, depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uScroll: { value: 0 }, uVelocity: { value: 0 },
      uMouse: { value: new THREE.Vector2() }, uAspect: { value: 1 }, uMix: { value: 0 },
      uColorA: { value: new THREE.Color('#04050a') },
      uColorB: { value: new THREE.Color('#131a33') },
      uColorC: { value: new THREE.Color('#7b6cff') },
      uIntensity: { value: LOW ? 0.9 : 1.0 },
      uShock: { value: 0 },
      uShockColor: { value: new THREE.Color('#35d29a') }
    }
  });
  sceneBG.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

  /* =========================================================== main pass */
  sceneMain = new THREE.Scene();
  camMain = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
  camMain.position.set(0, 0, 6);

  var COL = {
    accent: new THREE.Color('#7b6cff'),
    accentLight: new THREE.Color('#a79cff'),
    pos: new THREE.Color('#35d29a'),
    neg: new THREE.Color('#ff5f7e'),
    warn: new THREE.Color('#f0b45f')
  };

  /* ---------------------------------------------------- particle field */
  var pointsMat, points;
  (function () {
    var COUNT = HIGH ? 1100 : LOW ? 240 : 560;
    var g = new THREE.BufferGeometry();
    var pos = new Float32Array(COUNT * 3), sc = new Float32Array(COUNT), sd = new Float32Array(COUNT);
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = -Math.random() * 22 - 1;
      sc[i] = 0.35 + Math.random() * 1.5;
      sd[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(sc, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
    pointsMat = new THREE.ShaderMaterial({
      vertexShader: GEO.shaders.points.vertex, fragmentShader: GEO.shaders.points.fragment,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uSize: { value: LOW ? 1.6 : 2.1 }, uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2() }, uColor: { value: COL.accentLight.clone() }
      }
    });
    points = new THREE.Points(g, pointsMat);
    sceneMain.add(points);
  })();

  /* ================================================= mode: hero sphere */
  var hero = null, heroMat = null, satellites = [];
  function buildHero() {
    var seg = HIGH ? 160 : LOW ? 56 : 110;
    heroMat = new THREE.ShaderMaterial({
      vertexShader: GEO.shaders.displaced.vertex, fragmentShader: GEO.shaders.displaced.fragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 }, uAmp: { value: 0 }, uFreq: { value: 0.95 }, uHover: { value: 0 },
        uColorA: { value: new THREE.Color('#05060f') },
        uColorB: { value: new THREE.Color('#221c56') },
        uRim: { value: new THREE.Color('#8f86ff') },
        uOpacity: { value: 1 }
      }
    });
    hero = new THREE.Group();
    hero.add(new THREE.Mesh(new THREE.SphereGeometry(1.3, seg, seg), heroMat));

    /* Satellites on tilted orbits, so the object reads as a system rather
       than a single lump. Each carries a faint ring showing its path. */
    var n = LOW ? 2 : 4;
    for (var i = 0; i < n; i++) {
      var orbit = new THREE.Group();
      orbit.rotation.x = (i / n) * 1.4 - 0.6;
      orbit.rotation.z = i * 0.9;
      var r = 1.85 + i * 0.28;
      var m = new THREE.Mesh(
        new THREE.SphereGeometry(0.055 + Math.random() * 0.03, 12, 12),
        new THREE.MeshBasicMaterial({ color: i % 2 ? COL.pos : COL.accentLight, transparent: true, opacity: 0.9 })
      );
      m.position.x = r;
      orbit.add(m);
      orbit.add(new THREE.Mesh(
        new THREE.RingGeometry(r - 0.004, r + 0.004, 96),
        new THREE.MeshBasicMaterial({ color: COL.accent, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
      ));
      orbit.userData.speed = 0.22 + i * 0.09;
      satellites.push(orbit);
      hero.add(orbit);
    }
    sceneMain.add(hero);
  }

  /* ======================================================= mode: globe */
  var globe = null, globeDotsMat = null, markerMat = null, markerGeo = null, arcs = [];
  var globeSpin = { auto: true, resumeAt: 0, targetY: 0, targetX: 0 };
  var GLOBE_R = 1.62;

  function latLon(lat, lon, r) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function buildGlobe() {
    globe = new THREE.Group();

    /* --- the planet as a dot field (Fibonacci sphere = even coverage) --- */
    var N = HIGH ? 3000 : LOW ? 700 : 1600;
    var g = new THREE.BufferGeometry();
    var pos = new Float32Array(N * 3), seed = new Float32Array(N);
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var rad = Math.sqrt(Math.max(0, 1 - y * y));
      var th = golden * i;
      pos[i * 3] = Math.cos(th) * rad * GLOBE_R;
      pos[i * 3 + 1] = y * GLOBE_R;
      pos[i * 3 + 2] = Math.sin(th) * rad * GLOBE_R;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    globeDotsMat = new THREE.ShaderMaterial({
      vertexShader: GEO.shaders.globeDots.vertex, fragmentShader: GEO.shaders.globeDots.fragment,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uSize: { value: LOW ? 1.5 : 1.9 }, uReveal: { value: 0 },
        uColor: { value: new THREE.Color('#6b769f') }, uOpacity: { value: 0 }
      }
    });
    globe.add(new THREE.Points(g, globeDotsMat));

    /* --- supplier pins plus the assembly plant --- */
    var geoData = (GEO.data && GEO.data.TOYOTA_GEO) || [];
    var assembly = (GEO.data && GEO.data.TOYOTA_ASSEMBLY) || [35.1, 137.2];
    var all = geoData.concat([assembly]);

    markerGeo = new THREE.BufferGeometry();
    var mp = new Float32Array(all.length * 3);
    var on = new Float32Array(all.length);
    var ms = new Float32Array(all.length);
    all.forEach(function (c, i) {
      var v = latLon(c[0], c[1], GLOBE_R * 1.012);
      mp[i * 3] = v.x; mp[i * 3 + 1] = v.y; mp[i * 3 + 2] = v.z;
      on[i] = i === all.length - 1 ? 1 : 0;      // the plant is always lit
      ms[i] = Math.random();
    });
    markerGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    markerGeo.setAttribute('aOn', new THREE.BufferAttribute(on, 1));
    markerGeo.setAttribute('aSeed', new THREE.BufferAttribute(ms, 1));

    markerMat = new THREE.ShaderMaterial({
      vertexShader: GEO.shaders.marker.vertex, fragmentShader: GEO.shaders.marker.fragment,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uSize: { value: LOW ? 4.6 : 6.4 },
        uIdle: { value: new THREE.Color('#8891b5') }, uLit: { value: COL.accentLight.clone() }
      }
    });
    globe.add(new THREE.Points(markerGeo, markerMat));

    /* --- one trade route per supplier --- */
    var target = latLon(assembly[0], assembly[1], GLOBE_R * 1.01);
    var SEGS = LOW ? 26 : HIGH ? 54 : 40;
    var RADIAL = LOW ? 3 : 5;
    geoData.forEach(function (c) {
      var from = latLon(c[0], c[1], GLOBE_R * 1.01);
      var mid = from.clone().add(target).multiplyScalar(0.5);
      /* Lift the control point by the distance, so long routes arc higher. */
      mid.normalize().multiplyScalar(GLOBE_R + from.distanceTo(target) * 0.42);
      var curve = new THREE.QuadraticBezierCurve3(from, mid, target);

      var ag = new THREE.TubeGeometry(curve, SEGS, 0.028, RADIAL, false);

      var am = new THREE.ShaderMaterial({
        vertexShader: GEO.shaders.arc.vertex, fragmentShader: GEO.shaders.arc.fragment,
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: COL.accent.clone() },
          uHeadColor: { value: new THREE.Color('#ffffff') },
          uProgress: { value: 0 }, uHead: { value: Math.random() }, uOpacity: { value: 0 }
        }
      });
      var tube = new THREE.Mesh(ag, am);
      tube.userData = { mat: am, speed: 0.10 + Math.random() * 0.10, offset: Math.random(), lit: 0 };
      arcs.push(tube);
      globe.add(tube);
    });

    /* Start rotated so the assembly plant, where every route converges, is
       turned toward the viewer, with Europe still coming into view. */
    globe.rotation.y = -Math.atan2(target.x, target.z) - 0.55;
    sceneMain.add(globe);
  }

  /* Spin the globe so a supplier faces the camera, light its pin and draw
     its route. Called straight from the DOM when a country is opened. */
  api.focusCountry = function (index) {
    if (!globe || index == null) return;
    var c = ((GEO.data && GEO.data.TOYOTA_GEO) || [])[index];
    if (!c) return;

    var p = latLon(c[0], c[1], 1);
    globeSpin.targetY = -Math.atan2(p.x, p.z);
    globeSpin.targetX = Math.asin(GEO.env.clamp(p.y, -1, 1)) * 0.55;
    globeSpin.auto = false;
    globeSpin.resumeAt = performance.now() + 5200;

    var on = markerGeo.getAttribute('aOn');
    on.setX(index, 1); on.needsUpdate = true;
    if (arcs[index]) arcs[index].userData.lit = 1;
    api.pulse(0.3);
  };

  /* Light exactly this set of suppliers (used by "reveal all" / "hide all"). */
  api.litCountries = function (indices) {
    if (!globe) return;
    var on = markerGeo.getAttribute('aOn');
    for (var i = 0; i < on.count - 1; i++) on.setX(i, indices.indexOf(i) === -1 ? 0 : 1);
    on.needsUpdate = true;
    arcs.forEach(function (l, i) { l.userData.lit = indices.indexOf(i) === -1 ? 0 : 1; });
  };

  /* ============================================ mode: blocks and rings */
  var slabs = [], rings = [];
  slabs.group = null; rings.group = null;

  function slabMat(color) {
    return new THREE.ShaderMaterial({
      vertexShader: GEO.shaders.slab.vertex, fragmentShader: GEO.shaders.slab.fragment,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uCharge: { value: 0 }, uOpacity: { value: 1 },
        uColor: { value: new THREE.Color(color) }
      }
    });
  }

  function buildBlocks() {
    var colors = ['#7b6cff', '#35d29a', '#f0b45f', '#ff5f7e'];
    var group = new THREE.Group();
    for (var i = 0; i < 4; i++) {
      var m = slabMat(colors[i]);
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.5, 0.26), m);
      mesh.position.set((i - 1.5) * 0.46, -2.4, 0);
      mesh.userData = { mat: m, target: 0, current: 0 };
      slabs.push(mesh);
      group.add(mesh);
    }
    group.rotation.x = 0.14;
    group.rotation.y = -0.35;
    sceneMain.add(group);
    slabs.group = group;
  }

  function buildRings() {
    var group = new THREE.Group();
    [['#7b6cff', 1.5], ['#35d29a', 1.95], ['#f0b45f', 2.4]].forEach(function (s, i) {
      var m = slabMat(s[0]);
      var mesh = new THREE.Mesh(new THREE.TorusGeometry(s[1], 0.018, 8, LOW ? 64 : 160), m);
      mesh.rotation.x = 1.2 + i * 0.2;
      mesh.rotation.y = i * 0.5;
      mesh.userData = { mat: m, speed: 0.09 + i * 0.05, target: 0, current: 0 };
      rings.push(mesh);
      group.add(mesh);
    });
    sceneMain.add(group);
    rings.group = group;
  }

  /* charge(index, value): how complete a single block or ring is, 0..1 */
  api.charge = function (index, value) {
    var set = slabs.length ? slabs : rings;
    if (!set[index]) return;
    set[index].userData.target = GEO.env.clamp(value, 0, 1);
  };
  api.setProgress = function (v) {
    var set = slabs.length ? slabs : rings;
    set.forEach(function (m) { m.userData.target = GEO.env.clamp(v, 0, 1); });
  };

  /* ======================================== screen-space particle burst */
  var bursts = [];
  api.burst = function (clientX, clientY, color) {
    if (GEO.env.reducedMotion || LOW) return;
    var n = 34;
    var g = new THREE.BufferGeometry();
    var pos = new Float32Array(n * 3), sc = new Float32Array(n), sd = new Float32Array(n);
    var vel = [];

    /* Place the burst where the click happened, on a plane in front of the
       camera, so 3D confetti lines up with the button that fired it. */
    var dir = new THREE.Vector3(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1,
      0.5
    ).unproject(camMain).sub(camMain.position).normalize();
    var origin = camMain.position.clone().add(dir.multiplyScalar(5));

    for (var i = 0; i < n; i++) {
      pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z;
      sc[i] = 0.6 + Math.random() * 1.6;
      sd[i] = Math.random();
      var a = Math.random() * Math.PI * 2, s = 0.9 + Math.random() * 2.2;
      vel.push(new THREE.Vector3(Math.cos(a) * s, Math.sin(a) * s, (Math.random() - 0.5) * s));
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(sc, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));

    var m = new THREE.ShaderMaterial({
      vertexShader: GEO.shaders.points.vertex, fragmentShader: GEO.shaders.points.fragment,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uSize: { value: 4.2 }, uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2() }, uColor: { value: new THREE.Color(color || '#35d29a') }
      }
    });
    var pts = new THREE.Points(g, m);
    sceneMain.add(pts);
    bursts.push({ pts: pts, mat: m, vel: vel, life: 1 });
  };

  /* ================================================ mix, pulse, shockwave */
  var mixTarget = 0, mixCurrent = 0, pulse = 0, shock = 0;

  api.setMix = function (v) { mixTarget = GEO.env.clamp(v, 0, 1); };
  api.pulse = function (a) { pulse = Math.min(1.4, pulse + (a || 0.5)); };
  api.shock = function (tone) {
    bgMat.uniforms.uShockColor.value.copy(tone === 'neg' ? COL.neg : tone === 'warn' ? COL.warn : COL.pos);
    shock = 1;
  };

  api.bindSections = function () {
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
    } else if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) api.setMix(parseFloat(e.target.getAttribute('data-scene-mix')) || 0); });
      }, { rootMargin: '-35% 0px -35% 0px' });
      nodes.forEach(function (el) { io.observe(el); });
    }
  };

  /* ============================================================== build */
  if (api.mode === 'hero') buildHero();
  else if (api.mode === 'globe') buildGlobe();
  else if (api.mode === 'blocks') buildBlocks();
  else if (api.mode === 'rings') buildRings();

  /* ============================================================= sizing */
  function layout() {
    var wide = window.innerWidth > 900;
    var mid = window.innerWidth > 700;

    if (hero) {
      hero.position.set(wide ? 2.05 : 0, wide ? 0.1 : 0.6, 0);
      hero.scale.setScalar(wide ? 1 : 0.7);
    }
    /* On wide screens these objects sit in the right margin beside the
       content; on narrow screens they move behind it and shrink back so
       they never compete with the text. */
    if (globe) {
      globe.position.set(wide ? 1.85 : 0, wide ? 0 : 0.4, wide ? -0.5 : -1.8);
      globe.scale.setScalar(wide ? 0.78 : mid ? 0.68 : 0.56);
    }
    if (slabs.group) {
      slabs.group.position.set(wide ? 2.1 : 0, wide ? 0.15 : 1.2, wide ? -0.6 : -2.4);
      slabs.group.scale.setScalar(wide ? 0.78 : 0.55);
    }
    if (rings.group) {
      rings.group.position.set(wide ? 2.1 : 0, wide ? 0 : 0.8, wide ? 0 : -2.4);
      rings.group.scale.setScalar(wide ? 1 : 0.72);
    }
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(GEO.env.dpr());
    renderer.setSize(w, h, false);
    camMain.aspect = w / h;
    camMain.updateProjectionMatrix();
    bgMat.uniforms.uAspect.value = w / h;
    layout();
    if (!GEO.env.animate()) draw();
  }
  window.addEventListener('resize', resize);
  resize();

  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); dead = true; canvas.style.opacity = '0'; });
  canvas.addEventListener('webglcontextrestored', function () { dead = false; canvas.style.opacity = ''; resize(); });

  /* =============================================================== loop */
  var heroHover = 0, introAmp = 0, globeReveal = 0;

  function draw() {
    if (dead) return;
    renderer.clear();
    renderer.render(sceneBG, camBG);
    renderer.clearDepth();
    renderer.render(sceneMain, camMain);
  }

  function update(dt, time) {
    if (dead) return;
    var reduced = GEO.env.reducedMotion;
    var t = reduced ? 12.0 : time;
    var s = GEO.env.scroll, p = GEO.env.pointer;
    var mx = reduced ? 0 : p.ex, my = reduced ? 0 : p.ey;

    mixCurrent = GEO.env.damp(mixCurrent, mixTarget, 2.2, dt);
    pulse = GEO.env.damp(pulse, 0, 2.4, dt);
    shock = Math.max(0, shock - dt * 1.15);

    /* ---- background ---- */
    var u = bgMat.uniforms;
    u.uTime.value = t;
    u.uScroll.value = s.progress;
    u.uVelocity.value = reduced ? 0 : s.velocity;
    u.uMix.value = mixCurrent + pulse * 0.4;
    u.uMouse.value.set(mx, my);
    u.uIntensity.value = (LOW ? 0.9 : 1.0) + pulse * 0.26;
    u.uShock.value = shock;

    /* ---- particles ---- */
    pointsMat.uniforms.uTime.value = t;
    pointsMat.uniforms.uScroll.value = s.progress;
    pointsMat.uniforms.uMouse.value.set(mx, my);

    /* ---- hero ---- */
    if (hero) {
      introAmp = GEO.env.damp(introAmp, 0.26 + pulse * 0.1, 1.1, dt);
      heroMat.uniforms.uTime.value = t;
      heroMat.uniforms.uAmp.value = introAmp;
      var want = reduced ? 0 : GEO.env.clamp(1 - Math.hypot(mx - 0.45, my) * 0.9, 0, 1);
      heroHover = GEO.env.damp(heroHover, want, 3.0, dt);
      heroMat.uniforms.uHover.value = heroHover;
      if (!reduced) {
        /* Scrolling fast spins it faster: the object answers the gesture. */
        hero.rotation.y += dt * (0.14 + Math.abs(s.velocity) * 0.5);
        hero.rotation.x = Math.sin(t * 0.22) * 0.14;
        satellites.forEach(function (o) { o.rotation.y += dt * o.userData.speed; });
      }
      hero.position.y = (window.innerWidth > 900 ? 0.1 : 0.6) - s.progress * 3.2;
      heroMat.uniforms.uOpacity.value = GEO.env.clamp(1 - s.progress * 2.4, 0, 1);
      hero.visible = heroMat.uniforms.uOpacity.value > 0.01;
    }

    /* ---- globe ---- */
    if (globe) {
      globeReveal = GEO.env.damp(globeReveal, 1, 0.9, dt);
      globeDotsMat.uniforms.uTime.value = t;
      globeDotsMat.uniforms.uReveal.value = globeReveal;
      /* Fade with the section weight so it never fights the body copy. */
      globeDotsMat.uniforms.uOpacity.value = 0.30 + mixCurrent * 0.75;
      markerMat.uniforms.uTime.value = t;

      if (!reduced) {
        if (!globeSpin.auto && performance.now() > globeSpin.resumeAt) globeSpin.auto = true;
        if (globeSpin.auto) {
          globe.rotation.y += dt * (0.055 + Math.abs(s.velocity) * 0.35);
          globe.rotation.x = GEO.env.damp(globe.rotation.x, my * 0.22, 1.6, dt);
        } else {
          globe.rotation.y = GEO.env.damp(globe.rotation.y, globeSpin.targetY, 2.4, dt);
          globe.rotation.x = GEO.env.damp(globe.rotation.x, globeSpin.targetX, 2.4, dt);
        }
        globe.rotation.z = GEO.env.damp(globe.rotation.z, mx * 0.06, 1.4, dt);
      }

      arcs.forEach(function (l) {
        var d = l.userData, au = d.mat.uniforms;
        au.uProgress.value = GEO.env.damp(au.uProgress.value, d.lit ? 1 : 0.55, 2.2, dt);
        au.uOpacity.value = GEO.env.damp(au.uOpacity.value,
          Math.min(1, (d.lit ? 1.3 : 0.45) * (0.35 + mixCurrent * 0.75)), 2.0, dt);
        if (!reduced) {
          d.offset = (d.offset + dt * d.speed) % 1;
          au.uHead.value = d.offset;
        }
        au.uColor.value.copy(d.lit ? COL.accentLight : COL.accent);
      });
    }

    /* ---- blocks and rings ---- */
    slabs.forEach(function (m, i) {
      var d = m.userData;
      d.current = GEO.env.damp(d.current, d.target, 3.0, dt);
      d.mat.uniforms.uTime.value = t;
      d.mat.uniforms.uCharge.value = d.current;
      m.position.y = -2.4 + d.current * 2.4;
      m.scale.y = 0.35 + d.current * 0.75;
      if (!reduced) m.rotation.y = Math.sin(t * 0.5 + i) * 0.25 + mx * 0.2;
    });
    if (slabs.group && !reduced) slabs.group.rotation.y = GEO.env.damp(slabs.group.rotation.y, mx * 0.3, 1.5, dt);

    rings.forEach(function (m, i) {
      var d = m.userData;
      d.current = GEO.env.damp(d.current, d.target, 2.4, dt);
      d.mat.uniforms.uTime.value = t;
      d.mat.uniforms.uCharge.value = d.current;
      if (!reduced) {
        m.rotation.z += dt * d.speed * (0.4 + d.current);
        m.rotation.x = 1.2 + i * 0.2 + Math.sin(t * 0.3 + i) * 0.12 + my * 0.15;
      }
      m.scale.setScalar(0.85 + d.current * 0.2);
    });
    if (rings.group && !reduced) rings.group.rotation.y = GEO.env.damp(rings.group.rotation.y, mx * 0.35, 1.5, dt);

    /* ---- bursts ---- */
    for (var bi = bursts.length - 1; bi >= 0; bi--) {
      var b = bursts[bi];
      b.life -= dt * 0.9;
      var arr = b.pts.geometry.getAttribute('position');
      for (var k = 0; k < b.vel.length; k++) {
        arr.setXYZ(k,
          arr.getX(k) + b.vel[k].x * dt,
          arr.getY(k) + b.vel[k].y * dt - dt * 0.5,
          arr.getZ(k) + b.vel[k].z * dt);
        b.vel[k].multiplyScalar(1 - dt * 2.2);
      }
      arr.needsUpdate = true;
      b.mat.uniforms.uSize.value = 4.2 * Math.max(0, b.life);
      if (b.life <= 0) {
        sceneMain.remove(b.pts);
        b.pts.geometry.dispose(); b.mat.dispose();
        bursts.splice(bi, 1);
      }
    }

    /* ---- camera ---- */
    if (!reduced) {
      camMain.position.x = GEO.env.damp(camMain.position.x, mx * 0.55, 2.0, dt);
      camMain.position.y = GEO.env.damp(camMain.position.y, my * 0.35 + s.progress * -0.9, 2.0, dt);
      camMain.position.z = GEO.env.damp(camMain.position.z, 6 - s.progress * 1.4 - pulse * 0.35, 2.0, dt);
      camMain.lookAt(0, s.progress * -0.6, 0);
    }

    draw();
  }

  GEO.env.onTick(function (dt, time) { if (!GEO.env.reducedMotion) update(dt, time); });

  function staticFrame() { update(0.016, 12.0); }
  GEO.env.on('motionchange', function (r) { if (r) staticFrame(); });
  window.addEventListener('scroll', function () { if (GEO.env.reducedMotion) staticFrame(); }, { passive: true });
  if (GEO.env.reducedMotion) staticFrame();

  api.dispose = function () {
    try {
      sceneMain.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      bgMat.dispose();
      renderer.dispose();
    } catch (e) {}
  };
  window.addEventListener('pagehide', api.dispose);

  api.ready = true;
  return api;
})();
