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

## Run it locally

Fastest: just double-click `index.html`.

Better while you're actively editing (avoids browser quirks with
`file://` links):
```
python3 serve.py
```
This starts a local server and opens `http://localhost:8000` in your
browser automatically. Leave it running, edit `js/content.js` (or
any file), and refresh the tab to see the change. Stop it with
`Ctrl+C`. Pass a different port with `python3 serve.py 5500` if 8000
is taken.

## Ship it online

This site is 100% static — no build step, no server code, no
database. It also uses hash-based routing (`#/datasets`, etc.), so
there is no server-side routing to configure; any static host works
out of the box.

**Netlify Drop (no account needed for a quick link):**
Go to https://app.netlify.com/drop and drag the whole
`data-intelligence-codex-site` folder onto the page. You get a live
URL in a few seconds. (Create a free account if you want to keep the
site and update it later rather than get a one-off throwaway link.)

**GitHub Pages (free, tied to a repo):**
1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment," set the source to your main branch
   (root folder).
4. GitHub gives you a `https://<username>.github.io/<repo>/` URL
   within a minute or two.

**Vercel (free, good if you want custom domains later):**
1. Go to https://vercel.com/new and import the repo (or drag the
   folder in via their dashboard).
2. Leave the build settings blank/default — there's nothing to
   build.
3. Deploy. You get a live URL immediately, plus one for every future
   push if it's connected to a repo.

Whichever you pick, updating the live site later just means
re-uploading the folder (or pushing to the connected repo) — nothing
about the project changes to support this.

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
