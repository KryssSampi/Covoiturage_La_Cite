#!/usr/bin/env bash
# ai-handoff.sh — Copie le prochain prompt IA dans le presse-papier
# Appelé automatiquement par le Stop hook Claude Code

PROMPT_FILE="$(dirname "$0")/../.IA_CHATs/NEXT_PROMPT.md"

if [ ! -f "$PROMPT_FILE" ]; then
  exit 0
fi

CONTENT=$(cat "$PROMPT_FILE")

# Copie dans le presse-papier selon l'OS
if command -v clip.exe &>/dev/null; then
  # Windows (WSL ou Git Bash)
  echo "$CONTENT" | clip.exe
elif command -v xclip &>/dev/null; then
  echo "$CONTENT" | xclip -selection clipboard
elif command -v pbcopy &>/dev/null; then
  echo "$CONTENT" | pbcopy
fi

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  ✅ Phase terminée — Prompt copié dans le presse-papier  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "Colle ce prompt dans le prochain modèle (Ctrl+V) :"
echo "─────────────────────────────────────────────────────"
echo "$CONTENT"
echo "─────────────────────────────────────────────────────"
