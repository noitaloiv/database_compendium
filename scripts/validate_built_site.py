#!/usr/bin/env python3
"""Validate properties that can only be checked after Jekyll has rendered."""

from __future__ import annotations

from html.parser import HTMLParser
import argparse
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


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
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag in ("a", "link", "script", "img"):
            target = values.get("href") if tag in ("a", "link") else values.get("src")
            if target:
                self.references.append(target)
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
    arguments = argparse.ArgumentParser()
    arguments.add_argument("--baseurl", default="", help="Same baseurl as the Jekyll build")
    baseurl = arguments.parse_args().baseurl.rstrip("/")
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
        documents = {item.get("doc") for item in search_data.values()}
        for source in (ROOT / "docs").rglob("*.md"):
            title = re.search(r"^title: (\d+\..+)$", source.read_text(), re.M)
            if title and title.group(1) not in documents:
                ERRORS.append(f"chapter missing from search index: {title.group(1)}")

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
        rendered = path.read_text(encoding="utf-8")
        if "{%" in rendered or "{{" in rendered or "```sql" in rendered:
            ERRORS.append(f"{path.relative_to(SITE)}: unrendered template or code block")
        for reference in parser.references:
            url = urlsplit(reference)
            if url.scheme or url.netloc or not url.path:
                continue
            target = unquote(url.path)
            if target.startswith("/"):
                if baseurl and not target.startswith(baseurl + "/"):
                    ERRORS.append(f"{path.relative_to(SITE)}: link outside baseurl: {target}")
                    continue
                target_path = SITE / target[len(baseurl):].lstrip("/")
            else:
                target_path = path.parent / target
            if target_path.is_dir():
                target_path /= "index.html"
            if not target_path.is_file():
                ERRORS.append(f"{path.relative_to(SITE)}: missing local target {target}")
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
    print("Rendered pages, chapter search entries, local targets, baseurl, deferred scripts and image dimensions: OK")


if __name__ == "__main__":
    main()