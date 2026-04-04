"""
Talki — Conversation Cache
Stockage enrichi des sessions pour l'auto-optimisation nocturne.

Chaque conversation archivée contient :
- Les 6 candidats avec leurs scores KPI individuels
- Le breakdown du meilleur candidat
- La zone de décision et le spread
- Les signaux comportementaux complets
- Le ground truth (outcome + feedback)

Sans ces données, la Phase 1 ne peut pas savoir POURQUOI
le système s'est trompé, ni QUEL KPI ajuster.
"""

from __future__ import annotations
import json
import os
import sqlite3
from datetime import datetime, timedelta
from dataclasses import asdict

from models import (
    ConversationSession, MessageRecord, Outcome,
    CompressedConversation, CandidateRecord
)

DB_PATH  = os.path.join(os.path.dirname(__file__), "data", "conversations.db")
TTL_MINS = 10

_session_cache: dict[str, ConversationSession] = {}


def _init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)

    # Table enrichie — migration auto si colonnes manquantes
    conn.execute("""
        CREATE TABLE IF NOT EXISTS compressed_conversations (
            id                   TEXT PRIMARY KEY,
            timestamp            TEXT,

            intent               TEXT,
            entity               TEXT,
            domain_relevance     REAL,
            ambiguity_score      REAL,
            urgency_score        REAL,
            detected_lang        TEXT,
            question_word_count  INTEGER,

            faq_id               TEXT,
            decision_zone        TEXT,
            best_score           REAL,
            score_spread         REAL,

            candidates           TEXT,
            best_kpi             TEXT,

            clarification_count  INTEGER,
            fallback_triggered   INTEGER,
            negative_count       INTEGER,
            outcome_signal       TEXT,

            outcome              TEXT,
            user_feedback        REAL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS kpi_evolution_log (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp     TEXT,
            outcome       TEXT,
            faq_id        TEXT,
            best_score    REAL,
            decision_zone TEXT,
            fitness       REAL
        )
    """)

    conn.commit()
    conn.close()


_init_db()


# ─────────────────────────────────────────────
#  GESTION DES SESSIONS
# ─────────────────────────────────────────────

def get_or_create_session(session_id: str, user_id: str | None = None) -> ConversationSession:
    _purge_expired()
    if session_id in _session_cache:
        session = _session_cache[session_id]
        session.last_activity = datetime.utcnow()
        return session
    session = ConversationSession(id=session_id, user_id=user_id)
    _session_cache[session_id] = session
    return session


def add_message(
    session_id:       str,
    input_text:       str,
    question_object:  dict,
    predicted_faq_id: str | None,
    response:         str,
    confidence:       float,
    judge_scores:     list | None = None,   # list[CandidateScore] du Judge
    decision_zone:    str         = "",
    score_spread:     float       = 0.0,
    best_kpi:         dict | None = None,
    detected_lang:    str         = "fr",
) -> ConversationSession:
    """
    Enregistre un échange dans la session avec toutes les données riches.
    judge_scores : les scores des 6 candidats évalués par le Judge.
    """
    session = get_or_create_session(session_id)
    msg = MessageRecord(
        input_text       = input_text,
        question_object  = question_object,
        predicted_faq_id = predicted_faq_id,
        response         = response,
        confidence       = confidence,
    )
    session.messages.append(msg)
    session.last_activity = datetime.utcnow()

    # Stocker les données riches dans la session pour la compression finale
    if not hasattr(session, "_last_judge_data"):
        session._last_judge_data = {}

    session._last_judge_data = {
        "judge_scores":  judge_scores or [],
        "decision_zone": decision_zone,
        "score_spread":  score_spread,
        "best_kpi":      best_kpi or {},
        "detected_lang": detected_lang,
        "question_object": question_object,
    }
    return session


def detect_follow_up_signal(session_id: str, new_input: str) -> dict:
    """
    Détecte les signaux comportementaux et met à jour l'outcome probable.
    Retourne le type de signal pour l'archivage.
    """
    from renderer import THANKS_WORDS

    session = _session_cache.get(session_id)
    if not session or not session.messages:
        return {"signal": "new_conversation"}

    raw_lower = new_input.lower()
    signal    = "continuation"

    NEGATIVE_WORDS = {
        "non", "pas du tout", "ça répond pas", "c'est pas ça",
        "incorrect", "faux", "mauvais", "pas ça", "j'ai pas compris",
        "ça marche pas", "toujours pas", "pas correct",
    }

    if any(w in raw_lower for w in NEGATIVE_WORDS):
        session.follow_up_detected = True
        session.negative_count    += 1
        session.outcome            = Outcome.FP
        signal                     = "negative_followup"

    elif any(w in raw_lower for w in THANKS_WORDS):
        session.outcome = Outcome.TP
        signal          = "positive_followup"

    elif session.messages and _is_rephrasing(session.messages[-1].input_text, new_input):
        session.rephrasing_detected = True
        session.outcome             = Outcome.FP
        signal                      = "rephrasing"

    # Stocker le dernier signal comportemental
    session._last_judge_data = getattr(session, "_last_judge_data", {})
    session._last_judge_data["outcome_signal"] = signal

    session.last_activity = datetime.utcnow()
    return {
        "signal":          signal,
        "negative_count":  session.negative_count,
        "should_escalate": session.negative_count >= 3,
    }


def record_user_feedback(session_id: str, rating: int, correction: str = ""):
    """Enregistre le feedback explicite — signal le plus fiable pour le ground truth."""
    session = _session_cache.get(session_id)
    if not session:
        return
    session.user_feedback = {"rating": rating, "correction": correction}
    if rating >= 4:
        session.outcome = Outcome.TP
    elif rating == 3:
        pass  # Neutre — on garde l'outcome comportemental
    elif rating <= 2:
        session.outcome = Outcome.FP

    jd = getattr(session, "_last_judge_data", {})
    jd["outcome_signal"] = "explicit_feedback"
    session._last_judge_data = jd
    session.last_activity = datetime.utcnow()


def _is_rephrasing(prev: str, new: str) -> bool:
    w_prev = set(prev.lower().split())
    w_new  = set(new.lower().split())
    if not w_prev or not w_new:
        return False
    return len(w_prev & w_new) / max(len(w_prev | w_new), 1) > 0.40


# ─────────────────────────────────────────────
#  COMPRESSION ET ARCHIVAGE
# ─────────────────────────────────────────────

def flush_session(session_id: str):
    """
    Compresse et archive une session avec toutes les données riches.
    """
    session = _session_cache.get(session_id)
    if not session:
        return

    # Déduire outcome si non défini
    if session.outcome is None:
        if session.negative_count >= 3:
            session.outcome = Outcome.FP
        elif session.abandonment:
            session.outcome = Outcome.FN
        else:
            session.outcome = Outcome.TN

    # Feedback score normalisé
    feedback_score = None
    if session.user_feedback:
        rating = session.user_feedback.get("rating", 3)
        feedback_score = (rating - 1) / 4.0

    # Données riches du dernier échange
    jd = getattr(session, "_last_judge_data", {})
    last_msg    = session.messages[-1] if session.messages else None
    qobj        = jd.get("question_object", last_msg.question_object if last_msg else {})
    judge_scores = jd.get("judge_scores", [])

    # Sérialiser les 6 candidats
    candidates_data = []
    for s in judge_scores:
        candidates_data.append({
            "faq_id":    s.response_id,
            "score":     round(s.global_score, 4),
            "rank":      s.rank,
            "pertinence": round(s.pertinence, 4),
            "couverture": round(s.couverture_intention, 4),
            "clarte":    round(s.clarte, 4),
            "coherence": round(s.coherence, 4),
            "proximite": round(s.proximite_faq, 4),
            "historique": round(s.historique_succes, 4),
        })

    # Score spread (écart top1-top2)
    spread = 0.0
    if len(candidates_data) >= 2:
        spread = candidates_data[0]["score"] - candidates_data[1]["score"]

    compressed = CompressedConversation(
        id                  = session.id,
        timestamp           = session.created_at,
        intent              = str(qobj.get("intent", "incomprehensible")),
        entity              = str(qobj.get("entity", "aucun")),
        domain_relevance    = float(qobj.get("domain", 0.0)),
        ambiguity_score     = float(qobj.get("ambiguity", 0.5)),
        urgency_score       = float(qobj.get("urgency", 0.0)),
        detected_lang       = jd.get("detected_lang", "fr"),
        question_word_count = len(last_msg.input_text.split()) if last_msg else 0,
        faq_id              = last_msg.predicted_faq_id if last_msg else None,
        decision_zone       = jd.get("decision_zone", "UNKNOWN"),
        best_score          = candidates_data[0]["score"] if candidates_data else 0.0,
        score_spread        = round(spread, 4),
        candidates          = candidates_data,
        best_kpi            = jd.get("best_kpi", {}),
        clarification_count = session.clarification_count,
        fallback_triggered  = any(
            "fallback" in (m.response or "").lower() for m in session.messages
        ),
        negative_count      = session.negative_count,
        outcome_signal      = jd.get("outcome_signal", "neutral"),
        outcome             = session.outcome,
        user_feedback       = feedback_score,
    )

    _archive_compressed(compressed)
    del _session_cache[session_id]
    print(f"[Cache] {session_id[:8]}... archivé → {session.outcome.value} | zone={jd.get('decision_zone','?')} | score={compressed.best_score:.2f}")


def _archive_compressed(c: CompressedConversation):
    """Sauvegarde dans SQLite avec toutes les colonnes enrichies."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT OR REPLACE INTO compressed_conversations (
            id, timestamp,
            intent, entity, domain_relevance, ambiguity_score, urgency_score,
            detected_lang, question_word_count,
            faq_id, decision_zone, best_score, score_spread,
            candidates, best_kpi,
            clarification_count, fallback_triggered, negative_count, outcome_signal,
            outcome, user_feedback
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        c.id,
        c.timestamp.isoformat(),
        c.intent,
        c.entity,
        c.domain_relevance,
        c.ambiguity_score,
        c.urgency_score,
        c.detected_lang,
        c.question_word_count,
        c.faq_id,
        c.decision_zone,
        c.best_score,
        c.score_spread,
        json.dumps(c.candidates),
        json.dumps(c.best_kpi),
        c.clarification_count,
        int(c.fallback_triggered),
        c.negative_count,
        c.outcome_signal,
        c.outcome.value,
        c.user_feedback,
    ))
    conn.commit()
    conn.close()


def load_recent_compressed(limit: int = 2000) -> list[dict]:
    """
    Charge les conversations pour le Training Loop.
    Reconstruit les candidats et best_kpi depuis JSON.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute("""
        SELECT id, timestamp,
               intent, entity, domain_relevance, ambiguity_score, urgency_score,
               detected_lang, question_word_count,
               faq_id, decision_zone, best_score, score_spread,
               candidates, best_kpi,
               clarification_count, fallback_triggered, negative_count, outcome_signal,
               outcome, user_feedback
        FROM compressed_conversations
        ORDER BY timestamp DESC
        LIMIT ?
    """, (limit,))

    rows = []
    cols = [d[0] for d in cursor.description]
    for row in cursor.fetchall():
        d = dict(zip(cols, row))
        # Désérialiser JSON
        try:
            d["candidates"] = json.loads(d["candidates"] or "[]")
        except Exception:
            d["candidates"] = []
        try:
            d["best_kpi"] = json.loads(d["best_kpi"] or "{}")
        except Exception:
            d["best_kpi"] = {}
        rows.append(d)

    conn.close()
    return rows


# ─────────────────────────────────────────────
#  PURGE TTL
# ─────────────────────────────────────────────

def _purge_expired():
    now = datetime.utcnow()
    expired = [
        sid for sid, sess in _session_cache.items()
        if (now - sess.last_activity) > timedelta(minutes=TTL_MINS)
    ]
    for sid in expired:
        flush_session(sid)
    if expired:
        print(f"[Cache] {len(expired)} session(s) expirée(s)")


def batch_cleanup():
    for sid in list(_session_cache.keys()):
        flush_session(sid)
    print("[Cache] Batch cleanup effectué")
