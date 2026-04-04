"""
Talki — Pipeline Central
Flux complet :
  User (any lang)
  → NLLB detect+translate → FR
  → CamemBERT classify
  → Feature Encoder
  → Matching Engine → 6 candidats
  → IA Judge évalue les 6 → score global
    > 75%      → réponse directe
    60-75%     → boucle clarification (max 3 tours)
    < 60%      → on ne sait pas
  → Template direct
  → NLLB → langue originale
  → User

RÉVISION v1.1 :
- Filtre is_domain_relevant assoupli pour INCOMPREHENSIBLE-mais-pertinent
  (domain_relevance = 0.65 → passe le seuil 0.40)
- HORS_SCOPE et SALUTATION restent bloqués en amont
- INCOMPREHENSIBLE avec contexte covoiturage → tente le Matching Engine
"""

from __future__ import annotations
import httpx
from dataclasses import dataclass, field

from models import QuestionObject, ResponseObject, Intent
from llm_parser import parse_question, is_domain_relevant
from feature_encoder import encode
from matching_engine import find_candidates, candidates_to_response_objects
from faq_client import load_faq_resolved, force_refresh
from judge import evaluate_all, decide, load_weights
from renderer import (
    render_response, render_identity, detect_small_talk_type,
    generate_clarification, IDENTITY_RESPONSES,
)
from conversation_cache import (
    get_or_create_session, add_message,
    detect_follow_up_signal, flush_session,
)

TRANSLATOR_URL = "http://localhost:8002"
TIMEOUT        = 12.0

THRESHOLD_CONFIDENT = 0.75
THRESHOLD_UNCERTAIN = 0.60
MAX_CLARIF_LOOPS    = 3


@dataclass
class PipelineResult:
    text:             str
    response_type:    str
    confidence:       float
    faq_id:           str | None
    judge_scores:     list
    fallback_reason:  str
    should_escalate:  bool
    clarification:    dict | None
    session_id:       str
    detected_lang:    str
    decision_zone:    str


_FAQ_ITEMS = None

def _get_faq():
    global _FAQ_ITEMS
    if _FAQ_ITEMS is None:
        _FAQ_ITEMS = load_faq_resolved()
    return _FAQ_ITEMS


# ─────────────────────────────────────────────
#  COUCHE TRADUCTION (NLLB)
# ─────────────────────────────────────────────

def _to_fr(text: str, hint_lang: str | None = None) -> tuple[str, str]:
    FR_MARKERS = {"bonjour","salut","merci","comment","pourquoi","quoi",
                  "votre","mon","ma","je","une","les","des","est","pas"}
    words = text.lower().split()
    force = len(words) <= 4 and not any(w in FR_MARKERS for w in words)

    try:
        r = httpx.post(
            f"{TRANSLATOR_URL}/to-french",
            json={"text": text},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        d = r.json()
        translated = d["translated"]
        src_lang   = d["source_lang"]

        if force and translated.strip().lower() == text.strip().lower():
            src_lang = hint_lang or "en"

        return translated, src_lang
    except Exception as e:
        print(f"[Pipeline] NLLB entrée échoué : {e}")
        return text, hint_lang or "fr"


def _from_fr(text: str, lang: str) -> str:
    if lang in ("fr", ""):
        return text
    try:
        r = httpx.post(
            f"{TRANSLATOR_URL}/from-french",
            json={"text": text, "target_lang": lang},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        return r.json()["translated"]
    except Exception as e:
        print(f"[Pipeline] NLLB sortie échoué : {e}")
        return text


# ─────────────────────────────────────────────
#  PIPELINE PRINCIPAL
# ─────────────────────────────────────────────

def process(raw_text: str, session_id: str, user_id: str | None = None) -> PipelineResult:

    # ── 0 : Vérification triple insatisfaction
    fu = detect_follow_up_signal(session_id, raw_text)
    if fu.get("should_escalate"):
        flush_session(session_id)
        _, lang = _to_fr(raw_text)
        text = _from_fr(IDENTITY_RESPONSES["triple_escalation"], lang)
        return _build_result("escalation", text, lang, 0.0, session_id,
                             reason="triple_negative_feedback", escalate=True)

    session = get_or_create_session(session_id, user_id)
    known_lang = getattr(session, "detected_lang", None)

    # ── 1a : Résolution clarification en attente
    if session.pending_clarification and raw_text.strip() in {"1","2","3","4"}:
        options = session.pending_clarification.get("options", [])
        idx = int(raw_text.strip()) - 1
        if 0 <= idx < len(options):
            raw_text = options[idx]
            session.pending_clarification = None
            print(f"[Pipeline] Clarification résolue → '{raw_text}'")

    # ── 1b : NLLB — détection + traduction → FR
    text_fr, lang = _to_fr(raw_text, hint_lang=known_lang)
    if not hasattr(session, "detected_lang") or session.detected_lang != lang:
        session.detected_lang = lang

    # ── 2 : CamemBERT — classification intention/entité
    qobj: QuestionObject = parse_question(text_fr)

    print(f"[Pipeline] Intent={qobj.intent.value} | Entity={qobj.entity.value} "
          f"| Domain={qobj.domain_relevance:.2f} | SmallTalk={qobj.is_small_talk} "
          f"| OutOfScope={qobj.is_out_of_scope}")

    # ── 2b : Détection feedback négatif (insatisfaction simple, pas triple)
    _NEGATIVE_FEEDBACK = {"pas ce que", "pas correct", "mauvaise reponse", "pas bon",
                          "pas ca", "pas ça", "voulais pas", "voulu", "entendre",
                          "comprends pas", "incorrect", "erreur", "faux", "nul",
                          "pas normale", "pas bonne"}
    text_lower = text_fr.lower()
    is_negative_feedback = any(neg in text_lower for neg in _NEGATIVE_FEEDBACK)
    if is_negative_feedback and qobj.intent == Intent.INCOMPREHENSIBLE:
        msg = ("Je comprends votre frustration 😌 Pouvez-vous reformuler votre question "
               "pour que je puisse mieux vous aider ?\n\n"
               "Par exemple : « Comment réserver un trajet ? » ou « Problème avec mon paiement »")
        out = _from_fr(msg, lang)
        _log(session_id, raw_text, qobj, None, out, 0.0)
        return PipelineResult(
            text=out, response_type="reformulation", confidence=0.0,
            faq_id=None, judge_scores=[], fallback_reason="negative_feedback",
            should_escalate=False, clarification=None,
            session_id=session_id, detected_lang=lang, decision_zone="UNCERTAIN",
        )

    # ── 3 : Filtre rapide — small talk (salutation/remerciement)
    if qobj.is_small_talk:
        talk = detect_small_talk_type(qobj) or "greeting"
        fr   = render_identity(talk)
        _log(session_id, raw_text, qobj, None, fr, 1.0)
        return _build_result("identity", fr, lang, 1.0, session_id)

    # ── 3b : Filtre hors-scope EXPLICITE
    # Seuls HORS_SCOPE et is_out_of_scope=True sont bloqués ici.
    # INCOMPREHENSIBLE avec domain_relevance >= 0.40 passe vers le matching.
    if qobj.is_out_of_scope or qobj.intent == Intent.HORS_SCOPE:
        fr = render_identity("out_of_scope")
        _log(session_id, raw_text, qobj, None, fr, 0.0)
        return _build_result("identity", fr, lang, 0.0, session_id, reason="out_of_scope")

    # ── 3c : Filtre domain_relevance (NE bloque PAS INCOMPREHENSIBLE avec contexte)
    # INCOMPREHENSIBLE avec domain_relevance >= 0.40 → laissé passer vers le matching
    # INCOMPREHENSIBLE avec domain_relevance < 0.40 → offrir une clarification générique
    #   au lieu de rejeter comme out_of_scope (l'utilisateur s'adresse peut-être au bot)
    if not is_domain_relevant(qobj):
        if qobj.intent == Intent.INCOMPREHENSIBLE and qobj.domain_relevance < 0.40:
            # Offrir une clarification générique plutôt que rejeter
            session = get_or_create_session(session_id, user_id)
            if session.clarification_count < MAX_CLARIF_LOOPS:
                session.clarification_count += 1
                clarif = generate_clarification(qobj)  # intent=incomprehensible → "default"
                session.pending_clarification = clarif
                msg = f"Je veux bien vous aider 🙂 Pouvez-vous préciser votre demande ?\n\n{clarif['question']}\n"
                for i, opt in enumerate(clarif["options"], 1):
                    msg += f"{i}. {opt}\n"
                msg += f"\n({session.clarification_count}/{MAX_CLARIF_LOOPS})"
                out = _from_fr(msg, lang)
                _log(session_id, raw_text, qobj, None, out, 0.3)
                return PipelineResult(
                    text=out, response_type="clarification", confidence=0.3,
                    faq_id=None, judge_scores=[], fallback_reason="generic_help_request",
                    should_escalate=False, clarification=clarif,
                    session_id=session_id, detected_lang=lang, decision_zone="UNCERTAIN",
                )
            else:
                fr = render_identity("out_of_scope")
                _log(session_id, raw_text, qobj, None, fr, 0.0)
                return _build_result("identity", fr, lang, 0.0, session_id, reason="truly_out_of_scope")
        elif qobj.intent != Intent.INCOMPREHENSIBLE:
            # Intent identifié mais domain_relevance faible → cas rare
            fr = render_identity("out_of_scope")
            _log(session_id, raw_text, qobj, None, fr, 0.0)
            return _build_result("identity", fr, lang, 0.0, session_id, reason="out_of_scope")

    # ── 4 : Feature Encoding
    fv = encode(qobj)

    # ── 5 : Matching Engine → exactement N candidats (idéalement 6)
    raw_candidates = find_candidates(fv, _get_faq(), top_n=6)
    candidates     = candidates_to_response_objects(raw_candidates)

    if not candidates:
        return _unknown(session_id, raw_text, qobj, lang, "no_candidates")

    # ── 6 : IA Judge évalue TOUS les candidats
    weights    = load_weights()
    all_scores = evaluate_all(qobj, candidates, weights=weights)
    best_resp, zone = decide(all_scores, candidates)

    print(f"[Pipeline] Zone={zone} | Best={all_scores[0].global_score:.2f} | "
          f"Candidates={len(candidates)} | Intent={qobj.intent.value}")

    # ── 7 : Routing selon la zone de décision
    if zone == "CONFIDENT":
        fr_response = render_response(best_resp, qobj)
        out = _from_fr(fr_response, lang)
        spread = all_scores[0].global_score - all_scores[1].global_score if len(all_scores) >= 2 else 0.0
        _log(session_id, raw_text, qobj, best_resp.faq_source_id, out, best_resp.score,
             judge_scores=all_scores, decision_zone="CONFIDENT",
             score_spread=round(spread, 4), detected_lang=lang)
        return PipelineResult(
            text=out, response_type="answer", confidence=best_resp.score,
            faq_id=best_resp.faq_source_id, judge_scores=all_scores,
            fallback_reason="", should_escalate=False, clarification=None,
            session_id=session_id, detected_lang=lang, decision_zone="CONFIDENT",
        )

    elif zone == "UNCERTAIN":
        if session.clarification_count < MAX_CLARIF_LOOPS:
            session.clarification_count += 1
            clarif = generate_clarification(qobj)
            session.pending_clarification = clarif
            msg  = f"{clarif['message']} ({session.clarification_count}/{MAX_CLARIF_LOOPS})"
            out  = _from_fr(msg, lang)
            spread = all_scores[0].global_score - all_scores[1].global_score if len(all_scores) >= 2 else 0.0
            _log(session_id, raw_text, qobj, None, out, all_scores[0].global_score,
                 judge_scores=all_scores, decision_zone="UNCERTAIN",
                 score_spread=round(spread, 4), detected_lang=lang)
            return PipelineResult(
                text=out, response_type="clarification",
                confidence=all_scores[0].global_score,
                faq_id=None, judge_scores=all_scores,
                fallback_reason=f"uncertain_{zone}", should_escalate=False,
                clarification=clarif, session_id=session_id,
                detected_lang=lang, decision_zone="UNCERTAIN",
            )
        else:
            # Max clarifications atteint → meilleure réponse disponible
            best_candidate = next(
                (r for r in candidates if r.response_id == all_scores[0].response_id),
                None
            )
            if best_candidate:
                fr_response = render_response(best_candidate, qobj)
                note = "\n\n_(Réponse approximative — je n'étais pas certain 😌)_"
                out  = _from_fr(fr_response + note, lang)
                _log(session_id, raw_text, qobj, best_candidate.faq_source_id, out,
                     all_scores[0].global_score)
                session.clarification_count = 0
                return PipelineResult(
                    text=out, response_type="answer",
                    confidence=all_scores[0].global_score,
                    faq_id=best_candidate.faq_source_id, judge_scores=all_scores,
                    fallback_reason="max_clarif_reached", should_escalate=False,
                    clarification=None, session_id=session_id,
                    detected_lang=lang, decision_zone="UNCERTAIN",
                )
            return _unknown(session_id, raw_text, qobj, lang, "max_clarif_no_candidate", all_scores)

    else:
        return _unknown(session_id, raw_text, qobj, lang, "below_threshold", all_scores)


# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────

def _unknown(sid, raw, qobj, lang, reason, scores=None) -> PipelineResult:
    fr  = IDENTITY_RESPONSES["fallback"]
    out = _from_fr(fr, lang)
    _log(sid, raw, qobj, None, out, 0.0)
    return PipelineResult(
        text=out, response_type="unknown", confidence=0.0,
        faq_id=None, judge_scores=scores or [], fallback_reason=reason,
        should_escalate=False, clarification=None,
        session_id=sid, detected_lang=lang, decision_zone="UNKNOWN",
    )


def _build_result(
    rtype, fr, lang, conf, sid,
    reason="", escalate=False, scores=None, clarif=None
) -> PipelineResult:
    return PipelineResult(
        text=_from_fr(fr, lang), response_type=rtype,
        confidence=conf, faq_id=None,
        judge_scores=scores or [], fallback_reason=reason,
        should_escalate=escalate, clarification=clarif,
        session_id=sid, detected_lang=lang, decision_zone="",
    )


def _log(
    sid, raw, qobj, faq_id, response, conf,
    judge_scores=None, decision_zone="", score_spread=0.0,
    best_kpi=None, detected_lang="fr",
):
    if best_kpi is None and judge_scores:
        s = judge_scores[0]
        best_kpi = {
            "pertinence":           round(s.pertinence, 4),
            "couverture_intention": round(s.couverture_intention, 4),
            "clarte":               round(s.clarte, 4),
            "coherence":            round(s.coherence, 4),
            "proximite_faq":        round(s.proximite_faq, 4),
            "historique_succes":    round(s.historique_succes, 4),
        }

    add_message(
        session_id       = sid,
        input_text       = raw,
        question_object  = {
            "intent":    qobj.intent.value,
            "entity":    qobj.entity.value,
            "urgency":   qobj.urgency_score,
            "domain":    qobj.domain_relevance,
            "ambiguity": qobj.ambiguity_score,
        },
        predicted_faq_id = faq_id,
        response         = response,
        confidence       = conf,
        judge_scores     = judge_scores,
        decision_zone    = decision_zone,
        score_spread     = score_spread,
        best_kpi         = best_kpi,
        detected_lang    = detected_lang,
    )


def reload_faq():
    global _FAQ_ITEMS
    force_refresh()
    _FAQ_ITEMS = load_faq_resolved()
    print(f"[Pipeline] FAQ rechargée — {len(_FAQ_ITEMS)} entrées")
