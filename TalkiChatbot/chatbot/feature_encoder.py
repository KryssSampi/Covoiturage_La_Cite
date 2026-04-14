"""
Feature Encoder — Module 2 du pipeline
Convertit QuestionObject → vecteur numérique exploitable par le Matching Engine.
Colonnes statiques (filtre instantané) + colonnes dynamiques (évoluent avec l'expérience).
"""

from __future__ import annotations
import json
import os
from dataclasses import dataclass, field
from models import QuestionObject, Intent, Entity

# ─────────────────────────────────────────────
#  MAPPINGS CATÉGORIELS  (colonnes statiques)
# ─────────────────────────────────────────────

INTENT_MAP: dict[str, int] = {
    "reservation": 0,
    "annulation": 1,
    "paiement": 2,
    "compte": 3,
    "trajet": 4,
    "conducteur": 5,
    "passager": 6,
    "signalement": 7,
    "litige": 8,
    "vehicule": 9,
    "notifications": 10,
    "indisponibilite": 11,
    "securite": 12,
    "hors_scope": 13,
    "salutation": 14,
    "incomprehensible": 15,
}

ENTITY_MAP: dict[str, int] = {
    "trajet": 0,
    "reservation": 1,
    "paiement": 2,
    "compte": 3,
    "vehicule": 4,
    "profil": 5,
    "badge": 6,
    "review": 7,
    "aucun": 8,
}

# Colonnes dynamiques : mots-clés métier appris au fil du temps
DYNAMIC_KEYWORDS_PATH = os.path.join(os.path.dirname(__file__), "data", "dynamic_keywords.json")

def _load_dynamic_keywords() -> list[str]:
    if os.path.exists(DYNAMIC_KEYWORDS_PATH):
        with open(DYNAMIC_KEYWORDS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    # Seed initial — enrichi automatiquement par le Training Loop
    return [
        "annuler", "réserver", "payer", "rembourser", "signaler",
        "conducteur", "passager", "trajet", "compte", "véhicule",
        "bloqué", "erreur", "problème", "urgent", "sécurité",
        "argent", "notification", "indisponible", "litige", "message"
    ]

def save_dynamic_keywords(keywords: list[str]):
    os.makedirs(os.path.dirname(DYNAMIC_KEYWORDS_PATH), exist_ok=True)
    with open(DYNAMIC_KEYWORDS_PATH, "w", encoding="utf-8") as f:
        json.dump(keywords, f, ensure_ascii=False, indent=2)


# ─────────────────────────────────────────────
#  FEATURE VECTOR  (résultat de l'encodage)
# ─────────────────────────────────────────────

@dataclass
class FeatureVector:
    # ── Colonnes statiques (15 features fixes)
    intent_id:          int     # 0–15
    entity_id:          int     # 0–8
    urgency_score:      float   # 0.0–1.0
    ambiguity_score:    float   # 0.0–1.0
    domain_relevance:   float   # 0.0–1.0
    is_small_talk:      int     # 0 ou 1
    is_out_of_scope:    int     # 0 ou 1
    text_length:        float   # longueur normalisée
    question_mark:      int     # contient "?" → 0 ou 1
    exclamation_mark:   int     # contient "!" → 0 ou 1
    has_number:         int     # contient un chiffre → 0 ou 1
    has_negation:       int     # "pas", "ne", "jamais"... → 0 ou 1
    has_urgency_word:   int     # "urgent", "aide", "SOS"... → 0 ou 1
    keyword_density:    float   # ratio mots-clés / longueur
    faq_match_score:    float   # score de pré-matching (0.0–1.0)

    # ── Colonnes dynamiques (taille variable selon DYNAMIC_KEYWORDS)
    keyword_presence:   list[int] = field(default_factory=list)  # 0 ou 1 par mot-clé

    def to_list(self) -> list[float]:
        """Retourne le vecteur complet sous forme de liste numérique."""
        static = [
            float(self.intent_id),
            float(self.entity_id),
            self.urgency_score,
            self.ambiguity_score,
            self.domain_relevance,
            float(self.is_small_talk),
            float(self.is_out_of_scope),
            self.text_length,
            float(self.question_mark),
            float(self.exclamation_mark),
            float(self.has_number),
            float(self.has_negation),
            float(self.has_urgency_word),
            self.keyword_density,
            self.faq_match_score,
        ]
        return static + [float(k) for k in self.keyword_presence]

    @property
    def feature_names(self) -> list[str]:
        dynamic_keywords = _load_dynamic_keywords()
        static_names = [
            "intent_id", "entity_id", "urgency_score", "ambiguity_score",
            "domain_relevance", "is_small_talk", "is_out_of_scope",
            "text_length", "question_mark", "exclamation_mark",
            "has_number", "has_negation", "has_urgency_word",
            "keyword_density", "faq_match_score"
        ]
        return static_names + [f"kw_{kw}" for kw in dynamic_keywords]


# ─────────────────────────────────────────────
#  ENCODER
# ─────────────────────────────────────────────

NEGATION_WORDS = {"pas", "ne", "jamais", "aucun", "non", "sans", "plus", "impossible"}
URGENCY_WORDS  = {"urgent", "aide", "sos", "danger", "peur", "bloqué", "impossible", "urgence", "vite"}
MAX_TEXT_LENGTH = 300  # pour normalisation

def encode(qobj: QuestionObject, faq_match_score: float = 0.0) -> FeatureVector:
    """
    Transforme un QuestionObject en FeatureVector exploitable.
    """
    dynamic_keywords = _load_dynamic_keywords()
    raw_lower = qobj.raw_text.lower()
    words = set(raw_lower.split())

    # Métriques textuelles
    text_len_norm = min(len(qobj.raw_text) / MAX_TEXT_LENGTH, 1.0)
    kw_count = sum(1 for k in qobj.keywords if k.lower() in raw_lower)
    kw_density = kw_count / max(len(qobj.raw_text.split()), 1)

    # Présence de mots-clés dynamiques
    kw_presence = [1 if kw.lower() in raw_lower else 0 for kw in dynamic_keywords]

    return FeatureVector(
        intent_id          = INTENT_MAP.get(qobj.intent.value, 15),
        entity_id          = ENTITY_MAP.get(qobj.entity.value, 8),
        urgency_score      = qobj.urgency_score,
        ambiguity_score    = qobj.ambiguity_score,
        domain_relevance   = qobj.domain_relevance,
        is_small_talk      = int(qobj.is_small_talk),
        is_out_of_scope    = int(qobj.is_out_of_scope),
        text_length        = text_len_norm,
        question_mark      = int("?" in qobj.raw_text),
        exclamation_mark   = int("!" in qobj.raw_text),
        has_number         = int(any(c.isdigit() for c in qobj.raw_text)),
        has_negation       = int(bool(words & NEGATION_WORDS)),
        has_urgency_word   = int(bool(words & URGENCY_WORDS)),
        keyword_density    = kw_density,
        faq_match_score    = faq_match_score,
        keyword_presence   = kw_presence,
    )


def add_dynamic_keyword(keyword: str):
    """
    Ajoute un nouveau mot-clé aux colonnes dynamiques si absent.
    Appelé par le Training Loop lors de la détection de nouveaux patterns.
    """
    keywords = _load_dynamic_keywords()
    if keyword.lower() not in [k.lower() for k in keywords]:
        keywords.append(keyword.lower())
        save_dynamic_keywords(keywords)
        print(f"[FeatureEncoder] Nouveau mot-clé dynamique ajouté : '{keyword}'")


if __name__ == "__main__":
    from models import Intent, Entity
    test_q = QuestionObject(
        raw_text="J'ai un problème urgent avec mon paiement refusé !",
        intent=Intent.PAIEMENT,
        entity=Entity.PAIEMENT,
        urgency_score=0.8,
        ambiguity_score=0.2,
        domain_relevance=0.95,
        keywords=["paiement", "refusé", "urgent"],
    )
    fv = encode(test_q, faq_match_score=0.7)
    print("Vecteur statique :", fv.to_list()[:15])
    print("Présence keywords:", sum(fv.keyword_presence), "actifs sur", len(fv.keyword_presence))
