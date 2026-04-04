"""
Talki — FAQ Client
Récupère les FAQs depuis le serveur web Next.js (BFF).
Couche de sécurité : le service chatbot n'accède jamais directement à la DB.
Toutes les requêtes passent par le serveur web qui contrôle les accès.
"""

from __future__ import annotations
import json
import os
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv
load_dotenv()

from models import FAQItemResolved, Intent, Entity

# ── Config
WEB_SERVER_BASE = os.environ.get("WEB_SERVER_URL", "http://localhost:3000")
FAQ_ENDPOINT    = f"{WEB_SERVER_BASE}/api/faq"
INTERNAL_TOKEN  = os.environ.get(
    "CHATBOT_INTERNAL_TOKEN",
    "82a51cc52f5a012f6a153a529df06fe393e767f578bdd48af70d14e2126fd746"
)

# ── Cache local (évite les appels répétés au serveur web)
CACHE_PATH     = Path(__file__).parent / "data" / "faq_cache.json"
CACHE_TTL_SECS = 3600  # Rafraîchi toutes les heures


def fetch_faq_from_server() -> list[dict]:
    """
    Appelle le serveur web Next.js pour récupérer les FAQs stockées en DB.
    Retourne [] si inaccessible — NE sauvegarde PAS en cache sur échec
    pour forcer un retry au prochain appel.
    """
    headers = {
        "x-internal-token": INTERNAL_TOKEN,
        "Content-Type":     "application/json",
    }
    try:
        response = httpx.get(FAQ_ENDPOINT, headers=headers, timeout=20.0)
        response.raise_for_status()
        data = response.json()
        # Debug temporaire — à retirer après diagnostic
        print(f"[FAQClient] DEBUG type={type(data).__name__} | "
              f"len={len(data) if isinstance(data, (list,dict)) else '?'} | "
              f"keys={list(data.keys())[:3] if isinstance(data, dict) else 'N/A'}")
        # Normaliser : certains endpoints retournent {} au lieu de [{}]
        if isinstance(data, dict):
            # Chercher la liste dans les valeurs du dict
            for v in data.values():
                if isinstance(v, list) and v:
                    data = v
                    break
            else:
                data = [data]
        elif not isinstance(data, list):
            data = []
        if data:
            print(f"[FAQClient] ✓ {len(data)} groupes FAQ récupérés depuis {FAQ_ENDPOINT}")
            _save_cache(data)
        return data
    except httpx.ConnectError:
        print(f"[FAQClient] Serveur web inaccessible ({WEB_SERVER_BASE})")
        return []
    except httpx.TimeoutException:
        print(f"[FAQClient] Timeout — le serveur web n'a pas répondu dans les 20s ({FAQ_ENDPOINT})")
        return []
    except httpx.HTTPError as e:
        print(f"[FAQClient] Erreur HTTP : {e}")
        return []
    except Exception as e:
        print(f"[FAQClient] Erreur : {e}")
        return []


def _save_cache(data: list[dict], source: str = "server"):
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump({"timestamp": time.time(), "source": source, "data": data}, f, ensure_ascii=False, indent=2)


def _load_cache() -> list[dict]:
    """Charge le cache local si disponible, sinon retourne la FAQ seed."""
    if CACHE_PATH.exists():
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            cached = json.load(f)
        age = time.time() - cached.get("timestamp", 0)
        print(f"[FAQClient] Cache local utilisé (âge : {age/60:.0f} min)")
        return cached.get("data", [])

    # Fallback ultime : fichier seed local
    seed_path = Path(__file__).parent / "faq_data.json"
    if seed_path.exists():
        with open(seed_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        print("[FAQClient] FAQ seed locale utilisée")
        return data
    return []


def _cache_is_fresh() -> bool:
    """Cache frais uniquement si récent ET issu du serveur web (pas du seed)."""
    if not CACHE_PATH.exists():
        return False
    with open(CACHE_PATH, "r", encoding="utf-8") as f:
        cached = json.load(f)
    # Cache seed → toujours retenter le serveur
    if cached.get("source", "seed") == "seed":
        return False
    return (time.time() - cached.get("timestamp", 0)) < CACHE_TTL_SECS


def load_faq_resolved() -> list[FAQItemResolved]:
    """
    Point d'entrée principal.
    Priorité : cache frais → serveur web → seed local.
    Le cache n'est jamais sauvegardé sur échec serveur.
    """
    if _cache_is_fresh():
        raw = _load_cache()
    else:
        raw = fetch_faq_from_server()   # [] si serveur inaccessible
        if not raw:
            raw = _load_cache()         # cache périmé mais utilisable
        if not raw:
            raw = _load_seed()          # seed local en dernier recours

    return _flatten_to_resolved(raw)


def _load_seed() -> list[dict]:
    """Charge le fichier seed local faq_data.json."""
    seed_path = Path(__file__).parent / "faq_data.json"
    if seed_path.exists():
        with open(seed_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"[FAQClient] Seed local utilisé ({len(data)} groupes)")
        return data
    return []


# Mapping categorie serveur → intent interne
CATEGORIE_TO_INTENT: dict[str, str] = {
    "compte":          "compte",
    "inscription":     "compte",
    "connexion":       "compte",
    "accessibilite":   "compte",
    "accessibilité":   "compte",
    "inclusion":       "compte",
    "reservation":     "reservation",
    "réservation":     "reservation",
    "reservations":    "reservation",
    "réservations":    "reservation",
    "demandes":        "reservation",
    "annulation":      "annulation",
    "paiement":        "paiement",
    "paiements":       "paiement",
    "finances":        "paiement",
    "trajet":          "trajet",
    "trajets":         "trajet",
    "covoiturage":     "trajet",
    "conducteur":      "conducteur",
    "passager":        "passager",
    "vehicule":        "vehicule",
    "véhicule":        "vehicule",
    "signalement":     "signalement",
    "litige":          "litige",
    "securite":        "securite",
    "sécurité":        "securite",
    "verification":    "securite",
    "vérification":    "securite",
    "notifications":   "notifications",
    "indisponibilite": "indisponibilite",
    "indisponibilité": "indisponibilite",
    "donnees":         "compte",
    "données":         "compte",
    "confidentialite": "compte",
    "confidentialité": "compte",
    "technique":       "compte",
    "support":         "compte",
}

CATEGORIE_TO_ENTITY: dict[str, str] = {
    "compte":          "compte",
    "inscription":     "compte",
    "connexion":       "compte",
    "accessibilite":   "compte",
    "donnees":         "compte",
    "données":         "compte",
    "technique":       "compte",
    "support":         "compte",
    "reservation":     "reservation",
    "réservation":     "reservation",
    "reservations":    "reservation",
    "réservations":    "reservation",
    "paiement":        "paiement",
    "paiements":       "paiement",
    "finances":        "paiement",
    "trajet":          "trajet",
    "trajets":         "trajet",
    "vehicule":        "vehicule",
    "véhicule":        "vehicule",
    "signalement":     "trajet",
    "securite":        "trajet",
    "sécurité":        "trajet",
    "verification":    "trajet",
}


def _infer_intent(group: dict) -> Intent:
    """
    Infère l'intent depuis les champs du groupe serveur.
    Priorité : intent explicite → id groupe → categorie → incomprehensible.
    L'id est plus précis que la catégorie quand celle-ci est générique (ex: "Technique").
    """
    import unicodedata as _ud

    def _n(text: str) -> str:
        return "".join(
            c for c in _ud.normalize("NFD", text.lower().strip())
            if _ud.category(c) != "Mn"
        )

    # 1. Champ intent explicite
    if "intent" in group:
        try:
            return Intent(group["intent"])
        except ValueError:
            pass

    # 2. Depuis l'id du groupe (plus précis que la catégorie)
    id_norm = _n(group.get("id", ""))
    for key, intent_str in CATEGORIE_TO_INTENT.items():
        if key in id_norm:
            try:
                return Intent(intent_str)
            except ValueError:
                pass

    # 3. Depuis la catégorie
    cat_norm = _n(group.get("categorie", ""))
    for key, intent_str in CATEGORIE_TO_INTENT.items():
        if key in cat_norm:
            try:
                return Intent(intent_str)
            except ValueError:
                pass

    return Intent.INCOMPREHENSIBLE


def _infer_entity(group: dict) -> Entity:
    """Infère l'entity depuis les champs du groupe serveur."""
    if "entity" in group:
        try:
            return Entity(group["entity"])
        except ValueError:
            pass

    cat_raw  = group.get("categorie", group.get("id", "")).lower().strip()
    cat_norm = "".join(
        c for c in __import__("unicodedata").normalize("NFD", cat_raw)
        if __import__("unicodedata").category(c) != "Mn"
    )
    for key, entity_str in CATEGORIE_TO_ENTITY.items():
        if key in cat_norm:
            try:
                return Entity(entity_str)
            except ValueError:
                pass

    return Entity.AUCUN


PUNCT = ".,;:!?()[]'\"-"
def _extract_keywords(question: str, reponse: str) -> list[str]:
    """Extrait des mots-clés simples si absents du format serveur."""
    stop = {"le","la","les","de","du","des","un","une","je","tu","il","elle",
            "nous","vous","ils","et","en","à","au","par","sur","pour","pas",
            "ne","mon","ma","mes","votre","vos","comment","pourquoi","quoi",
            "est","ce","que","qui","si","mais","ou","donc","or","ni","car"}
    words = set()
    for text in [question, reponse]:
        for w in text.lower().split():
            w = w.strip(PUNCT)
            if len(w) > 3 and w not in stop:
                words.add(w)
    return list(words)[:12]


def _flatten_to_resolved(raw: list[dict]) -> list[FAQItemResolved]:
    """
    Aplatit les groupes FAQ en FAQItemResolved.
    Compatible avec le format serveur (sans intent/entity/variations)
    ET le format interne enrichi.
    """
    resolved: list[FAQItemResolved] = []

    for group in raw:
        if not isinstance(group, dict):
            continue
        group_id = group.get("id", "")
        if not group_id:
            continue

        active = group.get("active", True)
        intent = _infer_intent(group)
        entity = _infer_entity(group)

        for item in group.get("items", []):
            if not isinstance(item, dict):
                continue
            question = item.get("question", "").strip()
            reponse  = item.get("reponse", "").strip()
            if not question or not reponse:
                continue

            # Mots-clés : utilisés si présents, sinon extraits automatiquement
            keywords = item.get("keywords", []) or _extract_keywords(question, reponse)

            resolved.append(FAQItemResolved(
                group_id   = group_id,
                sujet      = group.get("sujet", ""),
                categorie  = group.get("categorie", "").lower(),
                intent     = intent,
                entity     = entity,
                question   = question,
                reponse    = reponse,
                variations = item.get("variations", []),
                keywords   = keywords,
                actions    = item.get("actions", []),
                conditions = item.get("conditions", []),
                active     = active,
            ))

    return resolved


def force_refresh():
    """Force le rafraîchissement du cache — appelé par le Training Loop nocturne."""
    return fetch_faq_from_server()
