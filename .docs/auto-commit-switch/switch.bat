#!/usr/bin/env bash
# ============================================================
#  switch.sh — Tier switch automatique (web/core ↔ mobile)
#  Usage : ./switch.sh
#  Config : .tier-config (même dossier que ce script)
# ============================================================

SCRIPT_DIR="$(cd "D:\Covoiturage_La_Cite\.docs\auto-commit-switch && pwd)"
CONFIG="$SCRIPT_DIR/.tier-config"
UPDATE_SCRIPT="$SCRIPT_DIR/update_config.sh"

# ── Couleurs ────────────────────────────────────────────────
RED='\033[0;31m'
YLW='\033[1;33m'
GRN='\033[0;32m'
BLU='\033[0;34m'
CYN='\033[0;36m'
RST='\033[0m'
BLD='\033[1m'

pause_exit() {
  echo ""
  echo -e "${BLD}Appuyer sur une touche pour fermer...${RST}"
  read -n1 -s
  exit "${1:-0}"
}

# ── Vérifications préalables ────────────────────────────────
if [ ! -f "$CONFIG" ]; then
  echo -e "${RED}[ERREUR] Fichier .tier-config introuvable : $CONFIG${RST}"
  pause_exit 1
fi

if [ ! -f "$UPDATE_SCRIPT" ]; then
  echo -e "${RED}[ERREUR] Script update_config.sh introuvable : $UPDATE_SCRIPT${RST}"
  pause_exit 1
fi

# ── Lecture config ──────────────────────────────────────────
source "$CONFIG"
# Attendu dans .tier-config :
#   TIER_ACTIF=web/core        (ou mobile)
#   TIER_CIBLE=mobile          (ou web/core)
#   BRANCHE_WEBCORE=web/feat-exemple
#   BRANCHE_MOBILE=mobile/feat-exemple

echo ""
echo -e "${BLD}╔══════════════════════════════════════╗${RST}"
echo -e "${BLD}║        SWITCH DE TIER — Cité         ║${RST}"
echo -e "${BLD}╚══════════════════════════════════════╝${RST}"
echo ""
echo -e "  Tier actif   : ${CYN}${BLD}$TIER_ACTIF${RST}"
echo -e "  Tier cible   : ${YLW}${BLD}$TIER_CIBLE${RST}"

# ── Branche active du tier cible ────────────────────────────
if [ "$TIER_CIBLE" = "web/core" ]; then
  BRANCHE_CIBLE="$BRANCHE_WEBCORE"
else
  BRANCHE_CIBLE="$BRANCHE_MOBILE"
fi

echo -e "  Branche cible: ${BLU}$BRANCHE_CIBLE${RST}"
echo ""

# ── Étape 1 : Commit de la branche courante ─────────────────
echo -e "${BLD}[1/3] Vérification des changements en cours...${RST}"

if git diff --quiet && git diff --cached --quiet; then
  echo -e "      ${GRN}Rien à commiter — skip${RST}"
else
  echo -e "      Changements détectés, commit en cours..."
  git add -A 2>&1
  COMMIT_OUT=$(git commit -m "wip(switch): snapshot avant switch vers $TIER_CIBLE" 2>&1)
  COMMIT_CODE=$?

  if [ $COMMIT_CODE -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERREUR] Le commit a échoué :${RST}"
    echo -e "${RED}$COMMIT_OUT${RST}"
    echo ""
    echo -e "${YLW}Résoudre les erreurs ci-dessus avant de relancer le switch.${RST}"
    pause_exit 1
  fi

  echo -e "      ${GRN}Commit effectué.${RST}"
fi

# ── Étape 2 : Checkout branche active du tier cible ─────────
echo ""
echo -e "${BLD}[2/3] Checkout vers : ${BLU}$BRANCHE_CIBLE${RST}"

CHECKOUT_OUT=$(git checkout "$BRANCHE_CIBLE" 2>&1)
CHECKOUT_CODE=$?

if [ $CHECKOUT_CODE -ne 0 ]; then
  echo -e "${RED}[ERREUR] Checkout impossible :${RST}"
  echo -e "${RED}$CHECKOUT_OUT${RST}"
  echo ""
  echo -e "${YLW}Vérifier que la branche ${BLD}$BRANCHE_CIBLE${RST}${YLW} existe bien.${RST}"
  pause_exit 1
fi

echo -e "      ${GRN}Sur la branche : $BRANCHE_CIBLE${RST}"

# ── Étape 3 : Changer la branche active du tier cible ? ─────
echo ""
echo -e "${BLD}[3/3] La branche active du tier cible doit-elle changer ?${RST}"
echo -e "      Branche active actuelle : ${BLU}${BLD}$BRANCHE_CIBLE${RST}"
echo ""
echo -n "  Changer ? (o/n) : "
read -r REPONSE

if [[ "$REPONSE" =~ ^[oO]$ ]]; then

  echo -n "  Nouveau nom de branche : "
  read -r NOUVEAU_NOM

  if [ -z "$NOUVEAU_NOM" ]; then
    echo -e "${YLW}Nom vide, aucun changement effectué.${RST}"
  else
    CHECKOUT_NEW_OUT=$(git checkout "$NOUVEAU_NOM" 2>&1)
    CHECKOUT_NEW_CODE=$?

    if [ $CHECKOUT_NEW_CODE -ne 0 ]; then
      echo ""
      echo -e "${RED}[ERREUR] Branche inexistante ou inaccessible :${RST}"
      echo -e "${RED}  → \"$NOUVEAU_NOM\"${RST}"
      echo -e "${RED}$CHECKOUT_NEW_OUT${RST}"
      echo ""
      echo -e "${YLW}Vérifier le nom et réessayer au prochain switch.${RST}"
      echo -e "${YLW}Rappel : pensez à merger votre progression actuelle dans${RST}"
      echo -e "${YLW}         ${BLD}Kryss_branch/root${RST}${YLW} avant de créer une nouvelle branche.${RST}"
      echo ""
      # Pas d'update_config → on reste sur BRANCHE_CIBLE déjà checkoutée
      # On inverse quand même les tiers puisque le checkout initial a réussi
      bash "$UPDATE_SCRIPT" "$TIER_ACTIF" "$TIER_CIBLE" "$BRANCHE_WEBCORE" "$BRANCHE_MOBILE"
      pause_exit 0
    fi

    echo -e "      ${GRN}Checkout réussi : $NOUVEAU_NOM${RST}"

    # Mise à jour de la branche active du tier cible avec le nouveau nom
    bash "$UPDATE_SCRIPT" "$TIER_ACTIF" "$TIER_CIBLE" "$BRANCHE_WEBCORE" "$BRANCHE_MOBILE" "$NOUVEAU_NOM"
    echo -e "      ${GRN}Config mise à jour.${RST}"
    pause_exit 0
  fi
fi

# Réponse "non" ou nom vide → update simple (inversion tiers seulement)
bash "$UPDATE_SCRIPT" "$TIER_ACTIF" "$TIER_CIBLE" "$BRANCHE_WEBCORE" "$BRANCHE_MOBILE"
echo ""
echo -e "${GRN}Switch terminé. Tier actif désormais : ${BLD}$TIER_CIBLE${RST}"
pause_exit 0
