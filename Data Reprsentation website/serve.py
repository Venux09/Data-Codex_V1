#!/usr/bin/env python3
"""
Run the Data Intelligence Codex locally — and receive project
uploads from the "+ Add Project" button in the browser.

Usage:
    python3 serve.py            # serves on http://localhost:8000
    python3 serve.py 5500       # serves on a different port
"""
import http.server
import socketserver
import sys
import re
import os
import json
import webbrowser
from urllib.parse import urlsplit

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
import build_manifest

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

os.chdir(BASE_DIR)

ALLOWED_EXTS = ('.ipynb', '.md', '.py', '.csv')
ALLOWED_SECTIONS = ('datasets', 'ml', 'ai')


def parse_multipart(body: bytes, boundary: bytes):
    """Minimal multipart/form-data parser — just enough for one file
    field and a couple of plain text fields."""
    delimiter = b'--' + boundary
    parts = body.split(delimiter)
    result = {}
    for part in parts:
        part = part.strip(b'\r\n')
        if not part or part == b'--':
            continue
        if b'\r\n\r\n' not in part:
            continue
        header_bytes, content = part.split(b'\r\n\r\n', 1)
        content = content[:-2] if content.endswith(b'\r\n') else content
        headers = header_bytes.decode('utf-8', errors='replace')
        name_match = re.search(r'name="([^"]+)"', headers)
        filename_match = re.search(r'filename="([^"]*)"', headers)
        if not name_match:
            continue
        field_name = name_match.group(1)
        if filename_match and filename_match.group(1):
            result[field_name] = {'filename': filename_match.group(1), 'content': content}
        else:
            result[field_name] = content.decode('utf-8', errors='replace')
    return result


class CodexHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # keep the terminal clean

    def send_json(self, status, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlsplit(self.path).path
        # Regenerate a section's manifest on demand, so a file dropped
        # straight into notebooks/<section>/ shows up on refresh with
        # no server restart needed.
        if path.startswith('/notebooks/') and path.endswith('/manifest.json'):
            try:
                build_manifest.build_all(BASE_DIR)
            except Exception:
                pass
        super().do_GET()

    def do_POST(self):
        path = urlsplit(self.path).path
        if path != '/api/upload':
            self.send_error(404)
            return

        content_type = self.headers.get('Content-Type', '')
        m = re.search(r'boundary=(?:"([^"]+)"|([^;]+))', content_type)
        if not m:
            self.send_json(400, {'ok': False, 'error': 'Malformed upload request.'})
            return
        boundary = (m.group(1) or m.group(2)).strip().encode()

        try:
            length = int(self.headers.get('Content-Length', 0))
        except ValueError:
            length = 0
        body = self.rfile.read(length)
        fields = parse_multipart(body, boundary)

        section = fields.get('section', '')
        file_field = fields.get('file')

        if section not in ALLOWED_SECTIONS:
            self.send_json(400, {'ok': False, 'error': 'Unknown section.'})
            return
        if not isinstance(file_field, dict):
            self.send_json(400, {'ok': False, 'error': 'No file received.'})
            return

        filename = file_field['filename']
        safe_name = re.sub(r'[^A-Za-z0-9._-]', '-', filename)
        ext = os.path.splitext(safe_name)[1].lower()
        if ext not in ALLOWED_EXTS:
            self.send_json(400, {'ok': False, 'error': f'{ext or "that file type"} isn\'t supported yet — use .ipynb, .md, .py, or .csv.'})
            return

        section_dir = os.path.join(BASE_DIR, 'notebooks', section)
        os.makedirs(section_dir, exist_ok=True)

        base, extension = os.path.splitext(safe_name)
        dest = os.path.join(section_dir, safe_name)
        counter = 1
        while os.path.exists(dest):
            dest = os.path.join(section_dir, f'{base}-{counter}{extension}')
            counter += 1

        with open(dest, 'wb') as f:
            f.write(file_field['content'])

        try:
            build_manifest.build_all(BASE_DIR)
        except Exception as e:
            self.send_json(200, {'ok': True, 'title': os.path.basename(dest), 'warning': str(e)})
            return

        title = os.path.splitext(os.path.basename(dest))[0]
        try:
            with open(os.path.join(section_dir, 'manifest.json'), encoding='utf-8') as mf:
                manifest = json.load(mf)
            saved_name = os.path.basename(dest)
            for entry in manifest.get('entries', []):
                if any(os.path.basename(f) == saved_name for f in entry.get('files', [])):
                    title = entry['title']
                    break
        except Exception:
            pass

        self.send_json(200, {'ok': True, 'title': title})


if __name__ == '__main__':
    try:
        build_manifest.build_all(BASE_DIR)
    except Exception:
        pass

    try:
        httpd = socketserver.TCPServer(("", PORT), CodexHandler)
    except OSError as e:
        if e.errno in (48, 98, 10048):  # "address already in use", mac/linux/windows
            print(f"\nPort {PORT} is already in use — something else (maybe an older")
            print(f"serve.py you forgot to stop) is already using it.\n")
            print(f"Easiest fix: run this instead —")
            print(f"    python serve.py {PORT + 1}")
            print(f"\nOr free up port {PORT} and try again. See the README for how.\n")
        else:
            print(f"\nCouldn't start the server: {e}\n")
        sys.exit(1)

    with httpd:
        url = f"http://localhost:{PORT}"
        print(f"Serving Data Intelligence Codex at {url}  (Ctrl+C to stop)")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
