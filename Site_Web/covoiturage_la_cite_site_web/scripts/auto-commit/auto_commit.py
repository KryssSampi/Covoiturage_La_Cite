#!/usr/bin/env python3
import subprocess, sys, os, re, argparse
from datetime import datetime
from collections import Counter
from pathlib import Path

SCRIPT_DIR   = Path(__file__).parent.resolve()
DEFAULT_REPO = str(SCRIPT_DIR.parent.parent)
LOG_FILE     = SCRIPT_DIR / "auto_commit.log"
ARCH_FILE    = SCRIPT_DIR / "architecture.md"
UPDATE_ARCH  = SCRIPT_DIR / "update_architecture.py"

_env = SCRIPT_DIR / ".env"
if _env.is_file():
    for _l in _env.read_text(encoding="utf-8").splitlines():
        _l = _l.strip()
        if _l and not _l.startswith("#") and "=" in _l:
            k, v = _l.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_AUTO_COMMIT_API_KEY") or os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL   = "claude-haiku-4-5-20251001"

FEATURE_LABELS = {
    "auth": "authentification", "dashboard": "tableau de bord",
    "search": "recherche", "planner": "planificateur",
    "reservations": "réservations", "finances": "finances",
    "favoris": "favoris", "goboard": "GoBoard",
    "notifications": "notifications", "reviews": "avis",
    "statistiques": "statistiques", "historique": "historique",
    "nouveautes": "nouveautés", "brouillons": "brouillons",
    "trajets": "trajets", "admin": "administration",
    "homepage": "page d'accueil",
}

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
    r = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True, cwd=repo)
    if r.stdout: print(r.stdout.strip())
    if r.returncode != 0 and r.stderr: print(r.stderr.strip(), file=sys.stderr)
    return r.returncode

def log(msg):
    ts   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass

def refresh_architecture():
    if UPDATE_ARCH.is_file():
        subprocess.run([sys.executable, str(UPDATE_ARCH)], capture_output=True)

def load_architecture():
    arch = {}
    if ARCH_FILE.is_file():
        for line in ARCH_FILE.read_text(encoding="utf-8").splitlines():
            if "|" in line and not line.startswith("#"):
                path, desc = line.split("|", 1)
                arch[path.strip()] = desc.strip()
    return arch

def parse_status(repo):
    out, _ = run_git(["status", "--short"], repo)
    entries = []
    for line in out.splitlines():
        line = line.strip()
        if not line:
            continue
        code = line[0] if line[0] != " " else line[1]
        path = line[2:].strip().split(" -> ")[-1]
        entries.append((code, path))
    return entries

def detect_new_features(entries, repo):
    new_feats = set()
    for code, path in entries:
        if code not in ("A", "?"):
            continue
        m = re.match(r"^features/([^/]+)/", path)
        if not m:
            continue
        feat = m.group(1)
        committed, _ = run_git(["ls-files", f"features/{feat}/"], repo)
        if not committed.strip():
            new_feats.add(feat)
    return new_feats

def detect_deleted_features(entries, repo):
    deleted = set()
    for code, path in entries:
        if code != "D":
            continue
        m = re.match(r"^features/([^/]+)/", path)
        if m:
            deleted.add(m.group(1))
    return deleted

def dominant_scope(entries):
    votes = Counter()
    for _, path in entries:
        m = re.match(r"^(?:features|app/\(protected\))/([^/]+)", path)
        if m:
            votes[m.group(1)] += 1
            continue
        m = re.match(r"^app/api/([^/]+)", path)
        if m:
            votes[f"api/{m.group(1)}"] += 1
            continue
        m = re.match(r"^(core|shared|tests?|scripts)", path)
        if m:
            votes[m.group(1)] += 1
    return votes.most_common(1)[0][0] if votes else "misc"

def dominant_type(entries, new_feats):
    if new_feats:
        return "feat"
    codes = Counter(c for c, _ in entries)
    total = len(entries)
    if codes.get("A", 0) + codes.get("?", 0) > total * 0.5:
        return "feat"
    if codes.get("D", 0) > total * 0.4:
        return "refactor"
    tests = sum(1 for _, p in entries if p.startswith("tests/") or ".test." in p or ".spec." in p)
    if tests > total * 0.5:
        return "test"
    styles = sum(1 for _, p in entries if p.endswith(".css"))
    if styles > total * 0.5:
        return "style"
    scripts = sum(1 for _, p in entries if p.startswith("scripts/"))
    if scripts > total * 0.5:
        return "chore"
    return "feat" if any(p.startswith("features/") or p.startswith("app/") for _, p in entries) else "chore"

def build_subject(entries, arch, new_feats, del_feats):
    scope  = dominant_scope(entries)
    type_  = dominant_type(entries, new_feats)
    label  = FEATURE_LABELS.get(scope, scope)
    n      = len(entries)

    if new_feats and del_feats:
        nf = ", ".join(FEATURE_LABELS.get(f, f) for f in sorted(new_feats))
        df = ", ".join(FEATURE_LABELS.get(f, f) for f in sorted(del_feats))
        return f"refactor({label}): ajout {nf} + suppression {df}"

    if new_feats:
        names = sorted(FEATURE_LABELS.get(f, f) for f in new_feats)
        if len(new_feats) == 1:
            feat  = next(iter(new_feats))
            files = [p for _, p in entries if p.startswith(f"features/{feat}/")]
            parts = []
            if any("components" in p for p in files): parts.append("composants")
            if any("hooks"      in p for p in files): parts.append("hooks")
            if any("types"      in p for p in files): parts.append("types")
            if any("context"    in p for p in files): parts.append("context")
            detail = ", ".join(parts) if parts else f"{len(files)} fichiers"
            return f"feat({names[0]}): nouvelle feature {names[0]} ({detail})"
        return f"feat({label}): nouvelles features — {', '.join(names)}"

    if n == 1:
        _, path = entries[0]
        desc = arch.get(path)
        if desc:
            short = desc.split(" — ")[0].lower()
            return f"{type_}({label}): mise à jour {short}"
        name = re.sub(r"([A-Z])", r" \1", Path(path).stem).strip().lower()
        return f"{type_}({label}): mise à jour de {name}"

    if n <= 4:
        descs = []
        for _, path in entries[:3]:
            desc = arch.get(path, "").split(" — ")[0].lower()
            if desc:
                descs.append(desc)
        if descs:
            return f"{type_}({label}): {', '.join(descs[:2])}" + (f" +{n-2}" if n > 2 else "")

    scopes_top = Counter()
    for _, path in entries:
        m = re.match(r"^(?:features|app/\(protected\))/([^/]+)", path)
        if m:
            scopes_top[FEATURE_LABELS.get(m.group(1), m.group(1))] += 1
    top2 = [s for s, _ in scopes_top.most_common(2)]
    if top2:
        return f"{type_}({label}): mise à jour {' et '.join(top2)} ({n} fichiers)"

    return f"{type_}({label}): {n} fichiers mis à jour"


def build_body(entries, arch, new_feats, del_feats):
    lines = []
    n     = len(entries)
    codes = Counter(c for c, _ in entries)

    # ── Résumé chiffré ────────────────────────────────────────────────────────
    parts = [f"Fichiers : {n}"]
    if codes.get("A", 0) + codes.get("?", 0): parts.append(f"+{codes.get('A',0)+codes.get('?',0)} ajoutés")
    if codes.get("M", 0):                      parts.append(f"~{codes['M']} modifiés")
    if codes.get("D", 0):                      parts.append(f"-{codes['D']} supprimés")
    if codes.get("R", 0):                      parts.append(f"↺{codes['R']} renommés")
    lines.append("  ".join(parts))
    lines.append("")

    # ── Zones touchées ────────────────────────────────────────────────────────
    zone_counts: Counter = Counter()
    zone_sublabels: dict = {}
    for _, path in entries:
        m = re.match(r"^(?:features|app/\(protected\))/([^/]+)", path)
        if m:
            feat = m.group(1)
            key  = FEATURE_LABELS.get(feat, feat)
            zone_counts[key] += 1
            # collect sub-areas (components / hooks / api…)
            sub = re.match(r"^(?:features|app/\(protected\))/[^/]+/([^/]+)", path)
            if sub:
                zone_sublabels.setdefault(key, set()).add(sub.group(1))
            continue
        m = re.match(r"^app/api/([^/]+)", path)
        if m:
            key = f"api/{m.group(1)}"
            zone_counts[key] += 1
            continue
        m = re.match(r"^(core|shared|tests?|scripts)", path)
        if m:
            zone_counts[m.group(1)] += 1

    if zone_counts:
        lines.append("Zones touchées :")
        max_w = max(len(z) for z in zone_counts)
        for zone, cnt in zone_counts.most_common(10):
            subs = zone_sublabels.get(zone)
            sub_str = f"  ({', '.join(sorted(subs)[:3])})" if subs else ""
            lines.append(f"  • {zone:<{max_w}}  — {cnt} fichier{'s' if cnt > 1 else ''}{sub_str}")
        if len(zone_counts) > 10:
            lines.append(f"  + {len(zone_counts)-10} autres zones")
        lines.append("")

    # ── Nouvelles features ────────────────────────────────────────────────────
    if new_feats:
        lines.append("Nouvelles features :")
        for feat in sorted(new_feats):
            feat_files = [p for _, p in entries if p.startswith(f"features/{feat}/")]
            parts_f = []
            if any("components" in p for p in feat_files): parts_f.append("composants")
            if any("hooks"      in p for p in feat_files): parts_f.append("hooks")
            if any("types"      in p for p in feat_files): parts_f.append("types")
            if any("context"    in p for p in feat_files): parts_f.append("context")
            detail = ", ".join(parts_f) if parts_f else f"{len(feat_files)} fichiers"
            lines.append(f"  ✦ {FEATURE_LABELS.get(feat, feat)}  ({detail})")
        lines.append("")

    # ── Nouveaux fichiers clés ────────────────────────────────────────────────
    new_files = [(c, p) for c, p in entries if c in ("A", "?")]
    if new_files:
        lines.append("Nouveaux fichiers :")
        shown = 0
        for _, path in new_files[:12]:
            desc = arch.get(path, "")
            short_desc = f"  — {desc}" if desc else ""
            lines.append(f"  + {path}{short_desc}")
            shown += 1
        if len(new_files) > shown:
            lines.append(f"  … et {len(new_files)-shown} autres")
        lines.append("")

    # ── Fichiers modifiés clés ────────────────────────────────────────────────
    modified = [(c, p) for c, p in entries if c == "M"]
    key_modified = [(c, p) for c, p in modified if arch.get(p)]
    if key_modified:
        lines.append("Fichiers modifiés :")
        for _, path in key_modified[:8]:
            desc = arch.get(path, "").split(" — ")[0]
            lines.append(f"  ~ {path}  ({desc})")
        if len(modified) > len(key_modified[:8]):
            rest = len(modified) - len(key_modified[:8])
            lines.append(f"  … et {rest} autre{'s' if rest > 1 else ''}")
        lines.append("")

    # ── Features supprimées ───────────────────────────────────────────────────
    if del_feats:
        df_labels = ", ".join(FEATURE_LABELS.get(f, f) for f in sorted(del_feats))
        lines.append(f"Features supprimées : {df_labels}")
        lines.append("")

    lines.append("Auto-généré par auto_commit.py [smart]")
    return "\n".join(lines)


def build_message(entries, arch, new_feats, del_feats, repo):
    subject = build_subject(entries, arch, new_feats, del_feats)
    if len(entries) <= 1:
        return subject
    body = build_body(entries, arch, new_feats, del_feats)
    return f"{subject}\n\n{body}"

def ask_claude(entries, arch):
    if not ANTHROPIC_API_KEY:
        return None
    summaries = []
    for code, path in entries[:12]:
        desc = arch.get(path, Path(path).stem)
        summaries.append(f"  {code} {path} — {desc}")
    content = "\n".join(summaries)
    prompt  = (
        "Génère un message de commit Git conventionnel en français (type(scope): description, max 72 chars). "
        "Réponds UNIQUEMENT avec le message.\n\nFichiers modifiés :\n" + content
    )
    try:
        import urllib.request, urllib.error, json
        payload = json.dumps({
            "model": ANTHROPIC_MODEL, "max_tokens": 100,
            "messages": [{"role": "user", "content": prompt}]
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages", data=payload,
            headers={"Content-Type": "application/json",
                     "x-api-key": ANTHROPIC_API_KEY,
                     "anthropic-version": "2023-06-01"}
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read())["content"][0]["text"].strip().strip('"').strip("'")
        except urllib.error.HTTPError as e:
            print(f"[Claude API] HTTP {e.code}")
            return None
    except Exception as e:
        print(f"[Claude API] {e}")
        return None

def main():
    p = argparse.ArgumentParser(description="Auto-commit intelligent.")
    p.add_argument("--repo",    default=DEFAULT_REPO)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--model",   choices=["smart", "claude"], default="smart")
    args = p.parse_args()

    repo = os.path.abspath(args.repo)
    log(f"Dépôt : {repo}  |  Mode : {args.model}")

    if not os.path.isdir(repo) or not is_git_repo(repo):
        log("ERREUR : dépôt introuvable ou invalide.")
        sys.exit(1)

    if not has_changes(repo):
        log("Rien à committer.")
        sys.exit(0)

    refresh_architecture()
    arch = load_architecture()

    stage_all(repo)
    entries   = parse_status(repo)
    new_feats = detect_new_features(entries, repo)
    del_feats = detect_deleted_features(entries, repo)

    if args.model == "claude":
        message = ask_claude(entries, arch)
        if not message:
            log("API indisponible — fallback smart.")
            message = None

    if args.model == "smart" or not message:
        message = build_message(entries, arch, new_feats, del_feats, repo)

    if not message:
        message = f"chore: auto-commit du {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    log(f"Message : {message}")

    if args.dry_run:
        print("(dry-run — aucun commit effectué)")
        sys.exit(0)

    code = do_commit(repo, message)
    log("Commit réussi." if code == 0 else "ERREUR lors du commit.")
    if code != 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
