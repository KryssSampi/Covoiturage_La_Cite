"""
Talki — Renderer
Transforme un ResponseObject → texte naturel.
Zéro modèle de langage — injection de template direct.
Le ton et la personnalité de Talki sont définis ici.
"""

from __future__ import annotations
import random
from models import ResponseObject, QuestionObject, Intent

# ─────────────────────────────────────────────
#  IDENTITÉ DE TALKI
# ─────────────────────────────────────────────

IDENTITY_RESPONSES = {
    "greeting": [
        "Bonjour 🙂 Je suis Talki, votre assistant Cité-Covoiturage. Comment puis-je vous aider ?",
        "Salut 🙂 Je suis Talki ! Avez-vous une question sur vos trajets ou votre compte ?",
        "Bonjour ! Talki à votre service 🚗 Qu'est-ce que je peux faire pour vous ?",
    ],
    "farewell": [
        "Bonne route 🚗 N'hésitez pas à revenir si vous avez d'autres questions !",
        "Au revoir 🙂 Bonne journée !",
    ],
    "thanks": [
        "Avec plaisir 🙂 Je reste disponible si vous avez d'autres questions.",
        "Pas de souci ! C'est pour ça que je suis là 🚗",
    ],
    "out_of_scope": [
        "Désolé 😌 Ce n'est pas dans mes cordes. Je suis spécialisé dans l'application Cité-Covoiturage.",
        "Je ne peux pas vous aider avec ça 😌 Par contre, pour tout ce qui concerne vos trajets ou votre compte, je suis là !",
        "Bonne question, mais je laisse ça aux experts 😌 Avez-vous une question sur le covoiturage ?",
    ],
    "fallback": (
        "😌 Je n'ai pas trouvé de réponse suffisamment fiable à votre question.\n\n"
        "Vous pouvez :\n"
        "→ Consulter la **FAQ** pour trouver une réponse existante\n"
        "→ Contacter le **support technique** pour une aide personnalisée\n\n"
        "Voulez-vous reformuler votre question ? Je vais réessayer 👍"
    ),
    "triple_escalation": (
        "😌 Je vois que je n'ai pas pu vous aider correctement. Je transfère votre demande "
        "à notre équipe de support.\n\nUn membre de l'équipe vous contactera sous peu. "
        "Merci de votre patience 🚗"
    ),
}

GREETING_WORDS  = {"bonjour", "salut", "allô", "allo", "hello", "bonsoir", "hey", "hi"}
FAREWELL_WORDS  = {"au revoir", "bye", "bonne journée", "bonne route", "ciao", "bonsoir"}
THANKS_WORDS    = {"merci", "thanks", "thank you", "super merci", "parfait", "excellent"}

CLARIFICATION_MAP: dict[str, dict] = {
    "reservation":    {"question": "Votre question concerne :", "options": ["Trouver un trajet", "Confirmer une réservation", "Modifier une réservation", "Autre"]},
    "annulation":     {"question": "Vous souhaitez :", "options": ["Annuler en tant que passager", "Annuler un trajet conducteur", "Connaître les frais d'annulation", "Autre"]},
    "paiement":       {"question": "Votre problème concerne :", "options": ["Paiement refusé", "Remboursement non reçu", "Recharger mon compte", "Retirer mes gains"]},
    "compte":         {"question": "Votre demande concerne :", "options": ["Connexion impossible", "Modifier mon profil", "Supprimer mon compte", "Autre"]},
    "trajet":         {"question": "Votre question porte sur :", "options": ["Créer un trajet", "Trajet en cours", "Trajet annulé", "Historique"]},
    "default":        {"question": "Votre demande concerne :", "options": ["Réservation / Trajet", "Paiement / Compte", "Problème technique", "Signalement"]},
}


# ─────────────────────────────────────────────
#  RENDERER PRINCIPAL
# ─────────────────────────────────────────────

def render_response(resp: ResponseObject, qobj: QuestionObject) -> str:
    """
    Retourne le template de réponse directement.
    Pas de LLM — le template FAQ est déjà bien rédigé.
    La traduction vers la langue de l'utilisateur est gérée
    en aval dans le pipeline (service NLLB :8002).
    """
    if resp.templates:
        return resp.templates[0]
    return IDENTITY_RESPONSES["fallback"]


def render_identity(response_type: str) -> str:
    options = IDENTITY_RESPONSES.get(response_type, [])
    if isinstance(options, list):
        return random.choice(options)
    return options


def detect_small_talk_type(qobj: QuestionObject) -> str | None:
    raw = qobj.raw_text.lower().strip()
    if any(w in raw for w in GREETING_WORDS):
        return "greeting"
    if any(w in raw for w in FAREWELL_WORDS):
        return "farewell"
    if any(w in raw for w in THANKS_WORDS):
        return "thanks"
    return None


def generate_clarification(qobj: QuestionObject) -> dict:
    key     = qobj.intent.value if qobj.intent.value in CLARIFICATION_MAP else "default"
    mapping = CLARIFICATION_MAP[key]
    return {
        "type":        "clarification",
        "message":     "Pour vous répondre avec précision, j'ai besoin d'une clarification 🙂",
        "question":    mapping["question"],
        "options":     mapping["options"][:4],
        "intent_hint": key,
    }


def needs_clarification(qobj: QuestionObject, fallback_reason: str, clarification_count: int) -> bool:
    if clarification_count >= 2:
        return False
    if qobj.is_out_of_scope or qobj.is_small_talk:
        return False
    if qobj.ambiguity_score > 0.5:
        return True
    if "ambiguous_spread" in fallback_reason:
        return True
    if "below_threshold" in fallback_reason and qobj.domain_relevance > 0.5:
        return True
    return False
