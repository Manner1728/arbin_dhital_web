#!/usr/bin/env python3
"""Build the content catalogue consumed by the static website.

Visitors never need a server. On every GitHub push, the included workflow runs
this script, extracts supported files placed in the repository root, and writes
content-manifest.json for the browser.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import re
import struct
import unicodedata
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
from xml.etree import ElementTree as ET


TEXT_EXTENSIONS = {".txt", ".md", ".markdown", ".rtf", ".docx", ".odt"}
DOCUMENT_EXTENSIONS = TEXT_EXTENSIONS | {".pdf", ".epub"}
AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".oga", ".m4a", ".aac", ".flac", ".opus"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v", ".ogv"}
SUPPORTED_EXTENSIONS = DOCUMENT_EXTENSIONS | AUDIO_EXTENSIONS | VIDEO_EXTENSIONS

IGNORED_NAMES = {
    "README.md",
    "DEPLOYMENT.md",
    "CONTENT_GUIDE.md",
    "LICENSE.md",
    "robots.txt",
}

TYPE_ALIASES = {
    "poem": "poem",
    "poetry": "poem",
    "kavita": "poem",
    "कविता": "poem",
    "novel": "novel",
    "upanyas": "novel",
    "उपन्यास": "novel",
    "article": "article",
    "essay": "article",
    "blog": "article",
    "लेख": "article",
    "निबन्ध": "article",
}


def normalize_space(value: str) -> str:
    return re.sub(r"[ \t]+", " ", value).strip()


def clean_filename_title(path: Path) -> str:
    stem = unicodedata.normalize("NFC", path.stem)
    stem = re.sub(
        r"^(poem|poetry|kavita|novel|upanyas|article|essay|blog|music|audio|song|video|vlog)[-_ ]+",
        "",
        stem,
        flags=re.I,
    )
    stem = re.sub(r"^\d{1,4}[-_. ]+", "", stem)
    return normalize_space(re.sub(r"[-_]+", " ", stem)) or path.stem


def split_front_matter(text: str) -> tuple[dict[str, str], str]:
    stripped = text.lstrip("\ufeff")
    if not stripped.startswith("---"):
        return {}, stripped
    lines = stripped.splitlines()
    end = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if end is None:
        return {}, stripped
    metadata: dict[str, str] = {}
    for line in lines[1:end]:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        metadata[key.strip().lower()] = value.strip().strip("\"'")
    return metadata, "\n".join(lines[end + 1 :]).strip()


def strip_markdown(text: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)
    text = re.sub(r"[*_~`]+", "", text)
    return text.strip()


def strip_rtf(text: str) -> str:
    text = re.sub(r"\\par[d]?\b", "\n", text)
    text = re.sub(r"\\'[0-9a-fA-F]{2}", "", text)
    text = re.sub(r"\\[a-zA-Z]+-?\d* ?", "", text)
    return normalize_space(text.replace("{", "").replace("}", ""))


def extract_docx(path: Path) -> tuple[str, str | None]:
    with zipfile.ZipFile(path) as archive:
        document_xml = archive.read("word/document.xml")
        root = ET.fromstring(document_xml)
        paragraphs: list[str] = []
        for paragraph in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
            parts = [
                node.text or ""
                for node in paragraph.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t")
            ]
            line = normalize_space("".join(parts))
            if line:
                paragraphs.append(line)
        title = None
        try:
            props = ET.fromstring(archive.read("docProps/core.xml"))
            title_node = props.find("{http://purl.org/dc/elements/1.1/}title")
            title = normalize_space(title_node.text or "") if title_node is not None else None
        except (KeyError, ET.ParseError):
            pass
        return "\n\n".join(paragraphs), title


def extract_odt(path: Path) -> str:
    with zipfile.ZipFile(path) as archive:
        root = ET.fromstring(archive.read("content.xml"))
        lines: list[str] = []
        for node in root.iter():
            if node.tag.endswith("}p") or node.tag.endswith("}h"):
                value = normalize_space("".join(node.itertext()))
                if value:
                    lines.append(value)
        return "\n\n".join(lines)


def extract_text(path: Path) -> tuple[str, dict[str, str], str | None]:
    extension = path.suffix.lower()
    inferred_title = None
    if extension == ".docx":
        text, inferred_title = extract_docx(path)
    elif extension == ".odt":
        text = extract_odt(path)
    else:
        text = path.read_text(encoding="utf-8", errors="replace")
        if extension in {".md", ".markdown"}:
            text = strip_markdown(text)
        elif extension == ".rtf":
            text = strip_rtf(text)
    metadata, body = split_front_matter(text)
    return body.strip(), metadata, inferred_title


def first_meaningful_line(text: str) -> str | None:
    for line in text.splitlines():
        candidate = normalize_space(line.lstrip("#").strip())
        if 2 <= len(candidate) <= 140:
            return candidate
    return None


def classify_document(path: Path, text: str, metadata: dict[str, str]) -> str:
    declared = metadata.get("type", "").lower()
    if declared in TYPE_ALIASES:
        return TYPE_ALIASES[declared]
    source = f"{path.stem} {text[:300]}".lower()
    for alias, canonical in TYPE_ALIASES.items():
        if re.search(rf"(^|[\s_.-]){re.escape(alias)}($|[\s_.-])", source):
            return canonical
    word_count = len(text.split())
    line_count = len([line for line in text.splitlines() if line.strip()])
    short_line_ratio = (
        sum(1 for line in text.splitlines() if 0 < len(line.strip()) <= 72) / max(line_count, 1)
    )
    if word_count >= 8000:
        return "novel"
    if line_count >= 4 and short_line_ratio >= 0.72 and word_count <= 1800:
        return "poem"
    return "article"


def read_id3v2_title(path: Path) -> str | None:
    try:
        with path.open("rb") as stream:
            header = stream.read(10)
            if len(header) < 10 or header[:3] != b"ID3":
                return None
            version = header[3]
            tag_size = sum((byte & 0x7F) << shift for byte, shift in zip(header[6:10], (21, 14, 7, 0)))
            data = stream.read(min(tag_size, 2_000_000))
        cursor = 0
        while cursor + 10 <= len(data):
            frame_id = data[cursor : cursor + 4]
            if frame_id.strip(b"\x00") == b"":
                break
            if version == 4:
                size_bytes = data[cursor + 4 : cursor + 8]
                frame_size = sum((byte & 0x7F) << shift for byte, shift in zip(size_bytes, (21, 14, 7, 0)))
            else:
                frame_size = struct.unpack(">I", data[cursor + 4 : cursor + 8])[0]
            payload = data[cursor + 10 : cursor + 10 + frame_size]
            if frame_id == b"TIT2" and payload:
                encodings = {0: "latin-1", 1: "utf-16", 2: "utf-16-be", 3: "utf-8"}
                return normalize_space(payload[1:].decode(encodings.get(payload[0], "utf-8"), errors="replace"))
            cursor += 10 + frame_size
    except (OSError, ValueError, struct.error):
        return None
    return None


def excerpt(text: str, limit: int = 210) -> str:
    compact = normalize_space(text.replace("\n", " "))
    if len(compact) <= limit:
        return compact
    shortened = compact[:limit].rsplit(" ", 1)[0]
    return f"{shortened}…"


def safe_relative_url(path: Path) -> str:
    return "/".join(quote(part) for part in path.parts)


def truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on", "हो"}


def build_item(path: Path, root: Path) -> dict[str, object] | None:
    relative = path.relative_to(root)
    extension = path.suffix.lower()
    stat = path.stat()
    digest = hashlib.sha1(relative.as_posix().encode("utf-8")).hexdigest()[:12]
    common: dict[str, object] = {
        "id": digest,
        "file": relative.as_posix(),
        "url": safe_relative_url(relative),
        "format": extension.lstrip("."),
        "size": stat.st_size,
        "updated": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
    }

    if extension in AUDIO_EXTENSIONS:
        title = read_id3v2_title(path) if extension == ".mp3" else None
        return {
            **common,
            "type": "audio",
            "title": title or clean_filename_title(path),
            "excerpt": "मधुर श्रवणका लागि नयाँ अडियो प्रस्तुति।",
            "mime": mimetypes.guess_type(path.name)[0] or "audio/mpeg",
        }
    if extension in VIDEO_EXTENSIONS:
        return {
            **common,
            "type": "video",
            "title": clean_filename_title(path),
            "excerpt": "नयाँ भिडियो प्रस्तुति।",
            "mime": mimetypes.guess_type(path.name)[0] or "video/mp4",
        }
    if extension in {".pdf", ".epub"}:
        inferred_type = "novel" if "novel" in path.stem.lower() or "upanyas" in path.stem.lower() else "article"
        return {
            **common,
            "type": inferred_type,
            "title": clean_filename_title(path),
            "excerpt": "पूर्ण सामग्री हेर्न फाइल खोल्नुहोस्।",
            "content": "",
            "downloadOnly": True,
        }

    try:
        text, metadata, document_title = extract_text(path)
    except (OSError, KeyError, zipfile.BadZipFile, ET.ParseError):
        return None
    if not text:
        return None
    detected_type = classify_document(path, text, metadata)
    title = metadata.get("title") or document_title or first_meaningful_line(text) or clean_filename_title(path)
    return {
        **common,
        "type": detected_type,
        "title": normalize_space(title),
        "author": metadata.get("author", "अर्बिन धिताल"),
        "language": metadata.get("language", "ne"),
        "image": metadata.get("image", ""),
        "featured": truthy(metadata.get("featured")),
        "excerpt": metadata.get("excerpt") or excerpt(text),
        "content": text,
        "wordCount": len(text.split()),
    }


def build_manifest(root: Path) -> dict[str, object]:
    items: list[dict[str, object]] = []
    for path in sorted(root.iterdir(), key=lambda item: item.name.casefold()):
        if (
            not path.is_file()
            or path.name.startswith(".")
            or path.name in IGNORED_NAMES
            or path.suffix.lower() not in SUPPORTED_EXTENSIONS
        ):
            continue
        item = build_item(path, root)
        if item:
            items.append(item)
    order = {"poem": 0, "novel": 1, "article": 2, "audio": 3, "video": 4}
    items.sort(key=lambda item: (order.get(str(item["type"]), 99), not bool(item.get("featured")), str(item["title"])))
    return {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "counts": {
            content_type: sum(1 for item in items if item["type"] == content_type)
            for content_type in ("poem", "novel", "article", "audio", "video")
        },
        "items": items,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="Repository root")
    parser.add_argument("--output", default="content-manifest.json")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    output = root / args.output
    output.write_text(
        json.dumps(build_manifest(root), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {output.relative_to(root)}")


if __name__ == "__main__":
    main()
