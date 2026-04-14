"""
Talki — API principale :8000
Middleware de sécurité symétrique sur tous les endpoints.
Seul le serveur web Next.js (porteur du token) peut appeler Talki.
"""

from __future__ import annotations
import os
import threading
import multiprocessing
import hmac
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

# Windows : forcer spawn avant tout import de multiprocessing
# Doit être au niveau module, pas dans une coroutine async
if __name__ != "__main__":
    try:
        multiprocessing.set_start_method("spawn")
    except RuntimeError:
        pass  # Déjà défini

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from pipeline import process, PipelineResult
from conversation_cache import record_user_feedback, flush_session
from training_loop import start_scheduler, run_training_loop
from judge import load_weights

# ─────────────────────────────────────────────
#  CONFIGURATION SÉCURITÉ (depuis .env)
# ─────────────────────────────────────────────

INTERNAL_TOKEN = os.environ.get(
    "CHATBOT_INTERNAL_TOKEN",
    "82a51cc52f5a012f6a153a529df06fe393e767f578bdd48af70d14e2126fd746"
)
ADMIN_SECRET = os.environ.get("CHATBOT_ADMIN_SECRET", INTERNAL_TOKEN)

# Endpoints publics — ne nécessitent pas le token
PUBLIC_PATHS = {"/health"}

# ─────────────────────────────────────────────
#  APPLICATION
# ─────────────────────────────────────────────

app = FastAPI(
    title="Talki — Cité-Covoiturage Support Bot",
    description="Chatbot de support IA à apprentissage continu",
    version="1.0.0",
    docs_url=None,   # Désactiver Swagger en prod (pas de surface d'attaque)
    redoc_url=None,
)

# CORS restreint au serveur web uniquement
WEB_ORIGIN = os.environ.get("WEB_SERVER_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[WEB_ORIGIN, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["x-internal-token", "Content-Type"],
)


# ─────────────────────────────────────────────
#  MIDDLEWARE TOKEN SYMÉTRIQUE
# ─────────────────────────────────────────────

@app.middleware("http")
async def verify_internal_token(request: Request, call_next):
    """
    Vérifie le token symétrique sur chaque requête entrante.
    Comparaison HMAC à temps constant pour éviter les timing attacks.
    Seul /health est exempt (monitoring).
    """
    if request.url.path in PUBLIC_PATHS:
        return await call_next(request)

    token = request.headers.get("x-internal-token", "")

    # Comparaison à temps constant — évite les attaques par timing
    token_valid = hmac.compare_digest(
        token.encode("utf-8"),
        INTERNAL_TOKEN.encode("utf-8"),
    )

    if not token_valid:
        return JSONResponse(
            status_code=401,
            content={"error": "Token invalide ou manquant"}
        )

    return await call_next(request)


# ─────────────────────────────────────────────
#  SCHÉMAS
# ─────────────────────────────────────────────

class ChatRequest(BaseModel):
    message:    str
    session_id: str
    user_id:    str | None = None

class ChatResponse(BaseModel):
    text:            str
    response_type:   str
    confidence:      float
    faq_id:          str | None
    clarification:   dict | None
    should_escalate: bool
    session_id:      str
    detected_lang:   str

class FeedbackRequest(BaseModel):
    session_id: str
    rating:     int
    correction: str = ""

class AdminTriggerRequest(BaseModel):
    secret: str


# ─────────────────────────────────────────────
#  TRAINER PROCESS MANAGEMENT
# ─────────────────────────────────────────────

_trainer_process = None

def _start_trainer_process(interval_hours: float):
    """Lance le process Trainer en arrière-plan."""
    global _trainer_process
    if _trainer_process is not None and _trainer_process.is_alive():
        return
    _trainer_process = multiprocessing.Process(
        target=start_scheduler,
        args=(interval_hours,),
        daemon=True
    )
    _trainer_process.start()


# ─────────────────────────────────────────────
#  ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/health")  # Public — pas de token requis
async def health():
    return {
        "status":    "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version":   "1.0.0",
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message vide")

    result: PipelineResult = process(
        raw_text=req.message,
        session_id=req.session_id,
        user_id=req.user_id,
    )
    return ChatResponse(
        text=result.text,
        response_type=result.response_type,
        confidence=result.confidence,
        faq_id=result.faq_id,
        clarification=result.clarification,
        should_escalate=result.should_escalate,
        session_id=result.session_id,
        detected_lang=result.detected_lang,
    )


@app.post("/feedback")
async def feedback(req: FeedbackRequest):
    if not 1 <= req.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating entre 1 et 5")
    record_user_feedback(req.session_id, req.rating, req.correction)
    flush_session(req.session_id)
    return {"status": "ok"}


@app.post("/session/close")
async def close_session(session_id: str):
    flush_session(session_id)
    return {"status": "ok"}


@app.get("/admin/metrics")
async def admin_metrics(secret: str):
    if not hmac.compare_digest(secret.encode(), ADMIN_SECRET.encode()):
        raise HTTPException(status_code=403, detail="Accès refusé")
    import json, os
    path = os.path.join(os.path.dirname(__file__), "data", "faq_metrics.json")
    metrics = json.load(open(path)) if os.path.exists(path) else {}
    weights = load_weights()
    return {
        "faq_metrics": metrics,
        "kpi_weights": {
            "pertinence":           weights.pertinence,
            "couverture_intention": weights.couverture_intention,
            "clarte":               weights.clarte,
            "coherence":            weights.coherence,
            "proximite_faq":        weights.proximite_faq,
            "historique_succes":    weights.historique_succes,
            "version":              weights.version,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/admin/training-logs")
async def admin_training_logs(secret: str):
    if not hmac.compare_digest(secret.encode(), ADMIN_SECRET.encode()):
        raise HTTPException(status_code=403, detail="Accès refusé")
    import json, os
    path = os.path.join(os.path.dirname(__file__), "data", "training_log.json")
    return {"logs": json.load(open(path)) if os.path.exists(path) else []}


@app.post("/admin/trigger-training")
async def admin_trigger_training(req: AdminTriggerRequest):
    if not hmac.compare_digest(req.secret.encode(), ADMIN_SECRET.encode()):
        raise HTTPException(status_code=403, detail="Accès refusé")
    # Lancer dans un process séparé pour ne pas bloquer l'API
    p = multiprocessing.Process(target=run_training_loop, daemon=True)
    p.start()
    return {"status": "ok", "message": f"Training Loop lancé (PID {p.pid})"}


@app.get("/admin/trainer-status")
async def admin_trainer_status(secret: str):
    """Statut de l'instance Trainer."""
    if not hmac.compare_digest(secret.encode(), ADMIN_SECRET.encode()):
        raise HTTPException(status_code=403, detail="Accès refusé")
    alive = _trainer_process is not None and _trainer_process.is_alive()
    return {
        "trainer_alive": alive,
        "trainer_pid":   _trainer_process.pid if _trainer_process else None,
        "timestamp":     datetime.utcnow().isoformat(),
    }


@app.post("/admin/restart-trainer")
async def admin_restart_trainer(req: AdminTriggerRequest):
    """Redémarre le process Trainer si mort."""
    if not hmac.compare_digest(req.secret.encode(), ADMIN_SECRET.encode()):
        raise HTTPException(status_code=403, detail="Accès refusé")
    _start_trainer_process(interval_hours=6.0)
    return {"status": "ok", "message": "Trainer redémarré"}



async def admin_reload_faq(req: AdminTriggerRequest):
    if not hmac.compare_digest(req.secret.encode(), ADMIN_SECRET.encode()):
        raise HTTPException(status_code=403, detail="Accès refusé")
    from pipeline import reload_faq
    reload_faq()
    return {"status": "ok", "message": "FAQ rechargée"}


# ─────────────────────────────────────────────
#  DÉMARRAGE
# ─────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    _start_trainer_process(interval_hours=6.0)
    print(f"[Talki] ✓ API démarrée — token {'configuré' if INTERNAL_TOKEN else '⚠ MANQUANT'}")
    print(f"[Talki] ✓ Instance Trainer active (process séparé)")

# uvicorn api:app --host 127.0.0.1 --port 8000
