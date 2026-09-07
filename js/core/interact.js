/* ==========================================================================
   interact.js: the micro-interaction layer.

   Six behaviours, all opt-in through data attributes, all switched off for
   coarse pointers and reduced motion, and none of them required to operate
   the element underneath:

     [data-tilt]        the card leans toward the pointer in 3D
     [data-glow]        a soft highlight follows the pointer inside the card
     [data-ripple]      a ring expands from the exact click point
     [data-scramble]    letters shuffle then settle on hover and on reveal
     [data-skew]        the group skews with scroll velocity and settles
     [data-marquee]     a seamless ticker whose speed follows the scroll

   Buttons and card-like controls get ripple and glow automatically, so the
   whole interface responds to being touched rather than only the pieces
   somebody remembered to annotate.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.interact = (function () {
  var AUTO_RIPPLE = '.btn, .deck, .qpick, .node, .option, .tool, .step-dot, .card--link';
  var AUTO_GLOW = '.card, .tool, .deck, .qpick';
  var stopTick = null;
  var tilts = [];

  function on() { return !GEO.env.coarse && !GEO.env.reducedMotion; }

  /* ------------------------------------------------------------- ripple */
  function ripple(e) {
    if (!on()) return;
    var el = e.target.closest(AUTO_RIPPLE + ', [data-ripple]');
    if (!el || el.disabled) return;

    var r = el.getBoundingClientRect();
    var span = document.createElement('span');
    span.className = 'ripple';
    var size = Math.max(r.width, r.height) * 2.2;
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - r.left - size / 2) + 'px';
    span.style.top = (e.clientY - r.top - size / 2) + 'px';

    /* The host needs a stacking context and clipping for the ring to sit
       inside it; both are safe to set on anything we ripple. */
    var cs = getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';

    el.appendChild(span);
    setTimeout(function () { span.remove(); }, 700);
  }

  /* --------------------------------------------------------- glow follow */
  function glow(e) {
    if (!on()) return;
    var el = e.target.closest(AUTO_GLOW + ', [data-glow]');
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    el.classList.add('has-glow');
  }

  /* ---------------------------------------------------------------- tilt */
  function collectTilts() {
    tilts = Array.prototype.slice.call(document.querySelectorAll('[data-tilt]')).map(function (el) {
      return { el: el, max: parseFloat(el.getAttribute('data-tilt')) || 7, rx: 0, ry: 0, trx: 0, try_: 0, inside: false };
    });
  }

  function tiltMove(e) {
    if (!on()) return;
    for (var i = 0; i < tilts.length; i++) {
      var t = tilts[i];
      var r = t.el.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      t.inside = inside;
      if (inside) {
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        t.try_ = px * t.max * 2;
        t.trx = -py * t.max * 2;
      } else {
        t.try_ = 0; t.trx = 0;
      }
    }
  }

  /* ------------------------------------------------------------ scramble */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|<>*+=';

  function scramble(el, duration) {
    if (!on() || el.__scrambling) return;
    var final = el.getAttribute('data-scramble-text') || el.textContent;
    el.setAttribute('data-scramble-text', final);
    el.__scrambling = true;

    var frames = Math.round((duration || 460) / 16);
    var frame = 0;
    var queue = final.split('').map(function (ch, i) {
      return { ch: ch, start: Math.floor(i * frames / final.length * 0.7), end: Math.floor(frames * (0.45 + i / final.length * 0.55)) };
    });

    var id = setInterval(function () {
      var out = '';
      for (var i = 0; i < queue.length; i++) {
        var q = queue[i];
        if (frame >= q.end || q.ch === ' ') out += q.ch;
        else if (frame >= q.start) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else out += ' ';
      }
      el.textContent = out;
      frame++;
      if (frame > frames) {
        clearInterval(id);
        el.textContent = final;
        el.__scrambling = false;
      }
    }, 16);
  }

  /* --------------------------------------------------------------- skew */
  var skews = [];
  function collectSkews() { skews = Array.prototype.slice.call(document.querySelectorAll('[data-skew]')); }

  /* ------------------------------------------------------------ marquee */
  var marquees = [];
  function buildMarquees() {
    marquees = [];
    document.querySelectorAll('[data-marquee]').forEach(function (el) {
      if (el.__built) { marquees.push(el.__built); return; }
      var track = el.firstElementChild;
      if (!track) return;
      /* Duplicate the track so the loop is seamless at any width. */
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      el.appendChild(clone);
      var rec = { el: el, tracks: [track, clone], x: 0, w: track.scrollWidth,
                  speed: parseFloat(el.getAttribute('data-marquee')) || 40 };
      el.__built = rec;
      marquees.push(rec);
    });
  }

  /* ---------------------------------------------------------------- init */
  function init() {
    collectTilts();
    collectSkews();
    buildMarquees();

    document.addEventListener('pointerdown', ripple);
    document.addEventListener('pointermove', glow);
    document.addEventListener('pointermove', tiltMove);
    document.addEventListener('pointerleave', function () {
      tilts.forEach(function (t) { t.trx = 0; t.try_ = 0; });
    });

    /* Scramble on hover for anything opted in, plus once when it appears. */
    document.querySelectorAll('[data-scramble]').forEach(function (el) {
      el.addEventListener('pointerenter', function () { scramble(el, 420); });
      if (window.ScrollTrigger && on()) {
        ScrollTrigger.create({
          trigger: el, start: 'top 92%', once: true,
          onEnter: function () { scramble(el, 620); }
        });
      }
    });

    window.addEventListener('resize', function () {
      collectTilts();
      marquees.forEach(function (m) { m.w = m.tracks[0].scrollWidth; });
    });

    if (stopTick) stopTick();
    stopTick = GEO.env.onTick(function (dt) {
      var reduced = GEO.env.reducedMotion;

      /* tilt */
      for (var i = 0; i < tilts.length; i++) {
        var t = tilts[i];
        t.rx = GEO.env.damp(t.rx, reduced ? 0 : t.trx, 9, dt);
        t.ry = GEO.env.damp(t.ry, reduced ? 0 : t.try_, 9, dt);
        t.el.style.transform = (Math.abs(t.rx) < 0.02 && Math.abs(t.ry) < 0.02)
          ? ''
          : 'perspective(900px) rotateX(' + t.rx.toFixed(2) + 'deg) rotateY(' + t.ry.toFixed(2) + 'deg) translateZ(0)';
      }

      /* skew with scroll velocity */
      var v = reduced ? 0 : GEO.env.clamp(GEO.env.scroll.velocity, -1, 1);
      for (var s = 0; s < skews.length; s++) {
        skews[s].style.transform = Math.abs(v) < 0.01 ? '' : 'skewY(' + (v * -1.4).toFixed(3) + 'deg)';
      }

      /* marquee, faster while the page is moving */
      for (var m = 0; m < marquees.length; m++) {
        var mq = marquees[m];
        if (!mq.w) { mq.w = mq.tracks[0].scrollWidth; continue; }
        var speed = reduced ? 0 : mq.speed * (1 + Math.abs(v) * 2.5);
        mq.x -= speed * dt;
        if (mq.x <= -mq.w) mq.x += mq.w;
        mq.tracks[0].style.transform = mq.tracks[1].style.transform = 'translate3d(' + mq.x.toFixed(2) + 'px,0,0)';
      }
    });
  }

  return {
    init: init,
    scramble: scramble,
    /* Pages that inject markup call this so new nodes pick up the behaviours. */
    refresh: function () { collectTilts(); collectSkews(); buildMarquees(); }
  };
})();
