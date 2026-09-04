#!/usr/bin/env python3
"""Dependency-free structural checks for the compendium source."""

from __future__ import annotations

from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def front_matter(text: str) -> str | None:
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---\n", 4)
    if end == -1:
        return None
    return text[4:end]


def scalar_value(metadata: str, key: str) -> str | None:
    match = re.search(rf"(?m)^{re.escape(key)}:\s*(.+?)\s*$", metadata)
    return match.group(1).strip('"\'') if match else None


def check_pages() -> None:
    permalinks: dict[str, Path] = {}
    published_pages = [ROOT / "index.md", ROOT / "404.md"]
    published_pages.extend(sorted((ROOT / "docs").rglob("*.md")))

    for path in published_pages:
        relative = path.relative_to(ROOT)
        text = path.read_text(encoding="utf-8")
        metadata = front_matter(text)

        if "docs/planering" in relative.as_posix():
            continue
        if metadata is None:
            ERRORS.append(f"{relative}: published Markdown lacks front matter")
            continue
        if not scalar_value(metadata, "title"):
            ERRORS.append(f"{relative}: missing title")

        permalink = scalar_value(metadata, "permalink")
        if permalink:
            if permalink in permalinks:
                ERRORS.append(
                    f"{relative}: duplicate permalink also used by "
                    f"{permalinks[permalink].relative_to(ROOT)}"
                )
            permalinks[permalink] = path

        if path.name != "404.md" and "keywords:" not in metadata:
            ERRORS.append(f"{relative}: missing searchable keywords")

        if text.count("<details") != text.count("</details>"):
            ERRORS.append(f"{relative}: unbalanced details element")
        if text.count("<figure") != text.count("</figure>"):
            ERRORS.append(f"{relative}: unbalanced figure element")

        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
            if target.startswith(("http://", "https://", "#", "{{")):
                continue
            local_target = target.split("#", 1)[0]
            resolved = (path.parent / local_target).resolve()
            if not resolved.exists():
                ERRORS.append(f"{relative}: missing local link {target}")

        for asset in re.findall(r"/assets/(?:images|sql|js|css)/[^ '\"})]+", text):
            resolved = ROOT / asset.lstrip("/")
            if not resolved.exists():
                ERRORS.append(f"{relative}: missing asset {asset}")


def check_svg() -> None:
    namespace = "{http://www.w3.org/2000/svg}"
    for path in sorted((ROOT / "assets" / "images").glob("*.svg")):
        relative = path.relative_to(ROOT)
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError as error:
            ERRORS.append(f"{relative}: invalid XML ({error})")
            continue
        title = root.find(f"{namespace}title")
        description = root.find(f"{namespace}desc")
        if title is None or not (title.text or "").strip():
            ERRORS.append(f"{relative}: missing SVG title")
        if description is None or not (description.text or "").strip():
            ERRORS.append(f"{relative}: missing SVG description")


def check_platform_contract() -> None:
    required = [
        "_includes/head_custom.html",
        "_includes/header_custom.html",
        "_includes/search_placeholder_custom.html",
        "_includes/lunr/custom-data.json",
        "_includes/lunr/custom-index.js",
        "_sass/color_schemes/databaser-dark.scss",
        "assets/css/just-the-docs-databaser-dark.scss",
            "assets/js/theme-toggle.js",
            "scripts/test_theme_toggle.js",
        ".github/workflows/pages.yml",
    ]
    for relative in required:
        if not (ROOT / relative).exists():
            ERRORS.append(f"missing platform file: {relative}")

    config = (ROOT / "_config.yml").read_text(encoding="utf-8")
    for fragment in (
        "search_enabled: true",
        "heading_level: 3",
        "button: true",
        'focus_shortcut_key: "k"',
        "color_scheme: databaser",
    ):
        if fragment not in config:
            ERRORS.append(f"_config.yml: missing {fragment}")

    nav_footer = (ROOT / "_includes" / "nav_footer_custom.html").read_text(
        encoding="utf-8"
    )
    if "site-footer" in nav_footer:
        ERRORS.append("nav_footer_custom.html must not wrap content in .site-footer")

    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix in {".md", ".html", ".yml"}:
            text = path.read_text(encoding="utf-8")
            if 'href="#"' in text:
                ERRORS.append(f"{path.relative_to(ROOT)}: placeholder link found")


def main() -> None:
    check_pages()
    check_svg()
    check_platform_contract()

    if ERRORS:
        print("\n".join(f"ERROR: {error}" for error in ERRORS), file=sys.stderr)
        raise SystemExit(1)
    print("Site source structure, links, search metadata, and SVG metadata: OK")


if __name__ == "__main__":
    main()
