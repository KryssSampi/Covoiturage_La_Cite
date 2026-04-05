# Audit Exhaustif des Routes — Covoiturage La Cité
**Date :** Avril 2026  
**Couverture :** 100% routes BFF + Server Core  
**Résumé :** Client 78 appels, BFF 75 routes, Server Core ~130 endpoints (17 controllers)

---

## A) Routes CLIENT WEB → BFF

| Route | Méthode | Commentaire |
|-------|---------|-------------|
| `/api/auth/session/init` | POST | Init session |
| `/api/auth/session/verify-email` | POST | |
| `/api/auth/session/password-login` | POST | |
| `/api/auth/session/verify-code` | POST | |
| `/api/auth/session/renew-code` | POST | |
| `/api/auth/session/register` | POST | |
| `/api/auth/logout` | POST | |
| `/api/onboarding/accept-politics` | POST | |
| `/api/onboarding/set-role` | POST | |
| `/api/onboarding/set-phone` | POST | |
| `/api/onboarding/submit-vehicle` | POST | |
| `/api/onboarding/submit-vehicle-photos` | POST | |
| `/api/onboarding/submit-document` | POST | |
| `/api/onboarding/set-profile-picture` | POST | |
| `/api/onboarding/abandon-driver` | POST | |
| `/api/onboarding/status` | GET | |
| `/api/trips` | GET, POST | |
| `/api/trips/{id}` | GET, PATCH, DELETE | |
| `/api/trips/{id}/status` | PATCH | |
| `/api/trips/recommended` | GET | |
| `/api/drafts` | GET, POST | |
| `/api/drafts/{id}` | GET, PATCH, DELETE | |
| `/api/reservations` | GET, POST | |
| `/api/reservations/{id}` | GET | |
| `/api/reservations/{id}/accept` | POST | |
| `/api/reservations/{id}/refuse` | POST | |
| `/api/reservations/{id}/reject` | POST | |
| `/api/reservations/{id}/cancel` | POST | |
| `/api/reservations/{id}/start` | POST | |
| `/api/driver/reservation-requests` | GET | |
| `/api/passenger/reservations-enriched` | GET | |
| `/api/vehicles` | GET, POST | |
| `/api/favoris` | GET | Calculé en local (buildFavorisResponse) |
| `/api/lieux-favoris` | GET, POST, DELETE | ⚠️ self-service — à migrer |
| `/api/favoris/alerte-toggle` | PATCH, DELETE | ⚠️ self-service — à migrer |
| `/api/favoris/user-favori` | POST, DELETE | ⚠️ self-service — à migrer |
| `/api/notifications` | GET | |
| `/api/notifications/{id}/read` | PATCH | |
| `/api/notifications/read-all` | POST | |
| `/api/sse/notifications` | GET | SSE stream |
| `/api/dashboard/driver/{id}` | GET | |
| `/api/dashboard/driver/{id}/finance` | GET | |
| `/api/dashboard/passenger/{id}` | GET | |
| `/api/driver/historique` | GET | |
| `/api/passenger/historique` | GET | |
| `/api/finances` | GET | |
| `/api/payment/bank-account` | GET | |
| `/api/payment/deposit` | POST | |
| `/api/payment/withdraw` | POST | |
| `/api/passenger/search` | POST | |
| `/api/locations` | PATCH | GPS tracking in-memory (intentionnel) |
| `/api/locations/suggestions` | GET | API externe OSM |
| `/api/sse/locations` | GET | SSE positions GPS in-memory (intentionnel) |
| `/api/indisponibilities/{id}` | GET, PUT | |
| `/api/trajet-en-cours/{id}` | GET | |
| `/api/goboard` | GET | |
| `/api/gotasks` | GET | |
| `/api/reviews` | GET, POST | |
| `/api/reviews/enriched` | GET | |
| `/api/astuces` | GET | ⚠️ self-service — à migrer vers MongoDB |
| `/api/nouveautes` | GET | ⚠️ self-service — à migrer vers MongoDB |
| `/api/faq` | GET | |
| `/api/unsplash` | GET | API externe |
| `/api/user-activity` | GET, POST | |
| `/api/users` | GET | |
| `/api/statistiques` | GET | |
| `/api/routing` | POST | OSRM externe |
| `/api/admin/trips` | GET | Admin |
| `/api/admin/users` | GET | Admin |
| `/api/admin/simulate` | POST | Admin simulation (intentionnel self-service) |
| `/api/admin/simulate/autoplay` | POST, DELETE | Admin simulation (intentionnel self-service) |
| `/api/sse/db-watch/{entity}` | GET | Watch entités (self-service) |
| `/api/db/{entity}` | GET, PUT, POST | **OBSOLÈTE** — retourne 503 |

---

## B) Routes BFF → Server Core

Toutes les routes BFF qui délèguent au Server Core :

| BFF Route | Controller C# | Notes |
|-----------|---------------|-------|
| `/api/auth/*` | AuthController, AuthSessionController | |
| `/api/onboarding/*` | OnboardingController | |
| `/api/trips/*` | TrajetController | Incl. recommended, mine/driver, mine/passenger |
| `/api/drafts/*` | DraftController | |
| `/api/reservations/*` | ReservationController | |
| `/api/vehicles/*` | VehicleController | |
| `/api/notifications/*` | NotificationController | |
| `/api/sse/notifications` | NotificationSseController | |
| `/api/dashboard/*` | AdminController / UserController | |
| `/api/driver/historique` | HistoriqueController | |
| `/api/passenger/historique` | HistoriqueController | |
| `/api/finances`, `/api/payment/*` | FinanceController | |
| `/api/reviews/*` | SocialController | |
| `/api/passenger/search` | MatchingController | |
| `/api/goboard` | GamificationControllers | |
| `/api/gotasks` | GoTaskController | |
| `/api/user-activity` | UserController ou MongoDB | |
| `/api/users` | UserController | |
| `/api/statistiques` | AdminController | |
| `/api/messages/*` | ChatController | ✅ Nouveau (session 15) |

---

## C) Classement des routes BFF auto-servies

### ✅ KEEP (self-service intentionnel et justifié)

| Route | Raison |
|-------|--------|
| `/api/locations` PATCH | GPS real-time in-memory — latence critique |
| `/api/sse/locations` GET | Streaming positions in-memory — latence critique |
| `/api/admin/simulate*` | Tests/démo admin uniquement — isolation voulue |
| `/api/routing` POST | API externe OSRM |
| `/api/locations/suggestions` GET | API externe OSM |
| `/api/unsplash` GET | API externe Unsplash |

### ⚠️ À MIGRER vers Server Core

| Route | Migration | Priorité |
|-------|-----------|----------|
| `/api/astuces` GET | `AstuceController` C# → MongoDB `astuces` | HAUTE |
| `/api/nouveautes` GET | `NouveauteController` C# → MongoDB `nouveautes` | HAUTE |
| `/api/lieux-favoris` GET/POST/DELETE | `FavoriteLocationController` C# → PostgreSQL | MOYENNE |
| `/api/favoris/alerte-toggle` PATCH/DELETE | Étendre `SocialController` | MOYENNE |
| `/api/favoris/user-favori` POST/DELETE | Étendre `SocialController` | MOYENNE |

### ❌ OBSOLÈTES (à supprimer)

| Route | Status | Action |
|-------|--------|--------|
| `/api/db/{entity}` GET/PUT/POST | Retourne 503 volontairement | Supprimer le fichier route.ts |

---

## D) Endpoints Server Core sans BFF correspondant (non exposés au client)

Ces endpoints existent dans Server Core mais n'ont pas de proxy BFF — accès direct depuis admin ou non utilisés :

| Endpoint | Controller | Notes |
|----------|------------|-------|
| `GET /api/trips/search` | TrajetController | Matching utilise `/api/matching/search` |
| `PATCH /api/trips/{id}/publish` | TrajetController | BFF appelle `/status` |
| `PATCH /api/trips/{id}/start` | TrajetController | |
| `PATCH /api/trips/{id}/complete` | TrajetController | |
| `GET /api/trips/mine/driver` | TrajetController | BFF filtre via `/api/trips?driverId` |
| `GET /api/trips/mine/passenger` | TrajetController | BFF filtre via `/api/trips` |
| `GET /api/trips/{id}/passengers` | TrajetController | |
| `GET /api/reservations/active` | ReservationController | |
| `PATCH /api/reservations/{id}/boarding/driver` | ReservationController | |
| `PATCH /api/reservations/{id}/boarding/passenger` | ReservationController | |
| `GET /api/notifications/{id}` | NotificationController | |
| `POST /api/notifications/send` | NotificationController | Admin only |
| `GET /api/finance/summary` | FinanceController | Route BFF appelle `/api/finances` |
| `GET /api/finance/transactions` | FinanceController | |
| `POST /api/finance/bank-account` | FinanceController | |
| `GET /api/finance/bank-accounts` | FinanceController | |
| `GET /api/reviews/{id}` | SocialController | |
| `DELETE /api/reviews/{id}` | SocialController | |
| `POST /api/gamification/tasks/{id}/complete` | GoTaskController | Non exposé BFF encore |
| `GET /api/gamification/leaderboard` | GamificationControllers | |
| `GET /api/users/{id}`, `PUT`, `DELETE` | UserController | |
| `GET /api/users/me` | UserController | |
| `GET /api/admin/dashboard` | AdminController | |
| `POST /api/admin/users/{id}/suspend` | AdminController | |
| `POST /api/admin/users/{id}/ban` | AdminController | |
| `GET /api/admin/audit-logs` | AdminController | |
| `GET /api/admin/config`, `PUT` | AdminController | |
| `GET /api/pipeda/export` | PipedaController | |
| `POST /api/pipeda/delete` | PipedaController | |
| `POST /api/security/change-password` | SecurityController | |
| `POST /api/security/mfa-enable` | SecurityController | |
| `GET /api/campus/list` | CampusController | |
| `GET /api/messages/*` | ChatController | ✅ Nouveau — BFF routes créées session 15 |

---

## E) Résumé Exécutif

### État global
- **Architecture correcte** : 3 tiers bien séparés, majorité des routes déléguées au Server Core
- **Pas de routes orphelines** côté client — tout appel fetch a un endpoint BFF correspondant
- **Routes self-service justifiées** pour GPS et simulation admin

### Actions requises

| Priorité | Action | Routes concernées |
|----------|--------|-------------------|
| 🔴 HAUTE | Migrer astuces + nouveautes → Server Core MongoDB | `/api/astuces`, `/api/nouveautes` |
| 🟡 MOYENNE | Migrer favoris → Server Core PostgreSQL | `/api/lieux-favoris`, `/api/favoris/*` |
| 🟢 BASSE | Supprimer routes 503 obsolètes | `/api/db/{entity}` |
| 🟢 BASSE | Exposer via BFF les endpoints Server Core utiles | GoTask complete, boarding, admin |
