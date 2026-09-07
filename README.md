# Geographies of Interconnections &amp; Global Tourism

A WebGL-driven revision site for the Year 10 Geography trimester test. Five pages,
no build step: open `index.html`, or deploy the folder as-is to GitHub Pages,
Netlify or Vercel.

> Three.js and GSAP load from a CDN, so the first load needs an internet connection.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Overview: hero scene, saved-progress strip, the unit's key figures as count-up stats, and the mark split for the paper. |
| `notes.html` | The full syllabus in seven modules with a sticky contents rail and scroll-spy. Includes the interactive Toyota supply-chain grid (explore / recall quiz) and the expandable Paris strategy cards. |
| `flashcards.html` | Six decks, 47 cards. 3D flip on click, tap or keyboard; per-card "know it / still learning"; shuffle and a still-learning filter. |
| `teet.html` | Guided Topic → Explanation → Example → Tie-back writer with 12 question-specific hint sets, live counts, validation, and copy / download. |
| `test.html` | The 37-mark paper as a four-state machine on a 45-minute clock: 12 auto-marked MCQs, three self-marked short answers with rubrics, and an extended response with a colour-coded exemplar. |

## Architecture

```
index.html  notes.html  flashcards.html  teet.html  test.html
css/
  base.css          tokens, reset, typography, nav, overlays, reduced-motion
  components.css    buttons, cards, chips, meters, fields, flip card, tables
  pages.css         per-page layout
js/
  shaders/          GLSL only: easy to tweak without touching DOM logic
    noise.glsl.js         shared simplex/fbm chunk
    background.glsl.js    the persistent atmospheric field
    object.glsl.js        displaced sphere + parallaxed particle field
    globe.glsl.js         globe dots, supplier pins, trade routes, charge slabs
    transition.glsl.js    the noise-warped directional page wipe
  core/
    env.js          capability detection, one shared rAF ticker, scroll/pointer state
    store.js        progress persistence (localStorage + in-memory fallback)
    scene.js        Three.js scene manager (two passes into one renderer)
    transition.js   page transitions
    cursor.js  magnetic.js  interact.js  reveal.js  counters.js  nav.js  boot.js
  data/             all curriculum content: the single source of truth
    curriculum.js  decks.js  teet.js  test.js
  pages/            per-page interactivity
    home.js  notes.js  flashcards.js  teet.js  test.js
standalone/
  geo-revision.html  the original single-file version, works offline-ish in one file
```

Everything is a classic script on a `GEO` namespace: no modules, so the site
runs from `file://` as well as over HTTP.

## A scene per page, and it answers you

Each page declares its 3D object with `<body data-scene="...">`, and the interface
drives it through `GEO.scene`:

| Page | Object | What makes it move |
|---|---|---|
| Overview | displaced sphere with orbiting satellites | pointer proximity inflates it, scroll velocity spins it faster, it sinks and fades as you leave the hero |
| Study Notes | the supply-chain globe | dotted planet, 21 supplier pins and 21 trade routes arcing to the assembly plant in Japan. Opening a country **spins the globe to face it** and draws its route; "reveal all" lights every route at once; a bright pulse keeps travelling along each one |
| TEET Builder | four glass blocks | one per box. Each charges and rises as you write into it, and all four light up when the paragraph compiles |
| Mock Test | three concentric rings | one per part of the paper, filling with your score |
| Flashcards | the same rings | filling with how much of the current deck you have mastered |

On top of that, `pulse()`, `shock('pos'/'neg'/'warn')` and `burst(x, y)` fire on real
events: a correct answer sends a green shockwave through the background field and
throws 3D confetti from the button you clicked; a wrong one sends a red wave.

## Motion

- **Background**: a fullscreen fragment shader driven continuously by scroll
  position, smoothed scroll *velocity*, and an eased pointer offset. Sections
  declare a palette weight with `data-scene-mix`, which cross-fades the field as
  they pass rather than restarting per section.
- **Page transitions**: a directional, noise-warped wipe (not a fade). Travel
  direction is derived from nav order and carried across the navigation in
  `sessionStorage`, so forward and back sweep opposite ways.
- **Cursor**: a hard dot tracking the pointer with a ring easing behind it at a
  different rate, expanding on interactive elements and able to carry contextual
  text via `data-cursor-text`.
- **Magnetism**: `[data-magnetic="0.4"]` on a button makes it drift toward the
  cursor within a radius and spring back.
- **Reveals**: headings are split into *measured lines*, each clipped and slid
  up; ledes light up word by word on a scrub; blocks stagger in; rules draw
  themselves; stats count up on entry.
- **Page exits**: the outgoing content lifts and staggers away before the wipe
  covers it, and the incoming page settles up as the wipe clears.
- **Micro-interactions** (`js/core/interact.js`): pointer tilt on cards, a
  highlight that follows the pointer inside them, a ripple from the exact click
  point, letters that scramble and settle, a group skew tied to scroll velocity,
  and a ticker whose speed follows the scroll.

## Degradation (all of this is tested)

- **No WebGL / THREE fails to load**: the scene is skipped, a CSS gradient
  backdrop carries the page, transitions become plain navigations, and every
  page stays fully readable and navigable.
- **Context loss**: handled; the canvas fades out to the CSS backdrop.
- **`prefers-reduced-motion`**: reveals are instant, the custom cursor and
  magnetism switch off, scene drift and rotation stop, counters show their final
  values, and wipes become cuts. Changing the setting is picked up live.
- **Touch / coarse pointer**: the custom cursor and magnetism never activate
  and the native cursor is untouched.
- **Low-power devices**: particle count, sphere resolution, antialiasing and
  device pixel ratio all scale down by tier; rendering pauses entirely when the
  tab is hidden.
- **Scripts fail after loading**: the boot curtain releases on a failsafe
  timeout, and a page module that throws is caught so the rest of the site
  still works.
- **Storage blocked**: progress falls back to memory for the session.
- **Keyboard**: everything is operable, including skip link, focus-visible rings, the
  flashcard is a real button (Space/Enter to flip, arrows to navigate), and step
  changes move focus to the new section.

The interactive tools do require JavaScript; each carries a `<noscript>` note
pointing at the reading-form notes.

## Editing content

All curriculum content lives in `js/data/`. The pages render from it and hold no
copy of their own, so a fact is corrected in exactly one place and the notes,
flashcards and mock test can never drift apart.
