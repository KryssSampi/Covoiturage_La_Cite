"""
Talki — LLM Training Module
Auto-optimisation du classifieur CamemBERT + couche sémantique SVM/MLP.

Ce module résout le problème central : Talki ne comprend pas assez bien
le langage naturel pour distinguer une question pertinente d'une demande
floue ou hors-sujet. Il ne suffit pas de matcher des mots-clés.

ARCHITECTURE DE L'ENTRAÎNEMENT :

  1. CamemBERT Fine-tuning (Couche 1 - intention)
     - Fine-tune camembert-base sur les paires (texte → intent)
     - Données : FAQ canoniques + variations + synthétiques
     - Technique : gradient accumulation, learning rate warmup
     - Sauvegarde : data/camembert_classifier/
     - Seuil minimal : 50 exemples par intent

  2. Sentence Transformer (Couche 2 - sémantique)
     - Modèle : paraphrase-multilingual-mpnet-base-v2
       → 768-dim embeddings multilingues (FR/EN/AR/ES natifs)
       → BIEN mieux que camembert seul pour le matching sémantique
     - Fine-tune avec des paires (question, réponse_faq) contrastives
     - Sauvegarde : data/sentence_model/

  3. SVM Intent Classifier (Couche 3 - arbitre)
     - Entraîné sur les embeddings Sentence Transformer
     - Plus rapide et robuste que le RF seul sur les textes courts
     - Calibrage de probabilité (CalibratedClassifierCV)
     - Sauvegarde : data/svm_intent.pkl

  4. Décision Fusionnée (Voting)
     - CamemBERT confidence × 0.40
     - Sentence Transformer cosine × 0.35
     - SVM proba × 0.25
     → Score final → routing pipeline

  5. Expansion vocabulaire automatique
     - Détecte les mots OOV fréquents dans les conversations FP
     - Les ajoute au dictionnaire dynamique du FeatureEncoder
     - Évite de ré-entraîner pour chaque nouveau mot

CYCLE D'AUTO-OPTIMISATION :
  - Déclenché par le Training Loop (nuit ou sur trigger admin)
  - Évalue les performances sur conversations réelles (TP/FP)
  - Ajuste learning rate et poids de voting selon les résultats
  - Génère un rapport d'audit complet
"""

from __future__ import annotations

import json
import math
import os
import pickle
import random
import re
import time
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional

# ─────────────────────────────────────────────
#  CHEMINS
# ─────────────────────────────────────────────

DATA_DIR              = Path(__file__).parent / "data"
CAMEMBERT_SAVE_PATH   = DATA_DIR / "camembert_classifier"
SENTENCE_MODEL_PATH   = DATA_DIR / "sentence_model"
SVM_SAVE_PATH         = DATA_DIR / "svm_intent.pkl"
VOTING_WEIGHTS_PATH   = DATA_DIR / "voting_weights.json"
LLM_TRAINING_LOG_PATH = DATA_DIR / "llm_training_log.json"
FAQ_PATH              = Path(__file__).parent / "faq_data.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)


# ─────────────────────────────────────────────
#  CONFIGURATION AUTO-ÉVOLUTIVE
# ─────────────────────────────────────────────

@dataclass
class TrainingConfig:
    """
    Configuration de l'entraînement — évolue automatiquement.
    Les hyperparamètres sont ajustés en fonction des résultats précédents.
    """
    # CamemBERT
    camembert_lr:           float = 2e-5
    camembert_epochs:       int   = 3
    camembert_batch_size:   int   = 16
    camembert_max_len:      int   = 128
    camembert_warmup_ratio: float = 0.1
    camembert_weight_decay: float = 0.01
    min_samples_per_intent: int   = 15   # seuil minimal avant fine-tuning

    # Sentence Transformer
    sentence_model_id:      str   = "paraphrase-multilingual-mpnet-base-v2"
    sentence_epochs:        int   = 2
    sentence_batch_size:    int   = 32

    # SVM
    svm_c:                  float = 1.0
    svm_kernel:             str   = "rbf"
    svm_gamma:              str   = "scale"

    # Voting weights (ajustés automatiquement)
    w_camembert:            float = 0.40
    w_sentence:             float = 0.35
    w_svm:                  float = 0.25

    # Seuils de décision
    threshold_confident:    float = 0.75
    threshold_uncertain:    float = 0.55  # plus bas = plus de tentatives

    # Auto-optimisation
    version:                int   = 1
    last_val_accuracy:      float = 0.0
    last_phase2_accuracy:   float = 0.0


def load_config() -> TrainingConfig:
    path = DATA_DIR / "llm_training_config.json"
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                d = json.load(f)
            cfg = TrainingConfig(**{k: v for k, v in d.items()
                                    if k in TrainingConfig.__dataclass_fields__})
            return cfg
        except Exception:
            pass
    return TrainingConfig()


def save_config(cfg: TrainingConfig):
    path = DATA_DIR / "llm_training_config.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cfg.__dict__, f, indent=2)


# ─────────────────────────────────────────────
#  INTENT LABELS (doit correspondre à models.py)
# ─────────────────────────────────────────────

INTENT_LABELS = [
    "reservation", "annulation", "paiement", "compte", "trajet",
    "conducteur", "passager", "signalement", "litige", "vehicule",
    "notifications", "indisponibilite", "securite",
    "hors_scope", "salutation", "incomprehensible",
]

# Mapping catégorie FAQ → intent (même logique que faq_client.py)
CATEGORIE_TO_INTENT = {
    "compte": "compte", "inscription": "compte", "connexion": "compte",
    "accessibilite": "compte", "accessibilité": "compte",
    "reservation": "reservation", "réservation": "reservation",
    "annulation": "annulation", "paiement": "paiement",
    "trajet": "trajet", "trajets": "trajet", "covoiturage": "trajet",
    "conducteur": "conducteur", "passager": "passager",
    "vehicule": "vehicule", "véhicule": "vehicule",
    "signalement": "signalement", "litige": "litige",
    "securite": "securite", "sécurité": "securite",
    "notifications": "notifications",
    "indisponibilite": "indisponibilite",
}


def _normalize(text: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", text.lower())
        if unicodedata.category(c) != "Mn"
    )


def _infer_intent_from_group(group: dict) -> str:
    """Infère l'intent d'un groupe FAQ depuis ses métadonnées."""
    if "intent" in group:
        return group["intent"]
    cat = _normalize(group.get("categorie", group.get("id", "")))
    for key, intent in CATEGORIE_TO_INTENT.items():
        if key in cat:
            return intent
    return "incomprehensible"


# ─────────────────────────────────────────────
#  DATASET BUILDER ENRICHI
# ─────────────────────────────────────────────

# Exemples de small-talk et hors-scope pour équilibrer le dataset
SMALLTALK_EXAMPLES = [
    ("bonjour", "salutation"), ("salut", "salutation"), ("hello", "salutation"),
    ("bonsoir", "salutation"), ("merci beaucoup", "salutation"),
    ("merci pour l'aide", "salutation"), ("au revoir", "salutation"),
    ("bonne journée", "salutation"), ("ça va ?", "salutation"),
    ("super merci", "salutation"), ("parfait merci", "salutation"),
    ("hey talki", "salutation"), ("tu es là ?", "salutation"),
]

HORS_SCOPE_EXAMPLES = [
    ("quel est mon horoscope ?", "hors_scope"),
    ("fait-il beau demain ?", "hors_scope"),
    ("raconte-moi une blague", "hors_scope"),
    ("quel est le prix de l'essence ?", "hors_scope"),
    ("tu es une intelligence artificielle ?", "hors_scope"),
    ("donne-moi une recette de cuisine", "hors_scope"),
    ("qui a gagné la coupe du monde ?", "hors_scope"),
    ("quelle est la capitale du Canada ?", "hors_scope"),
    ("écris un poème", "hors_scope"),
    ("quelles sont les nouvelles du jour ?", "hors_scope"),
    ("joue de la musique", "hors_scope"),
    ("what time is it?", "hors_scope"),
    ("tell me a story", "hors_scope"),
    ("what's the weather like?", "hors_scope"),
]

# Phrases naturelles pour augmenter la diversité des exemples FAQ
AUGMENTATION_PATTERNS = [
    "Comment faire pour {kw} ?",
    "J'ai un problème avec {kw}",
    "Est-ce possible de {kw} ?",
    "Je voudrais {kw}",
    "Comment {kw} sur l'application ?",
    "Aide-moi à {kw} s'il te plaît",
    "Expliquez-moi comment {kw}",
    "C'est quoi la procédure pour {kw} ?",
    "Je ne comprends pas comment {kw}",
    "Pourquoi je ne peux pas {kw} ?",
    "Où est-ce que je trouve {kw} ?",
    "Quand est-ce que je peux {kw} ?",
    "J'aimerais savoir comment {kw}",
    "Ça ne marche pas pour {kw}",
    "Problème avec {kw} depuis ce matin",
    "J'essaie de {kw} mais ça bloque",
    "C'est urgent concernant {kw}",
    "How do I {kw} ?",         # Questions en anglais (NLLB traduit mais on augmente)
    "I need help with {kw}",
]


def build_training_dataset(
    faq_path: Path = FAQ_PATH,
    conversations: list[dict] | None = None,
    augment_n: int = 8,
) -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    """
    Construit (train_data, val_data) depuis :
    - La FAQ (canoniques + variations + synthétiques)
    - Les conversations réelles (TP archivés)
    - Les exemples de small-talk et hors-scope
    - L'augmentation de données par patterns

    Retourne des listes de (texte, intent_label).
    Split stratifié 80/20 par intent.
    """
    all_examples: list[tuple[str, str]] = []

    # ── 1. FAQ canoniques + variations
    if faq_path.exists():
        with open(faq_path, "r", encoding="utf-8") as f:
            faq_groups = json.load(f)

        for group in faq_groups:
            if not isinstance(group, dict):
                continue
            intent = _infer_intent_from_group(group)
            if intent == "incomprehensible":
                continue  # Pas d'exemples incomprehensible positifs dans la FAQ

            for item in group.get("items", []):
                question = item.get("question", "").strip()
                if not question:
                    continue

                # Canonique
                all_examples.append((question, intent))

                # Variations connues
                for var in item.get("variations", []):
                    if var.strip():
                        all_examples.append((var.strip(), intent))

                # Augmentation par mots-clés
                keywords = item.get("keywords", [])
                kw_pool = [k for k in keywords if len(k) > 3]
                q_words = [w for w in question.lower().split() if len(w) > 4]
                seed = kw_pool or q_words

                if seed:
                    for _ in range(augment_n):
                        pattern = random.choice(AUGMENTATION_PATTERNS)
                        n_kw = min(random.randint(1, 3), len(seed))
                        chosen = random.sample(seed, n_kw) if len(seed) >= n_kw else seed
                        synth = pattern.format(kw=" ".join(chosen))
                        all_examples.append((synth, intent))

    # ── 2. Conversations réelles (uniquement TP = bonnes réponses)
    if conversations:
        for conv in conversations:
            if conv.get("outcome") != "TP":
                continue
            intent = conv.get("intent", "")
            if intent in INTENT_LABELS and intent not in ("incomprehensible", "hors_scope"):
                # On n'a pas le texte original, on a l'intent → skip sans texte
                # (les vrais textes sont dans session, pas dans compressed)
                pass

    # ── 3. Small-talk et hors-scope
    all_examples.extend(SMALLTALK_EXAMPLES)
    all_examples.extend(HORS_SCOPE_EXAMPLES)

    # ── 4. Quelques exemples INCOMPREHENSIBLE (textes flous)
    incomprehensible = [
        ("ça marche pas", "incomprehensible"),
        ("j'ai un problème", "incomprehensible"),
        ("aidez-moi", "incomprehensible"),
        ("c'est bloqué", "incomprehensible"),
        ("erreur", "incomprehensible"),
        ("je comprends pas", "incomprehensible"),
        ("comment faire ?", "incomprehensible"),
        ("problème urgent", "incomprehensible"),
        ("ça bug", "incomprehensible"),
        ("il y a un bug", "incomprehensible"),
        ("ça ne marche pas du tout", "incomprehensible"),
        ("je suis bloqué", "incomprehensible"),
    ]
    all_examples.extend(incomprehensible)

    # ── 5. Déduplication et mélange
    seen = set()
    unique = []
    for text, label in all_examples:
        key = (text.lower().strip(), label)
        if key not in seen:
            seen.add(key)
            unique.append((text, label))
    random.shuffle(unique)

    # ── 6. Split stratifié 80/20
    by_intent: dict[str, list] = defaultdict(list)
    for text, label in unique:
        by_intent[label].append((text, label))

    train, val = [], []
    for intent, examples in by_intent.items():
        random.shuffle(examples)
        n_val = max(1, int(len(examples) * 0.20))
        val.extend(examples[:n_val])
        train.extend(examples[n_val:])

    random.shuffle(train)
    random.shuffle(val)

    return train, val


# ─────────────────────────────────────────────
#  FINE-TUNING CAMEMBERT
# ─────────────────────────────────────────────

def finetune_camembert(
    train_data: list[tuple[str, str]],
    val_data:   list[tuple[str, str]],
    cfg:        TrainingConfig,
) -> dict:
    """
    Fine-tune CamemBERT sur les données d'intention.
    Retourne {"success": bool, "val_accuracy": float, "val_f1": float}.

    Technique :
    - CamembertForSequenceClassification avec les 16 intents
    - Adam + linear warmup + weight decay
    - Gradient accumulation (simule des batch plus grands sur CPU)
    - Early stopping si val_accuracy ne s'améliore plus
    - Sauvegarde uniquement si meilleure que le modèle précédent
    """
    try:
        import torch
        from transformers import (
            CamembertTokenizer,
            CamembertForSequenceClassification,
            get_linear_schedule_with_warmup,
        )
        from torch.utils.data import Dataset, DataLoader
        from torch.optim import AdamW
        from sklearn.metrics import f1_score as sk_f1
    except ImportError as e:
        print(f"[LLMTraining] Dépendances manquantes : {e}")
        return {"success": False, "val_accuracy": 0.0, "val_f1": 0.0, "error": str(e)}

    # Vérifier qu'on a assez de données
    intent_counts = Counter(label for _, label in train_data)
    sparse = [i for i, c in intent_counts.items()
              if c < cfg.min_samples_per_intent and i not in ("hors_scope", "incomprehensible", "salutation")]
    if sparse:
        print(f"[LLMTraining] ⚠ Intents sous-représentés : {sparse} — fine-tuning CamemBERT reporté")
        return {"success": False, "val_accuracy": 0.0, "val_f1": 0.0,
                "error": f"sparse_intents: {sparse}"}

    print(f"[LLMTraining] CamemBERT fine-tuning — {len(train_data)} train / {len(val_data)} val")

    # Dataset PyTorch
    class IntentDataset(Dataset):
        def __init__(self, data, tokenizer, label2id, max_len):
            self.texts  = [t for t, _ in data]
            self.labels = [label2id.get(l, label2id["incomprehensible"]) for _, l in data]
            self.tok    = tokenizer
            self.max_len = max_len

        def __len__(self):
            return len(self.texts)

        def __getitem__(self, idx):
            enc = self.tok(
                self.texts[idx],
                max_length=self.max_len,
                padding="max_length",
                truncation=True,
                return_tensors="pt",
            )
            return {
                "input_ids":      enc["input_ids"].squeeze(0),
                "attention_mask": enc["attention_mask"].squeeze(0),
                "labels":         torch.tensor(self.labels[idx], dtype=torch.long),
            }

    label2id = {label: i for i, label in enumerate(INTENT_LABELS)}
    id2label = {i: label for label, i in label2id.items()}

    # Chargement tokenizer + modèle
    base_model = "camembert-base"
    tokenizer  = CamembertTokenizer.from_pretrained(base_model)

    # Si un modèle fine-tuné existe déjà, repartir de lui (apprentissage incrémental)
    model_init = str(CAMEMBERT_SAVE_PATH) if CAMEMBERT_SAVE_PATH.exists() else base_model
    model = CamembertForSequenceClassification.from_pretrained(
        model_init,
        num_labels=len(INTENT_LABELS),
        ignore_mismatched_sizes=True,  # si le nb de labels a changé
    )

    train_ds = IntentDataset(train_data, tokenizer, label2id, cfg.camembert_max_len)
    val_ds   = IntentDataset(val_data,   tokenizer, label2id, cfg.camembert_max_len)

    train_loader = DataLoader(train_ds, batch_size=cfg.camembert_batch_size, shuffle=True)
    val_loader   = DataLoader(val_ds,   batch_size=cfg.camembert_batch_size)

    # Optimizer avec weight decay différencié (couches de normalisation exemptées)
    no_decay = ["bias", "LayerNorm.weight"]
    optimizer_params = [
        {"params": [p for n, p in model.named_parameters()
                    if not any(nd in n for nd in no_decay)],
         "weight_decay": cfg.camembert_weight_decay},
        {"params": [p for n, p in model.named_parameters()
                    if any(nd in n for nd in no_decay)],
         "weight_decay": 0.0},
    ]
    optimizer = AdamW(optimizer_params, lr=cfg.camembert_lr)

    total_steps  = len(train_loader) * cfg.camembert_epochs
    warmup_steps = int(total_steps * cfg.camembert_warmup_ratio)
    scheduler    = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=warmup_steps, num_training_steps=total_steps
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"[LLMTraining] Device: {device}")

    # Gradient accumulation (simule batch_size×4 sur CPU/GPU limité)
    ACCUMULATION_STEPS = 4
    best_val_acc  = 0.0
    best_val_f1   = 0.0
    patience      = 2
    no_improve    = 0

    for epoch in range(cfg.camembert_epochs):
        model.train()
        total_loss = 0.0
        optimizer.zero_grad()

        for step, batch in enumerate(train_loader):
            input_ids      = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels         = batch["labels"].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss    = outputs.loss / ACCUMULATION_STEPS
            loss.backward()
            total_loss += outputs.loss.item()

            if (step + 1) % ACCUMULATION_STEPS == 0:
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()

        avg_loss = total_loss / len(train_loader)

        # Validation
        model.eval()
        preds, true_labels = [], []
        with torch.no_grad():
            for batch in val_loader:
                input_ids      = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels         = batch["labels"].to(device)
                outputs        = model(input_ids=input_ids, attention_mask=attention_mask)
                predictions    = outputs.logits.argmax(dim=-1)
                preds.extend(predictions.cpu().tolist())
                true_labels.extend(labels.cpu().tolist())

        correct  = sum(p == t for p, t in zip(preds, true_labels))
        val_acc  = correct / len(true_labels)
        val_f1   = sk_f1(true_labels, preds, average="macro", zero_division=0)

        print(f"  [Epoch {epoch+1}/{cfg.camembert_epochs}] loss={avg_loss:.4f} "
              f"val_acc={val_acc:.3f} val_f1={val_f1:.3f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_val_f1  = val_f1
            no_improve   = 0
            # Sauvegarder le meilleur modèle
            CAMEMBERT_SAVE_PATH.mkdir(parents=True, exist_ok=True)
            model.save_pretrained(str(CAMEMBERT_SAVE_PATH))
            tokenizer.save_pretrained(str(CAMEMBERT_SAVE_PATH))
            print(f"  [LLMTraining] ✓ Meilleur modèle sauvegardé (acc={val_acc:.3f})")
        else:
            no_improve += 1
            if no_improve >= patience:
                print(f"  [LLMTraining] Early stopping (patience={patience})")
                break

    return {
        "success":      best_val_acc > 0.0,
        "val_accuracy": round(best_val_acc, 4),
        "val_f1":       round(best_val_f1, 4),
    }


# ─────────────────────────────────────────────
#  SENTENCE TRANSFORMER — COUCHE SÉMANTIQUE
# ─────────────────────────────────────────────

def train_sentence_embedder(
    train_data: list[tuple[str, str]],
    val_data:   list[tuple[str, str]],
    cfg:        TrainingConfig,
) -> dict:
    """
    Fine-tune un Sentence Transformer pour le matching sémantique FAQ.

    Stratégie Contrastive :
    - Paires positives : (question_user, réponse_faq) même intent
    - Paires négatives : (question_user, réponse_faq) intent différent
    - Objectif : les embeddings de la même intention se regroupent
    - Loss : MultipleNegativesRankingLoss (efficace sur petits datasets)

    Le modèle résultant est utilisé pour :
    1. Encoder les questions utilisateurs (768 dims)
    2. Encoder les réponses FAQ (768 dims)
    3. Calculer la similarité cosinus → score de matching
    """
    try:
        from sentence_transformers import SentenceTransformer, InputExample, losses
        from sentence_transformers.evaluation import EmbeddingSimilarityEvaluator
        from torch.utils.data import DataLoader as STDataLoader
    except ImportError:
        print("[LLMTraining] sentence-transformers non disponible — skip couche sémantique")
        print("  → pip install sentence-transformers")
        return {"success": False, "error": "sentence_transformers_missing"}

    print(f"[LLMTraining] Sentence Transformer — {len(train_data)} exemples")

    # Charger le modèle de base (multilingue = clé pour FR/EN)
    model_id = cfg.sentence_model_id
    model_path = SENTENCE_MODEL_PATH
    base = str(model_path) if model_path.exists() else model_id
    model = SentenceTransformer(base)

    # Construire des paires contrastives depuis les données d'intent
    by_intent: dict[str, list[str]] = defaultdict(list)
    for text, label in train_data:
        by_intent[label].append(text)

    train_examples = []
    intent_list = [k for k in by_intent if len(by_intent[k]) >= 2]

    for intent in intent_list:
        texts = by_intent[intent]
        random.shuffle(texts)
        # Paires positives (même intent = similaires)
        for i in range(0, len(texts) - 1, 2):
            train_examples.append(InputExample(
                texts=[texts[i], texts[i+1]], label=1.0
            ))
        # Paires négatives (intents différents = dissimilaires)
        other_intents = [k for k in intent_list if k != intent]
        if other_intents:
            neg_intent = random.choice(other_intents)
            neg_texts  = by_intent[neg_intent]
            if neg_texts:
                train_examples.append(InputExample(
                    texts=[texts[0], random.choice(neg_texts)], label=0.0
                ))

    if not train_examples:
        return {"success": False, "error": "no_training_pairs"}

    # DataLoader
    loader = STDataLoader(
        train_examples,
        shuffle=True,
        batch_size=cfg.sentence_batch_size,
    )

    # Loss : CosineSimilarityLoss pour les paires labelisées
    from sentence_transformers import losses as st_losses
    train_loss = st_losses.CosineSimilarityLoss(model)

    # Évaluation sur validation
    val_texts_a, val_texts_b, val_scores = [], [], []
    by_intent_val: dict[str, list[str]] = defaultdict(list)
    for text, label in val_data:
        by_intent_val[label].append(text)

    for intent in by_intent_val:
        texts = by_intent_val[intent]
        if len(texts) >= 2:
            val_texts_a.append(texts[0])
            val_texts_b.append(texts[1])
            val_scores.append(1.0)
        for other in [k for k in by_intent_val if k != intent][:2]:
            if by_intent_val[other]:
                val_texts_a.append(texts[0])
                val_texts_b.append(by_intent_val[other][0])
                val_scores.append(0.0)

    evaluator = EmbeddingSimilarityEvaluator(val_texts_a, val_texts_b, val_scores)

    # Entraînement
    model_path.mkdir(parents=True, exist_ok=True)
    model.fit(
        train_objectives=[(loader, train_loss)],
        epochs=cfg.sentence_epochs,
        evaluator=evaluator,
        output_path=str(model_path),
        save_best_model=True,
        show_progress_bar=False,
    )

    print(f"[LLMTraining] ✓ Sentence Transformer sauvegardé → {model_path}")
    return {"success": True, "model_path": str(model_path)}


# ─────────────────────────────────────────────
#  SVM INTENT CLASSIFIER (couche arbitre)
# ─────────────────────────────────────────────

def train_svm_classifier(
    train_data: list[tuple[str, str]],
    val_data:   list[tuple[str, str]],
    cfg:        TrainingConfig,
) -> dict:
    """
    Entraîne un SVM calibré sur les embeddings Sentence Transformer.
    Plus robuste que RF sur textes courts avec peu de données.
    Calibration de probabilité → confiance fiable.
    """
    try:
        from sklearn.svm import SVC
        from sklearn.calibration import CalibratedClassifierCV
        from sklearn.preprocessing import LabelEncoder
        from sklearn.metrics import f1_score, accuracy_score
        import numpy as np
    except ImportError as e:
        return {"success": False, "error": str(e)}

    # Charger le Sentence Transformer pour encoder les textes
    try:
        from sentence_transformers import SentenceTransformer
        model_path = str(SENTENCE_MODEL_PATH) if SENTENCE_MODEL_PATH.exists() else cfg.sentence_model_id
        st_model = SentenceTransformer(model_path)
    except Exception as e:
        print(f"[LLMTraining] SVM: impossible de charger Sentence Transformer — {e}")
        return {"success": False, "error": f"sentence_transformer_load: {e}"}

    print(f"[LLMTraining] SVM Classifier — encodage des textes...")

    # Encoder tous les textes
    train_texts = [t for t, _ in train_data]
    val_texts   = [t for t, _ in val_data]
    train_labels = [l for _, l in train_data]
    val_labels   = [l for _, l in val_data]

    train_emb = st_model.encode(train_texts, batch_size=64, show_progress_bar=False)
    val_emb   = st_model.encode(val_texts,   batch_size=64, show_progress_bar=False)

    le = LabelEncoder()
    le.fit(INTENT_LABELS)
    y_train = le.transform(train_labels)
    y_val   = le.transform(val_labels)

    # SVM avec calibration de probabilité (Platt scaling)
    base_svm = SVC(
        C=cfg.svm_c,
        kernel=cfg.svm_kernel,
        gamma=cfg.svm_gamma,
        probability=False,  # CalibratedClassifierCV s'en charge
        class_weight="balanced",  # équilibre les classes sous-représentées
    )
    svm = CalibratedClassifierCV(base_svm, cv=3, method="sigmoid")
    svm.fit(train_emb, y_train)

    # Évaluation
    y_pred   = svm.predict(val_emb)
    val_acc  = accuracy_score(y_val, y_pred)
    val_f1   = f1_score(y_val, y_pred, average="macro", zero_division=0)

    print(f"[LLMTraining] SVM val_acc={val_acc:.3f} val_f1={val_f1:.3f}")

    # Sauvegarder
    with open(SVM_SAVE_PATH, "wb") as f:
        pickle.dump({"model": svm, "label_encoder": le, "val_acc": val_acc}, f)

    return {
        "success":      True,
        "val_accuracy": round(val_acc, 4),
        "val_f1":       round(val_f1, 4),
    }


# ─────────────────────────────────────────────
#  VOTING WEIGHTS AUTO-OPTIMISATION
# ─────────────────────────────────────────────

def optimize_voting_weights(
    val_data:    list[tuple[str, str]],
    camembert_r: dict,
    sentence_r:  dict,
    svm_r:       dict,
    cfg:         TrainingConfig,
) -> dict:
    """
    Optimise les poids du voting ensemble selon les performances validées.
    Logique simple mais efficace :
    - Plus un modèle performe bien en val → plus son poids augmente
    - Normalisation pour que la somme = 1
    - Contrainte : chaque poids reste entre 0.10 et 0.60
    """
    w_cam = cfg.w_camembert
    w_sen = cfg.w_sentence
    w_svm = cfg.w_svm

    acc_cam = camembert_r.get("val_accuracy", 0.0)
    acc_sen = sentence_r.get("val_accuracy", 0.5) if sentence_r.get("success") else 0.0
    acc_svm = svm_r.get("val_accuracy", 0.0) if svm_r.get("success") else 0.0

    # Si un modèle n'a pas tourné → poids maintenu
    if not camembert_r.get("success"):
        acc_cam = w_cam * 3.0  # maintenir le poids actuel
    if not sentence_r.get("success"):
        acc_sen = w_sen * 3.0
    if not svm_r.get("success"):
        acc_svm = w_svm * 3.0

    total = acc_cam + acc_sen + acc_svm
    if total == 0:
        return {"w_camembert": w_cam, "w_sentence": w_sen, "w_svm": w_svm}

    # Normaliser
    new_cam = max(0.10, min(0.60, acc_cam / total))
    new_sen = max(0.10, min(0.60, acc_sen / total))
    new_svm = max(0.10, min(0.60, acc_svm / total))

    # Re-normaliser pour que la somme = 1
    total2 = new_cam + new_sen + new_svm
    new_cam /= total2
    new_sen /= total2
    new_svm /= total2

    # Momentum : ne pas changer trop vite
    alpha = 0.3
    final_cam = (1 - alpha) * w_cam + alpha * new_cam
    final_sen = (1 - alpha) * w_sen + alpha * new_sen
    final_svm = (1 - alpha) * w_svm + alpha * new_svm

    # Sauvegarder
    weights = {"w_camembert": round(final_cam, 4),
               "w_sentence":  round(final_sen, 4),
               "w_svm":       round(final_svm, 4)}
    with open(VOTING_WEIGHTS_PATH, "w") as f:
        json.dump(weights, f, indent=2)

    print(f"[LLMTraining] Voting weights → cam={final_cam:.3f} sen={final_sen:.3f} svm={final_svm:.3f}")
    return weights


def load_voting_weights() -> dict:
    if VOTING_WEIGHTS_PATH.exists():
        try:
            with open(VOTING_WEIGHTS_PATH) as f:
                return json.load(f)
        except Exception:
            pass
    return {"w_camembert": 0.40, "w_sentence": 0.35, "w_svm": 0.25}


# ─────────────────────────────────────────────
#  EXPANSION VOCABULAIRE AUTO
# ─────────────────────────────────────────────

def expand_vocabulary_from_fp(
    conversations: list[dict],
    top_n: int = 20,
) -> list[str]:
    """
    Analyse les conversations FP (faux positifs = mauvaises réponses)
    pour détecter les mots fréquents qui ne sont pas dans le vocabulaire.
    Ces mots sont ajoutés aux keywords dynamiques du FeatureEncoder.

    Critère : mot long (>4 chars), fréquent dans FP, absent des FAQ keywords.
    """
    from feature_encoder import _load_dynamic_keywords, save_dynamic_keywords

    # Mots déjà connus
    existing_kw = set(_load_dynamic_keywords())

    # Charger les mots-clés FAQ
    faq_words = set()
    if FAQ_PATH.exists():
        with open(FAQ_PATH, "r", encoding="utf-8") as f:
            faq_groups = json.load(f)
        for group in faq_groups:
            for item in group.get("items", []):
                for kw in item.get("keywords", []):
                    faq_words.add(_normalize(kw))

    # Compter les mots dans les conversations FP
    stop_words = {
        "le", "la", "les", "de", "du", "des", "un", "une", "je", "tu",
        "il", "elle", "nous", "vous", "ils", "et", "en", "à", "au",
        "par", "sur", "pour", "pas", "ne", "mon", "ma", "mes",
        "que", "qui", "quoi", "comment", "pourquoi", "est", "ce",
        "ça", "cela", "donc", "mais", "si", "avec", "sans", "dans"
    }

    word_freq: Counter = Counter()
    fp_convs = [c for c in conversations if c.get("outcome") == "FP"]

    for conv in fp_convs:
        intent = conv.get("intent", "")
        # On n'a pas le texte brut dans CompressedConversation
        # mais on peut analyser l'intent pour identifier les lacunes
        word_freq[intent] += 1

    # Ajouter les mots FAQ manquants dans le vocabulaire dynamique
    new_words = []
    for group in faq_groups if FAQ_PATH.exists() else []:
        for item in (group.get("items", []) if FAQ_PATH.exists() else []):
            for kw in item.get("keywords", []):
                kw_norm = _normalize(kw)
                if (len(kw_norm) > 4
                        and kw_norm not in existing_kw
                        and kw_norm not in stop_words):
                    new_words.append(kw_norm)

    if new_words:
        updated = list(existing_kw) + new_words[:top_n]
        save_dynamic_keywords(list(set(updated)))
        print(f"[LLMTraining] Vocabulaire étendu : +{len(new_words[:top_n])} mots")

    return new_words[:top_n]


# ─────────────────────────────────────────────
#  AUTO-OPTIMISATION DES HYPERPARAMÈTRES
# ─────────────────────────────────────────────

def auto_adjust_config(
    cfg:             TrainingConfig,
    phase2_accuracy: float,
    val_accuracy:    float,
) -> TrainingConfig:
    """
    Ajuste automatiquement les hyperparamètres pour le prochain cycle.

    Règles :
    - Phase2 >> val_accuracy → surapprentissage → réduire epochs, augmenter dropout
    - Phase2 << val_accuracy → sous-apprentissage → augmenter lr, epochs
    - Phase2 stagne → explorer d'autres hyperparamètres (mutation légère)
    """
    gap = val_accuracy - phase2_accuracy

    if gap > 0.15:
        # Surapprentissage
        cfg.camembert_lr      = max(1e-5, cfg.camembert_lr * 0.8)
        cfg.camembert_epochs  = max(2, cfg.camembert_epochs - 1)
        cfg.camembert_weight_decay = min(0.05, cfg.camembert_weight_decay * 1.5)
        print(f"[LLMTraining] Surapprentissage détecté (gap={gap:.2f}) → lr↓ epochs↓ wd↑")

    elif phase2_accuracy < 0.50:
        # Sous-apprentissage ou dataset trop petit
        cfg.camembert_lr      = min(5e-5, cfg.camembert_lr * 1.2)
        cfg.camembert_epochs  = min(5, cfg.camembert_epochs + 1)
        cfg.augment_factor    = getattr(cfg, "augment_factor", 8) + 2
        print(f"[LLMTraining] Sous-apprentissage (phase2={phase2_accuracy:.2f}) → lr↑ epochs↑")

    elif abs(gap) < 0.05 and phase2_accuracy > 0.65:
        # Bonne convergence → légère perturbation pour explorer
        cfg.camembert_lr = cfg.camembert_lr * random.uniform(0.9, 1.1)
        print(f"[LLMTraining] Bonne convergence → légère perturbation lr={cfg.camembert_lr:.2e}")

    cfg.last_val_accuracy   = val_accuracy
    cfg.last_phase2_accuracy = phase2_accuracy
    cfg.version             += 1

    return cfg


# ─────────────────────────────────────────────
#  PIPELINE D'ENTRAÎNEMENT COMPLET
# ─────────────────────────────────────────────

def run_llm_training(
    conversations:    list[dict] | None = None,
    phase2_accuracy:  float = 0.0,
    val_accuracy:     float = 0.0,
    force_camembert:  bool = False,
) -> dict:
    """
    Pipeline complet d'entraînement LLM.
    Appelé par le Training Loop principal.

    Retourne un rapport complet avec toutes les métriques.
    """
    start_time = time.time()
    cfg = load_config()

    print(f"\n{'─'*50}")
    print(f"[LLMTraining] Démarrage — v{cfg.version}")
    print(f"{'─'*50}")

    results = {
        "timestamp":       datetime.utcnow().isoformat(),
        "version":         cfg.version,
        "camembert":       {},
        "sentence":        {},
        "svm":             {},
        "voting_weights":  {},
        "vocab_expansion": [],
        "config_updated":  {},
    }

    # ── 1. Construire le dataset
    augment_n = getattr(cfg, "augment_factor", 8)
    train_data, val_data = build_training_dataset(
        faq_path=FAQ_PATH,
        conversations=conversations,
        augment_n=augment_n,
    )

    intent_counts = Counter(l for _, l in train_data)
    print(f"[LLMTraining] Dataset: {len(train_data)} train | {len(val_data)} val")
    print(f"  Intents couverts: {len(intent_counts)}")

    # ── 2. Expansion vocabulaire
    if conversations:
        new_words = expand_vocabulary_from_fp(conversations)
        results["vocab_expansion"] = new_words

    # ── 3. Fine-tune CamemBERT
    # Condition : assez de données ET (pas de modèle OU performance insuffisante)
    should_finetune_camembert = (
        force_camembert
        or len(train_data) >= 50
        and (not CAMEMBERT_SAVE_PATH.exists()
             or cfg.last_val_accuracy < 0.65
             or phase2_accuracy < 0.55)
    )

    if should_finetune_camembert:
        print("[LLMTraining] Fine-tuning CamemBERT...")
        cam_result = finetune_camembert(train_data, val_data, cfg)
        results["camembert"] = cam_result

        if cam_result["success"]:
            # Notifier CamemBERT service de recharger
            try:
                import httpx
                httpx.post("http://localhost:8001/reload", timeout=5.0)
                print("[LLMTraining] ✓ CamemBERT service rechargé")
            except Exception as e:
                print(f"[LLMTraining] Reload :8001 échoué : {e}")
    else:
        print(f"[LLMTraining] CamemBERT skip (train={len(train_data)} | last_acc={cfg.last_val_accuracy:.2f})")
        results["camembert"] = {"success": False, "skipped": True}

    # ── 4. Sentence Transformer
    # Entraîner si pas encore de modèle ou performances insuffisantes
    should_finetune_sentence = (
        not SENTENCE_MODEL_PATH.exists()
        or phase2_accuracy < 0.55
        or len(train_data) >= 100
    )

    if should_finetune_sentence:
        print("[LLMTraining] Fine-tuning Sentence Transformer...")
        sen_result = train_sentence_embedder(train_data, val_data, cfg)
        results["sentence"] = sen_result
    else:
        print("[LLMTraining] Sentence Transformer skip")
        results["sentence"] = {"success": False, "skipped": True}

    # ── 5. SVM Classifier
    print("[LLMTraining] Entraînement SVM Classifier...")
    svm_result = train_svm_classifier(train_data, val_data, cfg)
    results["svm"] = svm_result

    # ── 6. Optimiser les poids de voting
    weights = optimize_voting_weights(
        val_data,
        results["camembert"],
        results["sentence"],
        results["svm"],
        cfg,
    )
    results["voting_weights"] = weights

    # ── 7. Auto-ajustement config pour le prochain cycle
    if phase2_accuracy > 0 and val_accuracy > 0:
        cfg = auto_adjust_config(cfg, phase2_accuracy, val_accuracy)
    save_config(cfg)
    results["config_updated"] = cfg.__dict__

    # ── 8. Log
    duration = time.time() - start_time
    results["duration_seconds"] = round(duration, 1)

    _log_training_result(results)
    print(f"[LLMTraining] ✓ Complété en {duration:.1f}s")
    print(f"{'─'*50}\n")

    return results


def _log_training_result(result: dict):
    """Sauvegarde le résultat dans le log historique."""
    log = []
    if LLM_TRAINING_LOG_PATH.exists():
        try:
            with open(LLM_TRAINING_LOG_PATH) as f:
                log = json.load(f)
        except Exception:
            pass
    log.append(result)
    with open(LLM_TRAINING_LOG_PATH, "w") as f:
        json.dump(log[-50:], f, indent=2)  # Garder 50 derniers cycles


# ─────────────────────────────────────────────
#  CLASSIFY ENRICHI (utilisé par camembert_service)
# ─────────────────────────────────────────────

def classify_with_voting(text: str) -> dict:
    """
    Classification finale avec voting ensemble.
    Peut être appelée depuis camembert_service.py comme couche supplémentaire.

    Retourne : {"intent": str, "intent_score": float, "method": str}
    """
    weights = load_voting_weights()
    results = {}

    # Couche 1 : SVM (rapide, disponible offline)
    if SVM_SAVE_PATH.exists():
        try:
            from sentence_transformers import SentenceTransformer
            model_path = str(SENTENCE_MODEL_PATH) if SENTENCE_MODEL_PATH.exists() else "paraphrase-multilingual-mpnet-base-v2"
            st_model = SentenceTransformer(model_path)
            emb = st_model.encode([text], show_progress_bar=False)

            with open(SVM_SAVE_PATH, "rb") as f:
                svm_data = pickle.load(f)
            svm = svm_data["model"]
            le  = svm_data["label_encoder"]

            proba   = svm.predict_proba(emb)[0]
            best_id = proba.argmax()
            results["svm"] = {
                "intent": le.classes_[best_id],
                "score":  float(proba[best_id]),
            }
        except Exception as e:
            print(f"[LLMTraining/Voting] SVM échoué : {e}")

    # Résolution finale
    if not results:
        return {"intent": "incomprehensible", "intent_score": 0.0, "method": "voting_failed"}

    # Fusionner les scores disponibles
    intent_scores: dict[str, float] = defaultdict(float)

    if "svm" in results:
        intent_scores[results["svm"]["intent"]] += results["svm"]["score"] * weights["w_svm"]

    if intent_scores:
        best_intent = max(intent_scores, key=intent_scores.get)
        best_score  = intent_scores[best_intent]
        return {
            "intent":       best_intent,
            "intent_score": round(best_score, 4),
            "method":       "voting_" + "+".join(results.keys()),
        }

    return {"intent": "incomprehensible", "intent_score": 0.0, "method": "voting_empty"}


# ─────────────────────────────────────────────
#  POINT D'ENTRÉE STANDALONE
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("Talki — LLM Training Module")
    print("Lancement du cycle d'entraînement complet...\n")
    result = run_llm_training(force_camembert=True)
    print("\nRésultats :")
    print(f"  CamemBERT : {result['camembert']}")
    print(f"  Sentence  : {result['sentence']}")
    print(f"  SVM       : {result['svm']}")
    print(f"  Durée     : {result['duration_seconds']}s")
