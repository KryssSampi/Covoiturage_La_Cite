"""
Talki — Parser
Transforme le texte brut (déjà en français) → QuestionObject structuré.
Appelle CamemBERT local :8001 — zéro API externe, zéro coût.

RÉVISION v1.1 :
- domain_relevance conditionnel : INCOMPREHENSIBLE ≠ hors-scope automatique
- Détection de contexte domaine covoiturage par mots de surface
- Fallback enrichi : analyse lexicale si CamemBERT inaccessible
"""

from __future__ import annotations
import unicodedata
import httpx
from models import QuestionObject, Intent, Entity

CAMEMBERT_URL = "http://localhost:8001"
TIMEOUT       = 5.0

# ─────────────────────────────────────────────
#  MOTS DE CONTEXTE DOMAINE COVOITURAGE
#  Permettent de distinguer INCOMPREHENSIBLE-mais-pertinent
#  de INCOMPREHENSIBLE-hors-sujet.
#  Si au moins 1 de ces mots est présent → domain_relevance = 0.65
#  (suffisant pour passer le seuil 0.40 du pipeline)
# ─────────────────────────────────────────────

DOMAIN_CONTEXT_WORDS: frozenset[str] = frozenset({
    # Application / technique
    "application", "app", "plateforme", "site", "fonctionne", "marche",
    "bug", "erreur", "probleme", "technique", "charge", "affiche",
    "lent", "plante", "bloque",

    # Accessibilité / inclusion
    "accessible", "accessibilite", "handicap", "mobilite", "fauteuil",
    "ecran", "clavier", "wcag", "lecteur", "inclusion",

    # Covoiturage
    "covoiturage", "trajet", "trajets", "conducteur", "passager",
    "reservation", "reserver", "place", "places", "annuler", "annulation",
    "campus", "cite", "lacitec",

    # Compte / profil
    "compte", "profil", "connexion", "inscription", "email", "mot",
    "passe", "password", "login",

    # Paiement
    "paiement", "payer", "remboursement", "solde", "virement", "argent",
    "transaction", "finances",

    # Sécurité / signalement
    "signaler", "signalement", "securite", "incident", "danger",
    "urgence", "sos", "comportement",

    # Notifications / préférences
    "notification", "alerte", "preference",

    # Données / confidentialité
    "donnees", "confidentialite", "pipeda", "gps", "position",
    "geolocalisation",

    # Aide / interaction générale (l'utilisateur s'adresse au chatbot)
    "aide", "aider", "besoin", "question", "savoir", "information",
    "comment", "pourquoi", "expliquer", "comprendre",

    # Nom du bot (l'utilisateur parle directement à Talki)
    "talki",

    # Feedback / meta-conversation (insatisfaction = engagement)
    "reponse", "reformuler", "voulais", "voulu", "entendre",
    "comprends", "correct", "bonne",
})


def _normalize(text: str) -> str:
    """Supprime accents et met en minuscule — matching robuste."""
    return "".join(
        c for c in unicodedata.normalize("NFD", text.lower())
        if unicodedata.category(c) != "Mn"
    )


def _compute_domain_relevance(text_fr: str, intent: Intent) -> float:
    """
    Calcule domain_relevance de façon nuancée.

    Règle :
    - HORS_SCOPE ou SALUTATION → 0.0 (toujours rejeté)
    - Intent précis identifié (non INCOMPREHENSIBLE) → 0.90
    - INCOMPREHENSIBLE MAIS mots de contexte détectés → 0.65
      (passe le seuil 0.40 → le Matching Engine essaie quand même)
    - INCOMPREHENSIBLE sans contexte → 0.0
    """
    if intent in {Intent.HORS_SCOPE, Intent.SALUTATION}:
        return 0.0

    if intent != Intent.INCOMPREHENSIBLE:
        return 0.90

    # intent == INCOMPREHENSIBLE : vérifier si le sujet touche quand même
    # au domaine covoiturage via des mots de surface
    text_norm = _normalize(text_fr)

    # Tokenisation robuste : séparer les contractions françaises
    # "m'aider" → {"m", "aider"}, "l'application" → {"l", "application"}
    import re as _re
    tokens = set(_re.split(r"[\s''`]+", text_norm)) - {""}

    # Correspondance exacte sur un mot du dictionnaire
    direct_hit = bool(tokens & DOMAIN_CONTEXT_WORDS)

    # Correspondance partielle : sous-chaîne (ex: "accessible" dans "accessibilité")
    if not direct_hit:
        for domain_word in DOMAIN_CONTEXT_WORDS:
            if len(domain_word) >= 5 and domain_word in text_norm:
                direct_hit = True
                break

    return 0.65 if direct_hit else 0.0


# ─────────────────────────────────────────────
#  ANALYSE LEXICALE DE FALLBACK
#  Active quand CamemBERT est inaccessible.
#  Reprend les mêmes règles que camembert_service
#  pour ne pas bloquer le pipeline.
# ─────────────────────────────────────────────

_FALLBACK_INTENT_RULES: list[tuple[str, set[str]]] = [
    ("securite",        {"urgence", "sos", "danger", "peur", "securite", "911", "incident", "signaler", "signalement", "comportement", "harcelement"}),
    ("paiement",        {"paiement", "payer", "remboursement", "solde", "transaction", "virement", "finances", "argent", "contester", "erreur paiement"}),
    ("annulation",      {"annuler", "annulation", "desister", "retirer", "plus y aller", "cancel"}),
    ("reservation",     {"reserver", "reservation", "place", "booker", "demande reservation", "confirme", "statut reservation"}),
    ("compte",          {"compte", "connexion", "login", "profil", "inscription", "mot de passe", "email", "supprimer compte", "donnees", "confidentialite", "accessible", "accessibilite", "handicap", "application", "fonctionne", "bug", "erreur", "notification", "support", "technique"}),
    ("conducteur",      {"conducteur", "chauffeur", "conduire", "offrir", "proposer trajet", "publier trajet", "nouveau trajet", "brouillon", "demandes passager"}),
    ("passager",        {"passager", "chercher trajet", "trouver trajet", "covoiturage disponible", "rechercher"}),
    ("trajet",          {"trajet", "covoiturage", "creer trajet", "itineraire", "carte", "trajets", "depart", "destination", "planifier"}),
    ("salutation",      {"bonjour", "salut", "hello", "allo", "hey", "bonsoir", "merci", "au revoir", "bye"}),
    ("hors_scope",      {"meteo", "recette", "sport", "film", "musique", "blague", "horoscope", "politique"}),
]

_FALLBACK_ENTITY_RULES: list[tuple[str, set[str]]] = [
    ("paiement",    {"paiement", "payer", "remboursement", "solde", "virement", "transaction", "finances", "argent"}),
    ("reservation", {"reservation", "reserver", "place", "booker", "statut"}),
    ("compte",      {"compte", "profil", "connexion", "email", "inscription", "mot de passe", "donnees", "confidentialite"}),
    ("trajet",      {"trajet", "covoiturage", "itineraire", "depart", "destination", "carte", "planifier"}),
    ("vehicule",    {"vehicule", "voiture", "auto", "plaque", "assurance", "permis"}),
]


def _fallback_classify(text_fr: str) -> tuple[Intent, Entity, float]:
    """
    Classification par règles lexicales — actif si :8001 inaccessible.
    Retourne (intent, entity, intent_score).
    """
    text_norm = _normalize(text_fr)
    words_set = set(text_norm.split())

    best_intent_val = "incomprehensible"
    best_intent_score = 0.0

    for intent_val, keywords in _FALLBACK_INTENT_RULES:
        # Score = nombre de mots-clés présents (exact ou sous-chaîne pour les longs)
        hits = 0
        for kw in keywords:
            kw_norm = _normalize(kw)
            if kw_norm in words_set:
                hits += 1
            elif len(kw_norm) >= 6 and kw_norm in text_norm:
                hits += 0.5
        score = hits / max(len(keywords), 1)
        if score > best_intent_score:
            best_intent_score = score
            best_intent_val = intent_val

    best_entity_val = "aucun"
    best_entity_score = 0.0
    for entity_val, keywords in _FALLBACK_ENTITY_RULES:
        hits = sum(1 for kw in keywords if _normalize(kw) in text_norm)
        score = hits / max(len(keywords), 1)
        if score > best_entity_score:
            best_entity_score = score
            best_entity_val = entity_val

    try:
        intent = Intent(best_intent_val)
    except ValueError:
        intent = Intent.INCOMPREHENSIBLE

    try:
        entity = Entity(best_entity_val)
    except ValueError:
        entity = Entity.AUCUN

    return intent, entity, best_intent_score


# ─────────────────────────────────────────────
#  PARSER PRINCIPAL
# ─────────────────────────────────────────────

def parse_question(text_fr: str) -> QuestionObject:
    """
    Le texte est déjà traduit en français par le service NLLB avant cet appel.
    CamemBERT classifie l'intention et l'entité.
    En cas d'échec → fallback lexical enrichi (jamais de QuestionObject vide).
    """
    try:
        r = httpx.post(f"{CAMEMBERT_URL}/classify", json={"text": text_fr}, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()

        try:
            intent = Intent(data.get("intent", "incomprehensible"))
            entity = Entity(data.get("entity", "aucun"))
        except ValueError:
            intent, entity = Intent.INCOMPREHENSIBLE, Entity.AUCUN

        intent_score = float(data.get("intent_score", 0.5))

        # ── Calcul domain_relevance nuancé (FIX v1.1)
        domain_rel = _compute_domain_relevance(text_fr, intent)

        return QuestionObject(
            raw_text          = text_fr,
            intent            = intent,
            entity            = entity,
            urgency_score     = 0.95 if intent == Intent.SECURITE else 0.2,
            ambiguity_score   = max(0.0, 1.0 - intent_score),
            domain_relevance  = domain_rel,
            keywords          = _keywords(text_fr),
            is_small_talk     = bool(data.get("is_small_talk", False)),
            is_out_of_scope   = bool(data.get("is_out_of_scope", False)),
            context_variables = {},
        )

    except Exception as e:
        print(f"[Parser] CamemBERT inaccessible — fallback lexical enrichi ({e})")
        return _enriched_fallback(text_fr)


def get_embedding(text_fr: str) -> list[float]:
    """Vecteur sémantique 768 dims depuis CamemBERT."""
    try:
        r = httpx.post(f"{CAMEMBERT_URL}/embed", json={"text": text_fr}, timeout=TIMEOUT)
        r.raise_for_status()
        return r.json().get("vector", [])
    except Exception:
        return []


def is_domain_relevant(qobj: QuestionObject, threshold: float = 0.40) -> bool:
    if qobj.is_out_of_scope or qobj.is_small_talk:
        return False
    return qobj.domain_relevance >= threshold


def _keywords(text: str) -> list[str]:
    stop = {
        "le","la","les","de","du","des","un","une","je","tu","il","elle",
        "nous","vous","ils","et","en","à","au","par","sur","pour","pas",
        "ne","mon","ma","mes","que","qui","quoi","comment","pourquoi",
        "est","ce","ça","cela","donc","mais","si","avec","sans","dans",
        "leur","leurs","quel","quelle","quels","quelles","lors","dont"
    }
    return [
        w for w in _normalize(text).split()
        if len(w) > 3 and w not in stop
    ][:12]


def _enriched_fallback(raw_text: str) -> QuestionObject:
    """
    Fallback enrichi — utilisé quand :8001 est inaccessible.
    Tente une classification lexicale avant de déclarer INCOMPREHENSIBLE.
    Ne retourne JAMAIS domain_relevance=0.0 si des mots de domaine sont présents.
    """
    intent, entity, intent_score = _fallback_classify(raw_text)
    domain_rel = _compute_domain_relevance(raw_text, intent)

    return QuestionObject(
        raw_text          = raw_text,
        intent            = intent,
        entity            = entity,
        urgency_score     = 0.95 if intent == Intent.SECURITE else 0.2,
        ambiguity_score   = max(0.0, 1.0 - intent_score),
        domain_relevance  = domain_rel,
        keywords          = _keywords(raw_text),
        is_small_talk     = intent == Intent.SALUTATION,
        is_out_of_scope   = intent == Intent.HORS_SCOPE,
        context_variables = {},
    )
