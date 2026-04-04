# 🚗 TALKI — README DE LANCEMENT & INTÉGRATION
### Chatbot de support Cité-Covoiturage · Collège La Cité

---

## PHILOSOPHIE

Talki est notre IA — pas un service externe loué.  
Trois modèles open source, tout en local, zéro coût à l'usage, zéro dépendance externe.

```
User (n'importe quelle langue)
  ↓  NLLB-200 (Meta) — traduit vers le français
  ↓  CamemBERT (Inria) — comprend l'intention
  ↓  Random Forest — trouve la bonne réponse FAQ
  ↓  IA Judge — valide la confiance (seuil 75%)
  ↓  Template direct — réponse propre
  ↓  NLLB-200 — retraduit vers la langue de l'utilisateur
User reçoit sa réponse dans sa langue
```

**Aucun appel à Claude, GPT, ou n'importe quelle API payante.**

---

## ARCHITECTURE DES SERVICES

```
:3000  Serveur web Next.js     (ton app existante)
  └─── /api/internal/chatbot/faq  ← endpoint que Talki appelle pour récupérer les FAQs

:8000  Talki API principale    (pipeline + judge + cache)
:8001  CamemBERT Service       (classification + embeddings)
:8002  Service Traducteur      (NLLB-200 — 200 langues)
```

---

## STRUCTURE DES FICHIERS

```
chatbot/
├── camembert_service.py    Service CamemBERT :8001
├── translator_service.py   Service NLLB-200 :8002
├── api.py                  API principale Talki :8000
├── pipeline.py             Orchestrateur central
├── llm_parser.py           Appelle :8001 → QuestionObject
├── renderer.py             Templates directs + identité Talki
├── faq_client.py           Récupère FAQ depuis le serveur web :3000
├── matching_engine.py      Random Forest + cosinus
├── judge.py                IA Judge algorithmique (KPI évolutifs)
├── feature_encoder.py      QuestionObject → vecteur numérique
├── conversation_cache.py   Sessions + détection comportementale
├── training_loop.py        Boucle nocturne d'entraînement
├── models.py               Tous les objets de données
├── faq_data.json           FAQ seed initiale (avant 1er sync serveur)
└── requirements.txt
```

---

## INSTALLATION

### 1. Environnement Python
```bash
cd chatbot/
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Variables d'environnement
```bash
# .env dans chatbot/
WEB_SERVER_URL=http://localhost:3000
CHATBOT_INTERNAL_TOKEN=talki-internal-secret   # à changer en prod
```

### 3. Téléchargement des modèles (première fois uniquement)
Les modèles se téléchargent automatiquement depuis HuggingFace au premier démarrage.

| Modèle | Taille | Usage |
|--------|--------|-------|
| `camembert-base` | ~440 MB | Classification + embeddings |
| `facebook/nllb-200-distilled-600M` | ~600 MB | Traduction 200 langues |

Total : ~1 GB. Comparé à Ollama (12 GB + GPU), c'est rien.

---

## DÉMARRAGE

Lancer les 3 services dans 3 terminaux séparés (ou en background) :

```bash
# Terminal 1 — Traducteur NLLB
uvicorn translator_service:app --port 8002

# Terminal 2 — CamemBERT
uvicorn camembert_service:app --port 8001

# Terminal 3 — API Talki (attend que les 2 autres soient prêts)
uvicorn api:app --port 8000 --reload
```

Vérification :
```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8000/health
```

---

## INTÉGRATION CÔTÉ SERVEUR WEB (Next.js)

### A. Endpoint FAQ à créer dans l'app Next.js

Talki appelle cet endpoint pour récupérer les FAQs en temps réel.  
C'est la couche de sécurité — Talki ne touche jamais directement la DB.

```typescript
// app/api/internal/chatbot/faq/route.ts
import { NextRequest, NextResponse } from 'next/server'

const INTERNAL_TOKEN = process.env.CHATBOT_INTERNAL_TOKEN

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-internal-token')
  if (token !== INTERNAL_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Récupérer depuis ta DB (adapte selon ton ORM)
  const faqs = await getFAQsFromDB()

  // Format attendu par Talki (FAQItemModel)
  return NextResponse.json(faqs)
}
```

### B. Appel depuis le frontend vers Talki

Le frontend ne parle PAS directement à Talki — il passe par le BFF.

```typescript
// app/api/chat/route.ts  (BFF Next.js)
export async function POST(req: NextRequest) {
  const { message, sessionId, userId } = await req.json()

  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId, user_id: userId }),
  })

  const data = await response.json()
  return NextResponse.json(data)
}
```

### C. Format de réponse Talki

```typescript
interface TalkiResponse {
  text:             string        // Réponse dans la langue de l'utilisateur
  response_type:    'answer' | 'clarification' | 'fallback' | 'identity' | 'escalation'
  confidence:       number        // 0.0 – 1.0
  faq_id:           string | null
  detected_lang:    string        // code ISO 639-1 détecté
  should_escalate:  boolean
  clarification: {                // présent si response_type === 'clarification'
    question: string
    options:  string[]
  } | null
}
```

---

## PREMIER CYCLE D'ENTRAÎNEMENT

Avant le premier démarrage, lancer le training loop une fois manuellement :

```bash
python training_loop.py
```

Cela va :
1. Charger la FAQ depuis le serveur web (ou le seed local)
2. Générer le dataset d'entraînement
3. Tenter le fine-tuning CamemBERT (si assez de données)
4. Initialiser les métriques et les poids KPI

---

## CYCLE NOCTURNE AUTOMATIQUE

Le scheduler tourne automatiquement toutes les 6h dès que l'API principale est lancée.

Ce qui se passe chaque nuit :
```
1. Refresh FAQ depuis le serveur web
2. Analyse conversations compressées (TP/FP/FN/TN)
3. Mise à jour métriques par FAQ
4. Ajustement poids KPI du Judge
5. Génération dataset enrichi
6. Fine-tuning CamemBERT (si ≥ 50 exemples)
7. Si fine-tuning réussi → POST /reload sur :8001
8. Pruning FAQ sous-performantes (F1 < 30%)
9. Purge cache sessions
```

---

## LANGUES SUPPORTÉES

| Langue | Code | Couverture |
|--------|------|------------|
| Français | `fr` | ✓ (langue native du système) |
| Anglais | `en` | ✓ |
| Arabe | `ar` | ✓ |
| Espagnol | `es` | ✓ |
| Portugais | `pt` | ✓ |
| Créole haïtien | `ht` | ✓ |
| + 194 autres | — | NLLB-200 |

---

## ENDPOINTS ADMIN

```
GET  /admin/metrics?secret=...       Métriques FAQ + poids KPI
GET  /admin/training-logs?secret=... Historique cycles nocturnes
POST /admin/trigger-training         Déclenche training manuel
POST /admin/reload-faq               Force refresh FAQ depuis serveur web
```

---

## SÉCURITÉ

- Talki tourne sur des ports internes — jamais exposé directement à Internet
- Toutes les requêtes utilisateurs passent par le BFF Next.js
- L'accès aux FAQs DB est protégé par token interne
- Le Judge refuse toute réponse sous 75% de confiance
- Triple insatisfaction → escalation automatique vers support humain

---

## ÉVOLUTION

```
Maintenant   : Règles CamemBERT (avant 1er fine-tuning)
+1 semaine   : CamemBERT fine-tuné sur FAQ seed (50+ exemples)
+1 mois      : CamemBERT affiné sur vraies conversations
+3 mois      : Precision > 90% sur les intents courants
```

Talki devient meilleur chaque nuit. Automatiquement.
