#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════╗
║   TALKI — Console de test interactive        ║
║   Cité-Covoiturage · Collège La Cité         ║
╚══════════════════════════════════════════════╝

Usage :
  python talki_console.py
  python talki_console.py --url http://localhost:8000

Commandes :
  /quit              — Fermer la session (demande note)
  /new               — Nouvelle conversation
  /debug             — Activer/désactiver les détails techniques
  /clear             — Vider l'écran
  /status            — Vérifier que les services sont en ligne
  /lang <code>       — Tester une langue (ex: /lang en /lang ar)
  /feedback <1-5>    — Envoyer une note sans fermer la session
  /history           — Afficher les derniers échanges
  /reload            — Forcer le rechargement FAQ depuis le serveur web
  /training          — Déclencher le training loop manuellement
  /stats             — Afficher métriques FAQ et poids KPI
"""

import sys
import os
import uuid
import argparse
import textwrap
from datetime import datetime

try:
    import httpx
except ImportError:
    print("httpx requis : pip install httpx")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

INTERNAL_TOKEN = os.environ.get(
    "CHATBOT_INTERNAL_TOKEN",
    "82a51cc52f5a012f6a153a529df06fe393e767f578bdd48af70d14e2126fd746"
)
ADMIN_SECRET   = os.environ.get("CHATBOT_ADMIN_SECRET", INTERNAL_TOKEN)
_AUTH_HEADERS  = {"x-internal-token": INTERNAL_TOKEN}


# ─────────────────────────────────────────────
#  COULEURS ANSI
# ─────────────────────────────────────────────

class C:
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    DIM     = "\033[2m"
    WHITE   = "\033[97m"
    CYAN    = "\033[96m"
    GREEN   = "\033[92m"
    YELLOW  = "\033[93m"
    RED     = "\033[91m"
    BLUE    = "\033[94m"
    MAGENTA = "\033[95m"
    GREY    = "\033[90m"

USE_COLOR = hasattr(sys.stdout, "isatty") and sys.stdout.isatty()

def c(color, text):
    return f"{color}{text}{C.RESET}" if USE_COLOR else text

def dim(text):
    return c(C.DIM + C.GREY, text)

def bold(text):
    return c(C.BOLD, text)


# ─────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────

DEFAULT_URL = "http://127.0.0.1:8000"
TIMEOUT     = 15.0
WIDTH       = 70


# ─────────────────────────────────────────────
#  CLIENT TALKI
# ─────────────────────────────────────────────

def chat(base_url, message, session_id, user_id="console-tester"):
    with httpx.Client(timeout=TIMEOUT) as client:
        r = client.post(
            f"{base_url}/chat",
            json={"message": message, "session_id": session_id, "user_id": user_id},
            headers=_AUTH_HEADERS,
        )
        r.raise_for_status()
        return r.json()


def send_feedback(base_url, session_id, rating):
    try:
        with httpx.Client(timeout=5.0) as client:
            client.post(
                f"{base_url}/feedback",
                json={"session_id": session_id, "rating": rating},
                headers=_AUTH_HEADERS,
            )
        return True
    except Exception:
        return False


def check_health(base_url):
    try:
        with httpx.Client(timeout=3.0) as client:
            r = client.get(f"{base_url}/health")
            r.raise_for_status()
            return r.json()
    except Exception:
        return None


def trigger_reload(base_url):
    """Force le rechargement FAQ depuis le serveur web."""
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.post(
                f"{base_url}/admin/reload-faq",
                json={"secret": ADMIN_SECRET},
                headers=_AUTH_HEADERS,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        return {"error": str(e)}


def trigger_training(base_url):
    """Déclenche le training loop manuellement."""
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.post(
                f"{base_url}/admin/trigger-training",
                json={"secret": ADMIN_SECRET},
                headers=_AUTH_HEADERS,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        return {"error": str(e)}


def get_stats(base_url):
    """Récupère les métriques FAQ et poids KPI."""
    try:
        with httpx.Client(timeout=5.0) as client:
            r = client.get(
                f"{base_url}/admin/metrics",
                params={"secret": ADMIN_SECRET},
                headers=_AUTH_HEADERS,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────
#  AFFICHAGE
# ─────────────────────────────────────────────

def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def print_header():
    print()
    print(c(C.CYAN + C.BOLD, "╔" + "═" * (WIDTH - 2) + "╗"))
    print(c(C.CYAN + C.BOLD, "║") + c(C.WHITE + C.BOLD, "  🚗 TALKI — Console de test".center(WIDTH - 2)) + c(C.CYAN + C.BOLD, "║"))
    print(c(C.CYAN + C.BOLD, "║") + c(C.GREY, "  Cité-Covoiturage · Collège La Cité".center(WIDTH - 2)) + c(C.CYAN + C.BOLD, "║"))
    print(c(C.CYAN + C.BOLD, "╚" + "═" * (WIDTH - 2) + "╝"))
    print()
    print(dim("  /quit /new /debug /history /stats /reload /training /status /lang"))
    print()


def print_user_bubble(text):
    print(f"\n  {c(C.BLUE + C.BOLD, '  Vous  ')} {c(C.GREY, datetime.now().strftime('%H:%M'))}")
    for line in textwrap.wrap(text, width=WIDTH - 6):
        print(f"  {c(C.WHITE, line)}")


def print_talki_bubble(data, debug=False):
    rtype      = data.get("response_type", "?")
    confidence = data.get("confidence", 0.0)
    text       = data.get("text", "")
    faq_id     = data.get("faq_id")
    lang       = data.get("detected_lang", "?")
    escalate   = data.get("should_escalate", False)
    clarif     = data.get("clarification")

    type_colors = {
        "answer":        C.GREEN,
        "clarification": C.YELLOW,
        "fallback":      C.YELLOW,
        "identity":      C.CYAN,
        "escalation":    C.RED,
    }
    type_color = type_colors.get(rtype, C.WHITE)
    conf_bar   = _confidence_bar(confidence)
    type_tag   = c(type_color + C.BOLD, f"[{rtype}]")

    print(f"\n  {c(C.MAGENTA + C.BOLD, '  Talki  ')} {c(C.GREY, datetime.now().strftime('%H:%M'))}  {type_tag}  {conf_bar}")
    print()

    for line in text.split("\n"):
        if line.strip():
            for wrapped in textwrap.wrap(line, width=WIDTH - 6):
                print(f"  {c(C.WHITE, wrapped)}")
        else:
            print()

    if clarif and clarif.get("options"):
        print()
        print(f"  {c(C.YELLOW, clarif.get('question', ''))}")
        for i, opt in enumerate(clarif["options"], 1):
            print(f"  {c(C.YELLOW + C.BOLD, str(i) + '.')} {c(C.WHITE, opt)}")

    if debug:
        print()
        print(dim("  ┌ debug ───────────────────────────────"))
        print(dim(f"  │ confiance   : {confidence:.2f}"))
        print(dim(f"  │ langue      : {lang}"))
        if faq_id:
            print(dim(f"  │ faq_source  : {faq_id}"))
        if escalate:
            print(dim("  │ ⚠ escalation déclenchée"))
        print(dim("  └─────────────────────────────────────"))
    print()


def _confidence_bar(score):
    filled = round(score * 10)
    bar    = "█" * filled + "░" * (10 - filled)
    color  = C.GREEN if score >= 0.75 else (C.YELLOW if score >= 0.50 else C.RED)
    return c(color, f"{bar} {score:.0%}")


def print_status(base_url):
    health = check_health(base_url)
    if health:
        print(f"\n  {c(C.GREEN + C.BOLD, '● Talki en ligne')}  {dim(base_url)}")
        print(dim(f"  version : {health.get('version', '?')}"))
    else:
        print(f"\n  {c(C.RED + C.BOLD, '✗ Talki hors ligne')}  {dim(base_url)}")
        print(dim("  Lance : uvicorn api:app --host 127.0.0.1 --port 8000"))
    print()


def print_session_start(session_id):
    print(f"  {c(C.GREY, 'Session')} {c(C.CYAN, session_id[:8] + '...')}")
    print()


def print_history(history):
    if not history:
        print(dim("\n  Aucun échange dans cette session.\n"))
        return
    print(f"\n  {c(C.CYAN + C.BOLD, f'Historique — {len(history)} échange(s)')}\n")
    for i, entry in enumerate(history, 1):
        ts   = entry.get("time", "")
        user = entry.get("user", "")
        resp = entry.get("response", "")
        rtype = entry.get("type", "?")
        conf  = entry.get("confidence", 0.0)
        print(dim(f"  [{i}] {ts}"))
        print(f"  {c(C.BLUE, '›')} {c(C.WHITE, user[:60])}")
        print(f"  {c(C.MAGENTA, '»')} {c(C.GREY, resp[:80])}  {_confidence_bar(conf)}")
        print()


def print_stats(data):
    if "error" in data:
        print(f"\n  {c(C.RED, '✗')} {data['error']}\n")
        return

    weights = data.get("kpi_weights", {})
    metrics = data.get("faq_metrics", {})

    version_str = str(weights.get("version", "?"))
    print(f"\n  {c(C.CYAN + C.BOLD, chr(9472)*2 + ' Poids KPI du Judge')}  {dim('v' + version_str)}  \n")
    kpi_items = [
        ("pertinence",           weights.get("pertinence", 0)),
        ("couverture_intention", weights.get("couverture_intention", 0)),
        ("clarté",               weights.get("clarte", 0)),
        ("cohérence",            weights.get("coherence", 0)),
        ("proximité FAQ",        weights.get("proximite_faq", 0)),
        ("historique succès",    weights.get("historique_succes", 0)),
    ]
    for name, val in kpi_items:
        bar   = "█" * round(val * 20)
        color = C.GREEN if val >= 0.20 else C.YELLOW
        print(f"  {name:<22} {c(color, f'{bar:<20}')} {val:.0%}")

    if metrics:
        print(f"\n  {c(C.CYAN + C.BOLD, '── Métriques FAQ')}\n")
        print(f"  {'FAQ ID':<20} {'F1':>6}  {'TP':>4}  {'FP':>4}  {'FN':>4}")
        print(dim("  " + "─" * 44))
        for faq_id, m in list(metrics.items())[:10]:
            f1 = m.get("f1", 0.0)
            color = C.GREEN if f1 >= 0.75 else (C.YELLOW if f1 >= 0.5 else C.RED)
            print(f"  {faq_id:<20} {c(color, f'{f1:.0%}'):>6}  {m.get('TP',0):>4}  {m.get('FP',0):>4}  {m.get('FN',0):>4}")
    else:
        print(dim("\n  Pas encore de métriques — lance /training d'abord.\n"))
    print()


def print_goodbye(session_id, base_url):
    print()
    print(c(C.CYAN, "  Note de la conversation (1-5, ou Entrée pour passer)"))
    try:
        raw = input(c(C.GREY, "  ★ ")).strip()
        if raw.isdigit() and 1 <= int(raw) <= 5:
            if send_feedback(base_url, session_id, int(raw)):
                print(dim("  Feedback envoyé 🙂"))
    except (EOFError, KeyboardInterrupt):
        pass
    print()
    print(c(C.CYAN + C.BOLD, "  Bonne route 🚗"))
    print()


# ─────────────────────────────────────────────
#  BOUCLE PRINCIPALE
# ─────────────────────────────────────────────

def run(base_url):
    clear_screen()
    print_header()
    print_status(base_url)

    debug      = False
    session_id = str(uuid.uuid4())
    history    = []
    print_session_start(session_id)

    while True:
        try:
            raw = input(c(C.BLUE + C.BOLD, "  › ") + "").strip()
        except (EOFError, KeyboardInterrupt):
            print_goodbye(session_id, base_url)
            break

        if not raw:
            continue

        # ── Commandes internes
        if raw.startswith("/"):
            cmd = raw.lower().split()[0]

            if cmd in ("/quit", "/exit", "/q"):
                print_goodbye(session_id, base_url)
                break

            elif cmd == "/new":
                session_id = str(uuid.uuid4())
                history    = []
                print(f"\n  {c(C.CYAN, 'Nouvelle session démarrée')}")
                print_session_start(session_id)

            elif cmd == "/debug":
                debug = not debug
                state = c(C.GREEN, "activé") if debug else c(C.GREY, "désactivé")
                print(f"\n  Debug {state}\n")

            elif cmd == "/clear":
                clear_screen()
                print_header()

            elif cmd == "/status":
                print_status(base_url)

            elif cmd == "/lang":
                parts = raw.split()
                if len(parts) >= 2:
                    print(dim(f"\n  Langue : {parts[1]} — écris directement dans cette langue\n"))
                else:
                    print(dim("\n  Usage : /lang <code>  ex: /lang en, /lang ar, /lang es\n"))

            elif cmd == "/feedback":
                parts = raw.split()
                if len(parts) >= 2 and parts[1].isdigit() and 1 <= int(parts[1]) <= 5:
                    rating = int(parts[1])
                    if send_feedback(base_url, session_id, rating):
                        stars = "★" * rating + "☆" * (5 - rating)
                        print(f"\n  {c(C.YELLOW, stars)} Feedback {rating}/5 envoyé\n")
                    else:
                        print(dim("\n  Erreur envoi feedback\n"))
                else:
                    print(dim("\n  Usage : /feedback <1-5>  ex: /feedback 4\n"))

            elif cmd == "/history":
                print_history(history)

            elif cmd == "/reload":
                print(dim("\n  Rechargement FAQ en cours..."))
                result = trigger_reload(base_url)
                if "error" in result:
                    print(f"  {c(C.RED, '✗')} {result['error']}\n")
                else:
                    print(f"  {c(C.GREEN, '✓')} {result.get('message', 'FAQ rechargée')}\n")

            elif cmd == "/training":
                print(dim("\n  Démarrage du Training Loop en arrière-plan..."))
                result = trigger_training(base_url)
                if "error" in result:
                    print(f"  {c(C.RED, '✗')} {result['error']}\n")
                else:
                    print(f"  {c(C.GREEN, '✓')} {result.get('message', 'Training lancé')}\n")
                    print(dim("  Surveille le terminal de l'API pour suivre la progression.\n"))

            elif cmd == "/stats":
                print(dim("\n  Récupération des métriques..."))
                print_stats(get_stats(base_url))

            else:
                print(dim(f"\n  Commande inconnue : {cmd}  (tape /quit pour quitter)\n"))

            continue

        # ── Message vers Talki
        print_user_bubble(raw)

        try:
            data = chat(base_url, raw, session_id)
            print_talki_bubble(data, debug=debug)

            # Enregistrer dans l'historique local
            history.append({
                "time":       datetime.now().strftime("%H:%M"),
                "user":       raw,
                "response":   data.get("text", "")[:80],
                "type":       data.get("response_type", "?"),
                "confidence": data.get("confidence", 0.0),
            })
            if len(history) > 20:
                history.pop(0)

            # Escalation → nouvelle session auto
            if data.get("should_escalate"):
                print(c(C.RED + C.BOLD, "  ⚠ Session escaladée vers le support."))
                session_id = str(uuid.uuid4())
                history    = []
                print(dim(f"  Nouvelle session : {session_id[:8]}...\n"))

        except httpx.ConnectError:
            print(f"\n  {c(C.RED, '✗ Connexion refusée')} — Talki est-il démarré ?\n")
        except httpx.TimeoutException:
            print(f"\n  {c(C.YELLOW, '⏱ Timeout')} — Talki met trop de temps à répondre.\n")
        except httpx.HTTPStatusError as e:
            print(f"\n  {c(C.RED, f'✗ Erreur HTTP {e.response.status_code}')}\n")
        except Exception as e:
            print(f"\n  {c(C.RED, f'✗ Erreur : {e}')}\n")


# ─────────────────────────────────────────────
#  POINT D'ENTRÉE
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Talki — Console de test interactive")
    parser.add_argument("--url", default=DEFAULT_URL, help=f"URL Talki (défaut : {DEFAULT_URL})")
    args = parser.parse_args()
    try:
        run(args.url)
    except KeyboardInterrupt:
        print(c(C.CYAN + C.BOLD, "\n\n  Bonne route 🚗\n"))
        sys.exit(0)


if __name__ == "__main__":
    main()
