/* ==========================================================================
   nav.js — header behaviour and navigation routing.

   Marks the current page, handles the mobile menu, and routes internal link
   clicks through the shader transition. Direction of travel is derived from
   the page's position in the nav order, so the wipe sweeps forward or back.

   Every link remains a real <a href>: middle-click, ctrl/cmd-click, "open in
   new tab" and no-JS all behave normally.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.nav = (function () {
  var ORDER = ['index.html', 'notes.html', 'flashcards.html', 'teet.html', 'test.html'];

  function fileOf(url) {
    var path = String(url).split('#')[0].split('?')[0];
    var last = path.substring(path.lastIndexOf('/') + 1);
    return last === '' ? 'index.html' : last;
  }

  function indexOf(file) {
    var i = ORDER.indexOf(file);
    return i === -1 ? 0 : i;
  }

  function init() {
    var nav = document.querySelector('.nav');
    var here = fileOf(window.location.pathname);

    /* ---- current page ---- */
    document.querySelectorAll('.nav__link').forEach(function (a) {
      if (fileOf(a.getAttribute('href')) === here) a.setAttribute('aria-current', 'page');
    });

    /* ---- stuck state ---- */
    if (nav) {
      var onScroll = function () { nav.classList.toggle('is-stuck', window.pageYOffset > 24); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---- mobile menu ---- */
    var toggle = document.querySelector('.nav__toggle');
    var links = document.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        links.classList.toggle('is-open', !open);
      });
      /* Escape closes it, and focus stays usable throughout. */
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          toggle.setAttribute('aria-expanded', 'false');
          links.classList.remove('is-open');
          toggle.focus();
        }
      });
      links.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
          toggle.setAttribute('aria-expanded', 'false');
          links.classList.remove('is-open');
        }
      });
    }

    /* ---- route internal links through the transition ---- */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;

      // Respect every normal browser affordance.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.getAttribute('rel') === 'external') return;

      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|https?:)/i.test(href)) return;

      var target = fileOf(href);
      if (target === here) return;                       // same page: let it be

      e.preventDefault();
      var dir = indexOf(target) >= indexOf(here) ? 1 : -1;
      GEO.transition.go(href, dir);
    });
  }

  return { init: init };
})();
