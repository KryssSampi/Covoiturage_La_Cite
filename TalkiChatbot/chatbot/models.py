"""
Cité-Covoiturage — Chatbot IA Support
Modèles de données : QuestionObject, ResponseObject, FAQItem, Conversation
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid


# ─────────────────────────────────────────────
#  ÉNUMÉRATIONS MÉTIER
# ─────────────────────────────────────────────

class Intent(str, Enum):
    RESERVATION       = "reservation"
    ANNULATION        = "annulation"
    PAIEMENT          = "paiement"
    COMPTE            = "compte"
    TRAJET            = "trajet"
    CONDUCTEUR        = "conducteur"
    PASSAGER          = "passager"
    SIGNALEMENT       = "signalement"
    LITIGE            = "litige"
    VEHICULE          = "vehicule"
    NOTIFICATIONS     = "notifications"
    INDISPONIBILITE   = "indisponibilite"
    SECURITE          = "securite"
    HORS_SCOPE        = "hors_scope"
    SALUTATION        = "salutation"
    INCOMPREHENSIBLE  = "incomprehensible"

class Entity(str, Enum):
    TRAJET      = "trajet"
    RESERVATION = "reservation"
    PAIEMENT    = "paiement"
    COMPTE      = "compte"
    VEHICULE    = "vehicule"
    PROFIL      = "profil"
    BADGE       = "badge"
    REVIEW      = "review"
    AUCUN       = "aucun"

class Outcome(str, Enum):
    TP = "TP"   # Vrai positif  — réponse correcte, user satisfait
    FP = "FP"   # Faux positif  — réponse envoyée mais fausse
    FN = "FN"   # Faux négatif  — refus injustifié
    TN = "TN"   # Vrai négatif  — refus justifié (hors scope / incertitude)

class ResponseType(str, Enum):
    DIRECT       = "direct"
    GUIDE        = "guide"
    CONDITIONNEL = "conditionnel"
    FALLBACK     = "fallback"
    CLARIFICATION= "clarification"
    IDENTITAIRE  = "identitaire"
    ESQUIVE      = "esquive"

class RiskLevel(str, Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"


# ─────────────────────────────────────────────
#  QUESTION OBJECT  (input structuré)
# ─────────────────────────────────────────────

@dataclass
class QuestionObject:
    """Représentation structurée d'une question utilisateur."""
    raw_text:            str
    intent:              Intent               = Intent.INCOMPREHENSIBLE
    entity:              Entity               = Entity.AUCUN
    urgency_score:       float                = 0.0   # 0.0 → 1.0
    ambiguity_score:     float                = 0.5   # 0.0 → 1.0
    domain_relevance:    float                = 0.0   # 0.0 → 1.0
    faq_match_score:     float                = 0.0
    keywords:            list[str]            = field(default_factory=list)
    is_small_talk:       bool                 = False
    is_out_of_scope:     bool                 = False
    context_variables:   dict                 = field(default_factory=dict)
    semantic_vector:     list[float]          = field(default_factory=list)
    session_id:          str                  = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp:           datetime             = field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
#  RESPONSE OBJECT  (output structuré)
# ─────────────────────────────────────────────

@dataclass
class ResponseObject:
    """Réponse structurée prête pour le renderer."""
    response_id:         str
    intent:              Intent
    entity:              Entity
    response_type:       ResponseType
    templates:           list[str]            = field(default_factory=list)
    actions:             list[str]            = field(default_factory=list)
    conditions:          dict                 = field(default_factory=dict)
    confidence_base:     float                = 0.0
    risk_level:          RiskLevel            = RiskLevel.LOW
    emoji_allowed:       bool                 = True
    emoji_type:          Optional[str]        = None     # "greeting" | "support" | "soft_refusal"
    fallback:            bool                 = False
    faq_source_id:       Optional[str]        = None
    score:               float                = 0.0      # attribué par le Judge


# ─────────────────────────────────────────────
#  FAQ ITEM  (unité d'apprentissage)
# ─────────────────────────────────────────────

@dataclass
class FAQMetrics:
    true_positive:      int   = 0
    false_positive:     int   = 0
    false_negative:     int   = 0
    true_negative:      int   = 0
    precision:          float = 0.0
    recall:             float = 0.0
    f1_score:           float = 0.0
    user_satisfaction:  float = 0.0

    def update(self, outcome: Outcome, satisfaction: Optional[float] = None):
        if outcome == Outcome.TP:
            self.true_positive += 1
        elif outcome == Outcome.FP:
            self.false_positive += 1
        elif outcome == Outcome.FN:
            self.false_negative += 1
        elif outcome == Outcome.TN:
            self.true_negative += 1

        total_pred = self.true_positive + self.false_positive
        self.precision = self.true_positive / total_pred if total_pred > 0 else 0.0

        total_real = self.true_positive + self.false_negative
        self.recall = self.true_positive / total_real if total_real > 0 else 0.0

        denom = self.precision + self.recall
        self.f1_score = 2 * self.precision * self.recall / denom if denom > 0 else 0.0

        if satisfaction is not None:
            alpha = 0.1
            self.user_satisfaction = (1 - alpha) * self.user_satisfaction + alpha * satisfaction

@dataclass
class FAQQuestion:
    """
    Miroir exact de FAQQuestion (TypeScript) — une paire Q/R atomique.
    Enrichie côté Python des métadonnées nécessaires au matching.
    """
    question:   str
    reponse:    str
    # ── Métadonnées matching (absentes du modèle TS, gérées côté Python uniquement)
    variations: list[str]  = field(default_factory=list)   # reformulations connues
    keywords:   list[str]  = field(default_factory=list)   # mots-clés extraits
    actions:    list[str]  = field(default_factory=list)   # actions recommandées
    conditions: list[str]  = field(default_factory=list)   # pré-conditions contextuelles


@dataclass
class FAQItem:
    """
    Miroir exact de FAQItemModel (TypeScript) — groupe de Q/R par sujet.
    Enrichi côté Python des métadonnées d'apprentissage et de performance.

    TypeScript original :
      id        : string
      sujet     : string
      categorie : string
      items     : FAQQuestion[]
    """
    id:         str
    sujet:      str                          # Libellé affiché (ex : "Réservations")
    categorie:  str                          # Clé métier (ex : "reservation")
    items:      list[FAQQuestion]            = field(default_factory=list)

    # ── Métadonnées matching/apprentissage (Python uniquement)
    intent:              Intent              = Intent.INCOMPREHENSIBLE
    entity:              Entity              = Entity.AUCUN
    related_ids:         list[str]           = field(default_factory=list)
    active:              bool                = True
    auto_generated:      bool               = False
    metrics:             FAQMetrics          = field(default_factory=FAQMetrics)
    learned_patterns:    list[list[float]]   = field(default_factory=list)
    rejection_patterns:  list[list[float]]   = field(default_factory=list)
    last_updated:        datetime            = field(default_factory=datetime.utcnow)
    version:             int                 = 1


@dataclass
class FAQItemResolved:
    """
    Vue aplatie d'une question individuelle avec son contexte de groupe.
    Utilisée par le Matching Engine — une entrée = une paire Q/R matchable.
    """
    group_id:    str           # id du FAQItem parent
    sujet:       str
    categorie:   str
    intent:      Intent
    entity:      Entity
    question:    str           # question canonique de ce slot
    reponse:     str
    variations:  list[str]     = field(default_factory=list)
    keywords:    list[str]     = field(default_factory=list)
    actions:     list[str]     = field(default_factory=list)
    conditions:  list[str]     = field(default_factory=list)
    active:      bool          = True
    metrics:     FAQMetrics    = field(default_factory=FAQMetrics)

    @property
    def match_id(self) -> str:
        """Identifiant unique : group_id + index question (ex: faq_compte_0)"""
        return f"{self.group_id}_{hash(self.question) % 9999:04d}"


# ─────────────────────────────────────────────
#  CONVERSATION CACHE  (session temps réel)
# ─────────────────────────────────────────────

@dataclass
class MessageRecord:
    input_text:          str
    question_object:     dict                 # QuestionObject sérialisé
    predicted_faq_id:    Optional[str]
    response:            str
    confidence:          float
    timestamp:           datetime             = field(default_factory=datetime.utcnow)

@dataclass
class ConversationSession:
    id:                      str               = field(default_factory=lambda: str(uuid.uuid4()))
    user_id:                 Optional[str]     = None
    messages:                list[MessageRecord] = field(default_factory=list)
    follow_up_detected:      bool              = False
    rephrasing_detected:     bool              = False
    abandonment:             bool              = False
    negative_count:          int               = 0
    clarification_count:     int               = 0
    pending_clarification:   Optional[dict]    = None   # MCQ en attente de réponse
    detected_lang:           str               = "fr"   # langue détectée de l'utilisateur
    user_feedback:           Optional[dict]    = None
    outcome:                 Optional[Outcome] = None
    created_at:              datetime          = field(default_factory=datetime.utcnow)
    last_activity:           datetime          = field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
#  COMPRESSED CONVERSATION  (stockage long terme)
# ─────────────────────────────────────────────

@dataclass
class CandidateRecord:
    """Enregistrement d'un candidat évalué par le Judge."""
    faq_id:       str
    score:        float
    rank:         int
    pertinence:   float = 0.0
    couverture:   float = 0.0
    clarte:       float = 0.0
    coherence:    float = 0.0
    proximite:    float = 0.0
    historique:   float = 0.0


@dataclass
class CompressedConversation:
    """
    Enregistrement riche d'une conversation compressée.
    Contient tout ce dont la Phase 1 a besoin pour l'auto-optimisation :
    - Les 6 candidats avec leurs scores KPI individuels
    - Le breakdown du meilleur candidat
    - Les signaux comportementaux
    - La zone de décision et le spread
    """
    id:                   str
    timestamp:            datetime

    # ── Input
    intent:               str
    entity:               str
    domain_relevance:     float             = 0.0
    ambiguity_score:      float             = 0.5
    urgency_score:        float             = 0.0
    detected_lang:        str               = "fr"
    question_word_count:  int               = 0

    # ── Prédiction
    faq_id:               Optional[str]     = None
    decision_zone:        str               = "UNKNOWN"   # CONFIDENT|UNCERTAIN|UNKNOWN
    best_score:           float             = 0.0
    score_spread:         float             = 0.0         # écart top1 - top2

    # ── Les 6 candidats (pour analyse Judge)
    candidates:           list              = field(default_factory=list)  # list[CandidateRecord]

    # ── KPI breakdown du meilleur candidat
    best_kpi:             dict              = field(default_factory=dict)

    # ── Comportement session
    clarification_count:  int               = 0
    fallback_triggered:   bool              = False
    negative_count:       int               = 0
    outcome_signal:       str               = "neutral"   # positive_followup|negative_followup|rephrasing|explicit_feedback

    # ── Ground truth
    outcome:              Outcome           = Outcome.TN
    user_feedback:        Optional[float]   = None        # 0.0–1.0


# ─────────────────────────────────────────────
#  KPI CONFIG  (configurable + auto-évolutif)
# ─────────────────────────────────────────────

@dataclass
class KPIWeights:
    """Poids des KPI du Judge — évoluent automatiquement au fil du temps."""
    pertinence:             float = 0.30
    couverture_intention:   float = 0.20
    clarte:                 float = 0.15
    coherence:              float = 0.15
    proximite_faq:          float = 0.10
    historique_succes:      float = 0.10
    version:                int   = 1
    last_updated:           datetime = field(default_factory=datetime.utcnow)

    def normalize(self):
        total = (self.pertinence + self.couverture_intention + self.clarte
                 + self.coherence + self.proximite_faq + self.historique_succes)
        if total == 0:
            return
        self.pertinence           /= total
        self.couverture_intention /= total
        self.clarte               /= total
        self.coherence            /= total
        self.proximite_faq        /= total
        self.historique_succes    /= total
