"""
Talki — IA Judge
Évalue les 6 candidats produits par le Matching Engine.
Seuils : >75% → réponse | 60-75% → zone clarification | <60% → on ne sait pas

KPI évolutifs — jamais fixés manuellement, optimisés chaque nuit par algorithme évolutif.
"""

from __future__ import annotations
import os
import json
import math
import random
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from models import QuestionObject, ResponseObject, RiskLevel

WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "data", "kpi_weights.json")

# Seuils de décision
THRESHOLD_CONFIDENT   = 0.75   # > 75% → réponse directe
THRESHOLD_UNCERTAIN   = 0.60   # 60-75% → zone clarification
SPREAD_MIN            = 0.03   # Écart minimum entre les 2 premiers pour valider


@dataclass
class KPIWeights:
    pertinence:             float = 0.30
    couverture_intention:   float = 0.20
    clarte:                 float = 0.15
    coherence:              float = 0.15
    proximite_faq:          float = 0.10
    historique_succes:      float = 0.10
    version:                int   = 1
    fitness_score:          float = 0.0   # Score d'aptitude pour l'algo évolutif
    last_updated:           str   = ""

    def as_vector(self) -> list[float]:
        return [
            self.pertinence, self.couverture_intention, self.clarte,
            self.coherence, self.proximite_faq, self.historique_succes
        ]

    def from_vector(self, v: list[float]):
        keys = ["pertinence","couverture_intention","clarte","coherence","proximite_faq","historique_succes"]
        for k, val in zip(keys, v):
            setattr(self, k, float(val))
        # Normaliser directement sans appel récursif
        total = sum(self.as_vector())
        if total > 0:
            for k in keys:
                setattr(self, k, getattr(self, k) / total)

    def normalize(self):
        keys = ["pertinence","couverture_intention","clarte","coherence","proximite_faq","historique_succes"]
        total = sum(self.as_vector())
        if total > 0:
            for k in keys:
                setattr(self, k, getattr(self, k) / total)


@dataclass
class CandidateScore:
    response_id:          str
    pertinence:           float = 0.0
    couverture_intention: float = 0.0
    clarte:               float = 0.0
    coherence:            float = 0.0
    proximite_faq:        float = 0.0
    historique_succes:    float = 0.0
    global_score:         float = 0.0
    rank:                 int   = 0


def load_weights() -> KPIWeights:
    if os.path.exists(WEIGHTS_PATH):
        try:
            with open(WEIGHTS_PATH, "r", encoding="utf-8") as f:
                d = json.load(f)
            w = KPIWeights(
                pertinence           = d.get("pertinence", 0.30),
                couverture_intention = d.get("couverture_intention", 0.20),
                clarte               = d.get("clarte", 0.15),
                coherence            = d.get("coherence", 0.15),
                proximite_faq        = d.get("proximite_faq", 0.10),
                historique_succes    = d.get("historique_succes", 0.10),
                version              = d.get("version", 1),
                fitness_score        = d.get("fitness_score", 0.0),
            )
            w.normalize()
            return w
        except Exception:
            pass
    return KPIWeights()


def save_weights(w: KPIWeights):
    os.makedirs(os.path.dirname(WEIGHTS_PATH), exist_ok=True)
    w.last_updated = datetime.utcnow().isoformat()
    with open(WEIGHTS_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "pertinence":           w.pertinence,
            "couverture_intention": w.couverture_intention,
            "clarte":               w.clarte,
            "coherence":            w.coherence,
            "proximite_faq":        w.proximite_faq,
            "historique_succes":    w.historique_succes,
            "version":              w.version,
            "fitness_score":        w.fitness_score,
            "last_updated":         w.last_updated,
        }, f, indent=2)


# ─────────────────────────────────────────────
#  SCORING DES KPI INDIVIDUELS
# ─────────────────────────────────────────────

def _score_pertinence(qobj: QuestionObject, resp: ResponseObject) -> float:
    score = 0.0
    if qobj.intent == resp.intent:
        score += 0.70
    elif qobj.intent.value in ["conducteur","passager"] and resp.intent.value == "trajet":
        score += 0.40
    if qobj.entity == resp.entity:
        score += 0.30
    return min(score, 1.0)


def _score_couverture(qobj: QuestionObject, resp: ResponseObject) -> float:
    base = resp.confidence_base
    penalty = qobj.ambiguity_score * 0.25
    bonus = max(0.0, 0.10 - len(resp.conditions) * 0.02)
    return max(0.0, min(1.0, base - penalty + bonus))


def _score_clarte(resp: ResponseObject) -> float:
    template = resp.templates[0] if resp.templates else ""
    n = len(template.split())
    if 20 <= n <= 100:
        length_score = 1.0
    elif n < 20:
        length_score = max(0.3, n / 20)
    else:
        length_score = max(0.5, 1.0 - (n - 100) / 300)
    action_bonus = min(len(resp.actions) * 0.05, 0.20)
    return min(1.0, length_score + action_bonus)


def _score_coherence(qobj: QuestionObject, resp: ResponseObject) -> float:
    score = 0.85
    if qobj.urgency_score > 0.7 and resp.response_type.value not in ["guide","direct"]:
        score -= 0.20
    if resp.risk_level == RiskLevel.HIGH and not resp.conditions:
        score -= 0.15
    return max(0.0, score)


def _score_proximite_faq(resp: ResponseObject) -> float:
    return 0.90 if resp.faq_source_id else 0.35


def _score_historique(faq_f1: float) -> float:
    # Valeur par défaut 0.5 si pas encore de données
    return faq_f1 if faq_f1 > 0 else 0.5


# ─────────────────────────────────────────────
#  ÉVALUATION PRINCIPALE — 6 CANDIDATS
# ─────────────────────────────────────────────

def evaluate_all(
    qobj: QuestionObject,
    candidates: list[ResponseObject],
    faq_f1_scores: dict[str, float] | None = None,
    weights: KPIWeights | None = None,
) -> list[CandidateScore]:
    """
    Évalue les N candidats (idéalement 6) et retourne leurs scores triés.
    Le Judge évalue TOUS les candidats — jamais de sélection avant scoring.
    """
    if weights is None:
        weights = load_weights()
    if faq_f1_scores is None:
        faq_f1_scores = {}

    scores: list[CandidateScore] = []

    for resp in candidates:
        f1   = faq_f1_scores.get(resp.faq_source_id or "", 0.5)
        p    = _score_pertinence(qobj, resp)
        ci   = _score_couverture(qobj, resp)
        cl   = _score_clarte(resp)
        co   = _score_coherence(qobj, resp)
        pf   = _score_proximite_faq(resp)
        hs   = _score_historique(f1)

        global_score = (
            p  * weights.pertinence +
            ci * weights.couverture_intention +
            cl * weights.clarte +
            co * weights.coherence +
            pf * weights.proximite_faq +
            hs * weights.historique_succes
        )

        scores.append(CandidateScore(
            response_id          = resp.response_id,
            pertinence           = p,
            couverture_intention = ci,
            clarte               = cl,
            coherence            = co,
            proximite_faq        = pf,
            historique_succes    = hs,
            global_score         = global_score,
        ))

    scores.sort(key=lambda s: s.global_score, reverse=True)
    for i, s in enumerate(scores):
        s.rank = i + 1

    return scores


def decide(
    scores: list[CandidateScore],
    candidates: list[ResponseObject],
) -> tuple[ResponseObject | None, str]:
    """
    Décision finale basée sur les seuils :
    > 75%          → réponse directe (CONFIDENT)
    60% – 75%      → zone incertaine (UNCERTAIN) → clarification possible
    < 60%          → on ne sait pas (UNKNOWN)

    Retourne (meilleure_réponse | None, zone)
    """
    if not scores:
        return None, "UNKNOWN"

    best = scores[0]

    if best.global_score >= THRESHOLD_CONFIDENT:
        # Vérifier le spread pour s'assurer que ce n'est pas ambigu
        if len(scores) >= 2:
            spread = scores[0].global_score - scores[1].global_score
            if spread < SPREAD_MIN and best.global_score < 0.85:
                return None, "UNCERTAIN"
        resp = next((r for r in candidates if r.response_id == best.response_id), None)
        if resp:
            resp.score = best.global_score
        return resp, "CONFIDENT"

    elif best.global_score >= THRESHOLD_UNCERTAIN:
        return None, "UNCERTAIN"

    else:
        return None, "UNKNOWN"


# ─────────────────────────────────────────────
#  ALGORITHME ÉVOLUTIF POUR KPI (appelé par training_loop)
# ─────────────────────────────────────────────

def evolve_kpi_weights(
    conversations: list[dict],
    generations:   int = 20,
    population:    int = 12,
    phase2_audit:  dict | None = None,
) -> KPIWeights:
    """
    Algorithme génétique simple pour optimiser les poids KPI.
    Fitness = taux de vrais positifs sur les conversations récentes,
    ou si pas assez de données réelles, utilise l'audit Phase 2.
    """
    current = load_weights()

    # Fitness function — adapt selon les données disponibles
    real_tp = sum(1 for c in conversations if c.get("outcome") == "TP")
    real_fp = sum(1 for c in conversations if c.get("outcome") == "FP")
    use_real = (real_tp + real_fp) >= 10  # seuil minimum pour données fiables

    def fitness(w: KPIWeights) -> float:
        if use_real:
            # Mode nominal : évaluer sur conversations réelles
            tp = real_tp
            fp = real_fp
            total = tp + fp
            if total == 0:
                return 0.5
            weighted_tp = sum(
                float(c.get("user_feedback") or 0.5)
                for c in conversations
                if c.get("outcome") == "TP"
            )
            precision = tp / total
            satisfaction = weighted_tp / max(tp, 1)
            return 0.6 * precision + 0.4 * satisfaction

        # Mode bootstrap : évaluer via l'audit Phase 2
        if phase2_audit and phase2_audit.get("total", 0) > 0:
            acc = phase2_audit.get("accuracy", 0.0)
            wrong = phase2_audit.get("wrong_rate", 0.0)
            unknown = phase2_audit.get("unknown_rate", 0.0)
            # Favoriser les poids qui réduisent FP et unknown
            vec = w.as_vector()
            kpi_avg_tp = phase2_audit.get("kpi_avg_tp", {})
            kpi_avg_fp = phase2_audit.get("kpi_avg_fp", {})
            kpi_keys = ["pertinence","couverture_intention","clarte",
                        "coherence","proximite_faq","historique_succes"]
            # Score = accuracy pondérée + bonus si les poids favorisent les KPI discriminants
            discrimination_bonus = 0.0
            for i, kpi in enumerate(kpi_keys):
                tp_val = kpi_avg_tp.get(kpi, 0.5)
                fp_val = kpi_avg_fp.get(kpi, 0.5)
                if tp_val > fp_val:
                    # Ce KPI discrimine bien → bonus si le poids est élevé
                    discrimination_bonus += vec[i] * (tp_val - fp_val)
                elif fp_val > tp_val:
                    # Ce KPI trompe → pénalité si le poids est élevé
                    discrimination_bonus -= vec[i] * (fp_val - tp_val)
            return max(0.0, min(1.0,
                acc * 0.5 + (1.0 - wrong) * 0.3 + discrimination_bonus * 0.2
            ))

        # Pas de données du tout → fitness aléatoire légère pour permettre l'exploration
        return 0.5 + random.gauss(0, 0.02)

    # Population initiale — perturbations autour des poids actuels
    def mutate(base: list[float], sigma: float = 0.05) -> list[float]:
        v = [max(0.02, x + random.gauss(0, sigma)) for x in base]
        total = sum(v)
        return [x / total for x in v]

    def crossover(a: list[float], b: list[float]) -> list[float]:
        point = random.randint(1, len(a) - 1)
        child = a[:point] + b[point:]
        total = sum(child)
        return [x / total for x in child]

    # Initialisation
    pop: list[KPIWeights] = []
    base_vec = current.as_vector()
    for _ in range(population):
        w = KPIWeights()
        sigma = 0.08 if _ > 0 else 0.0  # Premier individu = poids actuels
        w.from_vector(mutate(base_vec, sigma=sigma))
        w.fitness_score = fitness(w)
        pop.append(w)

    best_overall = max(pop, key=lambda w: w.fitness_score)

    for gen in range(generations):
        # Sélection top 50%
        pop.sort(key=lambda w: w.fitness_score, reverse=True)
        survivors = pop[:population // 2]

        # Reproduction
        children: list[KPIWeights] = []
        while len(children) < population // 2:
            p1, p2 = random.sample(survivors, 2)
            child_vec = crossover(p1.as_vector(), p2.as_vector())
            # Mutation avec sigma décroissant
            sigma = 0.06 * (1 - gen / generations)
            child_vec = mutate(child_vec, sigma=sigma)
            child = KPIWeights()
            child.from_vector(child_vec)
            child.fitness_score = fitness(child)
            children.append(child)

        pop = survivors + children
        gen_best = max(pop, key=lambda w: w.fitness_score)
        if gen_best.fitness_score > best_overall.fitness_score:
            best_overall = gen_best

    best_overall.version = current.version + 1
    save_weights(best_overall)
    print(f"[Judge/Evolution] Fitness: {best_overall.fitness_score:.3f} — version {best_overall.version}")
    return best_overall
