# 📊 features/dashboard — Documentation Technique

> **Cité-Voiturage** · Dashboard utilisateur  
> Dernière mise à jour : 2026-02-22  
> Rôles couverts : `passenger` · `driver` · `admin`

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture du dossier](#2-architecture-du-dossier)
3. [Composants — `components/shared/`](#3-composants--componentsshared)
4. [Composants — `components/driver/`](#4-composants--componentsdriver)
5. [Composants — `components/passenger/`](#5-composants--componentspassenger)
6. [Hooks](#6-hooks)
7. [Types](#7-types)
8. [Fixtures de développement](#8-fixtures-de-développement)
9. [Utilitaires partagés](#9-utilitaires-partagés)
10. [Conventions et règles](#10-conventions-et-règles)
11. [Roadmap API — Branchements à faire](#11-roadmap-api--branchements-à-faire)

---

## 1. Vue d'ensemble

Le dossier `features/dashboard` contient l'ensemble de l'interface du tableau de bord utilisateur de Cité-Voiturage. Il est structuré en **Feature-Driven Architecture** : chaque couche (composants, hooks, types) est contenue dans le même dossier fonctionnel, ce qui facilite la navigation, la maintenance et le futur remplacement des données de test par des appels API réels.

### Principe fondamental

```
Données  →  Hook  →  Composant (JSX pur)
(fixtures ou API)     (logique zéro)
```

Chaque composant du dashboard est **pur visuellement** : il ne contient aucune logique d'état, de tri, ni de formatage. Tout cela est délégué aux hooks correspondants.

### Rôles et visibilité des composants

| Composant | `shared` | `driver` | `passenger` |
|---|:---:|:---:|:---:|
| HeroSection | ✅ | | |
| SuperSearchSection | ✅ | | |
| FavoritesSection | ✅ | | |
| NotificationsSection | ✅ | | |
| GoBoardSection | ✅ | | |
| ReviewsSection | ✅ | | |
| StatisticSection | ✅ | | |
| LaciteAstucesSection | ✅ | | |
| NouveautesSection | ✅ | | |
| PublishedTripSection | | ✅ | |
| ReservationRequestsSection | | ✅ | |
| FinanceSection | | ✅ | |
| QuickPlanSection | | ✅ | |
| RecentDestinationsSection | | | ✅ |
| RecommendedRidesSection | | | ✅ |
| ReservationsSection | | | ✅ |
| UsualDestinationsSection | | | ✅ |

---

## 2. Architecture du dossier

```
features/dashboard/
│
├── components/
│   ├── shared/                  ← Composants communs à tous les rôles
│   │   ├── index.ts
│   │   ├── hero.tsx
│   │   ├── supersearch.section.tsx  (+ /supersearch/index.ts)
│   │   ├── favorites.section.tsx
│   │   ├── notifications.section.tsx
│   │   ├── goboard.section.tsx
│   │   ├── reviews.section.tsx
│   │   ├── stats.section.tsx
│   │   ├── lacite_astuces.section.tsx
│   │   └── nouveautes.section.tsx
│   │
│   ├── driver/                  ← Exclusif au rôle Conducteur
│   │   ├── index.ts
│   │   ├── published_trips.section.tsx
│   │   ├── reservation_requests.section.tsx
│   │   ├── finance.section.tsx
│   │   └── quickplan.section.tsx
│   │
│   └── passenger/               ← Exclusif au rôle Passager
│       ├── index.ts
│       ├── destination.card.tsx
│       ├── recents-destinations.section.tsx
│       ├── recommended-rides.section.tsx
│       ├── reservations.section.tsx
│       └── usual-destinations.section.tsx
│
├── hooks/                       ← Logique d'état extraite des composants
│   ├── index.ts
│   ├── useFavorites.ts
│   ├── useGoBoard.ts
│   ├── useNotifications.ts
│   ├── useNouveautesSlider.ts
│   ├── usePublishedTrips.ts
│   ├── useRecentDestinations.ts
│   ├── useRecommendedRides.ts
│   ├── useReservationRequests.ts
│   ├── useReservations.ts
│   ├── useSuperSearch.ts
│   └── useUsualDestinations.ts
│
└── types/                       ← Contrats TypeScript de toutes les entités
    ├── index.ts
    ├── applicant.types.ts
    ├── destination.types.ts
    ├── driver.types.ts
    ├── favorite.types.ts
    ├── financesummary.types.ts
    ├── goboard.types.ts
    ├── lacite_astuces.types.ts
    ├── notification.types.ts
    ├── passenger.types.ts
    ├── publishedtrip.types.ts
    ├── publishedtripstatus.types.ts
    ├── reservation.types.ts
    ├── reservationrequest.types.ts
    ├── reservationStatus.types.ts
    ├── review.types.ts
    ├── search.types.ts
    ├── trip.types.ts
    └── trips.way.types.ts

tests/fixtures/dashboard/        ← Données de test isolées (hors production)
    ├── index.ts
    ├── favorites.fixtures.ts
    ├── finance.fixtures.ts
    ├── goboard.fixtures.ts
    ├── lacite_astuces.fixtures.ts
    ├── notifications.fixtures.ts
    ├── nouveautes.fixtures.ts
    ├── publishedtrips.fixtures.ts
    ├── recentDestination.fixtures.ts
    ├── reservationrequest.fixtures.ts
    ├── reservations.fixtures.ts
    ├── reviews.fixtures.ts
    ├── stats.fixtures.ts
    ├── trips.fixtures.ts
    ├── tripways.fixtures.ts
    └── usualDestination.fixtures.ts

core/utils/
    └── date.utils.ts            ← formatTripDate() partagé entre composants
```

---

## 3. Composants — `components/shared/`

Ces composants s'affichent sur tous les tableaux de bord, quel que soit le rôle.

### `HeroSection`

Bandeau d'accueil personnalisé avec le prénom de l'utilisateur connecté, son rôle actif et un bouton de basculement `Passager ↔ Conducteur`. Intègre `SuperSearchSection` directement.

**Props :** aucune — lit directement `appState`.

**Pattern SSR :** utilise un état `mounted` pour éviter les erreurs d'hydratation Next.js liées à `appState.userConnected`.

---

### `SuperSearchSection`

Formulaire de recherche / création de trajet. C'est le composant le plus complexe du dashboard.

**Props :**
```ts
{
  onSearch?: (params: SearchParams) => void
  defaultDeparture?: string         // Pré-rempli par CustomEvent depuis FavoritesSection
  defaultArrival?: string
  favDestinations?: FavDestination[]  // TODO: GET /api/users/{userId}/favorites
}
```

**Délègue à `useSuperSearch` :**
- Autocomplétion `getProposals()` (départ + arrivée, seuil 3 caractères)
- Géolocalisation navigateur → reverse geocoding `getAddressFromCoords()`
- Navigation date (chevrons ± 1 jour, min = aujourd'hui)
- Navigation heure (chevrons ± 5 min, input natif invisible)
- Toggle Maintenant / Planifié
- Toggle picker Départ ↔ Arrivée
- Écoute `CustomEvent "gero-search-section-autofill"` (depuis FavoritesSection)
- Construction `SearchParams` et appel `onSearch()`

---

### `FavoritesSection`

Liste des lieux favoris de l'utilisateur (Domicile, Travail, autres).

**Props :** `favorites?: Favorite[]`

**Logique dans `useFavorites` :**
- Tri : Domicile → Travail → reste
- Dispatch `CustomEvent "gero-search-section-autofill"` au clic sur un favori
- Ouverture/fermeture de la modale de suppression avec scroll lock du body

**TODO :** `DELETE /api/users/{userId}/favorites/{favoriteId}`

---

### `NotificationsSection`

Panneau des notifications récentes de l'utilisateur.

**Props :** `notifications?: Notification[]`

**Logique dans `useNotifications` :**
- Comptage des non-lues avec badge `99+`
- Tri : non-lues puis lues, limité à `max(length/3, 6)`
- Détection des types urgents (`UrgentRappel`, `Retard`)

**Navigation :** clic → `/notifications?notificationViewOpen=true&notificationId={id}`

**TODO :** `GET /api/users/{userId}/notifications?limit=6&unreadFirst=true`

---

### `GoBoardSection`

Liste des défis de gamification GoBoard avec accordéon animé pour les descriptions.

**Props :** `tasks?: GoTask[]`, `currentScore?: number`

**Logique dans `useGoBoard` :**
- État d'expansion par tâche (tableau de booléens immutable)
- Toggle description avec animation `grid-rows-[0fr]/[1fr]`

**Note visuelle :** les lettres "O" du logo Cité-Voiturage ont un effet zoom-out intentionnel sur les badges.

**TODO :** `GET /api/users/{userId}/go-tasks`, `GET /api/users/{userId}/go-score`

---

### `ReviewsSection`

Affiche les derniers avis reçus par l'utilisateur.

**Props :** `reviews?: Review[]`

**Sous-composant :** `StarRating` — supporte les demi-étoiles (ex: 3.5/5).

**TODO :** `GET /api/users/{userId}/reviews?limit=5&sort=date_desc`

---

### `StatisticSection`

Grille 2×2 des indicateurs clés : trajets, CO₂, note moyenne, GoScore.

**Props :** `stats?: UserStatsSummary`

**Calculs internes :**
- `formattedRating` : point → virgule en FR
- `goScoreLabel` : label dynamique selon seuils (> 800 = "Hyper GO!", > 600 = "Fast GO!"…)

**TODO :** `GET /api/users/{userId}/stats/summary`

---

### `LaciteAstucesSection`

Carrousel d'astuces éditoriales sur le covoiturage responsable. Auto-avancement toutes les 15 secondes.

**Props :** `tips?: Tip[]`

**Correction ESLint :** `next` stabilisé via `useCallback` pour éviter la fuite mémoire du `setInterval`.

---

### `NouveautesSection`

Carrousel de vidéos YouTube intégrées (iframes) présentant les nouveautés de la plateforme. Auto-avancement toutes les 3 minutes.

**Props :** `videos?: NouveauteVideo[]`

**Délègue à `useNouveautesSlider`** pour la gestion de l'index et les transitions Framer Motion.

---

## 4. Composants — `components/driver/`

### `PublishedTripSection`

Liste les trajets publiés du conducteur avec priorité d'affichage :
1. **En cours** (GPS actif — bouton carte interactif)
2. **Confirmés / Complets** (triés date croissante)
3. **Publiés** (en attente de passagers)
4. **Annulés** (date décroissante)
5. **Terminés / No-show** (date décroissante)

**Sous-composants :** `PublishedTripCard`, `PassengerAvatars` (liste déroulante à partir de 3 passagers)

**Images :** Unsplash via `getCityImage()`, chargées en `Promise.all` pour chaque carte.

**Délègue à `usePublishedTrips` :** tri, maps statut → libellé/couleur, état UI liste passagers.

**TODO :** `GET /api/driver/{userId}/trips?status=active&limit=10`

---

### `ReservationRequestsSection`

Demandes de réservation en attente, triées par note décroissante puis date croissante (passagers fiables sur les créneaux les plus proches d'abord).

**Sous-composant :** `ReservationRequestCard` avec boutons **Accepter / Refuser**.

**Délègue à `useReservationRequests` :** tri immutable `[...].sort()`.

**TODO :**
- `GET /api/driver/{userId}/reservation-requests?status=pending`
- `POST /api/reservation-requests/{id}/accept`
- `POST /api/reservation-requests/{id}/decline`

---

### `FinanceSection`

Résumé financier du conducteur en 3 blocs : gain mensuel, gains de la semaine (accumulé + en transit), pénalités actives.

**Props :** `finance?: DriverFinanceSummary`

**Détails UI :**
- Pénalités affichées en rouge si > 0, en vert si = 0
- Tooltip `FaInfoCircle` sur "En transit" et "Pénalités" (accessibilité)
- `fmt()` helper interne pour montant + devise

**Aligne sur :** §7 (Paiement Simulé) + §21 (Pénalités Automatiques) du manifeste.

**TODO :** `GET /api/driver/{userId}/finance/summary`

---

### `QuickPlanSection`

Destinations récentes du conducteur pour republication rapide sans formulaire complet.

**Props :** `destinations?: RecentDestination[]`

**Sous-composant :** `DestinationCard` avec :
- Images Unsplash départ/arrivée en clip-path diagonal
- Bouton **Modifier** → prefill de la page de création trajet
- Bouton **Publier** → publication directe avec les valeurs précédentes
- `e.stopPropagation()` sur les boutons pour éviter le routage de la carte

**TODO :**
- `GET /api/driver/{userId}/recent-destinations?limit=5`
- `POST /api/driver/{userId}/trips` (Publier)

---

## 5. Composants — `components/passenger/`

### `RecentDestinationsSection`

Historique des destinations récentes du passager pour relancer rapidement une recherche.

**TODO :** `GET /api/users/{userId}/recent-destinations`

---

### `RecommendedRidesSection`

Suggestions de trajets disponibles basées sur les habitudes et favoris du passager. Implémente l'algorithme de matching §5 du manifeste côté affichage.

**TODO :** `GET /api/trajets/search?departure={favori}&match=true`

---

### `ReservationsSection`

Liste des réservations actives et passées du passager (en attente, confirmées, terminées, annulées).

**TODO :** `GET /api/users/{userId}/reservations`

---

### `UsualDestinationsSection`

Destinations habituelles calculées depuis l'historique (fréquence d'utilisation — §1.2 du manifeste).

**TODO :** `GET /api/users/{userId}/usual-destinations`

---

## 6. Hooks

Tous les hooks suivent la convention : **un hook = une section = une responsabilité**.

| Hook | Composant cible | Responsabilités clés |
|---|---|---|
| `useFavorites` | FavoritesSection | Tri, CustomEvent autofill, modale suppression |
| `useGoBoard` | GoBoardSection | État accordéon par tâche (immutable) |
| `useNotifications` | NotificationsSection | Comptage, tri, badge 99+, détection urgence |
| `useNouveautesSlider` | NouveautesSection | Index courant, transitions Framer Motion |
| `useSuperSearch` | SuperSearchSection | Autocomplétion, géoloc, date/heure, soumission |
| `usePublishedTrips` | PublishedTripSection | Tri prioritaire 5 niveaux, maps statut |
| `useReservationRequests` | ReservationRequestsSection | Tri note desc → date asc |
| `useRecentDestinations` | RecentDestinationsSection | Tri et préparation des données |
| `useRecommendedRides` | RecommendedRidesSection | Matching et filtrage côté client |
| `useReservations` | ReservationsSection | Tri par statut et date |
| `useUsualDestinations` | UsualDestinationsSection | Tri par fréquence |

### Règles appliquées à tous les hooks

- Toujours **immutable** : `[...array].sort()`, jamais `.sort()` directement sur la prop
- Calculs coûteux **mémoïsés** avec `useMemo`
- Callbacks stabilisés avec `useCallback` quand utilisés dans des deps `useEffect`
- **Aucun console.log** en production

---

## 7. Types

Chaque entité métier a son propre fichier de types, importable via le barrel `types/index.ts`.

```ts
import { 
  Favorite, Notification, NotificationType,
  GoTask, Tip, NouveauteVideo,
  Review, UserStatsSummary,
  SearchParams, SuperSearchSectionProps, LocationSuggestion, FavDestination,
  PublishedTrip, PublishedTripStatus, PublishedTripCardModel,
  ReservationRequest, ReservationRequestCardModel,
  DriverFinanceSummary, RecentDestination,
  Passenger, Applicant
} from "@/features/dashboard/types";
```

### Conventions de nommage

| Ancienne convention | Nouvelle convention |
|---|---|
| `Urlpicture` | `urlPicture` |
| `DoneTrips` | `doneTrips` |
| `thisWeeklProfit` | `weeklyProfit` |
| `MensualProfit` | `mensualProfit` |
| `Cancelled` (enum) | `Cancelled` |
| `noShow` (enum) | `NoShow` |
| `published` (enum) | `Published` |

Toutes les propriétés sont en **camelCase**. Les enums sont en **PascalCase**.

---

## 8. Fixtures de développement

Les fixtures sont dans `tests/fixtures/dashboard/` — **jamais** dans `features/`.

```
⚠️ Ces données sont EXCLUSIVEMENT pour le développement.
   Elles doivent être remplacées par les appels API avant la mise en production.
```

Chaque fixture est documentée avec l'endpoint API cible en commentaire `TODO`.

### Import des fixtures

```ts
// Via le barrel (recommandé)
import { FIXTURE_FAVORITES, FIXTURE_NOTIFICATIONS } from "@/tests/fixtures/dashboard";

// Direct (si isolation nécessaire)
import { FIXTURE_PUBLISHED_TRIPS } from "@/tests/fixtures/dashboard/publishedtrips.fixtures";
```

### Correspondance fixtures → API

| Fixture | Endpoint cible |
|---|---|
| `favorites.fixtures.ts` | `GET /api/users/{userId}/favorites` |
| `notifications.fixtures.ts` | `GET /api/users/{userId}/notifications` |
| `goboard.fixtures.ts` | `GET /api/users/{userId}/go-tasks` |
| `stats.fixtures.ts` | `GET /api/users/{userId}/stats/summary` |
| `reviews.fixtures.ts` | `GET /api/users/{userId}/reviews` |
| `finance.fixtures.ts` | `GET /api/driver/{userId}/finance/summary` |
| `publishedtrips.fixtures.ts` | `GET /api/driver/{userId}/trips` |
| `reservationrequest.fixtures.ts` | `GET /api/driver/{userId}/reservation-requests` |
| `reservations.fixtures.ts` | `GET /api/users/{userId}/reservations` |
| `recentDestination.fixtures.ts` | `GET /api/driver/{userId}/recent-destinations` |
| `trips.fixtures.ts` | `GET /api/trajets/search` |
| `tripways.fixtures.ts` | `GET /api/trajets/{id}/waypoints` |
| `usualDestination.fixtures.ts` | `GET /api/users/{userId}/usual-destinations` |
| `lacite_astuces.fixtures.ts` | `GET /api/admin/astuces` (optionnel, CMS) |
| `nouveautes.fixtures.ts` | `GET /api/admin/nouveautes` (optionnel, CMS) |

---

## 9. Utilitaires partagés

### `core/utils/date.utils.ts` — `formatTripDate()`

Formate une date en libellé relatif bilingue (FR/EN), passé **et** futur.

```ts
formatTripDate("2026-02-22", Language.FR)  // → "Aujourd'hui"
formatTripDate("2026-02-23", Language.FR)  // → "Demain"
formatTripDate("2026-02-29", Language.FR)  // → "Dans 7 jours"
formatTripDate("2026-01-01", Language.EN)  // → "2 months ago"
```

**Règles de formatage :**

| Écart | Affichage FR | Affichage EN |
|---|---|---|
| Aujourd'hui | "Aujourd'hui" | "Today" |
| ± 1 jour | "Hier" / "Demain" | "Yesterday" / "Tomorrow" |
| < 7 jours | Nom du jour (ex: "Lundi") | Day name (ex: "Monday") |
| < 30 jours | "Il y a X semaines" / "Dans X semaines" | "X weeks ago" / "In X weeks" |
| < 12 mois | "Il y a X mois" / "Dans X mois" | "X months ago" / "In X months" |
| ≥ 12 mois | "Il y a X ans" / "Dans X ans" | "X years ago" / "In X years" |

Utilisé par : `QuickPlanSection`, `PublishedTripCard`, `ReservationRequestCard`, `NotificationsSection`, `ReviewsSection`.

---

## 10. Conventions et règles

### Structure d'un composant dashboard

```tsx
"use client";

// 1. Imports externes (Next, React, icônes)
// 2. Imports internes (appState, utils)
// 3. Import du hook dédié
// 4. Import des types
// 5. Import de la fixture (valeur par défaut de la prop)

// Constantes module-scope (tableaux, configs) — jamais dans le composant

export function XxxSection({ data = FIXTURE_XXX }: { data?: XxxType[] }) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { /* logique */ } = useXxx(data);

  return (/* JSX pur, zéro logique */);
}

// Sous-composants dans le même fichier si usage unique
function SousComposant({ ... }) { ... }
```

### Règle de séparation des préoccupations

```
❌ INTERDIT dans un composant :
   - useState() avec logique métier
   - Fonctions de tri ou de filtrage
   - Calculs dérivés (compteurs, labels)
   - Fonctions utilitaires inline dupliquées

✅ AUTORISÉ dans un composant :
   - useState() pour l'UI pure (hover, modal ouverte/fermée)
   - useEffect() pour les side-effects visuels (images Unsplash)
   - JSX conditionnel basé sur des valeurs reçues du hook
```

### Imports via barrels

```ts
// ✅ Préféré
import { PublishedTripSection, FinanceSection } from "@/features/dashboard/components/driver";
import { useFavorites, useGoBoard } from "@/features/dashboard/hooks";
import { Favorite, GoTask, PublishedTripStatus } from "@/features/dashboard/types";

// ❌ À éviter (imports profonds, fragiles au refactoring)
import { PublishedTripSection } from "@/features/dashboard/components/driver/published_trips.section";
```

---

## 11. Roadmap API — Branchements à faire

Quand le backend sera disponible, chaque section doit être branchée dans sa **page parente** (`/driver/[id]/page.tsx`, `/passenger/[id]/page.tsx`), pas dans le composant. Le pattern cible est :

```tsx
// app/(protected)/driver/[id]/page.tsx
const trips = await fetch(`/api/driver/${userId}/trips`).then(r => r.json());
const finance = await fetch(`/api/driver/${userId}/finance/summary`).then(r => r.json());

return (
  <>
    <PublishedTripSection trips={trips} />
    <FinanceSection finance={finance} />
  </>
);
```

Les composants n'ont **jamais** à connaître la source de leurs données (fixture ou API) — ils reçoivent uniquement des props typées.

---

*Documentation générée le 2026-02-22 · Cité-Voiturage · Collège La Cité*