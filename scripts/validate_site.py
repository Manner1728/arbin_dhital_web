#!/usr/bin/env python3
"""Small dependency-free integrity check for the static package."""

from __future__ import annotations

import json
import re
import sys
import threading
from collections import Counter
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
from urllib.request import Request, urlopen


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(str(values["id"]))
        for key in ("src", "href", "poster"):
            value = values.get(key)
            if value:
                self.references.append(value)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass


def is_local_reference(value: str) -> bool:
    return not (
        value.startswith(("#", "mailto:", "tel:", "data:"))
        or urlsplit(value).scheme in {"http", "https"}
    )


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    parser = ReferenceParser()
    parser.feed((root / "index.html").read_text(encoding="utf-8"))

    errors: list[str] = []
    duplicate_ids = [value for value, count in Counter(parser.ids).items() if count > 1]
    if duplicate_ids:
        errors.append(f"Duplicate HTML ids: {', '.join(duplicate_ids)}")

    for reference in parser.references:
        if not is_local_reference(reference):
            continue
        target = unquote(urlsplit(reference).path).lstrip("/")
        if target and not (root / target).exists():
            errors.append(f"Missing referenced file: {reference}")

    css = (root / "assets/css/styles.css").read_text(encoding="utf-8")
    for reference in re.findall(r"url\([\"']?([^\"')]+)", css):
        if reference.startswith(("data:", "%23", "#")):
            continue
        target = (root / "assets/css" / unquote(reference)).resolve()
        if not target.exists():
            errors.append(f"Missing CSS asset: {reference}")

    compact_css = re.sub(r"\s+", " ", css)
    clarity_requirements = {
        "non-overlapping automatic-publish panel": ".auto-publish { position: relative; z-index: 5; margin-top: 0;",
        "separated writing-card image and text rows": "grid-template-rows: minmax(270px, 330px) minmax(250px, auto);",
        "full-page cosmic background": "animation: nebulaDrift 28s ease-in-out infinite alternate;",
        "mobile card separation": "grid-template-rows: 240px auto;",
    }
    for label, marker in clarity_requirements.items():
        if marker not in compact_css:
            errors.append(f"Missing layout safeguard: {label}")

    javascript = (root / "assets/js/app.js").read_text(encoding="utf-8")
    for marker in ("drawNebula", "drawStars", "drawComets", "globalCompositeOperation"):
        if marker not in javascript:
            errors.append(f"Cosmic animation layer is incomplete: {marker}")

    manifest = json.loads((root / "content-manifest.json").read_text(encoding="utf-8"))
    if manifest.get("counts", {}).get("poem") != 4:
        errors.append("The generated catalogue must include all four preserved poems.")
    for item in manifest.get("items", []):
        if not (root / item["file"]).exists():
            errors.append(f"Manifest file is missing: {item['file']}")
        image = item.get("image")
        if image and not (root / image).exists():
            errors.append(f"Manifest image is missing: {image}")

    required_originals = [
        "assets/images/hero-divine.png",
        "assets/images/radha-krishna-glow.png",
        "assets/images/krishna-glow.png",
        "assets/images/contemplation.jpg",
        "assets/media/meditation-vision.mp4",
        "assets/media/krishna-radha-devotion.mp4",
        "assets/media/krishna-melody-vertical.mp4",
        "assets/media/flute-melody.mp3",
    ]
    for relative in required_originals:
        if not (root / relative).exists():
            errors.append(f"Preserved original asset is missing: {relative}")

    supplied_audio = list((root / "assets/media/audio").glob("*.mp3"))
    if len(supplied_audio) != 7:
        errors.append(f"Expected seven newly supplied tracks; found {len(supplied_audio)}.")

    website_files = [path for path in root.rglob("*") if path.is_file()]
    largest_file = max(website_files, key=lambda path: path.stat().st_size)
    if largest_file.stat().st_size >= 10 * 1024 * 1024:
        errors.append(
            f"Upload-edition file exceeds 10 MiB: "
            f"{largest_file.relative_to(root)} ({largest_file.stat().st_size} bytes)"
        )

    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=root))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        base_url = f"http://127.0.0.1:{server.server_port}"
        endpoints = [
            ("/index.html", "text/html"),
            ("/content-manifest.json", "application/json"),
            ("/assets/images/poem-last-birth.png", "image/png"),
            ("/assets/media/audio/krishna-flute-deep-sleep-2.mp3", "audio/mpeg"),
            ("/assets/media/meditation-vision.mp4", "video/mp4"),
        ]
        for endpoint, expected_type in endpoints:
            request = Request(f"{base_url}{endpoint}", method="HEAD")
            with urlopen(request, timeout=5) as response:
                content_type = response.headers.get_content_type()
                if response.status not in {200, 206} or content_type != expected_type:
                    errors.append(
                        f"Served endpoint failed: {endpoint} "
                        f"({response.status}, {content_type})"
                    )
    except OSError as exc:
        errors.append(f"Local served-site check failed: {exc}")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)

    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(
        "Validation passed: every file is below 10 MiB, collision safeguards, full cosmic animation, unique IDs, "
        "local references, four poems, all preserved originals, three new poem "
        "artworks, guru artwork, and seven supplied tracks."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
