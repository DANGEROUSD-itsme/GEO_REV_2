# Geographies of Interconnections & Global Tourism — Year 10 Revision App

A single, self-contained HTML revision tool for the Year 10 Geography trimester test.
Open `geo-revision.html` in any modern browser — there is no build step, no install and no server.

> **Needs an internet connection on first load.** Tailwind and Lucide are loaded from a CDN,
> so the page will not render offline.

## What's inside

| View | What it does |
|---|---|
| **Dashboard** | Session progress: flashcard mastery, TEET paragraphs compiled, mock-test score, and a mark-allocation donut for the exam. |
| **Study Notes** | The full syllabus in expandable modules — exam specs, core definitions, perceptions of place, ICT interconnections, transport & global logistics, types of tourism, and the Paris overtourism case study. |
| **Flashcards** | Six named decks (47 cards) with 3D flip, keyboard navigation, shuffle, per-card "Know it / Still learning" tracking and a still-learning filter. |
| **TEET Builder** | Guided Topic → Explanation → Example → Tie-back paragraph writing for three exam questions, with 12 question-specific hint sets, live word counts, compile, copy and download. |
| **Mock Test** | The full 37-mark paper on a 45-minute timer — 12 auto-marked multiple-choice questions with explanations, 3 short-answer questions with mark-by-mark rubrics and model answers, and a 12-mark extended response with a colour-coded T/E/E/T exemplar. |

## Key features

- **Exam-accurate**: 45 minutes, 37 marks (Part A 12 · Part B 13 · Part C 12), built around the T.E.E.T writing model.
- **Timed test** that auto-submits Parts A and B at zero but leaves Part C open so the extended response can be finished.
- **Self-marking** for the free-text sections, with explicit rubrics so marks are awarded against real criteria.
- **Interactive Toyota supply chain** — all 21 supplying countries, with an explore mode and a recall quiz mode.
- **Responsive** from 375px up, keyboard-operable, and colour-coded impacts that also carry `+` / `−` labels rather than relying on colour alone.

## Editing the content

All curriculum content lives in plain JavaScript data objects at the top of the `<script>` block
(`DEFINITIONS`, `PERCEPTION`, `ICT`, `TRANSPORT`, `TOURISM_TYPES`, `PARIS`, `DECKS`,
`TEET_QUESTIONS`, `PART_A`, `PART_B`, `PART_C`). Everything in the UI renders from that data, so
questions, flashcards and case-study facts can be changed without touching any render logic.

## Progress and persistence

Progress is held in memory for the current session only and resets when the page is closed, so the
file works in sandboxed environments that block browser storage. To persist progress across
sessions, serialise the `state` object into `localStorage` on change and restore it in `boot()` —
there is a comment in the source marking where.
