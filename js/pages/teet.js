/* ==========================================================================
   teet.js — the T.E.E.T paragraph builder.

   A four-field guided writer with per-field model phrases, live counts,
   validation before compiling, and copy / download of the finished paragraph.
   Drafts are saved per question, so switching questions never loses work.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.pages = GEO.pages || {};

GEO.pages.teet = (function () {
  var Q, qid, hints = {};

  var BOXES = [
    { k: 't',  tag: 'T', label: 'Topic Sentence', help: 'State your main point clearly.' },
    { k: 'e1', tag: 'E', label: 'Explanation',    help: 'Explain how or why this occurs.' },
    { k: 'e2', tag: 'E', label: 'Example',        help: 'Give a specific, concrete example — Paris €24B, 75k Airbnbs, Toyota car parts.' },
    { k: 't2', tag: 'T', label: 'Tie-Back',       help: 'Connect your argument back to the question.' }
  ];

  function question() { return Q.filter(function (q) { return q.id === qid; })[0]; }

  function draft() {
    var s = GEO.store.get();
    if (!s.teet[qid]) GEO.store.mutate(function (st) { st.teet[qid] = { t: '', e1: '', e2: '', t2: '', compiled: '' }; });
    return GEO.store.get().teet[qid];
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function words(s) { return (s.trim().match(/\S+/g) || []).length; }

  /* ------------------------------------------------------ question picker */
  function renderQuestions() {
    var host = document.getElementById('teet-questions');
    var saved = GEO.store.get().teet;
    host.innerHTML = Q.map(function (q) {
      var done = saved[q.id] && saved[q.id].compiled;
      return '<button class="qpick reveal reveal--up" data-q="' + q.id + '" aria-pressed="' + (q.id === qid) + '">' +
        '<span class="card__label"><span class="eyebrow">' + q.marks + '</span>' +
        (done ? '<span class="chip chip--pos" style="margin-left:auto">Compiled</span>' : '') + '</span>' +
        '<span class="qpick__t">' + q.label + '</span></button>';
    }).join('');
  }

  /* ------------------------------------------------------------ the boxes */
  function renderBoxes() {
    var host = document.getElementById('teet-grid');
    var q = question(), d = draft();

    host.innerHTML = BOXES.map(function (b) {
      var v = d[b.k] || '';
      var h = q.hints[b.k];
      return '<div class="card teet-box" data-k="' + b.k + '">' +
        '<div class="field__label">' +
          '<span class="teet-box__tag">' + b.tag + '</span>' +
          '<h2 class="h3">' + b.label + '</h2>' +
          '<button class="btn btn--sm btn--ghost" data-hint="' + b.k + '" aria-expanded="' + !!hints[b.k] + '" style="margin-left:auto">' +
            (hints[b.k] ? 'Hide hints' : 'Model phrases') + '</button>' +
        '</div>' +
        '<p class="small body-dim" style="margin:.4rem 0 .8rem">' + b.help + '</p>' +
        (hints[b.k] ? hintBlock(h) : '') +
        '<label class="visually-hidden" for="box-' + b.k + '">' + b.label + '</label>' +
        '<textarea class="textarea" id="box-' + b.k + '" data-box="' + b.k + '" rows="5" ' +
          'placeholder="Write your ' + b.label.toLowerCase() + ' here…">' + esc(v) + '</textarea>' +
        '<div class="field__label" style="margin-top:.5rem">' +
          '<span class="field__error" id="err-' + b.k + '"></span>' +
          '<span class="field__count" id="count-' + b.k + '">' + words(v) + ' words · ' + v.length + ' chars</span>' +
        '</div></div>';
    }).join('');

    GEO.magnetic.refresh();
  }

  function hintBlock(h) {
    return '<div class="hints">' +
      '<p class="eyebrow eyebrow--accent">' + h.title + '</p>' +
      h.starters.map(function (s) { return '<p>' + s + '</p>'; }).join('') +
      '<div class="hint-chips">' + h.phrases.map(function (p) { return '<span class="chip">' + p + '</span>'; }).join('') + '</div>' +
      '</div>';
  }

  /* -------------------------------------------------------------- compile */
  function tidy(s) {
    s = s.trim();
    return s && !/[.!?…]$/.test(s) ? s + '.' : s;
  }

  function compile() {
    var d = draft(), ok = true;

    BOXES.forEach(function (b) {
      var box = document.querySelector('.teet-box[data-k="' + b.k + '"]');
      var err = document.getElementById('err-' + b.k);
      var empty = !(d[b.k] || '').trim();
      box.classList.toggle('is-invalid', empty);
      box.style.borderColor = empty ? 'var(--neg)' : '';
      err.textContent = empty ? 'This box is empty.' : '';
      if (empty) ok = false;
    });

    var out = document.getElementById('teet-out');

    if (!ok) {
      out.innerHTML = '<div class="note note--neg"><p><b>A complete T.E.E.T paragraph needs all four parts.</b> ' +
        'Fill in the highlighted boxes, then compile again.</p></div>';
      var first = document.querySelector('.teet-box.is-invalid textarea');
      if (first) first.focus();
      return;
    }

    /* Joined into one flowing paragraph — sentence-final punctuation added
       where the writer left it off, then a single space between parts. */
    var text = BOXES.map(function (b) { return tidy(d[b.k]); }).join(' ');
    GEO.store.mutate(function (s) { s.teet[qid].compiled = text; });
    GEO.scene.pulse(0.55);

    out.innerHTML = '<div class="card card--pad teet-out">' +
      '<div class="field__label" style="margin-bottom:.9rem">' +
        '<h2 class="h3">Compiled paragraph</h2>' +
        '<span class="small" id="teet-msg" style="color:var(--pos)"></span>' +
        '<span class="spacer" style="margin-left:auto"></span>' +
        '<button class="btn btn--sm btn--ghost" id="teet-copy">Copy</button>' +
        '<button class="btn btn--sm btn--ghost" id="teet-dl">Download .txt</button>' +
      '</div>' +
      '<div class="definition"><p id="teet-preview"></p></div>' +
      '<p class="field__count" style="margin-top:.8rem">' + words(text) + ' words · ' + text.length + ' characters</p>' +
      '</div>';

    /* textContent, never innerHTML — this is the student's own writing. */
    document.getElementById('teet-preview').textContent = text;

    renderQuestions();
    if (window.gsap && !GEO.env.reducedMotion) {
      gsap.from(out.firstElementChild, { opacity: 0, y: 18, duration: 0.7, ease: 'expo.out' });
    }
  }

  function download() {
    var text = 'QUESTION: ' + question().label + '\n\nT.E.E.T PARAGRAPH:\n' + draft().compiled + '\n';
    var url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'teet-' + qid + '.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ------------------------------------------------------------------ init */
  return {
    init: function () {
      Q = GEO.data.TEET_QUESTIONS;
      qid = Q[0].id;

      renderQuestions();
      renderBoxes();

      document.getElementById('teet-questions').addEventListener('click', function (e) {
        var b = e.target.closest('[data-q]');
        if (!b) return;
        qid = b.getAttribute('data-q');
        hints = {};
        document.getElementById('teet-out').innerHTML = '';
        renderQuestions();
        renderBoxes();
      });

      var grid = document.getElementById('teet-grid');

      grid.addEventListener('click', function (e) {
        var h = e.target.closest('[data-hint]');
        if (!h) return;
        var k = h.getAttribute('data-hint');
        hints[k] = !hints[k];
        renderBoxes();
        var btn = grid.querySelector('[data-hint="' + k + '"]');
        if (btn) btn.focus();
      });

      /* Live counts on every keystroke, not on blur. */
      grid.addEventListener('input', function (e) {
        var t = e.target;
        if (!t.matches('[data-box]')) return;
        var k = t.dataset.box, v = t.value;

        GEO.store.mutate(function (s) { s.teet[qid][k] = v; });
        document.getElementById('count-' + k).textContent = words(v) + ' words · ' + v.length + ' chars';

        if (v.trim()) {
          var box = t.closest('.teet-box');
          box.classList.remove('is-invalid');
          box.style.borderColor = '';
          document.getElementById('err-' + k).textContent = '';
        }
      });

      document.getElementById('teet-compile').addEventListener('click', compile);

      document.getElementById('teet-clear').addEventListener('click', function () {
        GEO.store.mutate(function (s) { s.teet[qid] = { t: '', e1: '', e2: '', t2: '', compiled: '' }; });
        document.getElementById('teet-out').innerHTML = '';
        renderQuestions();
        renderBoxes();
      });

      document.getElementById('teet-out').addEventListener('click', function (e) {
        if (e.target.closest('#teet-dl')) { download(); return; }
        if (e.target.closest('#teet-copy')) {
          var msg = document.getElementById('teet-msg');
          var text = draft().compiled;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
              function () { msg.textContent = 'Copied.'; },
              function () { msg.textContent = 'Copy blocked — select the text and copy manually.'; }
            );
          } else {
            msg.textContent = 'Copy blocked — select the text and copy manually.';
          }
        }
      });
    }
  };
})();
