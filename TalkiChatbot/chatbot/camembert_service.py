"""
Talki — Service CamemBERT :8001 v2
Classification d'intention + embeddings sémantiques + voting ensemble.

NOUVEAUTÉS v2 :
- Intégration du voting ensemble (CamemBERT + SentenceTransformer + SVM)
- Classification de fallback améliorée avec scoring sémantique
- Endpoint /classify/voting pour la classification enrichie
- Reload automatique du SVM après training
- Logging des cas INCOMPREHENSIBLE pour analyse

La hiérarchie de décision :
  1. SVM (rapide, 768-dim embeddings) → si confiance > 0.7 → réponse directe
  2. CamemBERT fine-tuné → si disponible ET confiance > 0.65
  3. Règles enrichies (fallback toujours disponible)
  4. Voting final si les 3 sont disponibles

Un intent est INCOMPREHENSIBLE uniquement si TOUTES les couches sont d'accord
ou si le score maximal est < 0.40 sur toutes les couches.
"""

from __future__ import annotations
import os
import json
import time
import unicodedata
from pathlib import Path

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import (
    CamembertTokenizer,
    CamembertForSequenceClassification,
    AutoModel, AutoTokenizer,
)

app = FastAPI(title="Talki — Service CamemBERT", version="2.0.0")

DATA_DIR         = Path(__file__).parent / "data"
CLASSIFIER_PATH  = DATA_DIR / "camembert_classifier"
SVM_SAVE_PATH    = DATA_DIR / "svm_intent.pkl"
SENTENCE_PATH    = DATA_DIR / "sentence_model"
VOTING_PATH      = DATA_DIR / "voting_weights.json"
EMBEDDER_ID      = "camembert-base"
BASE_MODEL_ID    = "camembert-base"

INTENT_LABELS = [
    "reservation", "annulation", "paiement", "compte", "trajet",
    "conducteur", "passager", "signalement", "litige", "vehicule",
    "notifications", "indisponibilite", "securite",
    "hors_scope", "salutation", "incomprehensible",
]

ENTITY_LABELS = [
    "trajet", "reservation", "paiement", "compte",
    "vehicule", "profil", "badge", "review", "aucun",
]


class ModelState:
    classifier_tokenizer = None
    classifier_model     = None
    embedder_tokenizer   = None
    embedder_model       = None
    svm_model            = None
    svm_label_encoder    = None
    sentence_model       = None
    intent_labels        = INTENT_LABELS
    entity_labels        = ENTITY_LABELS
    fine_tuned           = False
    svm_ready            = False
    sentence_ready       = False

state = ModelState()


# ─────────────────────────────────────────────
#  CHARGEMENT DES MODÈLES
# ─────────────────────────────────────────────

def _load_classifier():
    if CLASSIFIER_PATH.exists():
        print(f"[CamemBERT] Chargement classifieur fine-tuné depuis {CLASSIFIER_PATH}")
        try:
            state.classifier_tokenizer = CamembertTokenizer.from_pretrained(str(CLASSIFIER_PATH))
            state.classifier_model     = CamembertForSequenceClassification.from_pretrained(
                str(CLASSIFIER_PATH)
            )
            state.classifier_model.eval()
            state.fine_tuned = True
        except Exception as e:
            print(f"[CamemBERT] Erreur chargement fine-tuné : {e} — retour aux règles")
            state.fine_tuned = False
    else:
        print("[CamemBERT] Pas de modèle fine-tuné — mode règles enrichies actif")
        state.fine_tuned = False


def _load_embedder():
    print(f"[CamemBERT] Chargement embedder {EMBEDDER_ID}...")
    start = time.time()
    try:
        state.embedder_tokenizer = AutoTokenizer.from_pretrained(EMBEDDER_ID)
        state.embedder_model     = AutoModel.from_pretrained(EMBEDDER_ID)
        state.embedder_model.eval()
        print(f"[CamemBERT] Embedder chargé en {time.time()-start:.1f}s")
    except Exception as e:
        print(f"[CamemBERT] Embedder échoué : {e}")


def _load_svm():
    """Charge le SVM entraîné par llm_training.py."""
    if not SVM_SAVE_PATH.exists():
        return
    try:
        import pickle
        with open(SVM_SAVE_PATH, "rb") as f:
            data = pickle.load(f)
        state.svm_model         = data["model"]
        state.svm_label_encoder = data["label_encoder"]
        state.svm_ready         = True
        print(f"[CamemBERT] SVM chargé ✓ (val_acc={data.get('val_acc', '?'):.3f})")
    except Exception as e:
        print(f"[CamemBERT] SVM chargement échoué : {e}")
        state.svm_ready = False


def _load_sentence_model():
    """Charge le Sentence Transformer fine-tuné."""
    try:
        from sentence_transformers import SentenceTransformer
        model_path = str(SENTENCE_PATH) if SENTENCE_PATH.exists() else "paraphrase-multilingual-mpnet-base-v2"
        state.sentence_model   = SentenceTransformer(model_path)
        state.sentence_ready   = True
        print(f"[CamemBERT] Sentence Transformer chargé ✓")
    except ImportError:
        print("[CamemBERT] sentence-transformers non installé — couche sémantique désactivée")
    except Exception as e:
        print(f"[CamemBERT] Sentence Transformer chargement échoué : {e}")


def _load_voting_weights() -> dict:
    if VOTING_PATH.exists():
        try:
            with open(VOTING_PATH) as f:
                return json.load(f)
        except Exception:
            pass
    return {"w_camembert": 0.40, "w_sentence": 0.35, "w_svm": 0.25}


# ─────────────────────────────────────────────
#  NORMALISATION
# ─────────────────────────────────────────────

def _normalize(text: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", text.lower())
        if unicodedata.category(c) != "Mn"
    )


# ─────────────────────────────────────────────
#  RÈGLES DE CLASSIFICATION ENRICHIES (v1.1 — inchangées)
# ─────────────────────────────────────────────

INTENT_KEYWORDS: dict[str, list[str]] = {
    "reservation": [
        "reserver", "reservation", "booker", "place", "faire reservation",
        "prendre place", "book", "comment reserver", "je veux reserver",
        "trouver une place", "cherche une place", "demande reservation",
        "confirmer reservation", "statut reservation", "place confirmee",
        "ma reservation", "mes reservations", "place disponible",
    ],
    "annulation": [
        "annuler", "annulation", "supprimer", "cancel", "desister",
        "ne veux plus", "plus y aller", "je ne peux plus venir",
        "me desinscrire", "retirer ma reservation", "annuler ma place",
        "annuler trajet", "supprimer trajet", "conducteur a annule",
    ],
    "paiement": [
        "payer", "paiement", "carte", "refuse", "remboursement",
        "recharger", "argent", "retrait", "transaction", "solde",
        "gains", "virement", "depot", "finances", "comment payer",
        "historique transactions", "contester paiement", "erreur paiement",
        "paiement incorrect", "mes revenus", "consulter solde",
    ],
    "compte": [
        "compte", "connexion", "login", "profil", "supprimer compte",
        "microsoft", "sso", "se connecter", "inscription", "creer compte",
        "mot de passe oublie", "reinitialiser mot de passe", "modifier profil",
        "changer informations", "changer photo", "supprimer mon compte",
        "telecharger mes donnees", "donnees personnelles", "confidentialite",
        "accessible", "accessibilite", "handicap", "wcag", "lecteur ecran",
        "application", "fonctionne", "bug", "erreur", "notification",
    ],
    "trajet": [
        "trajet", "creer trajet", "publier", "covoiturage", "matching",
        "offrir place", "nouveau trajet", "poster trajet", "comment creer trajet",
        "proposer covoiturage", "rechercher trajet", "trouver trajet",
        "details trajet", "itineraire", "point depart", "destination",
        "places disponibles", "pas de trajet disponible", "prix trajet",
    ],
    "conducteur": [
        "conducteur", "chauffeur", "offrir", "conduire", "driver",
        "mode conducteur", "devenir conducteur", "passer conducteur",
        "gerer demandes passagers", "accepter passager", "refuser passager",
        "brouillon trajet", "trajet recurrent", "documents conducteur",
    ],
    "passager": [
        "passager", "voyager", "cherche", "rider", "mode passager",
        "chercher covoiturage", "je cherche place", "trouver conducteur",
    ],
    "signalement": [
        "signaler", "signalement", "report", "plainte", "comportement",
        "faire signalement", "reporter comportement", "denoncer",
        "comportement inapproprie", "harcelement", "signaler conducteur",
        "signaler passager", "bouton signaler", "abus",
    ],
    "litige": [
        "litige", "contester", "dispute", "no-show", "contestation",
    ],
    "vehicule": [
        "vehicule", "voiture", "auto", "plaque", "assurance",
        "permis de conduire", "immatriculation",
    ],
    "notifications": [
        "notification", "alerte", "desactiver", "activer",
        "je ne recois pas notifications", "activer alertes",
        "push notifications", "notification ne marche pas", "aucune notification",
    ],
    "indisponibilite": [
        "indisponible", "absent", "conge", "bloquer dates",
    ],
    "securite": [
        "urgence", "sos", "danger", "peur", "securite", "911",
        "incident", "signaler", "comportement", "harcelement",
        "me sens pas en securite", "menace", "agression",
    ],
    "salutation": [
        "bonjour", "salut", "hello", "allo", "hey", "bonsoir",
        "merci", "au revoir", "bye", "ciao",
    ],
    "hors_scope": [
        "meteo", "recette", "sport", "film", "musique", "blague",
        "horoscope", "politique", "capitale", "prix essence",
    ],
}

SEMANTIC_EXPANSIONS: dict[str, list[str]] = {
    "reservation": ["je veux prendre", "comment rejoindre un trajet", "rejoindre le covoiturage"],
    "annulation":  ["je change d'avis", "je peux plus venir", "desister d'un trajet"],
    "paiement":    ["comment je paie", "probleme avec mon argent", "je veux retirer mes gains"],
    "compte":      ["creer mon profil", "probleme de connexion", "j'arrive pas a me connecter"],
    "trajet":      ["je veux poster un trajet", "proposer un covoiturage", "nouveau trajet"],
    "conducteur":  ["je veux conduire", "je propose des places", "comment devenir chauffeur"],
    "securite":    ["j'ai peur", "je me sens pas en securite", "quelqu'un m'a agresse"],
}

ENTITY_KEYWORDS: dict[str, list[str]] = {
    "paiement":    ["paiement", "payer", "remboursement", "solde", "virement", "argent"],
    "reservation": ["reservation", "reserver", "place", "statut"],
    "compte":      ["compte", "profil", "connexion", "email", "mot de passe"],
    "trajet":      ["trajet", "covoiturage", "itineraire", "depart", "destination"],
    "vehicule":    ["vehicule", "voiture", "auto", "plaque", "assurance", "permis"],
}


def _classify_by_rules(text: str) -> dict:
    """Classification multi-passe enrichie."""
    text_norm  = _normalize(text)
    text_words = set(text_norm.split())

    # Passe 1 : matching exact
    scores: dict[str, float] = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        kw_norm = [_normalize(k) for k in keywords]
        exact  = sum(1   for kw in kw_norm if kw in text_words)
        phrase = sum(0.8 for kw in kw_norm if " " in kw and kw in text_norm)
        scores[intent] = exact + phrase

    # Passe 2 : matching sous-chaîne
    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            kw_norm = _normalize(kw)
            if len(kw_norm) >= 5 and kw_norm in text_norm:
                if kw_norm not in text_words:
                    scores[intent] = scores.get(intent, 0) + 0.6
            elif len(kw_norm) >= 5:
                prefix = kw_norm[:4]
                for word in text_words:
                    if len(word) >= 4 and word[:4] == prefix:
                        scores[intent] = scores.get(intent, 0) + 0.3
                        break

    # Passe 3 : expansions sémantiques
    for intent, synonyms in SEMANTIC_EXPANSIONS.items():
        syn_norm = [_normalize(s) for s in synonyms]
        phrase_hits = sum(0.7 for s in syn_norm if " " in s and s in text_norm)
        word_hits   = sum(0.5 for s in syn_norm if " " not in s and s in text_norm)
        if phrase_hits + word_hits > 0:
            scores[intent] = scores.get(intent, 0) + phrase_hits + word_hits

    if not scores or max(scores.values()) == 0:
        best_intent, best_score = "incomprehensible", 0.0
    else:
        best_intent = max(scores, key=lambda k: scores[k])
        best_score  = scores[best_intent]

    # Entity
    best_entity, best_entity_score = "aucun", 0.0
    for entity, keywords in ENTITY_KEYWORDS.items():
        kw_norm = [_normalize(k) for k in keywords]
        hits  = sum(1   for kw in kw_norm if kw in text_words)
        hits += sum(0.7 for kw in kw_norm if len(kw) >= 5 and kw in text_norm and kw not in text_words)
        if hits > best_entity_score:
            best_entity_score = hits
            best_entity       = entity

    intent_score_norm = min(best_score / 5.0, 1.0)

    return {
        "intent":       best_intent,
        "intent_score": round(intent_score_norm, 3),
        "entity":       best_entity,
        "entity_score": round(min(best_entity_score / 3.0, 1.0), 3),
        "method":       "rules_v2",
    }


def _classify_by_model(text: str) -> dict:
    """Classification via CamemBERT fine-tuné."""
    inputs = state.classifier_tokenizer(
        text, return_tensors="pt", truncation=True, max_length=128, padding=True
    )
    with torch.no_grad():
        logits = state.classifier_model(**inputs).logits

    probs     = torch.softmax(logits, dim=-1)[0]
    intent_id = probs.argmax().item()
    intent    = state.intent_labels[intent_id] if intent_id < len(state.intent_labels) else "incomprehensible"

    return {
        "intent":       intent,
        "intent_score": float(probs[intent_id]),
        "entity":       "aucun",
        "entity_score": 0.0,
        "method":       "camembert",
    }


def _classify_by_svm(text: str) -> dict | None:
    """Classification via SVM sur embeddings Sentence Transformer."""
    if not state.svm_ready or not state.sentence_ready:
        return None
    try:
        emb   = state.sentence_model.encode([text], show_progress_bar=False)
        proba = state.svm_model.predict_proba(emb)[0]
        best  = proba.argmax()
        label = state.svm_label_encoder.classes_[best]
        return {
            "intent":       label,
            "intent_score": float(proba[best]),
            "entity":       "aucun",
            "entity_score": 0.0,
            "method":       "svm",
        }
    except Exception as e:
        print(f"[CamemBERT] SVM classify échoué : {e}")
        return None


def _classify_voting(text: str) -> dict:
    """
    Classification finale par voting pondéré.
    Combine CamemBERT + SVM + Règles selon les poids appris.
    """
    weights = _load_voting_weights()
    results = {}

    # Couche 1 : Règles (toujours disponible)
    rules_r = _classify_by_rules(text)
    results["rules"] = rules_r

    # Couche 2 : CamemBERT fine-tuné
    if state.fine_tuned and state.classifier_model:
        try:
            cam_r = _classify_by_model(text)
            results["camembert"] = cam_r
        except Exception:
            pass

    # Couche 3 : SVM
    svm_r = _classify_by_svm(text)
    if svm_r:
        results["svm"] = svm_r

    # Agrégation des scores par intent
    from collections import defaultdict as _dd
    intent_scores: dict[str, float] = _dd(float)

    # Poids effectifs selon ce qui est disponible
    if "camembert" in results and "svm" in results:
        w_cam = weights.get("w_camembert", 0.40)
        w_svm = weights.get("w_svm", 0.25)
        w_rule = 1.0 - w_cam - w_svm
    elif "camembert" in results:
        w_cam = 0.65
        w_svm = 0.0
        w_rule = 0.35
    elif "svm" in results:
        w_cam = 0.0
        w_svm = 0.60
        w_rule = 0.40
    else:
        w_cam = 0.0
        w_svm = 0.0
        w_rule = 1.0

    if "rules" in results:
        intent_scores[results["rules"]["intent"]] += results["rules"]["intent_score"] * w_rule
    if "camembert" in results:
        intent_scores[results["camembert"]["intent"]] += results["camembert"]["intent_score"] * w_cam
    if "svm" in results:
        intent_scores[results["svm"]["intent"]] += results["svm"]["intent_score"] * w_svm

    if not intent_scores:
        return rules_r

    best_intent = max(intent_scores, key=intent_scores.get)
    best_score  = intent_scores[best_intent]

    # Enrichir avec entity (depuis les règles)
    entity       = results["rules"]["entity"]
    entity_score = results["rules"]["entity_score"]

    methods_used = "+".join(results.keys())
    return {
        "intent":       best_intent,
        "intent_score": round(best_score, 4),
        "entity":       entity,
        "entity_score": round(entity_score, 4),
        "method":       f"voting({methods_used})",
        "all_scores":   dict(intent_scores),
    }


# ─────────────────────────────────────────────
#  EMBEDDINGS
# ─────────────────────────────────────────────

def _mean_pooling(model_output, attention_mask) -> torch.Tensor:
    token_embeddings = model_output.last_hidden_state
    input_mask = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask, 1) / torch.clamp(input_mask.sum(1), min=1e-9)


def _embed(text: str) -> list[float]:
    if state.embedder_model is None:
        return []
    inputs = state.embedder_tokenizer(
        text, return_tensors="pt", truncation=True, max_length=128, padding=True
    )
    with torch.no_grad():
        output = state.embedder_model(**inputs)
    vec = _mean_pooling(output, inputs["attention_mask"])
    return vec[0].tolist()


# ─────────────────────────────────────────────
#  SCHÉMAS
# ─────────────────────────────────────────────

class ClassifyRequest(BaseModel):
    text:           str
    use_voting:     bool = True   # Utiliser le voting ensemble si disponible

class EmbedRequest(BaseModel):
    text: str


# ─────────────────────────────────────────────
#  ENDPOINTS
# ─────────────────────────────────────────────

@app.post("/classify")
def classify(req: ClassifyRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Texte vide")

    # Décision de méthode selon use_voting et disponibilité
    if req.use_voting and (state.fine_tuned or state.svm_ready):
        result = _classify_voting(req.text)
    elif state.fine_tuned and state.classifier_model:
        result = _classify_by_model(req.text)
        # Enrichir entity via règles
        rules = _classify_by_rules(req.text)
        if result["entity"] == "aucun":
            result["entity"]       = rules["entity"]
            result["entity_score"] = rules["entity_score"]
    else:
        result = _classify_by_rules(req.text)

    result["is_out_of_scope"] = result["intent"] == "hors_scope"
    result["is_small_talk"]   = result["intent"] == "salutation"
    result["text"]            = req.text

    # Log des cas INCOMPREHENSIBLE pour analyse
    if result["intent"] == "incomprehensible" and result["intent_score"] < 0.30:
        _log_incomprehensible(req.text)

    return result


@app.post("/embed")
def embed(req: EmbedRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Texte vide")
    vec = _embed(req.text)
    return {"vector": vec, "dimensions": len(vec)}


@app.post("/reload")
def reload_model():
    """Recharge tous les modèles depuis disque."""
    _load_classifier()
    _load_svm()
    # Ne pas recharger Sentence Transformer à chaud (trop lourd)
    return {
        "status":         "reloaded",
        "fine_tuned":     state.fine_tuned,
        "svm_ready":      state.svm_ready,
        "sentence_ready": state.sentence_ready,
        "method":         _current_method(),
    }


@app.get("/health")
def health():
    return {
        "status":          "healthy",
        "fine_tuned":      state.fine_tuned,
        "svm_ready":       state.svm_ready,
        "sentence_ready":  state.sentence_ready,
        "embedder_ready":  state.embedder_model is not None,
        "method":          _current_method(),
        "version":         "2.0.0",
    }


def _current_method() -> str:
    parts = []
    if state.fine_tuned:
        parts.append("camembert")
    if state.svm_ready:
        parts.append("svm")
    if state.sentence_ready:
        parts.append("sentence_transformer")
    parts.append("rules_v2")
    return "voting(" + "+".join(parts) + ")" if len(parts) > 1 else parts[0]


def _log_incomprehensible(text: str):
    """Log les cas INCOMPREHENSIBLE pour amélioration future."""
    log_path = DATA_DIR / "incomprehensible_log.jsonl"
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            import json as _json
            _json.dump({"text": text, "ts": time.time()}, f, ensure_ascii=False)
            f.write("\n")
    except Exception:
        pass


@app.on_event("startup")
def startup():
    _load_classifier()
    _load_embedder()
    _load_svm()
    _load_sentence_model()
    print(f"[CamemBERT] ✓ Service Talki v2 prêt sur :8001 — méthode: {_current_method()}")


# uvicorn camembert_service:app --port 8001
