#!/usr/bin/env python3
import os, re, sys
from pathlib import Path
from datetime import datetime

SCRIPT_DIR = Path(__file__).parent.resolve()
ROOT       = (SCRIPT_DIR / ".." / "..").resolve()
OUTPUT     = SCRIPT_DIR / "architecture.md"

EXCLUDED = {
    "node_modules", ".next", ".git", "dist", "build", "out",
    ".turbo", ".cache", "coverage", ".yarn", "__pycache__",
    "auto-commit",
}
EXCLUDED_EXT = {".ico", ".woff", ".woff2", ".ttf", ".eot", ".png",
                ".jpg", ".jpeg", ".svg", ".avif", ".webp", ".gif",
                ".lock", ".tsbuildinfo"}

FEATURE_LABELS = {
    "auth": "authentification", "dashboard": "tableau de bord",
    "search": "recherche", "planner": "planificateur",
    "reservations": "réservations", "finances": "finances",
    "favoris": "favoris", "goboard": "GoBoard",
    "notifications": "notifications", "reviews": "avis",
    "statistiques": "statistiques", "historique": "historique",
    "nouveautes": "nouveautés", "brouillons": "brouillons",
    "trajets": "trajets", "admin": "administration",
    "homepage": "page d'accueil", "planner": "planificateur",
}

FILE_ROLE = {
    "page":    "Page Next.js",
    "layout":  "Layout Next.js",
    "loading": "Skeleton de chargement",
    "error":   "Page d'erreur",
    "route":   "Route API",
}

def clean(name):
    name = re.sub(r"([A-Z])", r" \1", name).strip()
    name = re.sub(r"[\.\-_]", " ", name).strip()
    return name.lower()

def feat_label(f):
    return FEATURE_LABELS.get(f, f)

def describe(rel):
    p = rel.replace("\\", "/")
    stem = Path(p).stem
    role = FILE_ROLE.get(stem)

    m = re.match(r"^features/([^/]+)/components/(.+?)(?:Page)?\.tsx?$", p)
    if m: return f"Composant {clean(m.group(2))} — feature {feat_label(m.group(1))}"

    m = re.match(r"^features/([^/]+)/hooks/(use[^/]+?)\.tsx?$", p)
    if m: return f"Hook {m.group(2)} — feature {feat_label(m.group(1))}"

    m = re.match(r"^features/([^/]+)/types/([^/]+?)\.types\.tsx?$", p)
    if m: return f"Types {clean(m.group(2))} — feature {feat_label(m.group(1))}"

    m = re.match(r"^features/([^/]+)/context/([^/]+?)\.tsx?$", p)
    if m: return f"Context {clean(m.group(2))} — feature {feat_label(m.group(1))}"

    m = re.match(r"^features/([^/]+)/converters?/([^/]+?)\.tsx?$", p)
    if m: return f"Converter {clean(m.group(2))} — feature {feat_label(m.group(1))}"

    m = re.match(r"^features/([^/]+)/index\.tsx?$", p)
    if m: return f"Barrel export — feature {feat_label(m.group(1))}"

    m = re.match(r"^features/([^/]+)/([^/]+?)\.tsx?$", p)
    if m: return f"Module {clean(m.group(2))} — feature {feat_label(m.group(1))}"

    m = re.match(r"^app/api/(.+?)/route\.ts$", p)
    if m: return f"Route API — {m.group(1)}"

    m = re.match(r"^app/\(protected\)/([^/]+)/\[id\]/page\.tsx$", p)
    if m: return f"Page protégée {m.group(1)} (rôle dynamique)"

    m = re.match(r"^app/\(protected\)/([^/]+)/([^/]+)/\[id\]/page\.tsx$", p)
    if m: return f"Sous-page {m.group(2)} — section {m.group(1)}"

    if role:
        parent = Path(p).parent.name
        return f"{role} — {parent}"

    m = re.match(r"^core/models/(.+?)Model\.tsx?$", p)
    if m: return f"Modèle de données — {m.group(1)}"

    m = re.match(r"^core/state/(.+?)\.tsx?$", p)
    if m: return f"Store global — {clean(m.group(1))}"

    m = re.match(r"^core/context/(.+?)\.context\.tsx?$", p)
    if m: return f"Context React — {clean(m.group(1))}"

    m = re.match(r"^core/utils/(.+?)\.utils\.tsx?$", p)
    if m: return f"Utilitaires — {clean(m.group(1))}"

    m = re.match(r"^core/(.+?)\.tsx?$", p)
    if m: return f"Module core — {clean(m.group(1))}"

    m = re.match(r"^shared/components/(.+?)\.tsx?$", p)
    if m: return f"Composant partagé — {clean(m.group(1))}"

    m = re.match(r"^shared/hooks/(use.+?)\.tsx?$", p)
    if m: return f"Hook partagé — {m.group(1)}"

    m = re.match(r"^shared/types/(.+?)\.types\.tsx?$", p)
    if m: return f"Types partagés — {clean(m.group(1))}"

    m = re.match(r"^tests?/db/(.+?)\.json$", p)
    if m: return f"Base de données test — {m.group(1)}"

    m = re.match(r"^tests?/fixtures/([^/]+)/(.+?)\.fixtures\.tsx?$", p)
    if m: return f"Fixtures — {clean(m.group(2))} ({m.group(1)})"

    m = re.match(r"^tests?/(.+?)\.tsx?$", p)
    if m: return f"Test — {clean(m.group(1))}"

    m = re.match(r"^scripts/(.+?)\.(?:js|ts|py)$", p)
    if m: return f"Script — {clean(m.group(1))}"

    return f"Fichier — {clean(stem)}"

def collect(root, excluded, excluded_ext):
    entries = []
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in excluded and not d.startswith(".")]
        for fname in files:
            if Path(fname).suffix in excluded_ext:
                continue
            full = Path(dirpath) / fname
            rel  = full.relative_to(root).as_posix()
            entries.append(rel)
    return sorted(entries)

def main():
    files = collect(ROOT, EXCLUDED, EXCLUDED_EXT)
    ts    = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [f"# architecture.md — généré le {ts}\n"]
    for rel in files:
        desc = describe(rel)
        lines.append(f"{rel}|{desc}")
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"[update_architecture] {len(files)} fichiers indexés → {OUTPUT}")

if __name__ == "__main__":
    main()
