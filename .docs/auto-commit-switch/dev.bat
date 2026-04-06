#!/usr/bin/env bash
# ============================================================
#  dev.sh — Wrapper npm run dev avec switch automatique
#
#  Remplace "npm run dev" comme point d'entrée du projet web.
#  Logique :
#    - Si tier actif = web/core → lance npm run dev directement
#    - Sinon → switch vers web/core puis lance npm run dev
#
#  Usage : ./dev.sh [args supplémentaires pour npm run dev]
#
#  Intégration VS Code :
#    Dans .vscode/tasks.json, remplacer la commande npm run dev par :
#    "command": "${workspaceFolder}/dev.sh"
#
#  Placer dans le même dossier que switch.sh et .tier-config
# ============================================================

SCRIPT_DIR="$(cd "D:\Covoiturage_La_Cite\Site_Web\covoiturage_la_cite_site_web" && pwd)
CONFIG="$SCRIPT_DIR/.tier-config"
SWITCH_SCRIPT="$SCRIPT_DIR/switch.sh"

RED='\033[0;31m'
GRN='\033[0;32m'
CYN='\033[0;36m'
YLW='\033[1;33m'
BLD='\033[1m'
RST='\033[0m'

pause_and_exit_on_error() {
  echo ""
  echo -e "${BLD}Appuyer sur une touche pour fermer...${RST}"
  read -n1 -s
  exit 1
}

# ── Vérifications ────────────────────────────────────────────
if [ ! -f "$CONFIG" ]; then
  echo -e "${RED}[ERREUR] .tier-config introuvable : $CONFIG${RST}"
  pause_and_exit_on_error
fi

source "$CONFIG"

echo ""
echo -e "${BLD}╔══════════════════════════════════════╗${RST}"
echo -e "${BLD}║        DEV SERVER — web/core         ║${RST}"
echo -e "${BLD}╚══════════════════════════════════════╝${RST}"
echo ""

# ── Vérification tier courant ────────────────────────────────
if [ "$TIER_ACTIF" = "web/core" ]; then
  echo -e "  ${GRN}Tier web/core déjà actif (${BLD}$BRANCHE_WEBCORE${RST}${GRN}).${RST}"
  echo ""
else
  echo -e "  Tier actif : ${CYN}${BLD}$TIER_ACTIF${RST} → switch vers ${YLW}${BLD}web/core${RST} en cours..."
  echo ""

  if [ ! -f "$SWITCH_SCRIPT" ]; then
    echo -e "${RED}[ERREUR] switch.sh introuvable : $SWITCH_SCRIPT${RST}"
    pause_and_exit_on_error
  fi

  bash "$SWITCH_SCRIPT"
  SWITCH_CODE=$?

  if [ $SWITCH_CODE -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERREUR] Le switch a échoué (code $SWITCH_CODE). Démarrage du serveur annulé.${RST}"
    pause_and_exit_on_error
  fi

  # Recharger la config après switch
  source "$CONFIG"
fi

# ── Vérification package.json présent ───────────────────────
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
  echo -e "${RED}[ERREUR] package.json introuvable dans $SCRIPT_DIR${RST}"
  echo -e "${YLW}Ce script doit être à la racine du projet Next.js.${RST}"
  pause_and_exit_on_error
fi

# ── Vérification node_modules ───────────────────────────────
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo -e "${YLW}[AVERTISSEMENT] node_modules absent. Installation en cours...${RST}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}[ERREUR] npm install a échoué.${RST}"
    pause_and_exit_on_error
  fi
fi

# ── Lancement du serveur ─────────────────────────────────────
echo -e "${BLD}Démarrage de npm run dev...${RST}"
echo -e "  Branche active : ${BLD}$BRANCHE_WEBCORE${RST}"
echo ""
echo -e "  ${YLW}Ctrl+C pour arrêter le serveur${RST}"
echo ""

