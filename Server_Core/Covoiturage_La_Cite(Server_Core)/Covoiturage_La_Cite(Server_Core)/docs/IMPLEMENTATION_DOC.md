# Documentation d'Implémentation — Server Core

> **Projet** : Covoiturage La Cité — Server Core  
> **Stack** : .NET 9.0 / ASP.NET Core / EF Core + PostgreSQL (PostGIS) / MongoDB / SignalR / Hangfire  
> **Architecture** : Clean Architecture (Domain → Application → Data → Api)  
> **Date de complétion** : Avril 2026  

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture du projet](#2-architecture-du-projet)
3. [Phases d'implémentation (P0–P16)](#3-phases-dimplémentation-p0p16)
4. [Infrastructure technique](#4-infrastructure-technique)
5. [Base de données](#5-base-de-données)
6. [Endpoints API](#6-endpoints-api)
7. [Sécurité](#7-sécurité)
8. [Jobs récurrents (Hangfire)](#8-jobs-récurrents-hangfire)
9. [Temps réel (SignalR)](#9-temps-réel-signalr)
10. [Configuration](#10-configuration)
11. [Démarrage local](#11-démarrage-local)

---

## 1. Vue d'ensemble

Le Server Core est le backend API REST du projet **Covoiturage La Cité**, une plateforme de covoiturage pour les étudiants et employés du collège La Cité (Ottawa). Il expose ~120+ endpoints REST, un hub SignalR temps réel, et 16 jobs Hangfire récurrents.

### Chiffres clés

| Métrique | Valeur |
|----------|--------|
| Fichiers .cs d'implémentation | ~148 |
| Entités de domaine | 30 |
| Enums | 16 |
| Interfaces (repos + services) | 27 |
| Fichiers DTO | 16 |
| Services métier | 14+ |
| Repositories EF Core | 13 |
| Controllers API | 17 |
| Phases complétées | 17 (P0–P16) |
| Jobs Hangfire | 16 récurrents |
| Événements SignalR | 12 |

---

## 2. Architecture du projet

```
Covoiturage_La_Cite(Server_Core)/
├── Domain/                          # Couche Domaine (entités, enums, contrats)
│   ├── Entities/                    # 30 entités (User, Trip, Reservation, etc.)
│   │   └── Security/               # 4 entités sécurité (ClientCertificate, etc.)
│   ├── Enums/                       # 16 enums (UserStatus, TripStatus, etc.)
│   └── Interfaces/                  # IRepository<T> (base générique)
│
├── Application/                     # Couche Application (logique métier)
│   ├── Interfaces/                  # 27 interfaces (repos + services)
│   ├── DTOs/                        # 16 dossiers DTO par domaine
│   ├── Services/                    # 14+ services métier
│   │   ├── Auth/                    # TokenService, MicrosoftSsoService
│   │   ├── User/                    # UserService
│   │   ├── Trip/                    # TrajetService
│   │   ├── Reservation/            # ReservationService
│   │   ├── Vehicle/                 # VehiculeService
│   │   ├── Finance/                 # FinanceService
│   │   ├── Notification/            # NotificationService
│   │   ├── Social/                  # ReviewService, AffinityService, ReportService
│   │   ├── Gamification/            # GamificationService
│   │   ├── Gps/                     # GpsTrackingService
│   │   ├── Campus/                  # CampusService
│   │   ├── Admin/                   # AdminService
│   │   ├── Matching/                # MatchingService (v4)
│   │   ├── Security/                # SecurityService (ECC-P256)
│   │   └── Pipeda/                  # PipedaComplianceService
│   ├── Jobs/                        # 4 fichiers Hangfire (16 jobs)
│   └── Validations/                 # (vide — FluentValidation prévu)
│
├── Data/                            # Couche Données
│   ├── PostgreSQL/
│   │   ├── AppDbContext.cs          # DbContext EF Core (30+ DbSets)
│   │   └── Repositories/           # 13 fichiers repository
│   └── MongoDB/
│       └── MongoDbContext.cs        # Singleton MongoClient
│
├── Api/                             # Couche Présentation
│   ├── Controllers/                 # 17 controllers REST
│   ├── Hubs/                        # CovoiturageHub + SignalREventService
│   ├── Configurations/              # AuthConfiguration.cs
│   ├── DTOs/Common/                 # ApiResponse<T>
│   └── Middlewares/                 # ExceptionMiddleware
│
├── Program.cs                       # Point d'entrée + DI + Pipeline
├── appsettings.json                 # Config production
└── appsettings.Development.json     # Config développement
```

### Flux des dépendances

```
Controller → IService → IRepository → AppDbContext → PostgreSQL
                ↓
         SignalREventService → CovoiturageHub → Clients WebSocket
                ↓
         MongoDbContext → MongoDB (logs, documents)
```

---

## 3. Phases d'implémentation (P0–P16)

### P0 — Auth (Infrastructure d'authentification)

| Composant | Fichier | Description |
|-----------|---------|-------------|
| JWT Config | `Api/Configurations/AuthConfiguration.cs` | Extension `AddJwtAuth` : HMAC-SHA256, ClockSkew=Zero |
| Token Service | `Application/Services/Auth/TokenService.cs` | Génération/validation tokens JWT |
| OTP Service | `Application/Services/Auth/OtpAuthService.cs` | Auth par code OTP envoyé par email (@lacitec.on.ca) |
| DTOs | `Application/DTOs/Auth/AuthDtos.cs` | LoginRequest, TokenResponse, OtpCallback |
| Wrapper API | `Api/DTOs/Common/ApiResponse.cs` | `ApiResponse<T>` générique Ok/Fail |
| Middleware | `Api/Middlewares/ExceptionMiddleware.cs` | Gestion globale erreurs → ApiResponse |

**Détails techniques :**
- JWT Bearer avec HMAC-SHA256, expiration configurable
- Authentification JWT via OTP avec validation du domaine `@lacitec.on.ca`
- Middleware d'exception global retournant `ApiResponse<T>` standardisé

---

### P1 — Users (Gestion des utilisateurs)

| Composant | Fichier |
|-----------|---------|
| Entités | `User.cs`, `DriverProfile.cs`, `UserPreferences.cs`, `UserStat.cs`, `UserBehaviorPattern.cs` |
| Interface Repo | `IUserRepository.cs` |
| Interface Service | `IUserService.cs` |
| DTOs | `UserResponseDto.cs`, `UpdateUserDto.cs`, `UserPublicDto.cs`, `PaginatedResult.cs` |
| Repository | `UserRepository.cs` (EF Core) |
| Service | `UserService.cs` |
| Controllers | `UserController.cs`, `AuthController.cs` |

**Détails techniques :**
- Entité `User` avec géolocalisation (NetTopologySuite Point, SRID 4326)
- Soft delete via `DeletedAt` + QueryFilter EF Core
- Profil conducteur séparé (1:1 avec User)
- `UserBehaviorPattern` pour inputs d'apprentissage machine
- Pagination générique `PaginatedResult<T>`

---

### P2 — Trajets (Gestion des trajets)

| Composant | Fichier |
|-----------|---------|
| Entité | `Trip.cs` (PostGIS DeparturePoint/ArrivalPoint) |
| Interface Repo | `ITrajetRepository.cs` |
| Interface Service | `ITrajetService.cs` |
| DTOs | `CreateTrajetDto.cs`, `TrajetResponseDto.cs` |
| Repository | `TrajetRepository.cs` |
| Service | `TrajetService.cs` |
| Controller | `TrajetController.cs` |

**Détails techniques :**
- Points de départ/arrivée en PostGIS `geography(point, 4326)`
- Trajets récurrents via `ParentTripId` (auto-référence)
- Index sur `DriverId`, `Status`, `DepartureDate`
- Conversion enum→string pour tous les statuts

---

### P3 — Réservations (gérée par Codex)

| Composant | Fichier |
|-----------|---------|
| Entité | `Reservation.cs` |
| Enum | `ReservationStatus.cs` |
| Interface Repo | `IReservationRepository.cs` |
| Interface Service | `IReservationService.cs` |
| DTOs | `CreateReservationDto.cs`, `ReservationResponseDto.cs`, `ReservationEnrichedDto.cs` |
| Repository | `ReservationRepository.cs` |
| Service | `ReservationService.cs` |
| Controller | `ReservationController.cs` |

**Notes :** Phase créée par Codex (autre IA). Inscription DI corrigée manuellement (était manquante).

---

### P4 — Véhicules

| Composant | Fichier |
|-----------|---------|
| Entités | `Vehicle.cs`, `DriverDocument.cs` |
| Interface Repo | `IVehiculeRepository.cs` |
| Interface Service | `IVehiculeService.cs` |
| DTOs | `VehiculeDtos.cs` |
| Repository | `VehiculeRepository.cs` |
| Service | `VehiculeService.cs` |
| Controller | `VehiculeController.cs` |

**Détails techniques :**
- Documents conducteur (permis, assurance) liés au DriverProfile
- Validation statut conducteur (enum `DriverValidationStatus`)

---

### P5 — Finances

| Composant | Fichier |
|-----------|---------|
| Entités | `Transaction.cs`, `Penalty.cs`, `Withdrawal.cs` |
| Interfaces | `IFinanceRepositories.cs` (3 repos), `IFinanceService.cs` |
| DTOs | `FinanceDtos.cs` |
| Repositories | `FinanceRepositories.cs` (3 en 1 fichier) |
| Service | `FinanceService.cs` |
| Controller | `FinanceController.cs` |

**Règles financières :**
- **Commission plateforme** : 15%
- **Part conducteur** : 85%
- **Rétention** par réservation : 1,50 $
- **Retrait minimum** : 20,00 $
- Méthodes de paiement : enum `PaymentMethod`
- Suivi des pénalités avec types et statuts

---

### P6 — Notifications

| Composant | Fichier |
|-----------|---------|
| Entité | `Notification.cs` |
| Interface Repo | `INotificationRepository.cs` |
| Interface Service | `INotificationService.cs` |
| DTOs | `NotificationDtos.cs` |
| Repository | `NotificationRepository.cs` |
| Service | `NotificationService.cs` |
| Controller | `NotificationController.cs` |

**Détails techniques :**
- 12+ types de notification (enum `NotificationType`)
- Index sur `UserId` + `CreatedAt`
- Intégration SignalR pour push temps réel

---

### P7 — Social (Avis, Affinités, Signalements)

| Composant | Fichier |
|-----------|---------|
| Entités | `Review.cs`, `Affinity.cs`, `Report.cs` |
| Interfaces | `ISocialRepositories.cs` (3 repos), `ISocialServices.cs` (3 services) |
| DTOs | `SocialDtos.cs` |
| Repositories | `SocialRepositories.cs` |
| Services | `SocialServices.cs` (ReviewService, AffinityService, ReportService) |
| Controller | `SocialControllers.cs` |

**Détails techniques :**
- Contrainte unique `(UserId, TargetUserId)` sur Affinity
- Review liée à une Reservation spécifique (1:1)
- Catégories de signalement via enum `ReportCategory`
- Score d'affinité calculé pour le matching

---

### P8 — Gamification

| Composant | Fichier |
|-----------|---------|
| Entités | `Badge.cs`, `UserBadge.cs`, `EcoChallenge.cs`, `ChallengeParticipation.cs` |
| Interfaces | `IGamificationRepositories.cs` (4 repos), `IGamificationService.cs` |
| DTOs | `GamificationDtos.cs` |
| Repositories | `GamificationRepositories.cs` (4 en 1 fichier) |
| Service | `GamificationService.cs` |
| Controller | `GamificationControllers.cs` |

**Détails techniques :**
- Badges avec conditions d'attribution automatique
- Défis écologiques avec suivi de progression
- Contrainte unique `(UserId, BadgeId)` pour éviter les doublons

---

### P9 — GPS / Tracking

| Composant | Fichier |
|-----------|---------|
| Entités | `GpsPosition.cs`, `SosAlert.cs` |
| Interfaces | `IGpsRepositories.cs` (2 repos), `IGpsTrackingService.cs` |
| DTOs | `GpsDtos.cs` |
| Repositories | `GpsRepositories.cs` |
| Service | `GpsTrackingService.cs` |
| Controller | `GpsControllers.cs` |

**Détails techniques :**
- Position GPS en PostGIS `geography(point, 4326)`
- Index composite `(TripId, CapturedAt)` pour requêtes de trajectoire
- Alertes SOS avec escalade automatique (job Hangfire)
- Nettoyage automatique des anciennes positions GPS

---

### P10 — Campus

| Composant | Fichier |
|-----------|---------|
| Entités | `GeofenceZone.cs`, `WaypointTrip.cs` |
| Interfaces | `ICampusRepositories.cs` (2 repos), `ICampusService.cs` |
| DTOs | `CampusDtos.cs` |
| Repositories | `CampusRepositories.cs` |
| Service | `CampusService.cs` |
| Controller | `CampusControllers.cs` |

**Détails techniques :**
- Zones géo-clôturées du campus (Point centre + Polygon)
- PostGIS `geography(point, 4326)` et `geography(polygon, 4326)`
- Waypoints pour points d'intérêt sur les trajets

---

### P11 — Admin (Administration plateforme)

| Composant | Fichier |
|-----------|---------|
| Entités | `PlatformConfig.cs`, `PlatformStats.cs`, `AuditLog.cs` |
| Interfaces | `IAdminRepositories.cs` (3 repos), `IAdminService.cs` |
| DTOs | `AdminDtos.cs` |
| Repositories | `AdminRepositories.cs` |
| Service | `AdminService.cs` |
| Controller | `AdminController.cs` |

**Détails techniques :**
- Configuration plateforme clé-valeur (PK = Key string)
- Statistiques agrégées recalculées par job Hangfire
- Audit log avec index `(EntityType, EntityId)`, `ActorId`, `CreatedAt`

---

### P12 — SignalR (Temps réel)

| Composant | Fichier |
|-----------|---------|
| Hub + Service | `Api/Hubs/CovoiturageHub.cs` |

**12 événements temps réel :**

| Événement | Description |
|-----------|-------------|
| `ReservationCreated` | Nouvelle réservation |
| `ReservationAccepted` | Réservation acceptée |
| `ReservationRejected` | Réservation refusée |
| `ReservationCancelled` | Réservation annulée |
| `TripStatusChanged` | Changement statut trajet |
| `GpsPositionUpdate` | Mise à jour position GPS |
| `SosAlertTriggered` | Alerte SOS déclenchée |
| `NewNotification` | Nouvelle notification |
| `GoScoreUpdated` | Score Go mis à jour |
| `BadgeEarned` | Badge gagné |
| `MatchFound` | Match trouvé |
| `PaymentProcessed` | Paiement traité |

**Architecture :** `SignalREventService` (Singleton) injectable dans tous les services.  
**Endpoint Hub :** `/hubs/covoiturage`

---

### P13 — Hangfire Jobs (Tâches récurrentes)

| Fichier | Jobs contenus |
|---------|---------------|
| `HangfireJobRegistrar.cs` | Registreur central (16 jobs) |
| `TripJobs.cs` | TripAutoStart, ReservationExpiry, TripAutoComplete, GpsCleanup |
| `ScheduledJobs.cs` | PenaltyExpiry, PlatformStats, AnomalyDetection, SosEscalation, EtaRecalculation |
| `UserJobs.cs` | GoScoreRecalc, InactiveUserReminder, ChallengeProgressCheck, WithdrawalProcessing, WeeklyReport, BadgeAwardCheck |

**Fréquences :** Chaque minute → quotidien → hebdomadaire.

---

### P14 — Matching v4 (Algorithme d'appariement)

| Composant | Fichier |
|-----------|---------|
| Entité | `MatchingScoreCache.cs` |
| Interface | `IMatchingService.cs` |
| DTOs | `MatchingDtos.cs` |
| Service | `MatchingService.cs` |
| Controller | `MatchingController.cs` |

**Algorithme v4 — 5 blocs de scoring (100 pts + 5 bonus) :**

| Bloc | Points | Critères |
|------|--------|----------|
| **Géographique** | 20 pts | Distance Haversine départ/arrivée |
| **Comportement** | 30 pts | Patterns, préférences, historique |
| **Fiabilité** | 25 pts | Taux d'annulation, ponctualité, évaluations |
| **Affinité** | 15 pts | Score social, trajets partagés |
| **Horaire** | 10 pts | Compatibilité horaire |
| **Bonus** | +5 pts | Éco-challenge actif, premier trajet, etc. |

**Éliminateurs durs :** Distance > seuil, utilisateur bloqué, véhicule plein.

---

### P15 — Security (Double Lock ECC-P256)

| Composant | Fichier |
|-----------|---------|
| Entités | `ClientCertificate.cs`, `UserSecurityActivity.cs`, `CertificateRotationEvent.cs`, `WebSessionKey.cs` |
| Interfaces | `ISecurityRepositories.cs` (4 repos), `ISecurityService.cs` |
| DTOs | `SecurityDtos.cs` (11 DTOs) |
| Repositories | `SecurityRepositories.cs` (4 repos, `ExecuteUpdateAsync`) |
| Service | `SecurityService.cs` |
| Controller | `SecurityController.cs` (9 endpoints) |

**Détails techniques :**
- Vérification ECC-P256 via `System.Security.Cryptography.ECDsa.VerifyData`
- **Kill Switch** à 4 niveaux d'escalade (Advisory → Critical → Emergency → Lockdown)
- Rotation globale des certificats
- Sessions web glissantes (sliding expiration)
- `DeviceFingerprint` unique par certificat client

---

### P16 — PIPEDA (Conformité vie privée)

| Composant | Fichier |
|-----------|---------|
| Interfaces | `IPipedaRepositories.cs` (2 repos), `IPipedaService.cs` |
| DTOs | `PipedaDtos.cs` |
| Repositories | `PipedaRepositories.cs` |
| Service | `PipedaComplianceService.cs` |
| Controller | `PipedaController.cs` (5 endpoints) |

**Conformité PIPEDA :**
- **Rétention** : 7 ans pour transactions et audit
- **Anonymisation** : sur suppression de compte (données personnelles effacées, transactions conservées anonymisées)
- **Consentements** : gestion opt-in/opt-out par catégorie
- **Export données** : génération ZIP avec toutes les données personnelles de l'utilisateur

---

## 4. Infrastructure technique

### Packages NuGet

| Package | Version | Usage |
|---------|---------|-------|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 9.0.11 | Auth JWT |
| `Swashbuckle.AspNetCore` | 9.0.6 | Swagger/OpenAPI |
| `Microsoft.EntityFrameworkCore.Design` | 9.0.11 | EF Core Design-time |
| `Microsoft.EntityFrameworkCore.Tools` | 9.0.11 | EF Core Tools (migrations) |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | 9.0.4 | Provider PostgreSQL |
| `Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite` | 9.0.4 | PostGIS |
| `NetTopologySuite` | 2.6.0 | Types géographiques |
| `MongoDB.Driver` | 3.6.0 | Client MongoDB |
| `Hangfire.Core` | 1.8.17 | Jobs récurrents |
| `Hangfire.PostgreSql` | 1.20.10 | Storage Hangfire dans PostgreSQL |
| `FluentValidation.AspNetCore` | 11.3.0 | Validation |
| `Serilog.AspNetCore` | 9.0.0 | Logging structuré |

### Pipeline Middleware (ordre)

```
1. ExceptionMiddleware          (global error handling → ApiResponse)
2. SerilogRequestLogging        (log chaque requête HTTP)
3. Swagger (dev only)           (documentation API)
4. HTTPS Redirection
5. CORS ("WebClientOnly")       (origin: localhost:3000 | domaine prod)
6. Authentication               (JWT Bearer)
7. Authorization
8. Hangfire Dashboard (dev)     (/hangfire)
9. MapControllers               (routes API)
10. MapHub<CovoiturageHub>      (/hubs/covoiturage)
```

---

## 5. Base de données

### PostgreSQL (principale)

**30+ tables** gérées par EF Core via `AppDbContext` :

| Catégorie | Tables |
|-----------|--------|
| Core | `Users`, `DriverProfiles`, `Vehicles`, `DriverDocuments`, `UserPreferences`, `UserStats`, `UserBehaviorPatterns` |
| Trajets | `Trips`, `WaypointTrips`, `Reservations`, `GpsPositions` |
| Finance | `Transactions`, `Penalties`, `Withdrawals` |
| Social | `Reviews`, `Affinities`, `Notifications`, `Reports`, `SosAlerts` |
| Gamification | `Badges`, `UserBadges`, `EcoChallenges`, `ChallengeParticipations`, `MatchingScoreCaches`, `SmartSuggestions` |
| Campus | `GeofenceZones` |
| Admin | `PlatformConfigs`, `AuditLogs`, `PlatformStats` |
| Security | `ClientCertificates`, `UserSecurityActivities`, `WebSessionKeys`, `CertificateRotationEvents` |

**PostGIS** activé pour :
- `Trip.DeparturePoint` / `Trip.ArrivalPoint`
- `GpsPosition.Location`
- `GeofenceZone.CenterPoint` / `GeofenceZone.Polygon`

**Hangfire** stocke aussi ses tables dans le même PostgreSQL.

### MongoDB (secondaire)

- **Database** : `Covoiturage_la_cite`
- **Usage prévu** : logs, documents non-relationnels, cache
- Singleton `MongoDbContext` avec méthode `Collection<T>(name)`

---

## 6. Endpoints API

### Résumé par domaine

| Préfixe Route | Controller | Méthodes |
|---------------|------------|----------|
| `api/auth` | AuthController | Login, OTP, Refresh Token |
| `api/users` | UserController | CRUD, profil, stats |
| `api/trajets` | TrajetController | CRUD, recherche, récurrents |
| `api/reservations` | ReservationController | Créer, accepter, refuser, annuler |
| `api/vehicules` | VehiculeController | CRUD véhicules + documents |
| `api/finances` | FinanceController | Transactions, pénalités, retraits |
| `api/notifications` | NotificationController | Liste, marquer lu |
| `api/social/*` | SocialControllers | Reviews, affinités, signalements |
| `api/gamification/*` | GamificationControllers | Badges, défis, progression |
| `api/gps/*` | GpsControllers | Positions, alertes SOS |
| `api/campus/*` | CampusControllers | Zones, waypoints |
| `api/admin` | AdminController | Config, stats, audit |
| `api/matching` | MatchingController | Recherche de matchs |
| `api/security` | SecurityController | Certificats, kill switch, sessions |
| `api/pipeda` | PipedaController | Consentements, export, anonymisation |
| `api/drafts` | DraftController | Brouillons de trajets |
| `api/historique` | HistoriqueController | Historique trajets/réservations |

---

## 7. Sécurité

### Couches de sécurité

1. **JWT Bearer** — HMAC-SHA256, ClockSkew=Zero
2. **JWT via OTP** — Code OTP envoyé par email, validation domaine `@lacitec.on.ca`
3. **ECC-P256 Double Lock** — Certificats client signés, rotation automatique
4. **Kill Switch** — 4 niveaux d'escalade de sécurité
5. **Sessions web glissantes** — Clés de session avec expiration sliding
6. **CORS restrictif** — Seul le domaine web autorisé
7. **HTTPS** — Redirection forcée
8. **Soft Delete** — QueryFilter sur `DeletedAt` (Users)
9. **PIPEDA** — Anonymisation, consentements, rétention 7 ans

---

## 8. Jobs récurrents (Hangfire)

| Job | Fréquence | Description |
|-----|-----------|-------------|
| `TripAutoStartJob` | Chaque minute | Démarre automatiquement les trajets à l'heure |
| `ReservationExpiryJob` | Toutes les 5 min | Expire les réservations non confirmées |
| `TripAutoCompleteJob` | Toutes les 10 min | Complète les trajets terminés |
| `GpsCleanupJob` | Quotidien | Nettoie les positions GPS expirées |
| `PenaltyExpiryJob` | Quotidien | Expire les pénalités échues |
| `PlatformStatsJob` | Quotidien | Recalcule les statistiques plateforme |
| `AnomalyDetectionJob` | Toutes les 30 min | Détecte les anomalies de comportement |
| `SosEscalationJob` | Toutes les 2 min | Escalade les alertes SOS non traitées |
| `EtaRecalculationJob` | Toutes les 5 min | Recalcule les heures d'arrivée estimées |
| `GoScoreRecalcJob` | Quotidien | Recalcule les scores Go |
| `InactiveUserReminderJob` | Hebdomadaire | Rappel aux utilisateurs inactifs |
| `ChallengeProgressCheckJob` | Toutes les heures | Vérifie la progression des défis |
| `WithdrawalProcessingJob` | Quotidien | Traite les demandes de retrait |
| `WeeklyReportJob` | Hebdomadaire | Génère le rapport hebdomadaire |
| `BadgeAwardCheckJob` | Toutes les heures | Vérifie l'attribution de badges |

**Dashboard** : accessible à `/hangfire` en mode Development uniquement.

---

## 9. Temps réel (SignalR)

- **Endpoint** : `/hubs/covoiturage`
- **Groupes** : auto-join par `trip-{tripId}` (JoinTrip/LeaveTrip)
- **Service injectable** : `SignalREventService` (Singleton)
- **12 événements** typés (voir P12 ci-dessus)

---

## 10. Configuration

### appsettings.json (structure)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "<PostgreSQL connection string>"
  },
  "Jwt": {
    "Key": "<clé HMAC-SHA256>",
    "Issuer": "covoiturage-lacite-core",
    "Audience": "covoiturage-lacite-web"
  },
  "OtpAuth": {
    "SmtpHost": "<SMTP host pour envoi emails OTP>",
    "SmtpPort": 587,
    "SenderEmail": "noreply@lacitec.on.ca",
    "OtpExpirationMinutes": 10,
    "OtpLength": 6
  },
  "Cors": {
    "AllowedOrigin": "http://localhost:3000"
  },
  "MongoDB": {
    "ConnectionString": "<MongoDB connection string>",
    "DatabaseName": "covoiturage_lacite_logs"
  }
}
```

---

## 11. Démarrage local

### Prérequis

- .NET SDK 9.0+
- PostgreSQL 15+ avec extension PostGIS
- MongoDB 7.0+ (ou Atlas cluster)
- Node.js 18+ (pour le site web uniquement)

### Étapes

```bash
# 1. Restaurer les packages NuGet
dotnet restore

# 2. Configurer les connection strings (appsettings.Development.json)

# 3. Créer la migration initiale
dotnet ef migrations add InitialCreate --project . --output-dir Data/PostgreSQL/Migrations

# 4. Appliquer la migration
dotnet ef database update

# 5. Lancer le serveur
dotnet run
```

**URLs par défaut :**
- API : `https://localhost:5001` / `http://localhost:5000`
- Swagger : `https://localhost:5001/swagger`
- Hangfire : `https://localhost:5001/hangfire`
- SignalR Hub : `wss://localhost:5001/hubs/covoiturage`

---

## ⚠️ Points d'attention

1. **`Application/Validations/`** — Vide. Aucun FluentValidation implémenté malgré `AddValidatorsFromAssemblyContaining<Program>()`.
2. **`Data/Models/`** — 47+ anciens modèles scaffold à supprimer.
3. **`Application/Services/UserServices/UserServices.cs`** — DEPRECATED, à supprimer.
4. **MongoDB** — Collections non encore créées (structure vide).
5. **Build** — Nécessite `dotnet restore` avant compilation (packages NuGet non restaurés).
