#!/usr/bin/env python3
"""
Scans notebooks/datasets, notebooks/ml, notebooks/ai and writes a
manifest.json inside each, listing what's there so the site can
display it — no manual registration required.

Run this yourself before shipping to a static host (Netlify/GitHub
Pages/Vercel), since those hosts can't run serve.py's automatic
regeneration. While developing locally with `python3 serve.py`, this
runs automatically every time the site asks for a manifest, and also
whenever a file is uploaded through the "+ Add Project" button — you
don't need to run it by hand for local use.

Usage:
    python3 build_manifest.py
"""
import json
import re
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
SECTIONS = ["datasets", "ml", "ai"]
VALID_EXTS = ('.ipynb', '.md', '.py', '.csv')


def humanize(name):
    name = re.sub(r'^[0-9]+[-_.\s]*', '', name)  # drop a leading order prefix like "1-" or "03_"
    name = name.replace('-', ' ').replace('_', ' ').strip()
    return name[:1].upper() + name[1:] if name else name


def title_from_notebook(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            nb = json.load(f)
    except Exception:
        return None
    for cell in nb.get('cells', []):
        if cell.get('cell_type') == 'markdown':
            src = cell.get('source', [])
            text = ''.join(src) if isinstance(src, list) else str(src)
            for line in text.split('\n'):
                line = line.strip()
                if line.startswith('#'):
                    return line.lstrip('#').strip()
    return None


def title_from_markdown(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('#'):
                    return line.lstrip('#').strip()
    except Exception:
        pass
    return None


def title_from_file(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == '.ipynb':
        return title_from_notebook(path)
    if ext == '.md':
        return title_from_markdown(path)
    return None


def build_section(section_dir):
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
            entries.append({
                "id": re.sub(r'^[0-9]+[-_.\s]*', '', item) or item,
                "title": title,
                "files": [f"{item}/{f}" for f in proj_files],
                "labels": [title_from_file(os.path.join(full, f)) or humanize(os.path.splitext(f)[0]) for f in proj_files]
            })
        elif item.lower().endswith(VALID_EXTS):
            base = os.path.splitext(item)[0]
            title = title_from_file(full) or humanize(base)
            entries.append({
                "id": re.sub(r'^[0-9]+[-_.\s]*', '', base) or base,
                "title": title,
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
    for section in SECTIONS:
        section_dir = os.path.join(root, "notebooks", section)
        counts[section] = build_section(section_dir)
    return counts


if __name__ == "__main__":
    counts = build_all()
    for section, n in counts.items():
        print(f"notebooks/{section}: {n} entr{'y' if n == 1 else 'ies'} indexed")
