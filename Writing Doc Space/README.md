# Data Intelligence Codex

A personal research archive for Data Science, Machine Learning, and AI
Engineering work — dark editorial theme, monochrome palette, theme
switcher, and a content system that needs no rebuild step.

## File structure

```
data-intelligence-codex/
├── index.html        the page shell — nav, canvas, footer, script tags
├── css/
│   └── styles.css    every style: theme tokens, layout, components
├── js/
│   ├── content.js     ← you will edit this file the most
│   └── app.js          rendering, routing, theme, background — edit
│                        only if you want to change page structure
└── README.md
```

Open `index.html` directly in a browser to preview it locally, or
upload the whole folder as-is to any static host (GitHub Pages,
Netlify, Vercel, etc.) — nothing needs to be built or compiled.

## Adding a dataset, ML project, or AI Engineering project

Everything lives in `js/content.js`, inside three arrays: `DATASETS`,
`ML_PROJECTS`, `AI_PROJECTS`. Each array has a commented example
object above it showing the exact shape.

To add one:
1. Open `js/content.js`.
2. Paste a new object into the relevant array, with a unique `id`
   (this becomes the URL, e.g. `#/dataset/your-id`).
3. Fill in the fields — `title`, `description`, `category`, `tools`,
   `status` (`"complete"` or `"in-progress"`), `year`, and the
   write-up fields (`overview`/`objective`/`cleaningSteps`/`analysis`
   for datasets; `problem`/`preprocessing`/`modelChoice`/`evaluation`
   for ML; `problem`/`architecture`/`evaluation` for AI Engineering).
4. Save. The relevant grid page and that entry's detail page update
   automatically — `app.js` never needs to change.

The same pattern applies to `SOCIAL_LINKS`, `NOW_LEARNING`, and
`ABOUT_CONTENT.sections` on the About page.

## How to document your code (using this system as-is)

The dataset/ML/AI write-up fields are built specifically for this —
you don't need a separate blog for project documentation:

- **`cleaningSteps` / `preprocessing`** — one entry per real decision
  you made cleaning or preparing the data. Each has a `title`, a
  `why` (your reasoning — this is the part worth writing well), and
  an optional `code` snippet.
- **`analysis`** (datasets) — one entry per question you asked the
  data: `question` → `approach` → `code` → `result` → `insight`.
  This is the "why did I do this" structure from your original
  brief, and it's the part that makes an entry read like a case
  study instead of a dump of code.
- **`modelChoice` / `evaluation` / `futureWork`** (ML & AI) — the
  same idea for a modelling project: what you chose, why, what the
  metric actually showed, and what's left to improve.

Practically: keep a running note (a `.md` file, a notebook cell, a
scratch doc — whatever you already use while working) of each
decision and its reasoning as you go, then transcribe the finished
ones into `content.js` when a project is far enough along to write
up. Trying to write the "why" after the fact from memory is where
most of the value gets lost.

## If you want a separate blog / notes section

The current architecture treats every entry as a *project*. If you
later want shorter, less structured writing that isn't tied to a
specific dataset or model — build notes, opinions, write-ups of
things you read — the cleanest way to add that without disrupting
anything above is a fourth content type that follows the exact same
pattern:

1. Add a `NOTES` (or `BLOG`) array to `content.js`, shaped like:
   ```js
   const NOTES = [
     // { id, title, date, tags: [], body }
   ];
   ```
   (`body` can be a single string, or an array of paragraph strings
   if you want more structure — plain text is fine to start.)
2. Add `renderNotes()` and `renderNoteDetail(id)` functions in
   `app.js`, copied from `renderDatasets`/`renderDatasetDetail` and
   simplified — a notes entry doesn't need `cleaningSteps` or
   `analysis`, just a title, date, and body.
3. Register the two new routes in the `ROUTES` and `NAV_MAP` objects
   near the bottom of `app.js`, and add a "Notes" link to the nav in
   `index.html` — both are a one-line change, following the same
   pattern already used for `datasets` / `ml` / `ai`.

I didn't build this in now since you hadn't asked for it yet — but
say the word and I'll add it following exactly this pattern.
