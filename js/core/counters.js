/* ==========================================================================
   counters.js — statistics count up when they scroll into view.

   Markup:
     <span data-count-to="24" data-prefix="€" data-suffix="B" data-decimals="0">€24B</span>

   The element's HTML already contains the final value, so if scripts fail or
   motion is reduced the correct number is simply there.
   ========================================================================== */
window.GEO = window.GEO || {};

GEO.counters = (function () {

  function format(v, node) {
    var dec = parseInt(node.getAttribute('data-decimals') || '0', 10);
    var pre = node.getAttribute('data-prefix') || '';
    var suf = node.getAttribute('data-suffix') || '';
    var grouped = node.getAttribute('data-group') !== 'false';
    var n = dec > 0 ? v.toFixed(dec) : String(Math.round(v));
    if (grouped) {
      var parts = n.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      n = parts.join('.');
    }
    return pre + n + suf;
  }

  function init(root) {
    var nodes = (root || document).querySelectorAll('[data-count-to]');
    if (!nodes.length) return;

    /* Reduced motion (or no GSAP): leave the printed final value alone. */
    if (GEO.env.reducedMotion || !window.gsap || !window.ScrollTrigger) return;

    nodes.forEach(function (node) {
      if (node.__counted) return;
      node.__counted = true;

      var target = parseFloat(node.getAttribute('data-count-to'));
      if (isNaN(target)) return;

      /* The authored final value stays on screen until the moment the count
         actually starts. If the trigger never fires — refresh timing, an odd
         layout, a ScrollTrigger failure — the correct number is still shown
         rather than a stranded zero. */
      ScrollTrigger.create({
        trigger: node,
        start: 'top 95%',
        once: true,
        onEnter: function () {
          var obj = { v: 0 };
          node.textContent = format(0, node);
          gsap.to(obj, {
            v: target,
            duration: 2.1,
            ease: 'expo.out',
            onUpdate: function () { node.textContent = format(obj.v, node); },
            onComplete: function () { node.textContent = format(target, node); }
          });
        }
      });
    });
  }

  return { init: init };
})();
