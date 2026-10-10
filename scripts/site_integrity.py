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
}
REQUIRED_META_EXEMPT = {
    # Search-engine verification file, not a public page.
}
INACTIVE_CONTACT = "hola@enkiama.com"
ACTIVE_WHATSAPP = "wa.me/34659447627"

# These are intentionally self-contained story / client dossier surfaces with
# their own navigation grammar rather than the shared public-site shell.
SHARED_CHROME_EXEMPT = {
    "barua.html",
    "trip.html",
    "experience-view.html",
    "journey.html",
    "kilimanjaro-expedition.html",
    "kilimanjaro-route.html",
}

# Stable design-system landmarks. These are intentionally structural markers
# (style IDs / section classes), not editorial copy, so wording can evolve.
REQUIRED_DESIGN_MARKERS = {
    # Phase 1/2 — homepage media hierarchy.
    "index.html": ('id="phase1-media-karibu"', 'id="phase2-home-media-hierarchy"'),
    "parks.html": ('id="phase1-parks-editorial"',),
    "companions.html": ('id="companions-editorial-recomposition"',),

    # Phase 3 — Journeys editorial/media rollout.
    "journeys.html": ('id="phase3-journeys-media-standard"',),

    # Phase 4/5 — destination ecosystem.
    "tanzania.html": ('id="phase4-tanzania-atlas"',),
    "serengeti.html": ('id="phase4-serengeti-motion"',),
    "ngorongoro.html": ('id="phase4-ngorongoro-descent"',),
    "tarangire.html": ('id="phase4-tarangire-river"',),
    "arusha.html": ('id="phase5-arusha"',),
    "great-rift.html": ('id="phase5-rift"',),
    "kilimanjaro.html": ('id="phase5-kilimanjaro"',),
    "mahale.html": ('id="phase5-mahale"',),
    "manyara.html": ('id="phase5-manyara"',),
    "nyerere.html": ('id="phase5-nyerere"',),
    "ruaha.html": ('id="phase5-ruaha"',),
    "stonetown.html": ('id="phase5-stonetown"',),
    "zanzibar.html": ('id="phase5-zanzibar"',),

    # Phase 6 — people, trust and editorial continuity.
    "family.html": ('id="phase6-family"', 'class="family-continuity"'),
    "how.html": ('id="phase6-how"', 'class="how-continuity"'),
    "partners.html": ('id="phase6-partners"', 'class="partner-continuity"'),
    "society-and-culture.html": ('id="phase6-culture"', 'class="culture-continuity"'),
    "why.html": ('id="phase6-why"', 'class="w-continuity"'),

    # Phase 7 — client-facing dossier interfaces.
    "experience-view.html": ('id="phase7-experience-view"',),
    "journey.html": ('id="phase7-private-journey"', 'class="journey-state journey-state--loading"', 'class="journey-state journey-state--notfound"'),
    "kilimanjaro-route.html": ('id="phase7-route-dossier"',),
    "kilimanjaro-expedition.html": ('id="phase7-expedition-dossier"',),

    # Conversion and Phase 8 utility treatments.
    "begin.html": ('id="begin-conversion-v2"', 'class="lf-thanks lf-thanks--editorial"'),
    "compose.html": ('id="compose-conversion-v2"', 'id="compose-conversion-v3"'),
    "privacy.html": ('id="phase8-pv-document"',),
    "terms.html": ('id="phase8-tm-document"', 'id="phase8-terms-process"'),
    "barua.html": ('id="phase8-barua"',),
    "404.html": ('id="phase8-404"',),

    # Phase 15 — previously untouched public surfaces.
    "stories.html": ('id="phase15-stories-editorial"',),
    "reflections.html": ('id="phase15-reflections-editorial"',),
    "practical.html": ('id="phase15-practical-dossier"',),
    "faq.html": ('id="phase15-faq-index"',),
    "trip.html": ('id="phase15-trip-reader"',),
    "notes.html": ('id="phase15-field-notes"',),
}

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

        robots = parser.meta.get("robots", "").lower()
        is_noindex = "noindex" in robots
        if page.name != "404.html" and not is_noindex:
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

        legacy_ui_literals = (
            "ENKIAMA_TIER1_START",
            "t1-cursor",
            "new Lenis(",
            "PREMIUM DETAILS JS",
            "page-veil",
            "scroll-prog",
        )
        for literal in legacy_ui_literals:
            if literal in text:
                errors.append(
                    f"{page.name}: retired Tier-1 interaction layer has reappeared ({literal})."
                )

        if page.name not in SHARED_CHROME_EXEMPT:
            chrome_expectations = {
                "<!-- ENKIAMA_HEADER_START -->": 1,
                "<!-- ENKIAMA_HEADER_END -->": 1,
                'id="ehTrigger"': 1,
                'id="ehOverlay"': 1,
                "assets/logo-header.png": 1,
                "assets/logo-footer.png": 1,
            }
            for marker, expected_count in chrome_expectations.items():
                actual_count = text.count(marker)
                if actual_count != expected_count:
                    errors.append(
                        f"{page.name}: shared chrome marker {marker!r} expected "
                        f"{expected_count} time(s), found {actual_count}."
                    )

            footer_count = len(re.findall(r"<footer\b", text, flags=re.IGNORECASE))
            if footer_count != 1:
                errors.append(
                    f"{page.name}: shared public shell expects exactly one footer, "
                    f"found {footer_count}."
                )

            if ACTIVE_WHATSAPP.lower() not in text.lower():
                errors.append(
                    f"{page.name}: shared public shell is missing the active WhatsApp route."
                )

        for marker in REQUIRED_DESIGN_MARKERS.get(page.name, ()):
            if marker not in text:
                errors.append(
                    f"{page.name}: required design-system marker missing: {marker}"
                )

        # Guard known retired asset literals even when they live inside CSS/JS
        # strings rather than directly in src/href attributes.
        forbidden_literals = {
            "hero-dawn.jpg": "retired hero fallback; use assets/images/hero-dawn.webp",
            "assets/great-rift.jpg": "wrong Great Rift path; use assets/images/great-rift.jpg",
        }
        lowered_text = text.lower()
        for literal, guidance in forbidden_literals.items():
            if literal.lower() in lowered_text:
                errors.append(f"{page.name}: forbidden literal {literal} ({guidance}).")

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
