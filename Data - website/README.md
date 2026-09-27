# Data Intelligence Codex

A notebook-first project archive for Data Science, Machine Learning,
and AI Engineering work. **Your `.ipynb` file is the source of
truth** — this site is a renderer, not a place you write content by
hand.

## File structure

```
data-intelligence-codex-site/
├── index.html
├── css/styles.css
├── js/
│   ├── content.js           small hand-written bits: About page,
│   │                        social links, "currently learning"
│   ├── notebook-viewer.js   parses .ipynb/.md/.py/.csv and renders
│   │                        them — the core of the whole system
│   └── app.js               routing, theme, background, page shells
├── notebooks/
│   ├── datasets/            drop project files here, or upload
│   ├── ml/                     via the "+ Add Project" button
│   └── ai/
├── build_manifest.py         scans notebooks/ and indexes what's there
├── serve.py                   local server + upload endpoint
└── README.md
```

## The core workflow

1. Work on your project normally — write your notebook in Jupyter,
   VS Code, whatever you already use.
2. Save the `.ipynb`.
3. Open the site, go to Datasets / Machine Learning / AI Engineering.
4. Either:
   - **Drag the file onto the "+ Add Project" box** (or click
     "Choose File"), or
   - **Drop it directly into the matching folder** —
     `notebooks/datasets/`, `notebooks/ml/`, or `notebooks/ai/` —
     and refresh the page.
5. It appears on the site immediately. Nothing is rewritten,
   summarized, or reformatted — every markdown cell, code cell, and
   output renders in the order it appears in your notebook.

No JavaScript, no JSON objects, no manual "write-up" step.

## Running it — a local server is required

Because uploads and notebook rendering both use `fetch()` to talk to
`notebooks/*/manifest.json` and the notebook files themselves,
**opening `index.html` by double-clicking it will not work** —
browsers block local-file fetches for security reasons. You need a
real (even if local) server:

```
python3 serve.py
```

This starts a server, opens `http://localhost:8000` automatically,
and handles the upload endpoint. Leave it running while you work.
Pass a different port with `python3 serve.py 5500` if 8000 is taken
by something else.

## Multi-notebook projects

If a project is more than one notebook (e.g. separate notebooks for
cleaning, exploration, and insights), put them together in a
subfolder instead of uploading them one at a time:

```
notebooks/datasets/
  us-real-estate/
    1-data-review.ipynb
    2-data-specification.ipynb
    3-cleaning-data.ipynb
    4-questions.ipynb
    5-insights-estate.ipynb
```

- The **folder name becomes the project title** (so name it well —
  `us-real-estate` becomes "Us real estate"; rename the folder to
  change the title).
- Files are shown **in filename order**, so a leading number prefix
  (`1-`, `2-`...) controls the sequence.
- All of them render on one project page, one after another, with a
  small divider between each.

This is exactly how the example project (`notebooks/datasets/us-real-estate/`)
already included in this folder is set up — open it on the Datasets
page to see it working.

## Supported file types

| Type | Support |
|---|---|
| `.ipynb` | Full — markdown, code, execution counts, stdout/stderr, text/HTML/image outputs (including pandas tables and matplotlib figures), errors |
| `.md` | Rendered as a single markdown document |
| `.py` | Rendered as a single syntax-highlighted code block |
| `.csv` | Rendered as a data preview table (first 50 rows) |

`.ipynb` is the fully-featured path and the one worth prioritizing.
The others are intentionally lighter — the architecture (drop a file
→ it renders) is the same for all of them, so more formats (`.pdf`,
images, `.json`) can be added later the same way, without changing
how you use the site.

## Shipping it online

The site itself is static, but the **upload button and the
auto-regenerating manifest depend on `serve.py`**, which won't run on
a plain static host (Netlify/GitHub Pages/Vercel). Two ways to handle
that:

1. **Do your uploading locally**, then deploy the whole folder
   (including the now-populated `notebooks/` directory) as static
   files. The "+ Add Project" button just won't do anything on the
   live site — which is fine if you only ever add projects from your
   own machine before deploying.
2. Before deploying, run:
   ```
   python3 build_manifest.py
   ```
   to make sure every `notebooks/*/manifest.json` is up to date with
   whatever's in the folders (this runs automatically whenever
   `serve.py` is handling requests, so you only need to run it by
   hand right before a deploy).

Either way, nothing about the deployed site is dynamic — it's the
same flat files, just with real content in `notebooks/` instead of
empty folders.

## A quick safety note

`.ipynb` output cells can contain raw HTML (this is normal — it's how
pandas renders DataFrames), and this viewer renders that HTML as-is
rather than stripping it. That's fine for your own notebooks. Don't
upload notebooks you didn't write/trust, since their HTML output
would render unfiltered too.
