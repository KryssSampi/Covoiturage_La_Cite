"""
Talki — Training Loop nocturne v2.1
Corrections appliquées sur v2 :

  BUG 1 — Phase 2 accuracy 0.0% / wrong_rate 88%
  ────────────────────────────────────────────────
  CAUSE : FAQItemResolved.match_id utilise hash() de Python.
  hash() N'EST PAS STABLE entre processus depuis Python 3.3
  (PYTHONHASHSEED aléatoire par défaut sur Windows).
  Le match_id calculé en Phase 2 est donc DIFFÉRENT de celui
  enregistré pendant le training → aucune correspondance → 88% wrong.

  FIX : les items du dataset stockent maintenant "group_id" (l'id
  stable du groupe FAQ, sans hash). La comparaison Phase 2 utilise
  group_id directement, et extrait le group_id de faq_source_id
  via rsplit("_", 1) avec vérification que le suffixe est numérique.

  BUG 2 — DLL PyTorch dans subprocess Windows (WinError 1114)
  ─────────────────────────────────────────────────────────────
  CAUSE : api.py lance run_training_loop() dans un multiprocessing.Process.
  Quand llm_training.py fait `import torch` dans une fonction imbriquée,
  Windows tente de recharger c10.dll. Elle est déjà verrouillée par le
  process parent (CamemBERT service :8001). → OSError WinError 1114.

  FIX :
  1. `import torch` au niveau MODULE (pas dans une fonction) →
     le subprocess hérite du contexte d'import du process parent.
  2. Le LLM Training tourne dans un THREAD (pas un nouveau subprocess).
     Les threads partagent les DLL du process courant → aucun rechargement.
  3. Flag _TORCH_AVAILABLE → si torch échoue quand même, le training
     loop continue sans planter (RF + Judge fonctionnent sans torch).
"""

from __future__ import annotations
import json
import os
import pickle
import random
import threading
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# ── Import PyTorch au niveau MODULE ───────────────────────────────────────
# Sur Windows avec multiprocessing.spawn : torch doit être importé ici,
# pas dans une fonction. Le subprocess hérite du contexte DLL du parent
# seulement si l'import est fait au niveau module avant tout spawn.
try:
    import torch as _torch
    _TORCH_AVAILABLE = True
except OSError as _e:
    _TORCH_AVAILABLE = False
    print(f"[Training Loop] ⚠ PyTorch non disponible ({_e}) — LLM Training désactivé")

FAQ_PATH        = os.path.join(os.path.dirname(__file__), "faq_data.json")
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "data", "matching_model.pkl")
METRICS_PATH    = os.path.join(os.path.dirname(__file__), "data", "faq_metrics.json")
LOG_PATH        = os.path.join(os.path.dirname(__file__), "data", "training_log.json")
THRESHOLD_PATH  = os.path.join(os.path.dirname(__file__), "data", "thresholds.json")
AUDIT_PATH      = os.path.join(os.path.dirname(__file__), "data", "phase2_audit.json")

os.makedirs(os.path.join(os.path.dirname(__file__), "data"), exist_ok=True)

MIN_SAMPLES_TRAIN = 30

# ─────────────────────────────────────────────
#  DATASET GENERATOR
# ─────────────────────────────────────────────

VARIATION_TEMPLATES = [
    "Comment faire pour {kw} ?",
    "Je voudrais {kw}",
    "J'ai un problème avec {kw}",
    "Est-ce que je peux {kw} ?",
    "Comment {kw} sur l'application ?",
    "Aide-moi à {kw} s'il vous plaît",
    "Je ne comprends pas comment {kw}",
    "Où est-ce que je peux {kw} ?",
    "C'est quoi la procédure pour {kw} ?",
    "J'aimerais savoir comment {kw}",
    "Pourquoi je ne peux pas {kw} ?",
    "Expliquez-moi comment {kw}",
    "Je veux {kw} rapidement",
    "Comment ça marche pour {kw} ?",
    "Problème avec {kw} depuis hier",
    "Dites-moi comment {kw}",
]

HORS_SCOPE = [
    "Quel est mon horoscope ?", "Fait-il beau demain ?",
    "Raconte-moi une blague", "Prix de l'essence ?",
    "Tu es une IA ?", "Donne-moi une recette",
    "Qui a gagné le match ?", "Capitale du Canada ?",
    "Écris un poème", "Nouvelles du jour",
]

AMBIGUOUS = [
    "ça marche pas", "j'ai un problème", "aidez-moi",
    "c'est bloqué", "erreur", "je comprends pas",
    "comment faire ?", "c'est pas bon", "problème urgent", "ça bug",
]


def _vary(question: str, variations: list[str], keywords: list[str] | None = None, n: int = 6) -> list[str]:
    result = []
    kw_pool    = [k for k in (keywords or []) if len(k) > 3]
    q_words    = [w for w in question.lower().split() if len(w) > 4]
    seed_words = kw_pool or q_words or question.split()[:2]

    while len(result) < n:
        template = random.choice(VARIATION_TEMPLATES)
        n_kw     = min(random.randint(1, 3), len(seed_words))
        chosen   = random.sample(seed_words, n_kw) if len(seed_words) >= n_kw else seed_words
        synth    = template.format(kw=" ".join(chosen))
        if synth not in result:
            result.append(synth)
    return result[:n]


def generate_full_dataset() -> list[dict]:
    """
    Génère le dataset depuis la FAQ.
    Chaque item stocke "group_id" (id stable du groupe, sans hash)
    pour que la comparaison Phase 2 soit reproductible.
    """
    with open(FAQ_PATH, "r", encoding="utf-8") as f:
        faq_raw = json.load(f)

    dataset = []
    for group in faq_raw:
        if not isinstance(group, dict):
            continue
        group_id = group.get("id", "")
        intent   = group.get("intent", group.get("categorie", "incomprehensible")).lower()
        if not group_id:
            continue

        for item in group.get("items", []):
            if not isinstance(item, dict):
                continue
            question   = item.get("question", "").strip()
            variations = item.get("variations", [])
            if not question:
                continue

            base = {
                "group_id":         group_id,   # ← stable, pas de hash
                "expected_faq_id":  group_id,
                "intent":           intent,
                "expected_outcome": "TP",
            }

            dataset.append({**base, "question": question, "label": "support", "difficulty": "easy"})
            for var in variations:
                if var.strip():
                    dataset.append({**base, "question": var, "label": "support_variation", "difficulty": "easy"})
            for synth in _vary(question, variations, keywords=item.get("keywords", []), n=6):
                dataset.append({**base, "question": synth, "label": "support_synthetic", "difficulty": "medium"})

    for q in HORS_SCOPE:
        dataset.append({"question": q, "group_id": None, "expected_faq_id": None,
                         "intent": "hors_scope", "label": "out_of_scope",
                         "expected_outcome": "TN", "difficulty": "easy"})
    for q in AMBIGUOUS:
        dataset.append({"question": q, "group_id": None, "expected_faq_id": None,
                         "intent": "incomprehensible", "label": "ambiguous",
                         "expected_outcome": "TN", "difficulty": "hard"})

    random.shuffle(dataset)
    return dataset


def split_50_50(dataset: list[dict]) -> tuple[list[dict], list[dict]]:
    """Split stratifié 50/50 par group_id (pas par question individuelle)."""
    by_group = defaultdict(list)
    non_faq  = defaultdict(list)

    for item in dataset:
        gid = item.get("group_id")
        if gid:
            by_group[gid].append(item)
        else:
            non_faq[item["label"]].append(item)

    lot_a, lot_b = [], []
    group_ids = list(by_group.keys())
    random.shuffle(group_ids)
    mid = len(group_ids) // 2
    for gid in group_ids[:mid]:
        lot_a.extend(by_group[gid])
    for gid in group_ids[mid:]:
        lot_b.extend(by_group[gid])

    for label, items in non_faq.items():
        random.shuffle(items)
        m = len(items) // 2
        lot_a.extend(items[:m])
        lot_b.extend(items[m:])

    random.shuffle(lot_a)
    random.shuffle(lot_b)
    return lot_a, lot_b


def split_75_25(dataset: list[dict]) -> tuple[list[dict], list[dict]]:
    by_label = defaultdict(list)
    for item in dataset:
        by_label[item["label"]].append(item)

    train, val = [], []
    for label, items in by_label.items():
        random.shuffle(items)
        cut = max(1, int(len(items) * 0.75))
        train.extend(items[:cut])
        val.extend(items[cut:])

    random.shuffle(train)
    random.shuffle(val)
    return train, val


# ─────────────────────────────────────────────
#  MÉTRIQUES FAQ
# ─────────────────────────────────────────────

def compute_faq_metrics(conversations: list[dict]) -> dict:
    metrics = defaultdict(lambda: {
        "TP": 0, "FP": 0, "FN": 0, "TN": 0,
        "precision": 0.0, "recall": 0.0, "f1": 0.0,
        "avg_confidence": 0.0, "avg_spread": 0.0, "satisfaction": 0.0,
    })
    for conv in conversations:
        faq_id  = conv.get("faq_id")
        outcome = conv.get("outcome", "TN")
        if not faq_id:
            continue
        m = metrics[faq_id]
        m[outcome] = m.get(outcome, 0) + 1
        m["avg_confidence"] = (m["avg_confidence"] + float(conv.get("best_score", 0.0))) / 2
        m["avg_spread"]     = (m["avg_spread"] + float(conv.get("score_spread", 0.0))) / 2
        sat = conv.get("user_feedback")
        if sat is not None:
            m["satisfaction"] = (m["satisfaction"] + float(sat)) / 2

    for faq_id, m in metrics.items():
        tp, fp, fn = m["TP"], m["FP"], m["FN"]
        m["precision"] = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        m["recall"]    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        denom = m["precision"] + m["recall"]
        m["f1"] = 2 * m["precision"] * m["recall"] / denom if denom > 0 else 0.0

    return dict(metrics)


def save_metrics(metrics: dict):
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)


def load_metrics() -> dict:
    return json.load(open(METRICS_PATH)) if os.path.exists(METRICS_PATH) else {}


# ─────────────────────────────────────────────
#  PHASE 1 — RF
# ─────────────────────────────────────────────

def darwin_select(dataset: list[dict], metrics: dict) -> list[dict]:
    selected = []
    for item in dataset:
        faq_id = item.get("expected_faq_id")
        m      = metrics.get(faq_id, {}) if faq_id else {}
        f1     = m.get("f1", 0.5)
        label  = item.get("label", "")

        if label in ("out_of_scope", "ambiguous"):
            selected.append(item)
            continue

        need = max(0.1, 1.0 - f1)
        if random.random() < (0.75 + need * 0.25):
            selected.append(item)
            if need > 0.65: selected.append(item)
            if need > 0.85: selected.append(item)

    random.shuffle(selected)
    return selected


def train_rf_phase1(
    train_data:    list[dict],
    val_data:      list[dict],
    conversations: list[dict],
    metrics:       dict,
) -> tuple[bool, float]:
    try:
        from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
        from sklearn.preprocessing import LabelEncoder
        from sklearn.metrics import accuracy_score
        import numpy as np
        from llm_parser import parse_question
        from feature_encoder import encode

        def encode_batch(items):
            X, y, w = [], [], []
            for item in items:
                if item["label"] not in ("support", "support_variation", "support_synthetic"):
                    continue
                try:
                    qobj = parse_question(item["question"])
                    fv   = encode(qobj)
                    X.append(fv.to_list())
                    # Utiliser group_id stable
                    y.append(item.get("group_id") or item.get("expected_faq_id", "unknown"))
                    faq_m = metrics.get(item.get("expected_faq_id", ""), {})
                    w.append(max(0.5, 2.0 - faq_m.get("f1", 0.5) * 2))
                except Exception:
                    continue
            return X, y, w

        print("[RF Phase1] Encodage train...")
        Xt, yt, wt = encode_batch(train_data)

        real_tp = [
            {"question": c.get("intent", ""), "group_id": c.get("faq_id", ""),
             "expected_faq_id": c.get("faq_id", ""), "label": "support"}
            for c in conversations if c.get("outcome") == "TP" and c.get("faq_id")
        ]
        if real_tp:
            Xr, yr, wr = encode_batch(real_tp)
            Xt.extend(Xr); yt.extend(yr); wt.extend(wr)

        if len(Xt) < MIN_SAMPLES_TRAIN:
            print(f"[RF Phase1] Pas assez d'exemples ({len(Xt)})")
            return False, 0.0

        print("[RF Phase1] Encodage val...")
        Xv, yv, _ = encode_batch(val_data)

        le    = LabelEncoder()
        le.fit(yt + (yv or []))
        yt_enc = le.transform(yt)

        Xt_np = np.array(Xt)
        wt_np = np.array(wt)

        best_clf   = None
        best_score = 0.0

        configs = [
            ("RF-100",  RandomForestClassifier(n_estimators=100, max_depth=None, random_state=42, n_jobs=1)),
            ("RF-200",  RandomForestClassifier(n_estimators=200, max_depth=20,   random_state=42, n_jobs=1)),
            ("GBT-100", GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)),
        ]

        for name, clf in configs:
            clf.fit(Xt_np, yt_enc, sample_weight=wt_np)
            if Xv and yv:
                Xv_np       = np.array(Xv)
                pred        = clf.predict(Xv_np)
                yv_aln, p_aln = [], []
                for i, label in enumerate(yv):
                    if label in le.classes_:
                        yv_aln.append(le.transform([label])[0])
                        p_aln.append(pred[i])
                if yv_aln:
                    acc = accuracy_score(yv_aln, p_aln)
                    print(f"  {name}: val_accuracy={acc:.3f}")
                    if acc > best_score:
                        best_score = acc
                        best_clf   = clf

        if best_clf:
            os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
            with open(MODEL_SAVE_PATH, "wb") as f:
                pickle.dump({"model": best_clf, "label_encoder": le}, f)
            print(f"[RF Phase1] ✓ Modèle sauvegardé — val_accuracy={best_score:.3f} | {len(Xt)} exemples")
            return True, best_score

        return False, 0.0

    except Exception as e:
        print(f"[RF Phase1] ⚠ Erreur : {e}")
        import traceback; traceback.print_exc()
        return False, 0.0


def load_thresholds() -> dict:
    if os.path.exists(THRESHOLD_PATH):
        try:
            return json.load(open(THRESHOLD_PATH))
        except Exception:
            pass
    return {"confident": 0.75, "uncertain": 0.60}


def save_thresholds(t: dict):
    with open(THRESHOLD_PATH, "w") as f:
        json.dump(t, f, indent=2)


def optimize_thresholds(conversations: list[dict], val_data: list[dict], current: dict) -> dict:
    tp_scores = [c["best_score"] for c in conversations if c.get("outcome") == "TP" and c.get("best_score")]
    fp_scores = [c["best_score"] for c in conversations if c.get("outcome") == "FP" and c.get("best_score")]

    if len(tp_scores) < 5 or len(fp_scores) < 5:
        return current

    mid = (sum(tp_scores) / len(tp_scores) + sum(fp_scores) / len(fp_scores)) / 2
    new_confident = min(0.85, max(0.65, mid + 0.10))
    new_uncertain = min(new_confident - 0.05, max(0.50, mid - 0.05))

    new_t = {"confident": round(new_confident, 3), "uncertain": round(new_uncertain, 3)}
    save_thresholds(new_t)
    print(f"[Thresholds] Optimisés → confident={new_confident:.3f} uncertain={new_uncertain:.3f}")
    return new_t


# ─────────────────────────────────────────────
#  PHASE 2 — SIMULATION LOT B (CORRIGÉE)
# ─────────────────────────────────────────────

def simulate_pipeline_on_batch(batch: list[dict]) -> dict:
    """
    Simule le pipeline complet sur Lot B.

    CORRECTION BUG PHASE 2 :
    expected = item["group_id"]  ← stable, sans hash
    predicted = extrait de best_resp.faq_source_id
      Format : "group_id_XXXX" → on split sur "_" et vérifie suffixe numérique
    Comparaison : predicted_group == expected_group
    """
    from llm_parser import parse_question, _keywords, _compute_domain_relevance
    from feature_encoder import encode
    from matching_engine import load_faq, find_candidates, candidates_to_response_objects
    from judge import evaluate_all, decide, load_weights
    from models import QuestionObject, Intent, Entity

    faq_items = load_faq()
    weights   = load_weights()

    INTENT_TO_ENTITY = {
        "reservation": "reservation", "annulation": "reservation",
        "paiement": "paiement", "compte": "compte",
        "trajet": "trajet", "conducteur": "trajet",
        "passager": "trajet", "vehicule": "vehicule",
        "signalement": "trajet", "litige": "trajet",
        "securite": "trajet", "notifications": "compte",
    }

    r = {
        "total": 0, "correct": 0, "wrong": 0, "unknown": 0,
        "fp_count": 0, "tp_count": 0,
        "kpi_fp_sum": defaultdict(float),
        "kpi_tp_sum": defaultdict(float),
        "score_spread_fp": [], "score_spread_tp": [],
        "zone_correct": defaultdict(int), "zone_wrong": defaultdict(int),
    }

    support_items = [d for d in batch if d.get("label") in
                     ("support", "support_variation", "support_synthetic")]

    for item in support_items:
        try:
            item_intent = item.get("intent", "incomprehensible")
            try:    intent = Intent(item_intent)
            except: intent = Intent.INCOMPREHENSIBLE
            try:    entity = Entity(INTENT_TO_ENTITY.get(item_intent, "aucun"))
            except: entity = Entity.AUCUN

            text = item["question"]
            qobj = QuestionObject(
                raw_text         = text,
                intent           = intent,
                entity           = entity,
                urgency_score    = 0.2,
                ambiguity_score  = 0.3 if item.get("label") == "support" else 0.5,
                domain_relevance = max(_compute_domain_relevance(text, intent), 0.85),
                keywords         = _keywords(text),
                is_small_talk    = False,
                is_out_of_scope  = False,
            )

            fv             = encode(qobj)
            candidates_raw = find_candidates(fv, faq_items, top_n=6)
            candidates     = candidates_to_response_objects(candidates_raw)
            all_scores     = evaluate_all(qobj, candidates, weights=weights)
            best_resp, zone = decide(all_scores, candidates)

            # ── Référence stable (group_id sans hash)
            expected_group = item.get("group_id") or item.get("expected_faq_id", "")
            r["total"] += 1
            spread = (all_scores[0].global_score - all_scores[1].global_score
                      if len(all_scores) >= 2 else 0.0)

            if zone == "UNKNOWN":
                r["unknown"] += 1
                r["zone_wrong"][zone] += 1
                continue

            if best_resp is None or not best_resp.faq_source_id:
                r["wrong"] += 1; r["fp_count"] += 1
                r["zone_wrong"][zone] += 1
                continue

            # ── Extraction group_id depuis faq_source_id
            # Format attendu : "group-id_NNNN" → split rsplit("_", 1)
            # Si le suffixe est bien numérique → parts[0] = group_id
            faq_src = best_resp.faq_source_id
            parts   = faq_src.rsplit("_", 1)
            predicted_group = parts[0] if (len(parts) == 2 and parts[1].isdigit()) else faq_src

            is_correct = (predicted_group == expected_group)
            kpi_list   = ["pertinence", "couverture_intention", "clarte",
                          "coherence", "proximite_faq", "historique_succes"]

            if is_correct:
                r["correct"] += 1; r["tp_count"] += 1
                r["zone_correct"][zone] += 1
                r["score_spread_tp"].append(spread)
                for s in all_scores[:1]:
                    for k in kpi_list: r["kpi_tp_sum"][k] += getattr(s, k, 0.0)
            else:
                r["wrong"] += 1; r["fp_count"] += 1
                r["zone_wrong"][zone] += 1
                r["score_spread_fp"].append(spread)
                for s in all_scores[:1]:
                    for k in kpi_list: r["kpi_fp_sum"][k] += getattr(s, k, 0.0)

        except Exception:
            continue

    total = r["total"]
    if total > 0:
        r["accuracy"]     = round(r["correct"] / total, 4)
        r["wrong_rate"]   = round(r["wrong"] / total, 4)
        r["unknown_rate"] = round(r["unknown"] / total, 4)
        if r["fp_count"] > 0:
            r["kpi_avg_fp"] = {k: round(v / r["fp_count"], 4) for k, v in r["kpi_fp_sum"].items()}
        if r["tp_count"] > 0:
            r["kpi_avg_tp"] = {k: round(v / r["tp_count"], 4) for k, v in r["kpi_tp_sum"].items()}

    return r


# ─────────────────────────────────────────────
#  JUDGE ADJUSTMENT
# ─────────────────────────────────────────────

def adjust_judge_from_audit(audit: dict, conversations: list[dict]) -> None:
    from judge import evolve_kpi_weights, load_weights, save_weights

    kpi_avg_fp = audit.get("kpi_avg_fp", {})
    kpi_avg_tp = audit.get("kpi_avg_tp", {})

    if not kpi_avg_fp or not kpi_avg_tp:
        print("[Judge] Pas assez de FP — évolution génétique directe")
        evolve_kpi_weights(conversations, generations=30, population=20, phase2_audit=audit)
        return

    weights  = load_weights()
    kpi_keys = ["pertinence", "couverture_intention", "clarte",
                "coherence", "proximite_faq", "historique_succes"]

    print("[Judge] Analyse KPI FP vs TP :")
    adjustments = {}
    for kpi in kpi_keys:
        diff = kpi_avg_fp.get(kpi, 0.5) - kpi_avg_tp.get(kpi, 0.5)
        if diff > 0.05:
            adjustments[kpi] = max(0.85, 1.0 - diff * 0.5)
        elif diff < -0.05:
            adjustments[kpi] = min(1.15, 1.0 + abs(diff) * 0.5)
        else:
            adjustments[kpi] = 1.0

    vec = weights.as_vector()
    for i, kpi in enumerate(kpi_keys):
        vec[i] *= adjustments.get(kpi, 1.0)
    weights.from_vector(vec)

    print("[Judge] Évolution génétique sur poids ajustés...")
    evolved = evolve_kpi_weights(conversations, generations=30, population=20, phase2_audit=audit)

    audit_log = []
    if os.path.exists(AUDIT_PATH):
        try:
            audit_log = json.load(open(AUDIT_PATH))
        except Exception:
            pass
    audit_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "accuracy":  audit.get("accuracy", 0.0),
        "wrong_rate": audit.get("wrong_rate", 0.0),
        "adjustments": adjustments,
        "kpi_after": evolved.as_vector(),
        "fitness": evolved.fitness_score,
    })
    with open(AUDIT_PATH, "w") as f:
        json.dump(audit_log[-30:], f, indent=2)


def prune_weak_faqs(metrics: dict) -> list[str]:
    with open(FAQ_PATH, "r", encoding="utf-8") as f:
        faq_list = json.load(f)

    deactivated = []
    for item in faq_list:
        faq_id = item.get("id", "")
        m      = metrics.get(faq_id, {})
        total  = m.get("TP", 0) + m.get("FP", 0) + m.get("FN", 0)
        if total >= 15 and m.get("f1", 1.0) < 0.25:
            item["active"] = False
            deactivated.append(faq_id)

    with open(FAQ_PATH, "w", encoding="utf-8") as f:
        json.dump(faq_list, f, ensure_ascii=False, indent=2)

    if deactivated:
        print(f"[Pruning] FAQ désactivées : {deactivated}")
    return deactivated


# ─────────────────────────────────────────────
#  LLM TRAINING — LANCEMENT EN THREAD (pas subprocess)
# ─────────────────────────────────────────────

def _run_llm_training_threaded(
    conversations:   list[dict],
    val_accuracy:    float,
    phase2_accuracy: float,
    force_camembert: bool = False,
) -> dict | None:
    """
    Lance llm_training dans un thread du process courant.

    THREADS vs SUBPROCESS sur Windows + PyTorch :
    ┌──────────────────────────────────────────────────────────────────┐
    │  multiprocessing.Process  → nouveau process → rechargement DLL  │
    │  → c10.dll déjà verrouillé par le parent → WinError 1114        │
    │                                                                  │
    │  threading.Thread         → même process → DLL déjà chargées    │
    │  → aucun rechargement → aucun conflit → fonctionne              │
    └──────────────────────────────────────────────────────────────────┘

    Le thread est BLOQUANT (join()) — le training loop attend sa fin.
    C'est intentionnel : pas de concurrence entre les phases.
    """
    if not _TORCH_AVAILABLE:
        print("[LLM Thread] PyTorch non disponible — skip")
        return None

    result_holder = [None]
    error_holder  = [None]

    def _worker():
        try:
            from llm_training import run_llm_training
            result_holder[0] = run_llm_training(
                conversations=conversations,
                phase2_accuracy=phase2_accuracy,
                val_accuracy=val_accuracy,
                force_camembert=force_camembert,
            )
        except Exception as e:
            error_holder[0] = e
            import traceback; traceback.print_exc()

    t = threading.Thread(target=_worker, name="llm-training", daemon=True)
    t.start()
    t.join()  # Bloquant — attend la fin

    if error_holder[0]:
        raise error_holder[0]
    return result_holder[0]


# ─────────────────────────────────────────────
#  TRAINING LOOP PRINCIPAL v2.1
# ─────────────────────────────────────────────

def run_training_loop():
    from conversation_cache import load_recent_compressed, batch_cleanup

    start = datetime.utcnow()
    log   = {"timestamp": start.isoformat(), "steps": [], "version": "2.1"}

    print(f"\n{'='*60}")
    print(f"[Training Loop] Démarrage v2.1 — {start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  PyTorch disponible : {_TORCH_AVAILABLE}")
    print(f"{'='*60}")

    # ── 0 : Sync FAQ
    from faq_client import fetch_faq_from_server
    print("[0] Sync FAQ...")
    try:
        fresh = fetch_faq_from_server()
        if fresh:
            if isinstance(fresh, dict): fresh = [fresh]
            valid = [g for g in fresh
                     if isinstance(g, dict) and "id" in g
                     and "items" in g and isinstance(g["items"], list)]
            for g in valid:
                if "intent" not in g:
                    import unicodedata
                    from faq_client import CATEGORIE_TO_INTENT
                    cat_n = "".join(
                        c for c in unicodedata.normalize("NFD",
                            g.get("categorie", g.get("id", "")).lower())
                        if unicodedata.category(c) != "Mn"
                    )
                    g["intent"] = next(
                        (v for k, v in CATEGORIE_TO_INTENT.items() if k in cat_n),
                        "incomprehensible"
                    )
            if valid:
                with open(FAQ_PATH, "w", encoding="utf-8") as f:
                    json.dump(valid, f, ensure_ascii=False, indent=2)
                print(f"[0] {len(valid)} groupes FAQ synchronisés ✓")
            else:
                print("[0] ⚠ Aucun groupe valide reçu — FAQ locale conservée")
    except Exception as e:
        print(f"[0] Sync échouée : {e} — FAQ locale utilisée")

    # ── 1 : Conversations réelles
    conversations = load_recent_compressed(limit=2000)
    print(f"[1] {len(conversations)} conversations réelles chargées")

    # ── 2 : Métriques
    metrics = compute_faq_metrics(conversations)
    save_metrics(metrics)
    print(f"[2] Métriques calculées pour {len(metrics)} FAQ")

    # ── 3 : Dataset
    print("[3] Génération dataset...")
    full_dataset = generate_full_dataset()
    lot_a, lot_b = split_50_50(full_dataset)
    print(f"[3] Dataset: {len(full_dataset)} total | Lot A={len(lot_a)} | Lot B={len(lot_b)}")
    log["steps"].append({"step": "dataset", "total": len(full_dataset),
                          "lot_a": len(lot_a), "lot_b": len(lot_b)})

    # ══════════════════════════════════════════
    #  PHASE 1 — RF
    # ══════════════════════════════════════════
    print(f"\n[PHASE 1] Apprentissage RF sur Lot A")
    lot_a_e            = darwin_select(lot_a, metrics)
    train_data, val_data = split_75_25(lot_a_e)
    print(f"  Lot A évolué: {len(lot_a_e)} | Train={len(train_data)} | Val={len(val_data)}")

    retrained, val_accuracy = train_rf_phase1(train_data, val_data, conversations, metrics)
    log["steps"].append({"step": "rf_phase1", "success": retrained, "val_accuracy": val_accuracy})

    new_thresholds = optimize_thresholds(conversations, val_data, load_thresholds())
    log["steps"].append({"step": "threshold_opt", "thresholds": new_thresholds})

    # ══════════════════════════════════════════
    #  PHASE 1b — LLM TRAINING (THREAD)
    # ══════════════════════════════════════════
    print(f"\n[PHASE 1b] LLM Training — thread (safe Windows DLL)")
    if _TORCH_AVAILABLE:
        try:
            llm_r = _run_llm_training_threaded(
                conversations=conversations,
                val_accuracy=val_accuracy,
                phase2_accuracy=0.0,
            )
            if llm_r:
                log["steps"].append({
                    "step":     "llm_training",
                    "camembert": llm_r.get("camembert", {}),
                    "sentence":  llm_r.get("sentence", {}),
                    "svm":       llm_r.get("svm", {}),
                    "duration":  llm_r.get("duration_seconds", 0),
                })
                print(f"[PHASE 1b] ✓ — {llm_r.get('duration_seconds', 0):.1f}s")
        except Exception as e:
            print(f"[PHASE 1b] ⚠ LLM Training échoué : {e}")
            log["steps"].append({"step": "llm_training", "error": str(e)})
    else:
        print("[PHASE 1b] skippé — PyTorch non disponible")
        log["steps"].append({"step": "llm_training", "skipped": "torch_unavailable"})

    # ══════════════════════════════════════════
    #  PHASE 2 — AUDIT LOT B
    # ══════════════════════════════════════════
    print(f"\n[PHASE 2] Audit sur Lot B ({len(lot_b)} exemples jamais vus)")
    audit      = simulate_pipeline_on_batch(lot_b)
    accuracy   = audit.get("accuracy", 0.0)
    wrong_rate = audit.get("wrong_rate", 0.0)

    print(f"  Accuracy Lot B : {accuracy:.1%}")
    print(f"  Wrong rate     : {wrong_rate:.1%}")
    print(f"  Unknown rate   : {audit.get('unknown_rate', 0.0):.1%}")
    print(f"  TP={audit.get('tp_count',0)} | FP={audit.get('fp_count',0)}")

    log["steps"].append({"step": "phase2_audit", "accuracy": accuracy, "wrong_rate": wrong_rate})

    adjust_judge_from_audit(audit, conversations)
    log["steps"].append({"step": "judge_adjustment"})

    # Re-tuning LLM si perf faible et torch dispo
    if _TORCH_AVAILABLE and accuracy < 0.55 and wrong_rate > 0.35:
        print(f"\n[POST] Re-tuning LLM (acc={accuracy:.1%} < 55%)")
        try:
            _run_llm_training_threaded(
                conversations=conversations,
                val_accuracy=val_accuracy,
                phase2_accuracy=accuracy,
                force_camembert=False,
            )
        except Exception as e:
            print(f"[POST] Re-tuning échoué : {e}")

    # ── Pruning + Reload + Purge
    deactivated = prune_weak_faqs(metrics)
    log["steps"].append({"step": "pruning", "deactivated": deactivated})
    print(f"\n[Pruning] {len(deactivated)} FAQ désactivées")

    if retrained:
        try:
            import httpx
            httpx.post("http://localhost:8001/reload", timeout=5.0)
            print("[Reload] CamemBERT rechargé ✓")
        except Exception:
            pass

    batch_cleanup()

    # ── Log final
    duration = (datetime.utcnow() - start).total_seconds()
    log.update({
        "duration_seconds": duration,
        "status":           "completed",
        "phase2_accuracy":  accuracy,
        "val_accuracy":     val_accuracy,
    })

    existing = []
    if os.path.exists(LOG_PATH):
        try: existing = json.load(open(LOG_PATH))
        except Exception: pass
    existing.append(log)
    with open(LOG_PATH, "w") as f:
        json.dump(existing[-30:], f, ensure_ascii=False, indent=2)

    print(f"\n[Training Loop] ✓ Complété en {duration:.1f}s")
    print(f"  Phase 1 val accuracy   : {val_accuracy:.1%}")
    print(f"  Phase 2 lot B accuracy : {accuracy:.1%}")
    if val_accuracy > 0 and accuracy < val_accuracy - 0.10:
        print(f"  ⚠ Écart = {val_accuracy - accuracy:.1%} — possible surapprentissage")
    print(f"{'='*60}\n")


# ─────────────────────────────────────────────
#  SCHEDULER
# ─────────────────────────────────────────────

def start_scheduler(interval_hours: float = 6.0):
    print(f"[Scheduler] Training Loop v2.1 — intervalle {interval_hours}h")
    while True:
        try:
            run_training_loop()
        except Exception as e:
            print(f"[Scheduler] ⚠ Erreur : {e}")
            import traceback; traceback.print_exc()
        print(f"[Scheduler] Prochaine exécution dans {interval_hours}h...")
        time.sleep(interval_hours * 3600)


if __name__ == "__main__":
    run_training_loop()
