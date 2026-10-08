#!/usr/bin/env python3
"""Enkiama public-site integrity checks.

Designed to catch structural regressions without trying to mechanise visual taste.
Uses only the Python standard library so it stays fast and deterministic in CI.
"""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_HTML = {
    "admin.html",
    "notes.html",
}
REQUIRED_META_EXEMPT = {
    # Search-engine verification file, not a public page.
}
INACTIVE_CONTACT = "hola@enkiama.com"

class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.links: list[tuple[str, str]] = []
        self.blank_targets: list[tuple[str, str]] = []
        self.title_parts: list[str] = []
        self.in_title = False
        self.h1_count = 0
        self.meta: dict[str, str] = {}
        self.canonical = ""

    def handle_starttag(self, tag: str, attrs_list):
        attrs = dict(attrs_list)
        if "id" in attrs and attrs["id"]:
            self.ids.append(attrs["id"])

        if tag == "h1":
            self.h1_count += 1
        elif tag == "title":
            self.in_title = True
        elif tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            if key:
                self.meta[key.lower()] = attrs.get("content", "").strip()
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href", "").strip()

        for attr in ("href", "src", "data-src", "poster"):
            value = attrs.get(attr)
            if value:
                self.links.append((attr, value.strip()))

        srcset = attrs.get("srcset")
        if srcset:
            for part in srcset.split(","):
                candidate = part.strip().split(" ")[0]
                if candidate:
                    self.links.append(("srcset", candidate))

        if attrs.get("target") == "_blank":
            rel = set((attrs.get("rel") or "").lower().split())
            if "noopener" not in rel:
                self.blank_targets.append((tag, attrs.get("href", "")))

    def handle_endtag(self, tag: str):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str):
        if self.in_title:
            self.title_parts.append(data)

    @property
    def title(self) -> str:
        return " ".join(x.strip() for x in self.title_parts if x.strip()).strip()


def public_pages() -> list[Path]:
    pages = []
    for path in sorted(ROOT.glob("*.html")):
        if path.name in EXCLUDED_HTML or path.name.startswith("google"):
            continue
        pages.append(path)
    return pages


def is_ignored_reference(value: str) -> bool:
    v = value.strip()
    if not v or v.startswith("#"):
        return True
    lower = v.lower()
    return lower.startswith((
        "http://", "https://", "//", "mailto:", "tel:", "sms:",
        "whatsapp:", "data:", "blob:", "javascript:"
    ))


def resolve_local(page: Path, value: str) -> Path | None:
    if is_ignored_reference(value):
        return None

    split = urlsplit(value)
    path_part = split.path
    if not path_part:
        return None

    if path_part.startswith("/"):
        candidate = ROOT / path_part.lstrip("/")
    else:
        candidate = page.parent / path_part

    candidate = candidate.resolve()
    try:
        candidate.relative_to(ROOT.resolve())
    except ValueError:
        return candidate

    if candidate.exists():
        return candidate

    # Support clean internal links if introduced later.
    if candidate.suffix == "":
        html_candidate = candidate.with_suffix(".html")
        if html_candidate.exists():
            return html_candidate
        index_candidate = candidate / "index.html"
        if index_candidate.exists():
            return index_candidate

    return candidate


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    pages = public_pages()

    if not pages:
        errors.append("No public HTML pages found.")

    for page in pages:
        text = page.read_text(encoding="utf-8")
        parser = PageParser()
        try:
            parser.feed(text)
        except Exception as exc:
            errors.append(f"{page.name}: HTML parser error: {exc}")
            continue

        if not parser.title:
            errors.append(f"{page.name}: missing <title>.")

        if parser.h1_count < 1:
            errors.append(f"{page.name}: missing <h1>.")

        viewport = parser.meta.get("viewport", "")
        if "width=device-width" not in viewport:
            errors.append(f"{page.name}: missing responsive viewport metadata.")

        if page.name != "404.html":
            if not parser.meta.get("description"):
                errors.append(f"{page.name}: missing meta description.")
            if not parser.canonical:
                errors.append(f"{page.name}: missing canonical URL.")

        duplicates = sorted({x for x in parser.ids if parser.ids.count(x) > 1})
        if duplicates:
            errors.append(f"{page.name}: duplicate id(s): {', '.join(duplicates)}")

        for tag, href in parser.blank_targets:
            errors.append(
                f"{page.name}: {tag} target=_blank missing rel=noopener"
                + (f" ({href})" if href else "")
            )

        if INACTIVE_CONTACT.lower() in text.lower():
            errors.append(f"{page.name}: inactive contact {INACTIVE_CONTACT} has reappeared.")

        for attr, value in parser.links:
            target = resolve_local(page, value)
            if target is None:
                continue
            if not target.exists():
                errors.append(f"{page.name}: broken local {attr} -> {value}")

        # Catch accidental unresolved template markers that should never ship.
        unresolved = re.findall(r"\{\{[^{}]+\}\}|<%=?[^%]+%>", text)
        if unresolved:
            warnings.append(f"{page.name}: possible unresolved template marker(s).")

    # Core assets / generated CSS expected by the public system.
    for required in (
        ROOT / "assets" / "css" / "enkiama.css",
        ROOT / "assets" / "logo-header.png",
        ROOT / "assets" / "favicon.svg",
        ROOT / "index.html",
        ROOT / "404.html",
    ):
        if not required.exists():
            errors.append(f"Missing required site asset: {required.relative_to(ROOT)}")

    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"  - {warning}")

    if errors:
        print(f"Site integrity FAILED with {len(errors)} issue(s):", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"Site integrity OK — checked {len(pages)} public HTML pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
