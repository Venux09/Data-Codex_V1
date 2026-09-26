#!/usr/bin/env python3
"""
Run the Data Intelligence Codex locally.

Usage:
    python3 serve.py            # serves on http://localhost:8000
    python3 serve.py 5500       # serves on a different port
"""
import http.server
import socketserver
import sys
import webbrowser
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # keep the terminal clean; comment this out if you want request logs

with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
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
