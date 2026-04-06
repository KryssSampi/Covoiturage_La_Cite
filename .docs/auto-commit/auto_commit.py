#!/usr/bin/env python3
"""
auto_commit.py — Orchestrateur tri-tiers v2
Génère trois index d'architecture (Web / Core / Mobile),
lit le git status, puis forge un message de commit structuré par tiers.

Format cible :
  feat(trajet-en-cours): mise à jour trajet-en-cours et administration (66 fichiers)
  Fichiers : 66 +5 ajoutés ~61 modifiés
  Zones touchées :
  • trajet-en-cours — 20 fichiers (components, converters, hooks)
  • tests — 16 fichiers
  ...
  Nouveaux fichiers :
  * app/api/admin/simulate/autoplay/route.ts — Route API — admin/simulate/autoplay
  ...

Modes :
  --model smart    → algorithme interne (zéro dépendance)
  --model claude   → appel API Anthropic (haiku), fallback smart
  --model ollama   → LLM local via Ollama, fallback smart
  --dry-run        → affiche le message sans committer
"""
import subprocess, sys, os, re, argparse
from datetime import datetime
from collections import Counter, defaultdict
from pathlib import Path

# ── Chemins ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()

# Chemins absolus des 3 dossiers auto-commit (à adapter si nécessaire)
WEB_COMMIT_DIR    = Path(r"D:\Covoiturage_La_Cite\Site_Web\covoiturage_la_cite_site_web\scripts\auto-commit")
MOBILE_COMMIT_DIR = Path(r"D:\Covoiturage_La_Cite\App_Mobile\Covoiturage_la_cite_(App_Mobile)\Covoiturage_la_cite_(App_Mobile)\.docs\auto-commit")
CORE_COMMIT_DIR   = Path(r"D:\Covoiturage_La_Cite\Server_Core\Covoiturage_La_Cite(Server_Core)\Covoiturage_La_Cite(Server_Core)\.docs\auto-commit")

DEFAULT_REPO = str(SCRIPT_DIR.parent.parent)
LOG_FILE     = SCRIPT_DIR / "auto_commit.log"

ARCH_WEB     = WEB_COMMIT_DIR    / "architecture_web.md"
ARCH_CORE    = CORE_COMMIT_DIR   / "architecture_core.md"
ARCH_MOBILE  = MOBILE_COMMIT_DIR / "architecture_mobile.md"

UPDATE_WEB    = WEB_COMMIT_DIR    / "update_architecture_web.py"
UPDATE_CORE   = CORE_COMMIT_DIR   / "update_architecture_core.py"
UPDATE_MOBILE = MOBILE_COMMIT_DIR / "update_architecture_mobile.py"

# ── Clé API ───────────────────────────────────────────────────────────────────
_env = SCRIPT_DIR / ".env"
if _env.is_file():
    for _l in _env.read_text(encoding="utf-8").splitlines():
        _l = _l.strip()
        if _l and not _l.startswith("#") and "=" in _l:
            k, v = _l.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

ANTHROPIC_API_KEY = (
    os.environ.get("ANTHROPIC_AUTO_COMMIT_API_KEY") or
    os.environ.get("ANTHROPIC_API_KEY", "")
)
ANTHROPIC_MODEL = "claude-haiku-4-5-20251001"
OLLAMA_MODEL    = os.environ.get("OLLAMA_MODEL", "mistral")
OLLAMA_URL      = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")

# ── Préfixes pour détecter le tiers depuis le chemin git ─────────────────────
# Quand le dépôt est un monorepo, chaque tiers a son propre préfixe.
# Si chaque tiers est son propre dépôt Git, les fichiers n'auront PAS de préfixe
# → dans ce cas, tout tombe dans "other" et classify_by_tier le gère.
TIER_WEB_PREFIXES    = ("Site_Web/", "covoiturage_la_cite_site_web/")
TIER_CORE_PREFIXES   = ("Server_Core/", "Covoiturage_La_Cite(Server_Core)/")
TIER_MOBILE_PREFIXES = ("App_Mobile/", "Covoiturage_la_cite_(App_Mobile)/")

# ── Labels features Web ───────────────────────────────────────────────────────
WEB_FEATURE_LABELS = {
    "auth": "authentification", "dashboard": "tableau de bord",
    "search": "recherche", "planner": "planificateur",
    "reservations": "réservations", "finances": "finances",
    "favoris": "favoris", "goboard": "GoBoard",
    "notifications": "notifications", "reviews": "avis",
    "statistiques": "statistiques", "historique": "historique",
    "nouveautes": "nouveautés", "brouillons": "brouillons",
    "trajets": "trajets", "admin": "administration",
    "homepage": "page d'accueil", "profile": "profil",
    "trajet-en-cours": "trajet en cours", "map-service": "service carte",
    "reservation": "réservation",
}

# ── Labels features Mobile ────────────────────────────────────────────────────
MOBILE_FEATURE_LABELS = {
    "customshell": "shell custom", "homepage": "accueil",
    "planner": "planificateur", "search": "recherche",
    "statistiques": "statistiques", "reservations": "réservations",
    "favorites": "favoris", "notifications": "notifications",
    "profil": "profil", "brouillons": "brouillons",
    "trajet": "trajet", "map": "carte",
}

# ── Labels couches Core ASP.NET ───────────────────────────────────────────────
CORE_LAYER_LABELS = {
    "Api": "API", "Application": "Application",
    "Domain": "Domaine", "Infrastructure": "Infrastructure",
    "Contracts": "Contrats", "Shared": "Partagé",
    "Data": "Données", "Services": "Services",
}


# ═════════════════════════════════════════════════════════════════════════════
# GIT UTILS
# ═════════════════════════════════════════════════════════════════════════════

def run_git(args, cwd):
    r = subprocess.run(["git"] + args, capture_output=True, text=True, cwd=cwd)
    return r.stdout.strip(), r.returncode

def is_git_repo(p):
    _, c = run_git(["rev-parse", "--is-inside-work-tree"], p)
    return c == 0

def has_changes(repo):
    out, _ = run_git(["status", "--porcelain"], repo)
    return bool(out.strip())

def stage_all(repo):
    run_git(["add", "-A"], repo)

def do_commit(repo, msg):
    r = subprocess.run(["git", "commit", "-m", msg],
                       capture_output=True, text=True, cwd=repo)
    if r.stdout: print(r.stdout.strip())
    if r.returncode != 0 and r.stderr: print(r.stderr.strip(), file=sys.stderr)
    return r.returncode

def get_diff_summary(repo, max_lines=120):
    out, _ = run_git(["diff", "--cached", "--stat"], repo)
    return "\n".join(out.splitlines()[:max_lines])

def file_already_tracked(repo, path):
    out, _ = run_git(["ls-files", path], repo)
    return bool(out.strip())


# ═════════════════════════════════════════════════════════════════════════════
# LOGGING
# ═════════════════════════════════════════════════════════════════════════════

def log(msg):
    ts   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass


# ═════════════════════════════════════════════════════════════════════════════
# ARCHITECTURE INDEX
# ═════════════════════════════════════════════════════════════════════════════

def refresh_all_architectures():
    for script in (UPDATE_WEB, UPDATE_CORE, UPDATE_MOBILE):
        if script.is_file():
            result = subprocess.run(
                [sys.executable, str(script)],
                capture_output=True, text=True
            )
            if result.stdout.strip():
                print(result.stdout.strip())
            if result.returncode != 0 and result.stderr.strip():
                print(f"[warn] {script.name}: {result.stderr.strip()}")
        else:
            print(f"[warn] Script introuvable : {script}")

def load_arch(path: Path) -> dict:
    arch = {}
    if not path.is_file():
        return arch
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        if "|" in line and not line.startswith("#"):
            p, d = line.split("|", 1)
            arch[p.strip()] = d.strip()
    return arch


# ═════════════════════════════════════════════════════════════════════════════
# GIT STATUS PARSING
# ═════════════════════════════════════════════════════════════════════════════

def parse_status(repo):
    out, _ = run_git(["status", "--short"], repo)
    entries = []
    for line in out.splitlines():
        if not line.strip():
            continue
        code = line[0] if line[0] != " " else line[1]
        path = line[2:].strip().split(" -> ")[-1].strip('"')
        entries.append((code, path))
    return entries

def classify_by_tier(entries):
    """
    Retourne (web, core, mobile, other).
    Fonctionne en monorepo (préfixes) ou en dépôt unique (tout = other).
    Dans le cas d'un dépôt unique par tiers, on peut forcer le tiers via
    la variable d'environnement TIER_FORCE (web|core|mobile).
    """
    forced = os.environ.get("TIER_FORCE", "").lower()
    if forced in ("web", "core", "mobile"):
        bucket = {"web": [], "core": [], "mobile": []}
        bucket[forced] = list(entries)
        return bucket["web"], bucket["core"], bucket["mobile"], []

    web, core, mobile, other = [], [], [], []
    for code, path in entries:
        p = path.replace("\\", "/")
        if any(p.startswith(pr) for pr in TIER_CORE_PREFIXES):
            core.append((code, path))
        elif any(p.startswith(pr) for pr in TIER_MOBILE_PREFIXES):
            mobile.append((code, path))
        elif any(p.startswith(pr) for pr in TIER_WEB_PREFIXES):
            web.append((code, path))
        else:
            other.append((code, path))

    # Si tout tombe dans "other" → le dépôt est mono-tiers, on auto-détecte.
    if other and not web and not core and not mobile:
        web, core, mobile, other = _auto_detect_tier(other)

    return web, core, mobile, other

def _auto_detect_tier(entries):
    """Détecte le tiers par les fichiers présents quand il n'y a pas de préfixe."""
    # Heuristiques : extensions et chemins caracteristiques
    cs_files   = sum(1 for _, p in entries if p.endswith(".cs"))
    xaml_files = sum(1 for _, p in entries if p.endswith(".xaml"))
    tsx_files  = sum(1 for _, p in entries if p.endswith((".tsx", ".ts", ".jsx")))
    csproj     = sum(1 for _, p in entries if p.endswith(".csproj"))

    has_features_xaml = any("Features/" in p and p.endswith(".xaml") for _, p in entries)
    has_maui          = any("MauiProgram" in p or "AppShell" in p for _, p in entries)
    has_nextjs        = any("next.config" in p or "app/" in p for _, p in entries)
    has_api_ctrl      = any("/Controllers/" in p for _, p in entries)

    if has_maui or has_features_xaml or (xaml_files > cs_files * 0.3):
        return [], [], entries, []
    if has_api_ctrl or (cs_files > 0 and not xaml_files and not tsx_files):
        return [], entries, [], []
    if has_nextjs or tsx_files > 0:
        return entries, [], [], []

    return [], [], [], entries


# ═════════════════════════════════════════════════════════════════════════════
# ANALYSE PAR TIERS — WEB
# ═════════════════════════════════════════════════════════════════════════════

def _web_zone(path: str) -> str | None:
    """Retourne la zone/feature Web d'un fichier, ou None."""
    p = path.replace("\\", "/")
    m = re.match(r"^features/([^/]+)", p)
    if m: return WEB_FEATURE_LABELS.get(m.group(1), m.group(1))
    m = re.match(r"^app/\(protected\)/([^/]+)", p)
    if m: return WEB_FEATURE_LABELS.get(m.group(1), m.group(1))
    m = re.match(r"^app/api/([^/]+)", p)
    if m: return f"api/{m.group(1)}"
    m = re.match(r"^(core|shared|tests?|scripts|domain|app)", p)
    if m: return m.group(1)
    return None

def _web_subzone(path: str) -> str | None:
    """Retourne le sous-dossier (components, hooks, types…) d'un fichier Web."""
    p = path.replace("\\", "/")
    m = re.search(r"/(?:features|app|core|shared)/[^/]+/([^/]+)/", p)
    if m:
        return m.group(1)
    parts = p.split("/")
    if len(parts) >= 3:
        return parts[2]
    return None

def web_zones_summary(entries) -> dict:
    """Retourne {zone: {"count": n, "subzones": set()}}."""
    zones = defaultdict(lambda: {"count": 0, "subzones": set()})
    for _, path in entries:
        z = _web_zone(path)
        if z:
            zones[z]["count"] += 1
            sz = _web_subzone(path)
            if sz:
                zones[z]["subzones"].add(sz)
    return dict(zones)

def web_dominant_scope(entries) -> str:
    votes = Counter()
    for _, p in entries:
        z = _web_zone(p)
        if z: votes[z] += 1
    return votes.most_common(1)[0][0] if votes else "misc"

def web_new_features(entries, repo) -> set:
    new = set()
    for code, path in entries:
        if code not in ("A", "?"):
            continue
        m = re.match(r"^features/([^/]+)/", path)
        if not m:
            continue
        feat = m.group(1)
        if not file_already_tracked(repo, f"features/{feat}/"):
            new.add(WEB_FEATURE_LABELS.get(feat, feat))
    return new


# ═════════════════════════════════════════════════════════════════════════════
# ANALYSE PAR TIERS — CORE (ASP.NET)
# ═════════════════════════════════════════════════════════════════════════════

def _core_zone(path: str) -> str | None:
    p = path.replace("\\", "/")
    # Clean Architecture layers
    for layer in ("Api", "Application", "Domain", "Infrastructure", "Contracts", "Shared"):
        if f"/{layer}/" in p or p.startswith(f"{layer}/"):
            return CORE_LAYER_LABELS.get(layer, layer.lower())
    # Fallback : premier dossier
    parts = p.split("/")
    if parts:
        return CORE_LAYER_LABELS.get(parts[0], parts[0].lower())
    return None

def _core_subzone(path: str) -> str | None:
    p = path.replace("\\", "/")
    # Controllers, Services, Repositories, DTOs, Models, Configurations...
    m = re.search(r"/(Controllers|Services|Repositories|DTOs|Models|Configurations|"
                  r"Middlewares|Validators|Mappings|Filters|Entities|ValueObjects|"
                  r"Enums|Events|Exceptions|Identity|Persistence|UseCases)/", p)
    if m:
        return m.group(1).lower()
    return None

def core_zones_summary(entries) -> dict:
    zones = defaultdict(lambda: {"count": 0, "subzones": set()})
    for _, path in entries:
        z = _core_zone(path)
        if z:
            zones[z]["count"] += 1
            sz = _core_subzone(path)
            if sz:
                zones[z]["subzones"].add(sz)
    return dict(zones)

def core_dominant_scope(entries) -> str:
    votes = Counter()
    for _, p in entries:
        z = _core_zone(p)
        if z: votes[z] += 1
    return votes.most_common(1)[0][0] if votes else "misc"


# ═════════════════════════════════════════════════════════════════════════════
# ANALYSE PAR TIERS — MOBILE (.NET MAUI)
# ═════════════════════════════════════════════════════════════════════════════

def _mobile_zone(path: str) -> str | None:
    p = path.replace("\\", "/")
    # Features
    m = re.match(r"^(?:.+/)?Features/([^/]+)", p, re.IGNORECASE)
    if m: return MOBILE_FEATURE_LABELS.get(m.group(1), m.group(1).lower())
    # Shared cards
    m = re.match(r"^(?:.+/)?Shared/Cards", p, re.IGNORECASE)
    if m: return "shared/cards"
    # Autres couches
    for layer in ("App", "Core", "Data", "Services", "Shared",
                  "Platforms", "Resources", "Test"):
        if re.match(rf"^(?:.+/)?{layer}/", p, re.IGNORECASE):
            return layer.lower()
    return None

def _mobile_subzone(path: str) -> str | None:
    p = path.replace("\\", "/")
    for sub in ("DisplayControler", "DisplayConverter", "DisplayConverters",
                "DisplayModels", "Views", "Services", "Fixtures",
                "Models", "Viewmodels", "Behaviors", "Converters",
                "Controls", "Helpers", "Cards"):
        if f"/{sub}/" in p or f"/{sub.lower()}/" in p:
            return sub.lower()
    return None

def mobile_zones_summary(entries) -> dict:
    zones = defaultdict(lambda: {"count": 0, "subzones": set()})
    for _, path in entries:
        z = _mobile_zone(path)
        if z:
            zones[z]["count"] += 1
            sz = _mobile_subzone(path)
            if sz:
                zones[z]["subzones"].add(sz)
    return dict(zones)

def mobile_dominant_scope(entries) -> str:
    votes = Counter()
    for _, p in entries:
        z = _mobile_zone(p)
        if z: votes[z] += 1
    return votes.most_common(1)[0][0] if votes else "misc"


# ═════════════════════════════════════════════════════════════════════════════
# CONSTRUCTION DU MESSAGE DE COMMIT
# ═════════════════════════════════════════════════════════════════════════════

def _dominant_type(entries, has_new=False) -> str:
    if has_new:
        return "feat"
    codes = Counter(c for c, _ in entries)
    total = len(entries) or 1
    if codes.get("A", 0) + codes.get("?", 0) > total * 0.5:
        return "feat"
    if codes.get("D", 0) > total * 0.4:
        return "refactor"
    if sum(1 for _, p in entries
           if ".test." in p or ".spec." in p or "Tests/" in p or "/Test/" in p) > total * 0.5:
        return "test"
    return "feat"


def _zones_lines(zones: dict, max_zones: int = 8) -> list[str]:
    """
    Génère les lignes 'Zones touchées :' du format désiré.
    • trajet-en-cours — 20 fichiers (components, converters, hooks)
    """
    sorted_zones = sorted(zones.items(), key=lambda x: -x[1]["count"])
    total_zones  = len(sorted_zones)
    lines = []
    for i, (zone, info) in enumerate(sorted_zones[:max_zones]):
        n  = info["count"]
        sz = sorted(info["subzones"])
        sz_str = f" ({', '.join(sz[:4])})" if sz else ""
        plural = "s" if n > 1 else ""
        lines.append(f"• {zone} — {n} fichier{plural}{sz_str}")
    if total_zones > max_zones:
        lines.append(f"* {total_zones - max_zones} autres zones")
    return lines


def _new_files_lines(entries: list, arch: dict, max_files: int = 8) -> list[str]:
    """
    Génère les lignes 'Nouveaux fichiers :'.
    * app/api/admin/simulate/autoplay/route.ts — Route API — admin/simulate/autoplay
    """
    new = [(c, p) for c, p in entries if c in ("A", "?")]
    if not new:
        return []
    lines = ["Nouveaux fichiers :"]
    for _, path in new[:max_files]:
        desc = arch.get(path, "")
        suffix = f" — {desc}" if desc else ""
        lines.append(f"* {path}{suffix}")
    if len(new) > max_files:
        lines.append(f"* … et {len(new) - max_files} autres")
    return lines


def _tier_section(tier_name: str, entries: list, zones: dict,
                  arch: dict, show_new: bool = True) -> list[str]:
    """
    Construit la section d'un tiers dans le corps du commit.
    Retourne une liste de lignes.
    """
    n = len(entries)
    codes = Counter(c for c, _ in entries)
    added    = codes.get("A", 0) + codes.get("?", 0)
    modified = codes.get("M", 0)
    deleted  = codes.get("D", 0)

    plural = "s" if n > 1 else ""
    parts = [f"+{added} ajoutés"] if added else []
    if modified: parts.append(f"~{modified} modifiés")
    if deleted:  parts.append(f"-{deleted} supprimés")
    counts_str = "  ".join(parts)

    lines = [
        f"── {tier_name} ──",
        f"Fichiers : {n} {counts_str}",
    ]

    # Zones
    if zones:
        lines.append("Zones touchées :")
        lines.extend(_zones_lines(zones))

    # Nouveaux fichiers
    if show_new:
        nf = _new_files_lines(entries, arch)
        if nf:
            lines.extend(nf)

    return lines


def _subject_line(tiers_touched: list, web, core, mobile, other,
                  arch_web, arch_core, arch_mobile, repo) -> str:
    """Forge la ligne de sujet (≤ 72 chars si possible)."""
    n_total = len(web) + len(core) + len(mobile) + len(other)

    if len(tiers_touched) == 0:
        return f"chore(root): {n_total} fichier(s) racine mis à jour"

    if len(tiers_touched) >= 2:
        scopes = []
        if web:    scopes.append(web_dominant_scope(web))
        if core:   scopes.append(core_dominant_scope(core))
        if mobile: scopes.append(mobile_dominant_scope(mobile))
        scope_str = "+".join(scopes[:2])
        return (f"feat({scope_str}): modifications multi-tiers"
                f" ({n_total} fichiers)")

    # Un seul tiers
    tier = tiers_touched[0]
    if tier == "web":
        new_feats = web_new_features(web, repo)
        type_     = _dominant_type(web, bool(new_feats))
        scope     = web_dominant_scope(web)

        # Top 2 zones pour le résumé
        zones = web_zones_summary(web)
        top2  = [z for z, _ in sorted(zones.items(),
                 key=lambda x: -x[1]["count"])[:2]]

        if new_feats:
            names = sorted(new_feats)
            return f"feat({scope}): nouvelle(s) feature {', '.join(names)} ({n_total} fichiers)"

        if len(top2) >= 2:
            summary = f"mise à jour {top2[0]} et {top2[1]}"
        elif top2:
            summary = f"mise à jour {top2[0]}"
        else:
            summary = "mise à jour"

        return f"{type_}({scope}): {summary} ({n_total} fichiers)"

    elif tier == "core":
        scope = core_dominant_scope(core)
        type_ = _dominant_type(core)
        zones = core_zones_summary(core)
        top2  = [z for z, _ in sorted(zones.items(),
                 key=lambda x: -x[1]["count"])[:2]]
        summary = f"mise à jour {' et '.join(top2)}" if top2 else "mise à jour"
        return f"{type_}(core/{scope}): {summary} ({n_total} fichiers)"

    else:  # mobile
        scope = mobile_dominant_scope(mobile)
        type_ = _dominant_type(mobile)
        zones = mobile_zones_summary(mobile)
        top2  = [z for z, _ in sorted(zones.items(),
                 key=lambda x: -x[1]["count"])[:2]]
        summary = f"mise à jour {' et '.join(top2)}" if top2 else "mise à jour"
        return f"{type_}(mobile/{scope}): {summary} ({n_total} fichiers)"


def build_smart_message(entries, web, core, mobile, other,
                        arch_web, arch_core, arch_mobile, repo) -> str:
    """Construit le message de commit complet dans le format désiré."""

    tiers_touched = []
    if web:    tiers_touched.append("web")
    if core:   tiers_touched.append("core")
    if mobile: tiers_touched.append("mobile")

    n_total = len(entries)

    # ── Ligne de sujet ────────────────────────────────────────────────────────
    subject = _subject_line(tiers_touched, web, core, mobile, other,
                            arch_web, arch_core, arch_mobile, repo)

    # Pas de corps pour les micro-commits
    if n_total <= 2 and len(tiers_touched) <= 1:
        return subject

    # ── Corps ─────────────────────────────────────────────────────────────────
    body_lines = []

    # Résumé global des fichiers
    codes    = Counter(c for c, _ in entries)
    added    = codes.get("A", 0) + codes.get("?", 0)
    modified = codes.get("M", 0)
    deleted  = codes.get("D", 0)
    parts = [f"+{added} ajoutés"] if added else []
    if modified: parts.append(f"~{modified} modifiés")
    if deleted:  parts.append(f"-{deleted} supprimés")
    body_lines.append(f"Fichiers : {n_total}  " + "  ".join(parts))

    # Indication des tiers si plusieurs
    if len(tiers_touched) > 1:
        body_lines.append("Tiers : " + " · ".join(t.upper() for t in tiers_touched))

    body_lines.append("")

    # ── Section WEB ───────────────────────────────────────────────────────────
    if web:
        web_zones = web_zones_summary(web)

        # Si un seul tiers : format compact (pas de séparateur de tiers)
        if len(tiers_touched) == 1:
            body_lines.append("Zones touchées :")
            body_lines.extend(_zones_lines(web_zones))
            body_lines.append("")
            nf = _new_files_lines(web, arch_web)
            if nf:
                body_lines.extend(nf)
                body_lines.append("")
        else:
            body_lines.extend(
                _tier_section("WEB (Next.js)", web, web_zones, arch_web))
            body_lines.append("")

    # ── Section CORE ──────────────────────────────────────────────────────────
    if core:
        core_zones = core_zones_summary(core)
        body_lines.extend(
            _tier_section("CORE (ASP.NET)", core, core_zones, arch_core,
                          show_new=(len(tiers_touched) > 1 or not web)))
        body_lines.append("")

    # ── Section MOBILE ────────────────────────────────────────────────────────
    if mobile:
        mob_zones = mobile_zones_summary(mobile)
        body_lines.extend(
            _tier_section("MOBILE (MAUI)", mobile, mob_zones, arch_mobile,
                          show_new=(len(tiers_touched) > 1 or not web)))
        body_lines.append("")

    # ── Fichiers racine ───────────────────────────────────────────────────────
    if other:
        if web or core or mobile:
            body_lines.append(f"[Racine]  {len(other)} fichier(s) — config / scripts")
        else:
            body_lines.append("Zones touchées :")
            zone_ctr: Counter = Counter()
            for _, p in other:
                parts_ = p.replace("\\", "/").split("/")
                zone_ctr[parts_[0] if parts_ else "racine"] += 1
            for z, c in zone_ctr.most_common(6):
                body_lines.append(f"• {z} — {c} fichier{'s' if c>1 else ''}")
            body_lines.append("")
            nf = _new_files_lines(other, {})
            if nf:
                body_lines.extend(nf)
                body_lines.append("")

    body_lines.append("Auto-généré par auto_commit.py")

    return subject + "\n\n" + "\n".join(body_lines).rstrip()


# ═════════════════════════════════════════════════════════════════════════════
# BACKENDS IA
# ═════════════════════════════════════════════════════════════════════════════

def _build_ia_prompt(entries, arch_web, arch_core, arch_mobile) -> str:
    arch_all = {**arch_web, **arch_core, **arch_mobile}
    summaries = []
    for code, path in entries[:25]:
        desc = arch_all.get(path, Path(path).stem)
        summaries.append(f"  {code} {path} — {desc}")

    return (
        "Tu es un expert Git. Génère un message de commit en français selon Conventional Commits.\n"
        "Format OBLIGATOIRE (copie ce format exactement) :\n\n"
        "  type(scope): résumé en 1 ligne (N fichiers)\n\n"
        "  Fichiers : N  +X ajoutés  ~Y modifiés\n"
        "  [Tiers : WEB · CORE · MOBILE  ← si plusieurs]\n\n"
        "  Zones touchées :\n"
        "  • zone-name — N fichiers (subzone1, subzone2)\n"
        "  ...\n\n"
        "  Nouveaux fichiers :\n"
        "  * chemin/fichier.ts — description courte\n"
        "  ...\n\n"
        "Réponds UNIQUEMENT avec le message de commit, sans backticks.\n\n"
        "Fichiers modifiés :\n" + "\n".join(summaries)
    )

def ask_claude(entries, arch_web, arch_core, arch_mobile, diff_stat) -> str | None:
    if not ANTHROPIC_API_KEY:
        return None
    prompt = _build_ia_prompt(entries, arch_web, arch_core, arch_mobile)
    if diff_stat:
        prompt += f"\n\nRésumé diff :\n{diff_stat[:400]}"
    try:
        import urllib.request, json
        payload = json.dumps({
            "model": ANTHROPIC_MODEL, "max_tokens": 600,
            "messages": [{"role": "user", "content": prompt}]
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages", data=payload,
            headers={"Content-Type": "application/json",
                     "x-api-key": ANTHROPIC_API_KEY,
                     "anthropic-version": "2023-06-01"}
        )
        with urllib.request.urlopen(req, timeout=25) as r:
            return json.loads(r.read())["content"][0]["text"].strip().strip('"\'')
    except Exception as e:
        print(f"[Claude API] {e}")
        return None

def ask_ollama(entries, arch_web, arch_core, arch_mobile, diff_stat) -> str | None:
    prompt = _build_ia_prompt(entries, arch_web, arch_core, arch_mobile)
    try:
        import urllib.request, json
        payload = json.dumps({
            "model": OLLAMA_MODEL, "prompt": prompt, "stream": False
        }).encode()
        req = urllib.request.Request(OLLAMA_URL, data=payload,
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read()).get("response", "").strip()
    except Exception as e:
        print(f"[Ollama] {e}")
        return None


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

def main():
    p = argparse.ArgumentParser(description="Auto-commit tri-tiers v2.")
    p.add_argument("--repo",    default=DEFAULT_REPO,
                   help="Racine du dépôt Git (défaut: deux niveaux au-dessus du script)")
    p.add_argument("--dry-run", action="store_true",
                   help="Affiche le message sans committer")
    p.add_argument("--model",   choices=["smart", "claude", "ollama"], default="smart",
                   help="Backend de génération du message (défaut: smart)")
    p.add_argument("--no-arch-refresh", action="store_true",
                   help="Sauter la régénération des index d'architecture")
    p.add_argument("--tier",    choices=["web", "core", "mobile"],
                   help="Forcer la classification dans un tiers unique")
    args = p.parse_args()

    # Forçage du tiers via CLI (alternative à la variable d'env)
    if args.tier:
        os.environ["TIER_FORCE"] = args.tier

    repo = os.path.abspath(args.repo)
    log(f"Dépôt : {repo}  |  Mode : {args.model}")

    if not os.path.isdir(repo) or not is_git_repo(repo):
        log("ERREUR : dépôt introuvable ou invalide.")
        sys.exit(1)

    if not has_changes(repo):
        log("Rien à committer.")
        sys.exit(0)

    # 1. Régénérer les index d'architecture
    if not args.no_arch_refresh:
        log("Régénération des index d'architecture (web / core / mobile)…")
        refresh_all_architectures()

    # 2. Charger les index
    arch_web    = load_arch(ARCH_WEB)
    arch_core   = load_arch(ARCH_CORE)
    arch_mobile = load_arch(ARCH_MOBILE)
    log(f"Index chargés — web:{len(arch_web)}  core:{len(arch_core)}  mobile:{len(arch_mobile)}")

    # 3. Stage + parser le status
    stage_all(repo)
    entries = parse_status(repo)
    if not entries:
        log("Rien à committer après staging.")
        sys.exit(0)

    diff_stat = get_diff_summary(repo)

    # 4. Classifier par tiers
    web, core, mobile, other = classify_by_tier(entries)
    log(f"Tiers : Web={len(web)}  Core={len(core)}  Mobile={len(mobile)}  Autre={len(other)}")

    # 5. Construire le message
    message = None

    if args.model == "claude":
        message = ask_claude(entries, arch_web, arch_core, arch_mobile, diff_stat)
        if not message:
            log("Backend claude indisponible — fallback smart.")

    elif args.model == "ollama":
        message = ask_ollama(entries, arch_web, arch_core, arch_mobile, diff_stat)
        if not message:
            log("Backend ollama indisponible — fallback smart.")

    if not message:
        message = build_smart_message(
            entries, web, core, mobile, other,
            arch_web, arch_core, arch_mobile, repo
        )

    if not message:
        message = f"chore: auto-commit du {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    # 6. Affichage
    print("\n" + "─" * 60)
    print(message)
    print("─" * 60 + "\n")
    log(f"Message généré ({len(message)} chars)")

    # 7. Commit (ou dry-run)
    if args.dry_run:
        print("(dry-run — aucun commit effectué)")
        sys.exit(0)

    code = do_commit(repo, message)
    if code == 0:
        log("✅ Commit réussi.")
    else:
        log("❌ ERREUR lors du commit.")
        sys.exit(1)


if __name__ == "__main__":
    main()