#!/usr/bin/env python3
"""Validate properties that can only be checked after Jekyll has rendered."""

from __future__ import annotations

from html.parser import HTMLParser
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
ERRORS: list[str] = []


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.images: list[dict[str, str | None]] = []
        self.links: list[dict[str, str | None]] = []
        self.scripts: list[dict[str, str | None]] = []
        self.select_ids: list[str | None] = []
        self.button_ids: list[str | None] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "img":
            self.images.append(values)
        elif tag == "link":
            self.links.append(values)
        elif tag == "script":
            self.scripts.append(values)
        elif tag == "select":
            self.select_ids.append(values.get("id"))
        elif tag == "button":
            self.button_ids.append(values.get("id"))


def parse_page(path: Path) -> DocumentParser:
    parser = DocumentParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


def main() -> None:
    if not SITE.exists():
        raise SystemExit("ERROR: _site is missing; build Jekyll before this check")

    search_path = SITE / "assets" / "js" / "search-data.json"
    try:
        search_data = json.loads(search_path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError) as error:
        ERRORS.append(f"search-data.json is missing or invalid: {error}")
    else:
        if not search_data:
            ERRORS.append("search-data.json contains no searchable sections")

    if (SITE / "docs" / "planering").exists():
        ERRORS.append("internal planning documents were rendered into _site")

    index_path = SITE / "index.html"
    index = parse_page(index_path)
    for expected in ("lunr.min.js", "just-the-docs.js", "theme-toggle.js"):
        matches = [item for item in index.scripts if expected in (item.get("src") or "")]
        if not matches or "defer" not in matches[0]:
            ERRORS.append(f"index.html: {expected} is missing or not deferred")

    if "theme-toggle" not in index.button_ids or "theme-preference" in index.select_ids:
        ERRORS.append("index.html: expected theme icon button and no theme select")

    for path in sorted(SITE.rglob("*.html")):
        parser = parse_page(path)
        for image in parser.images:
            source = image.get("src") or ""
            if "/assets/images/" not in source or "databaser-logo" in source:
                continue
            for attribute in ("alt", "width", "height", "loading", "decoding"):
                if not image.get(attribute):
                    ERRORS.append(
                        f"{path.relative_to(SITE)}: {source} lacks {attribute}"
                    )

    if ERRORS:
        print("\n".join(f"ERROR: {error}" for error in ERRORS), file=sys.stderr)
        raise SystemExit(1)
    print("Rendered site, search JSON, deferred scripts, and image dimensions: OK")


if __name__ == "__main__":
    main()