"""Dev server Nordy Tech: static + fallback /produk -> /produk.html + no-cache + clean slug."""
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 3000

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def do_GET(self):
        parts = urlsplit(self.path)
        path = parts.path
        if path != "/" and path.endswith("/"):
            path = path.rstrip("/")
        # /produk/<slug> -> produk-detail.html?slug=<slug>
        if path.startswith("/produk/") and path != "/produk":
            m = re.match(r'^/produk/([^/]+)$', path)
            if m:
                slug = m.group(1)
                self.path = "/produk-detail.html?slug=" + slug + ("?" + parts.query if parts.query else "")
                return super().do_GET()
        if path != "/" and "." not in os.path.basename(path):
            cand = os.path.join(ROOT, path.lstrip("/") + ".html")
            if os.path.isfile(cand):
                q = ("?" + parts.query) if parts.query else ""
                self.path = path + ".html" + q
        return super().do_GET()

if __name__ == "__main__":
    with ThreadingHTTPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Nordy Tech dev server: http://localhost:{PORT}")
        httpd.serve_forever()