#!/usr/bin/env python3
"""
update_architecture_core.py
Génère architecture_core.md — index commenté du tiers Core (ASP.NET Core)
Adapté à la Clean Architecture : Api / Application / Domain / Infrastructure / Contracts / Shared
"""
import os, re
from pathlib import Path
from datetime import datetime

SCRIPT_DIR = Path(__file__).parent.resolve()
ROOT       = (SCRIPT_DIR / ".." / "..").resolve()
OUTPUT     = SCRIPT_DIR / "architecture_core.md"

# ── Noms possibles du dossier racine du tiers Core ────────────────────────────
CORE_ROOTS = (SCRIPT_DIR / ".." / "..").resolve()

EXCLUDED = {
    "bin", "obj", ".git", ".vs", ".idea", "node_modules",
    "TestResults", ".sonarqube", "packages",
}
EXCLUDED_EXT = {
    ".dll", ".exe", ".pdb", ".nupkg", ".lock", ".suo",
    ".user", ".DotSettings", ".cache",
}

# ── Patterns de description par couche ───────────────────────────────────────
LAYER_LABELS = {
    "Api":            "Couche API (contrôleurs, middlewares, config DI)",
    "Application":    "Couche Application (use cases, DTOs, interfaces, validators)",
    "Domain":         "Couche Domaine (entités, value objects, événements)",
    "Infrastructure": "Couche Infrastructure (persistence, services externes, identité)",
    "Contracts":      "Couche Contrats (requêtes/réponses API publics)",
    "Shared":         "Couche Partagée (utils transverses, pattern Résultat)",
}

def clean(name: str) -> str:
    name = re.sub(r"([A-Z])", r" \1", name).strip()
    name = re.sub(r"[\.\-_]", " ", name).strip()
    return name.lower()

def describe(rel: str) -> str:
    """Produit une description humaine à partir du chemin relatif (depuis racine Core)."""
    p    = rel.replace("\\", "/")
    stem = Path(p).stem
    ext  = Path(p).suffix.lower()

    # ── Couche API ──────────────────────────────────────────────────────────
    m = re.match(r"^(?:src/)?\.Api/Controllers/(.+?)Controller\.cs$", p)
    if m: return f"Contrôleur HTTP — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Api/Middlewares/(.+?)\.cs$", p)
    if m: return f"Middleware — {clean(m.group(1))}"

    m = re.match(r"^(?:src/)?\.Api/Filters/(.+?)\.cs$", p)
    if m: return f"Filtre action — {clean(m.group(1))}"

    m = re.match(r"^(?:src/)?\.Api/Extensions/(.+?)\.cs$", p)
    if m: return f"Extension DI/config — {clean(m.group(1))}"

    if re.match(r"^(?:src/)?\.Api/Program\.cs$", p):
        return "Point d'entrée ASP.NET Core — configuration hôte et DI"

    # ── Couche Application ──────────────────────────────────────────────────
    m = re.match(r"^(?:src/)?\.Application/UseCases/([^/]+)/(.+?)\.cs$", p)
    if m:
        domain, name = m.group(1), m.group(2)
        if "Handler" in name:   return f"Use case handler — {domain}/{clean(name)}"
        if "Command" in name:   return f"Commande CQRS — {domain}/{clean(name)}"
        if "Query"   in name:   return f"Requête CQRS — {domain}/{clean(name)}"
        return f"Use case — {domain}/{clean(name)}"

    m = re.match(r"^(?:src/)?\.Application/Interfaces/Repositories/(.+?)\.cs$", p)
    if m: return f"Interface repository — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Application/Interfaces/Services/(.+?)\.cs$", p)
    if m: return f"Interface service applicatif — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Application/Interfaces/External/(.+?)\.cs$", p)
    if m: return f"Interface service externe — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Application/DTOs/(.+?)\.cs$", p)
    if m: return f"DTO applicatif — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Application/Mappings/(.+?)\.cs$", p)
    if m: return f"Profil AutoMapper — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Application/Validators/(.+?)\.cs$", p)
    if m: return f"Validateur FluentValidation — {m.group(1)}"

    # ── Couche Domaine ──────────────────────────────────────────────────────
    m = re.match(r"^(?:src/)?\.Domain/Entities/(.+?)\.cs$", p)
    if m: return f"Entité domaine — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Domain/ValueObjects/(.+?)\.cs$", p)
    if m: return f"Value Object — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Domain/Enums/(.+?)\.cs$", p)
    if m: return f"Enum domaine — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Domain/Events/(.+?)\.cs$", p)
    if m: return f"Événement domaine — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Domain/Exceptions/(.+?)\.cs$", p)
    if m: return f"Exception domaine — {m.group(1)}"

    # ── Couche Infrastructure ───────────────────────────────────────────────
    m = re.match(r"^(?:src/)?\.Infrastructure/Persistence/Postgre/DbContext/(.+?)\.cs$", p)
    if m: return f"DbContext Entity Framework — PostgreSQL ({m.group(1)})"

    m = re.match(r"^(?:src/)?\.Infrastructure/Persistence/Postgre/Configurations/(.+?)\.cs$", p)
    if m: return f"Configuration EF Core — entité {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Infrastructure/Persistence/Postgre/Repositories/(.+?)\.cs$", p)
    if m: return f"Repository PostgreSQL — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Infrastructure/Persistence/Mongo/Context/(.+?)\.cs$", p)
    if m: return f"Contexte MongoDB — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Infrastructure/Persistence/Mongo/Repositories/(.+?)\.cs$", p)
    if m: return f"Repository MongoDB — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Infrastructure/ExternalServices/Payment/(.+?)\.cs$", p)
    if m: return f"Service externe — paiement ({m.group(1)})"

    m = re.match(r"^(?:src/)?\.Infrastructure/ExternalServices/Maps/(.+?)\.cs$", p)
    if m: return f"Service externe — cartographie ({m.group(1)})"

    m = re.match(r"^(?:src/)?\.Infrastructure/ExternalServices/Notifications/(.+?)\.cs$", p)
    if m: return f"Service externe — notifications push ({m.group(1)})"

    m = re.match(r"^(?:src/)?\.Infrastructure/Identity/(.+?)\.cs$", p)
    if m: return f"Infrastructure identité — {m.group(1)}"

    if re.match(r"^(?:src/)?\.Infrastructure/DependencyInjection\.cs$", p):
        return "Enregistrement DI Infrastructure — extension IServiceCollection"

    # ── Contracts ───────────────────────────────────────────────────────────
    m = re.match(r"^(?:src/)?\.Contracts/Requests/(.+?)\.cs$", p)
    if m: return f"Requête API — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Contracts/Responses/(.+?)\.cs$", p)
    if m: return f"Réponse API — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Contracts/Events/(.+?)\.cs$", p)
    if m: return f"Événement contrat — {m.group(1)}"

    # ── Shared ──────────────────────────────────────────────────────────────
    m = re.match(r"^(?:src/)?\.Shared/ResultPattern/(.+?)\.cs$", p)
    if m: return f"Pattern Résultat — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Shared/Constants/(.+?)\.cs$", p)
    if m: return f"Constantes partagées — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Shared/Logging/(.+?)\.cs$", p)
    if m: return f"Logging/tracing — {m.group(1)}"

    m = re.match(r"^(?:src/)?\.Shared/Helpers/(.+?)\.cs$", p)
    if m: return f"Helper transverse — {m.group(1)}"

    # ── Tests ───────────────────────────────────────────────────────────────
    m = re.match(r"^tests/UnitTests/(.+?)\.cs$", p)
    if m: return f"Test unitaire — {m.group(1)}"

    m = re.match(r"^tests/IntegrationTests/(.+?)\.cs$", p)
    if m: return f"Test d'intégration — {m.group(1)}"

    # ── Docker ──────────────────────────────────────────────────────────────
    if re.match(r"^docker/docker-compose", p):   return "Docker Compose — orchestration services"
    if re.match(r"^docker/Dockerfiles/.+$", p):  return f"Dockerfile — {Path(p).name}"

    # ── Fichiers projet ─────────────────────────────────────────────────────
    if ext == ".csproj": return f"Projet C# — {stem}"
    if ext == ".sln":    return f"Solution Visual Studio — {stem}"
    if stem == "appsettings": return "Configuration ASP.NET Core — variables d'environnement"
    if ext == ".json" and "appsettings" in p.lower():
        return f"Configuration — {stem}"

    return f"Fichier C# — {clean(stem)}"


def find_core_root(root: Path) -> Path | None:
    for name in CORE_ROOTS:
        candidate = root / name
        if candidate.is_dir():
            return candidate
    return None


def collect(core_root: Path, excluded: set, excluded_ext: set):
    entries = []
    for dirpath, dirs, files in os.walk(core_root):
        dirs[:] = [d for d in dirs if d not in excluded and not d.startswith(".")]
        for fname in files:
            if Path(fname).suffix in excluded_ext: continue
            full = Path(dirpath) / fname
            try:
                rel = full.relative_to(core_root).as_posix()
            except ValueError:
                continue
            entries.append(rel)
    return sorted(entries)


def main():
    core_root = CORE_ROOTS if isinstance(CORE_ROOTS, Path) else find_core_root(ROOT)
    if core_root is None:
        # Aucun dossier Core trouvé : créer un index vide avec indication
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        OUTPUT.write_text(
            f"# architecture_core.md — Tiers Core (ASP.NET)\n"
            f"# Généré le {ts}\n"
            f"# AVERTISSEMENT : dossier Core introuvable (cherché : {', '.join(CORE_ROOTS)})\n"
            f"# Créez le dossier et relancez ce script.\n",
            encoding="utf-8"
        )
        print(f"[core] Dossier Core introuvable — index vide créé.")
        return

    files = collect(core_root, EXCLUDED, EXCLUDED_EXT)
    ts    = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        f"# architecture_core.md — Tiers Core (ASP.NET)",
        f"# Racine : {core_root}",
        f"# Généré le {ts} | {len(files)} fichiers indexés",
        f"# Format : chemin/relatif|description",
        "",
    ]
    for rel in files:
        desc = describe(rel)
        lines.append(f"{rel}|{desc}")

    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"[core] {len(files)} fichiers → {OUTPUT}")


if __name__ == "__main__":
    main()
