#!/usr/bin/env bash
# ============================================================
#  open_mobile.sh — Point d'entrée tier mobile
#
#  Logique :
#    - Si tier actif = mobile → ouvre VS directement, rien d'autre
#    - Sinon → lance switch.sh puis ouvre VS
#
#  Usage : ./open_mobile.sh [chemin/vers/projet.xcworkspace ou .sln]
#  Placer dans le même dossier que switch.sh et .tier-config
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/.tier-config"
SWITCH_SCRIPT="$SCRIPT_DIR/switch.sh"

RED='\033[0;31m'
GRN='\033[0;32m'
CYN='\033[0;36m'
YLW='\033[1;33m'
BLD='\033[1m'
RST='\033[0m'

# ── Chemin projet mobile (optionnel en arg, sinon lu depuis config) ──
PROJET_MOBILE="${1:-}"

pause_exit() {
  echo ""
  echo -e "${BLD}Appuyer sur une touche pour fermer...${RST}"
  read -n1 -s
  exit "${1:-0}"
}

# ── Vérifications ────────────────────────────────────────────
if [ ! -f "$CONFIG" ]; then
  echo -e "${RED}[ERREUR] .tier-config introuvable : $CONFIG${RST}"
  pause_exit 1
fi

source "$CONFIG"

echo ""
echo -e "${BLD}╔══════════════════════════════════════╗${RST}"
echo -e "${BLD}║       OUVERTURE TIER MOBILE          ║${RST}"
echo -e "${BLD}╚══════════════════════════════════════╝${RST}"
echo ""

# ── Vérification tier courant ────────────────────────────────
if [ "$TIER_ACTIF" = "mobile" ]; then
  echo -e "  ${GRN}Tier mobile déjà actif (${BLD}$BRANCHE_MOBILE${RST}${GRN}) — aucun switch nécessaire.${RST}"
  echo ""
else
  echo -e "  Tier actif : ${CYN}${BLD}$TIER_ACTIF${RST} → switch vers ${YLW}${BLD}mobile${RST} en cours..."
  echo ""

  if [ ! -f "$SWITCH_SCRIPT" ]; then
    echo -e "${RED}[ERREUR] switch.sh introuvable : $SWITCH_SCRIPT${RST}"
    pause_exit 1
  fi

  # Lance switch.sh dans le même terminal (interactif)
  bash "$SWITCH_SCRIPT"
  SWITCH_CODE=$?

  if [ $SWITCH_CODE -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERREUR] Le switch a échoué (code $SWITCH_CODE). Ouverture annulée.${RST}"
    pause_exit 1
  fi

  # Recharger la config après switch
  source "$CONFIG"
fi

# ── Ouverture Visual Studio ──────────────────────────────────
echo ""
echo -e "${BLD}Ouverture du projet mobile...${RST}"

# Priorité : argument > PROJET_MOBILE_PATH dans config > détection auto
if [ -z "$PROJET_MOBILE" ] && [ -n "${PROJET_MOBILE_PATH:-}" ]; then
  PROJET_MOBILE="$PROJET_MOBILE_PATH"
fi

if [ -z "$PROJET_MOBILE" ]; then
  # Détection automatique : cherche .xcworkspace, .xcodeproj, .sln dans le dossier courant
  PROJET_MOBILE=$(find "$SCRIPT_DIR" -maxdepth 3 \( -name "*.xcworkspace" -o -name "*.xcodeproj" -o -name "*.slnx" \) 2>/dev/null | head -1)
fi

if [ -z "$PROJET_MOBILE" ]; then
  echo -e "${YLW}[AVERTISSEMENT] Aucun projet mobile trouvé automatiquement.${RST}"
  echo -e "${YLW}Ajouter PROJET_MOBILE_PATH=... dans .tier-config ou passer le chemin en argument.${RST}"
  echo -e "${YLW}Switch effectué. Ouvrir le projet manuellement.${RST}"
  pause_exit 0
fi

# Détection OS pour la commande d'ouverture
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS — Xcode (.xcworkspace / .xcodeproj) ou Visual Studio for Mac (.sln)
  open "$PROJET_MOBILE"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  # Windows — Visual Studio
  if command -v devenv &>/dev/null; then
    devenv "$PROJET_MOBILE" &
  else
    start "" "$PROJET_MOBILE"
  fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux — Rider ou autre via xdg-open
  xdg-open "$PROJET_MOBILE" &>/dev/null &
fi

echo -e "${GRN}Projet ouvert : $PROJET_MOBILE${RST}"
echo -e "${GRN}Branche active : ${BLD}$BRANCHE_MOBILE${RST}"
echo ""
exit 0
