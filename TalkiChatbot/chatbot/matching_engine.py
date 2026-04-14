"""
Matching Engine — Module 3 du pipeline
Structure FAQ : groupée (FAQItemModel) → aplatie en FAQItemResolved pour le matching.
Hybride : règles métier → similarité cosinus → Random Forest.
"""

from __future__ import annotations
import json, os, pickle, math
from dataclasses import dataclass, field
from models import FAQItemResolved, Intent, Entity, ResponseObject, ResponseType, RiskLevel
from feature_encoder import FeatureVector

FAQ_PATH        = os.path.join(os.path.dirname(__file__), "faq_data.json")
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "data", "matching_model.pkl")
TOP_N = 6

ENTITY_MAP_LOCAL = {
    "trajet": 0, "reservation": 1, "paiement": 2, "compte": 3,
    "vehicule": 4, "profil": 5, "badge": 6, "review": 7, "aucun": 8,
}

@dataclass
class MatchCandidate:
    match_id:   str
    group_id:   str
    faq_item:   FAQItemResolved
    similarity: float
    rule_match: float
    ml_score:   float
    combined:   float = 0.0


def load_faq() -> list[FAQItemResolved]:
    """
    Charge la FAQ groupée (FAQItemModel) et l'aplatit en FAQItemResolved.
    Chaque paire Q/R individuelle devient une unité de matching indépendante.
    """
    with open(FAQ_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    resolved: list[FAQItemResolved] = []
    for group in raw:
        group_id = group["id"]
        active   = group.get("active", True)
        try:
            intent = Intent(group.get("intent", "incomprehensible"))
        except ValueError:
            intent = Intent.INCOMPREHENSIBLE
        try:
            entity = Entity(group.get("entity", "aucun"))
        except ValueError:
            entity = Entity.AUCUN

        for item in group.get("items", []):
            resolved.append(FAQItemResolved(
                group_id   = group_id,
                sujet      = group["sujet"],
                categorie  = group["categorie"],
                intent     = intent,
                entity     = entity,
                question   = item["question"],
                reponse    = item["reponse"],
                variations = item.get("variations", []),
                keywords   = item.get("keywords", []),
                actions    = item.get("actions", []),
                conditions = item.get("conditions", []),
                active     = active,
            ))
    return resolved


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot   = sum(x * y for x, y in zip(a, b))
    na    = math.sqrt(sum(x**2 for x in a))
    nb    = math.sqrt(sum(x**2 for x in b))
    return dot / (na * nb) if na and nb else 0.0


def _rule_match_score(fv: FeatureVector, faq: FAQItemResolved) -> float:
    from feature_encoder import INTENT_MAP, _load_dynamic_keywords
    score = 0.0
    exp_intent = INTENT_MAP.get(faq.intent.value, -1)
    if fv.intent_id == exp_intent:
        score += 0.55
    elif abs(fv.intent_id - exp_intent) <= 2:
        score += 0.20
    if fv.entity_id == ENTITY_MAP_LOCAL.get(faq.entity.value, -1):
        score += 0.30
    dyn_kw    = _load_dynamic_keywords()
    active_kw = {dyn_kw[i].lower() for i, v in enumerate(fv.keyword_presence) if v == 1}
    faq_kw    = {k.lower() for k in faq.keywords}
    overlap   = len(faq_kw & active_kw)
    score    += min(overlap / max(len(faq_kw), 1), 1.0) * 0.15
    return min(score, 1.0)


def _build_faq_vector(faq: FAQItemResolved) -> list[float]:
    from feature_encoder import _load_dynamic_keywords, INTENT_MAP
    dyn_kw   = _load_dynamic_keywords()
    all_text = " ".join([faq.question] + faq.variations).lower()
    has_q    = 1.0 if "?" in faq.question else 0.0
    has_neg  = 1.0 if any(w in all_text for w in ("pas","ne","jamais","aucun","sans")) else 0.0
    has_urg  = 1.0 if any(w in all_text for w in ("urgent","aide","sos","danger","bloqué")) else 0.0
    kw_dens  = min(len(faq.keywords) / max(len(faq.question.split()), 1), 1.0)
    static = [
        float(INTENT_MAP.get(faq.intent.value, 15)),
        float(ENTITY_MAP_LOCAL.get(faq.entity.value, 8)),
        0.0,                                    # urgency (FAQ = neutre)
        0.2,                                    # ambiguity (FAQ = peu ambiguë)
        0.95,                                   # domain_relevance (FAQ = très pertinent)
        0.0,                                    # is_small_talk
        0.0,                                    # is_out_of_scope
        min(len(faq.question) / 300.0, 1.0),    # text_length normalisé
        has_q,                                   # question_mark
        0.0,                                    # exclamation_mark
        0.0,                                    # has_number
        has_neg,                                 # has_negation
        has_urg,                                 # has_urgency_word
        kw_dens,                                 # keyword_density
        0.9,                                    # faq_match_score (auto-match élevé)
    ]
    kw_vec = [1.0 if kw.lower() in all_text else 0.0 for kw in dyn_kw]
    return static + kw_vec


def find_candidates(fv: FeatureVector, faq_items: list[FAQItemResolved], top_n: int = TOP_N) -> list[MatchCandidate]:
    fv_list    = fv.to_list()
    candidates = []
    for faq in faq_items:
        if not faq.active:
            continue
        rule_score = _rule_match_score(fv, faq)
        sim_score  = _cosine_similarity(fv_list, _build_faq_vector(faq))
        ml_score   = _rf_predict(fv_list, faq.match_id) if _rf_model_available() else sim_score
        combined   = 0.40 * rule_score + 0.35 * sim_score + 0.25 * ml_score
        candidates.append(MatchCandidate(
            match_id=faq.match_id, group_id=faq.group_id,
            faq_item=faq, similarity=sim_score,
            rule_match=rule_score, ml_score=ml_score, combined=combined,
        ))
    candidates.sort(key=lambda c: c.combined, reverse=True)
    return candidates[:top_n]


def _rf_model_available() -> bool:
    return os.path.exists(MODEL_SAVE_PATH)


def _rf_predict(fv_list: list[float], match_id: str) -> float:
    try:
        with open(MODEL_SAVE_PATH, "rb") as f:
            data = pickle.load(f)
        clf, le = data["model"], data["label_encoder"]
        if match_id in list(le.classes_):
            idx = list(le.classes_).index(match_id)
            return float(clf.predict_proba([fv_list])[0][idx])
    except Exception:
        pass
    return 0.5


def candidates_to_response_objects(candidates: list[MatchCandidate]) -> list[ResponseObject]:
    results = []
    for c in candidates:
        faq = c.faq_item
        obj = ResponseObject(
            response_id     = f"R_{c.match_id}",
            intent          = faq.intent,
            entity          = faq.entity,
            response_type   = ResponseType.DIRECT if c.combined > 0.7 else ResponseType.CONDITIONNEL,
            templates       = [faq.reponse],       # champ "reponse" du FAQItemModel
            actions         = faq.actions,
            conditions      = {cond: True for cond in faq.conditions},
            confidence_base = c.combined,
            risk_level      = RiskLevel.HIGH if faq.intent.value == "securite" else RiskLevel.LOW,
            emoji_allowed   = True,
            faq_source_id   = c.match_id,
            score           = c.combined,
        )
        results.append(obj)
    return results
