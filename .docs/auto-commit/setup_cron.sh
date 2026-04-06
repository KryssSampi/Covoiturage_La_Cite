#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup_cron.sh — Installe le commit automatique quotidien à 23h00
#
# Dépose ce fichier dans le même dossier qu'auto_commit.py.
# Il se configure AUTOMATIQUEMENT sur le dossier où il se trouve.
# ─────────────────────────────────────────────────────────────────────────────

# ── Auto-détection des chemins ────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$(realpath "$0")")" && pwd)"
SCRIPT_PY="$SCRIPT_DIR/auto_commit.py"
LOG_FILE="$SCRIPT_DIR/auto_commit.log"
PYTHON=$(which python3 2>/dev/null || which python 2>/dev/null)

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║         Setup — Auto-Commit Quotidien à 23h00        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Dépôt détecté  : $SCRIPT_DIR"
echo "  Script Python  : $SCRIPT_PY"
echo "  Python utilisé : $PYTHON"
echo "  Logs           : $LOG_FILE"
echo ""

# ── Vérifications ─────────────────────────────────────────────────────────────
if [ ! -f "$SCRIPT_PY" ]; then
    echo "❌ ERREUR : auto_commit.py introuvable dans $SCRIPT_DIR"
    echo "   Assure-toi que setup_cron.sh et auto_commit.py sont dans le même dossier."
    exit 1
fi

if [ -z "$PYTHON" ]; then
    echo "❌ ERREUR : Python introuvable. Installe Python 3.8+ et réessaie."
    exit 1
fi

if ! git -C "$SCRIPT_DIR" rev-parse --is-inside-work-tree &>/dev/null; then
    echo "❌ ERREUR : $SCRIPT_DIR n'est pas un dépôt Git."
    exit 1
fi

# ── Choix du backend IA ───────────────────────────────────────────────────────
echo "Quel backend IA veux-tu utiliser ?"
echo "  [1] Claude   (API Anthropic — recommandé, nécessite ANTHROPIC_API_KEY)"
echo "  [2] Ollama   (local, 100% gratuit — nécessite Ollama installé)"
echo ""
read -rp "Ton choix [1/2, défaut: 1] : " choice
echo ""

if [ "$choice" = "2" ]; then
    MODEL="ollama"
    echo "  ✓ Backend : Ollama (local)"
    if ! curl -s http://localhost:11434 &>/dev/null; then
        echo "  ⚠  Ollama ne semble pas tourner. Lance-le avec : ollama serve"
    fi
else
    MODEL="claude"
    echo "  ✓ Backend : Claude (Anthropic)"

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        read -rsp "  Entre ta clé Anthropic (sk-ant-...) : " key
        echo ""
        export ANTHROPIC_API_KEY="$key"
        # Persister dans les profils shell
        for rc in ~/.bashrc ~/.zshrc ~/.profile; do
            if [ -f "$rc" ]; then
                grep -q "ANTHROPIC_API_KEY" "$rc" || \
                    echo "export ANTHROPIC_API_KEY=\"$key\"" >> "$rc"
            fi
        done
        echo "  ✓ Clé sauvegardée dans les profils shell."
    else
        echo "  ✓ ANTHROPIC_API_KEY déjà définie dans l'environnement."
    fi
fi

echo ""

# ── Détection OS → stratégie de planification ─────────────────────────────────
detect_os() {
    case "$(uname -s)" in
        Linux*)
            if grep -qi microsoft /proc/version 2>/dev/null; then
                echo "wsl"
            else
                echo "linux"
            fi
            ;;
        Darwin*) echo "macos" ;;
        MINGW*|MSYS*|CYGWIN*) echo "windows_bash" ;;
        *) echo "unknown" ;;
    esac
}

OS=$(detect_os)
echo "  Système détecté : $OS"
echo ""

# ─── Installer selon l'OS ──────────────────────────────────────────────────────

install_crontab() {
    # Ligne cron 23h00 heure locale
    CRON_CMD="$PYTHON \"$SCRIPT_PY\" --model $MODEL >> \"$LOG_FILE\" 2>&1"
    CRON_LINE="0 23 * * * ANTHROPIC_API_KEY=\"$ANTHROPIC_API_KEY\" $CRON_CMD"

    # Ajouter sans doublon (supprime l'ancienne entrée auto_commit si présente)
    ( crontab -l 2>/dev/null | grep -v "auto_commit.py"; echo "$CRON_LINE" ) | crontab -

    echo "✅ Cron job installé ! Tourne chaque jour à 23h00."
    echo ""
    echo "  Vérifier  : crontab -l"
    echo "  Tester    : $PYTHON \"$SCRIPT_PY\" --dry-run"
    echo "  Logs      : tail -f \"$LOG_FILE\""
}

install_windows_task_scheduler() {
    # Convertir le chemin WSL/bash en chemin Windows
    WIN_PYTHON=$(which python3 | sed 's|/mnt/\([a-z]\)/|\1:/|' | sed 's|/|\\|g' 2>/dev/null || echo "python")
    WIN_SCRIPT=$(echo "$SCRIPT_PY" | sed 's|/mnt/\([a-z]\)/|\1:/|' | sed 's|/|\\|g')
    WIN_REPO=$(echo "$SCRIPT_DIR" | sed 's|/mnt/\([a-z]\)/|\1:/|' | sed 's|/|\\|g')
    WIN_LOG=$(echo "$LOG_FILE" | sed 's|/mnt/\([a-z]\)/|\1:/|' | sed 's|/|\\|g')

    PS_SCRIPT="$SCRIPT_DIR/register_task.ps1"
    cat > "$PS_SCRIPT" << PSEOF
# register_task.ps1 — Créé automatiquement par setup_cron.sh
# Lance dans PowerShell en tant qu'Administrateur

\$action = New-ScheduledTaskAction \`
    -Execute "python" \`
    -Argument '"${WIN_SCRIPT}" --model ${MODEL}' \`
    -WorkingDirectory "${WIN_REPO}"

\$trigger  = New-ScheduledTaskTrigger -Daily -At "23:00"
\$settings = New-ScheduledTaskSettingsSet \`
    -ExecutionTimeLimit (New-TimeSpan -Minutes 3) \`
    -StartWhenAvailable

# Variable d'environnement ANTHROPIC_API_KEY dans la tâche
\$envVar = New-Object System.Collections.Specialized.StringDictionary
\$principal = New-ScheduledTaskPrincipal -UserId "\$env:USERNAME" -RunLevel Highest

Register-ScheduledTask \`
    -TaskName "AutoCommit_$(basename "$SCRIPT_DIR")" \`
    -Action \$action \`
    -Trigger \$trigger \`
    -Settings \$settings \`
    -Principal \$principal \`
    -Force

Write-Host "✅ Tâche planifiée créée : AutoCommit_$(basename "$SCRIPT_DIR")"
Write-Host "   Pour tester : python '${WIN_SCRIPT}' --dry-run"
Write-Host "   Logs        : ${WIN_LOG}"
PSEOF

    echo "✅ Script PowerShell généré : $PS_SCRIPT"
    echo ""
    echo "  ▶  Lance cette commande dans PowerShell (Admin) pour planifier à 23h :"
    echo ""
    echo "     powershell -ExecutionPolicy Bypass -File \"$(echo "$PS_SCRIPT" | sed 's|/mnt/\([a-z]\)/|\1:/|' | sed 's|/|\\|g')\""
    echo ""
    echo "  Ou copie-colle directement le contenu de register_task.ps1 dans PowerShell."
    echo ""
    echo "  Pour tester maintenant (dry-run) :"
    echo "     python \"$SCRIPT_PY\" --model $MODEL --dry-run"
}

case "$OS" in
    linux|macos)
        install_crontab
        ;;
    wsl)
        echo "  WSL détecté — deux options disponibles :"
        echo "  [1] Cron WSL        (fonctionne uniquement si WSL tourne en arrière-plan)"
        echo "  [2] Task Scheduler  (recommandé — tourne même si WSL est fermé)"
        echo ""
        read -rp "  Ton choix [1/2, défaut: 2] : " wsl_choice
        echo ""
        if [ "$wsl_choice" = "1" ]; then
            install_crontab
        else
            install_windows_task_scheduler
        fi
        ;;
    windows_bash)
        install_windows_task_scheduler
        ;;
    *)
        echo "⚠  OS non reconnu. Génération du script PowerShell uniquement."
        install_windows_task_scheduler
        ;;
esac

echo ""
echo "─────────────────────────────────────────────────────"
echo "  Dépôt  : $SCRIPT_DIR"
echo "  Modèle : $MODEL"
echo "  Logs   : $LOG_FILE"
echo "─────────────────────────────────────────────────────"
echo ""
