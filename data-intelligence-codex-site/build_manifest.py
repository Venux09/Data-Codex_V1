#!/usr/bin/env python3
"""
Scans notebooks/datasets, notebooks/ml, notebooks/ai and writes a
manifest.json inside each, listing what's there so the site can
display it — no manual registration required.

Every field on a project card (title, description, tech stack,
category, year) is extracted automatically from the file itself —
nothing here is hand-typed content. If a field can't be reasonably
inferred, it's left out rather than guessed at.

Run this yourself before shipping to a static host (Netlify/GitHub
Pages/Vercel), since those hosts can't run serve.py's automatic
regeneration. While developing locally with `python3 serve.py`, this
runs automatically every time the site asks for a manifest, and also
whenever a file is uploaded through the "+ Add Project" button.

Usage:
    python3 build_manifest.py
"""
import json
import re
import os
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
SECTIONS = {"datasets": "Data Science", "ml": "Machine Learning", "ai": "AI Engineering"}
VALID_EXTS = ('.ipynb', '.md', '.py', '.csv')

IMPORT_NAME_MAP = {
    'pandas': 'Pandas', 'numpy': 'NumPy', 'matplotlib': 'Matplotlib', 'seaborn': 'Seaborn',
    'sympy': 'SymPy', 'sklearn': 'Scikit-learn', 'scipy': 'SciPy', 'tensorflow': 'TensorFlow',
    'torch': 'PyTorch', 'keras': 'Keras', 'requests': 'Requests', 'plotly': 'Plotly',
    'xgboost': 'XGBoost', 'lightgbm': 'LightGBM', 'statsmodels': 'Statsmodels', 'nltk': 'NLTK',
    'cv2': 'OpenCV', 'PIL': 'Pillow', 'flask': 'Flask', 'django': 'Django', 'bs4': 'BeautifulSoup',
    're': None, 'os': None, 'sys': None, 'json': None, 'math': None, 'time': None, 'random': None,
    'warnings': None, 'datetime': None, 'collections': None, 'itertools': None,
}


def slugify(name):
    name = re.sub(r'^[0-9]+[-_.\s]*', '', name)
    name = name.lower()
    name = re.sub(r'[^a-z0-9]+', '-', name).strip('-')
    return name or 'untitled'


def humanize(name):
    name = re.sub(r'^[0-9]+[-_.\s]*', '', name)
    name = name.replace('-', ' ').replace('_', ' ').strip()
    return name[:1].upper() + name[1:] if name else name


def load_notebook(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def cell_text(cell):
    src = cell.get('source', [])
    return ''.join(src) if isinstance(src, list) else str(src)


def title_from_notebook(nb):
    for cell in nb.get('cells', []):
        if cell.get('cell_type') == 'markdown':
            for line in cell_text(cell).split('\n'):
                line = line.strip()
                if line.startswith('#'):
                    return line.lstrip('#').strip()
    return None


def description_from_notebook(nb):
    for cell in nb.get('cells', []):
        if cell.get('cell_type') == 'markdown':
            for line in cell_text(cell).split('\n'):
                line = line.strip()
                if line and not line.startswith('#'):
                    line = re.sub(r'[*_`]', '', line)  # strip basic markdown emphasis
                    return (line[:180] + '…') if len(line) > 180 else line
    return None


def imports_from_code(code):
    mods = set()
    for line in code.split('\n'):
        line = line.strip()
        m = re.match(r'^import\s+([a-zA-Z0-9_.]+)', line)
        if not m:
            m = re.match(r'^from\s+([a-zA-Z0-9_.]+)\s+import', line)
        if m:
            mods.add(m.group(1).split('.')[0])
    return mods


def tools_from_notebook(nb):
    mods = set()
    for cell in nb.get('cells', []):
        if cell.get('cell_type') == 'code':
            mods |= imports_from_code(cell_text(cell))
    return mods


def title_from_markdown_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('#'):
                    return line.lstrip('#').strip()
    except Exception:
        pass
    return None


def analyze_file(path):
    """Returns (title, description, tools:set) extracted from one file."""
    ext = os.path.splitext(path)[1].lower()
    if ext == '.ipynb':
        nb = load_notebook(path)
        if nb is None:
            return None, None, set()
        return title_from_notebook(nb), description_from_notebook(nb), tools_from_notebook(nb)
    if ext == '.md':
        title = title_from_markdown_file(path)
        desc = None
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        desc = (line[:180] + '…') if len(line) > 180 else line
                        break
        except Exception:
            pass
        return title, desc, set()
    if ext == '.py':
        try:
            with open(path, 'r', encoding='utf-8') as f:
                text = f.read()
            return None, None, imports_from_code(text)
        except Exception:
            return None, None, set()
    if ext == '.csv':
        try:
            with open(path, 'r', encoding='utf-8') as f:
                lines = [l for l in f.readlines() if l.strip()]
            cols = lines[0].strip().split(',') if lines else []
            desc = f"{max(len(lines)-1,0)} rows · {len(cols)} columns"
            return None, desc, set()
        except Exception:
            return None, None, set()
    return None, None, set()


def nice_tools(mods):
    out = []
    for m in sorted(mods):
        label = IMPORT_NAME_MAP.get(m, False)
        if label is None:
            continue  # explicitly excluded (stdlib noise like os/re/json)
        out.append(label or humanize(m))
    return out


def build_section(section_dir, category_label):
    if not os.path.isdir(section_dir):
        os.makedirs(section_dir, exist_ok=True)

    entries = []
    items = sorted(os.listdir(section_dir))

    for item in items:
        full = os.path.join(section_dir, item)

        if os.path.isdir(full):
            proj_files = sorted(f for f in os.listdir(full) if f.lower().endswith(VALID_EXTS))
            if not proj_files:
                continue
            title = humanize(item)
            description = None
            tools = set()
            labels = []
            newest_mtime = 0
            for f in proj_files:
                fpath = os.path.join(full, f)
                _, desc, mods = analyze_file(fpath)
                if description is None and desc:
                    description = desc
                tools |= mods
                labels.append(title_from_markdown_file(fpath) if f.lower().endswith('.md')
                               else (title_from_notebook(load_notebook(fpath) or {}) if f.lower().endswith('.ipynb') else None)
                               or humanize(os.path.splitext(f)[0]))
                newest_mtime = max(newest_mtime, os.path.getmtime(fpath))
            entries.append({
                "id": slugify(item),
                "title": title,
                "description": description,
                "category": category_label,
                "tools": nice_tools(tools),
                "year": time.strftime('%Y', time.localtime(newest_mtime)) if newest_mtime else None,
                "files": [f"{item}/{f}" for f in proj_files],
                "labels": labels
            })
        elif item.lower().endswith(VALID_EXTS):
            base = os.path.splitext(item)[0]
            title, description, tools = analyze_file(full)
            title = title or humanize(base)
            entries.append({
                "id": slugify(base),
                "title": title,
                "description": description,
                "category": category_label,
                "tools": nice_tools(tools),
                "year": time.strftime('%Y', time.localtime(os.path.getmtime(full))),
                "files": [item],
                "labels": [title]
            })

    for i, e in enumerate(entries):
        e["number"] = i + 1

    manifest_path = os.path.join(section_dir, "manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump({"entries": entries}, f, indent=2)
    return len(entries)


def build_all(root=ROOT):
    counts = {}
    for section, label in SECTIONS.items():
        section_dir = os.path.join(root, "notebooks", section)
        counts[section] = build_section(section_dir, label)
    return counts


if __name__ == "__main__":
    counts = build_all()
    for section, n in counts.items():
        print(f"notebooks/{section}: {n} entr{'y' if n == 1 else 'ies'} indexed")
