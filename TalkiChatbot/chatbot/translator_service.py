"""
Talki — Service Traducteur :8002
Basé sur NLLB-200 distilled 600M (Meta, open source, gratuit)
Couverture : 200 langues dont FR, EN, AR, ES et bien d'autres.
Zéro appel externe — tourne entièrement en local.

Endpoints :
  POST /detect          → détecte la langue d'un texte
  POST /to-french       → traduit n'importe quelle langue → français
  POST /from-french     → traduit français → langue cible
  GET  /health          → statut du service + langues supportées
"""

from __future__ import annotations
import time
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline as hf_pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from langdetect import detect as langdetect_detect, LangDetectException

app = FastAPI(title="Talki — Service Traducteur", version="1.0.0")

MODEL_ID = "facebook/nllb-200-distilled-600M"

# ── Codes de langue NLLB (flores-200)
LANG_CODES: dict[str, str] = {
    "fr": "fra_Latn",
    "en": "eng_Latn",
    "ar": "arb_Arab",
    "es": "spa_Latn",
    "pt": "por_Latn",
    "ht": "hat_Latn",   # Créole haïtien
    "zh": "zho_Hans",
    "de": "deu_Latn",
    "it": "ita_Latn",
    "uk": "ukr_Cyrl",
    "vi": "vie_Latn",
}

# Langdetect → NLLB code
LANGDETECT_TO_NLLB: dict[str, str] = {
    "fr": "fra_Latn",
    "en": "eng_Latn",
    "ar": "arb_Arab",
    "es": "spa_Latn",
    "pt": "por_Latn",
    "zh-cn": "zho_Hans",
    "de": "deu_Latn",
    "it": "ita_Latn",
    "uk": "ukr_Cyrl",
    "vi": "vie_Latn",
}


# ─────────────────────────────────────────────
#  CHARGEMENT DU MODÈLE (une seule fois)
# ─────────────────────────────────────────────

_tokenizer = None
_model     = None

def _load_model():
    global _tokenizer, _model
    if _model is None:
        print(f"[Traducteur] Chargement {MODEL_ID}...")
        start = time.time()
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        _model     = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID)
        print(f"[Traducteur] Modèle chargé en {time.time()-start:.1f}s")
    return _tokenizer, _model


def _translate(text: str, src_lang: str, tgt_lang: str) -> str:
    """Traduit text de src_lang vers tgt_lang (codes NLLB flores-200)."""
    tokenizer, model = _load_model()

    # Si même langue → retour direct sans traduction
    if src_lang == tgt_lang:
        return text

    tokenizer.src_lang = src_lang
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)

    forced_bos = tokenizer.convert_tokens_to_ids(tgt_lang)
    outputs = model.generate(
        **inputs,
        forced_bos_token_id=forced_bos,
        max_new_tokens=512,
    )
    return tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]


# ─────────────────────────────────────────────
#  SCHÉMAS
# ─────────────────────────────────────────────

class DetectRequest(BaseModel):
    text: str

class TranslateRequest(BaseModel):
    text:        str
    target_lang: str = "fr"   # code ISO 639-1

class TranslateFromFrRequest(BaseModel):
    text:        str
    target_lang: str          # code ISO 639-1 de la langue cible


# ─────────────────────────────────────────────
#  ENDPOINTS
# ─────────────────────────────────────────────

@app.post("/detect")
def detect_language(req: DetectRequest):
    """Détecte la langue d'un texte. Retourne le code ISO 639-1."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Texte vide")
    try:
        lang = langdetect_detect(req.text)
        return {
            "lang":      lang,
            "nllb_code": LANGDETECT_TO_NLLB.get(lang, "fra_Latn"),
            "is_french": lang == "fr",
        }
    except LangDetectException:
        return {"lang": "fr", "nllb_code": "fra_Latn", "is_french": True}


@app.post("/to-french")
def to_french(req: TranslateRequest):
    """
    Traduit un texte de n'importe quelle langue vers le français.
    Si le texte est déjà en français, retourne tel quel.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Texte vide")
    try:
        detected = langdetect_detect(req.text)
    except LangDetectException:
        detected = "fr"

    src_nllb = LANGDETECT_TO_NLLB.get(detected, "fra_Latn")
    tgt_nllb = "fra_Latn"

    translated = _translate(req.text, src_nllb, tgt_nllb)
    return {
        "original":       req.text,
        "translated":     translated,
        "source_lang":    detected,
        "already_french": detected == "fr",
    }


@app.post("/from-french")
def from_french(req: TranslateFromFrRequest):
    """
    Traduit une réponse française vers la langue cible de l'utilisateur.
    Si la cible est le français, retourne tel quel.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Texte vide")

    tgt_nllb = LANG_CODES.get(req.target_lang, "fra_Latn")
    translated = _translate(req.text, "fra_Latn", tgt_nllb)
    return {
        "original":    req.text,
        "translated":  translated,
        "target_lang": req.target_lang,
    }


@app.get("/health")
def health():
    return {
        "status":             "healthy",
        "model":              MODEL_ID,
        "supported_langs":    list(LANG_CODES.keys()),
        "model_loaded":       _model is not None,
    }


@app.on_event("startup")
def startup():
    """Pré-charge le modèle au démarrage pour éviter la latence au 1er appel."""
    _load_model()
    print("[Traducteur] ✓ NLLB-200 prêt sur :8002")


# uvicorn translator_service:app --port 8002
