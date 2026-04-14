/usr/bin/env bash
# ============================================================
#  update_config.sh — Mise à jour de .tier-config
#
#  Args :
#    $1 = TIER_ACTIF courant (avant switch)
#    $2 = TIER_CIBLE courant (avant switch)
#    $3 = BRANCHE_WEBCORE courante
#    $4 = BRANCHE_MOBILE courante
#    $5 = NOUVEAU_NOM (optionnel) — nouvelle branche active du tier cible
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/.tier-config"

TIER_ACTIF="$1"
TIER_CIBLE="$2"
BRANCHE_WEBCORE="$3"
BRANCHE_MOBILE="$4"
NOUVEAU_NOM="${5:-}"

# Inversion des tiers
NOUVEAU_TIER_ACTIF="$TIER_CIBLE"
NOUVEAU_TIER_CIBLE="$TIER_ACTIF"

# Mise à jour de la branche active du tier cible si nouveau nom fourni
if [ -n "$NOUVEAU_NOM" ]; then
  if [ "$TIER_CIBLE" = "web/core" ]; then
    BRANCHE_WEBCORE="$NOUVEAU_NOM"
  else
    BRANCHE_MOBILE="$NOUVEAU_NOM"
  fi
fi

# Réécriture du fichier config
cat > "$CONFIG" <<EOF
TIER_ACTIF=$NOUVEAU_TIER_ACTIF
TIER_CIBLE=$NOUVEAU_TIER_CIBLE
BRANCHE_WEBCORE=$BRANCHE_WEBCORE
BRANCHE_MOBILE=$BRANCHE_MOBILE
EOF
