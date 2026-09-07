/* ==========================================================================
   reveal.js — scroll-tied reveals, all through GSAP + ScrollTrigger.

   Two mechanisms:
     [data-split]  headings are split into measured LINES, each clipped by an
                   overflow box and slid up — not an opacity fade.
     .reveal       generic blocks fade/rise on entry, with optional stagger via
                   [data-stagger] on a parent.
     [data-parallax] elements drift at a fraction of scroll speed.

   Degradation: without GSAP nothing is hidden — an IntersectionObserver adds
   the visible state so the page still reads correctly. With reduced motion,
   everything is shown immediately.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.reveal = (function () {
  var splitCache = [];

  /* ------------------------------------------------------- line splitting */
  function splitIntoLines(el) {
    /* Only split plain-text nodes — anything with markup keeps its structure. */
    if (el.querySelector('*') || !el.textContent.trim()) return null;

    var original = el.getAttribute('data-original-text') || el.textContent;
    el.setAttribute('data-original-text', original);

    var words = original.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');

    /* Group words by their vertical offset — that is the real line break as
       the browser laid it out, at this width, with this font. */
    var spans = Array.prototype.slice.call(el.querySelectorAll('.w'));
    var lines = [];
    var currentTop = null, bucket = [];
    spans.forEach(function (s) {
      var top = s.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) < 4) {
        bucket.push(s.textContent);
        if (currentTop === null) currentTop = top;
      } else {
        lines.push(bucket.join(' '));
        bucket = [s.textContent];
        currentTop = top;
      }
    });
    if (bucket.length) lines.push(bucket.join(' '));

    el.innerHTML = lines.map(function (l) {
      return '<span class="line"><span class="line__i">' + l + '</span></span>';
    }).join('');

    return Array.prototype.slice.call(el.querySelectorAll('.line__i'));
  }

  function showAll() {
    document.querySelectorAll('.line__i').forEach(function (n) { n.style.transform = 'none'; n.style.opacity = '1'; });
    document.querySelectorAll('.reveal').forEach(function (n) { n.style.opacity = '1'; n.style.transform = 'none'; });
  }

  /* ---------------------------------------------------------------- init */
  function init() {
    var hasGSAP = !!(window.gsap && window.ScrollTrigger);

    if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

    /* Marking <html> is what actually hides pre-reveal state in CSS, so if
       these scripts never ran, nothing was ever hidden. */
    if (hasGSAP && !GEO.env.reducedMotion) document.documentElement.classList.add('js-ready');

    if (!hasGSAP || GEO.env.reducedMotion) {
      // No animation available or wanted: make sure everything is visible.
      document.querySelectorAll('[data-split]').forEach(function (el) { splitIntoLines(el); });
      showAll();
      return;
    }

    /* ---- split headings ---- */
    document.querySelectorAll('[data-split]').forEach(function (el) {
      var lines = splitIntoLines(el);
      if (!lines) return;
      splitCache.push(el);

      gsap.set(lines, { yPercent: 115 });
      gsap.to(lines, {
        yPercent: 0,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.075,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* ---- generic blocks ---- */
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      var kids = group.querySelectorAll('.reveal');
      if (!kids.length) return;
      gsap.to(kids, {
        opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true }
      });
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.closest('[data-stagger]')) return;
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* ---- parallax layers ---- */
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var amount = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      gsap.to(el, {
        yPercent: -amount * 100,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });

    /* ---- top scroll progress bar ---- */
    var bar = document.querySelector('.scroll-bar');
    if (bar) {
      gsap.to(bar, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.25 }
      });
    }

    /* Re-measure line breaks when the width changes, otherwise a resized
       heading keeps last layout's line boxes. */
    var w = window.innerWidth, timer;
    window.addEventListener('resize', function () {
      if (window.innerWidth === w) return;                 // ignore mobile URL-bar height changes
      w = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(function () {
        splitCache.forEach(function (el) {
          var lines = splitIntoLines(el);
          if (lines) gsap.set(lines, { yPercent: 0 });      // already revealed, keep them shown
        });
        ScrollTrigger.refresh();
      }, 220);
    });

    GEO.env.on('motionchange', function (reduced) { if (reduced) showAll(); });
  }

  return {
    init: init,
    /* Called after a page injects new content so late nodes still animate. */
    refresh: function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }
  };
})();
