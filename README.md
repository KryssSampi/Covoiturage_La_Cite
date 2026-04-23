# Covoiturage La Cité — Documentation légale

> **Note importante** : Cette documentation légale est produite automatiquement à partir de l'analyse des modèles de données du Server Core (`Server_Core/Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core)/Domain/Entities/`). Elle reflète la structure technique exacte de la plateforme et sert de source unique de vérité pour les documents juridiques.

## 📋 Vue d'ensemble

Cette documentation légale comprend :

1. **[Politique de confidentialité](docs/legal/privacy-policy.md)** — Traitement des données personnelles selon PIPEDA/Loi québécoise
2. **[Conditions d'utilisation](docs/legal/terms-of-use.md)** — Règles d'accès et d'utilisation de la plateforme
3. **[Modèles de données sélectionnés](docs/legal/models-selected.md)** — Référence technique des entités du Server Core

## 🗂️ Structure des documents

```
docs/legal/
├── privacy-policy.md          # Politique de confidentialité (PIPEDA)
├── terms-of-use.md            # Conditions d'utilisation
├── models-selected.md         # Catalogue des entités techniques
└── README.md                  # Ce fichie (index)
```

## 🔗 Modèles du Server Core utilisés

Les documents légaux font référence aux entités C# suivantes, définies dans `Server_Core/.../Domain/Entities/` :

| Entité | Rôle juridique | Fichier source |
|--------|---------------|----------------|
| `User` | Identité, contact, statut | `Domain/Entities/User.cs` |
| `DriverProfile` | Profil conducteur, vérification | `Domain/Entities/DriverProfile.cs` |
| `DriverDocument` | Documents d'identité, validation | `Domain/Entities/DriverDocument.cs` |
| `Vehicle` | Informations véhicule | `Domain/Entities/Vehicle.cs` |
| `Trip` | Trajet publié, métadonnées | `Domain/Entities/Trip.cs` |
| `Reservation` | Réservation, statut, paiement | `Domain/Entities/Reservation.cs` |
| `Transaction` | Paiements, partage revenus | `Domain/Entities/Transaction.cs` |
| `Review` | Évaluations, notes, commentaires | `Domain/Entities/Review.cs` |
| `Report` | Signalements, modération | `Domain/Entities/Report.cs` |
| `Penalty` | Pénalités, impacts GoScore | `Domain/Entities/Penalty.cs` |
| `Notification` | Communications, opt-out | `Domain/Entities/Notification.cs` |
| `MediaStorage` | Fichiers multimédias | `Domain/Entities/MediaStorage.cs` |
| `MediaLog` | Journal des accès médias | `Domain/Entities/MediaLog.cs` |
| `GpsPosition` | Positions GPS, traçabilité | `Domain/Entities/GpsPosition.cs` |
| `GeofenceZone` | Zones géographiques | `Domain/Entities/GeofenceZone.cs` |
| `PlaceFavori` | Adresses sauvegardées | `Domain/Entities/PlaceFavori.cs` |
| `AuthSession` | Sessions d'authentification | `Domain/Entities/Security/AuthSession.cs` |
| `WebSessionKey` | Sessions web (cookies) | `Domain/Entities/Security/WebSessionKey.cs` |
| `ClientCertificate` | Certificats ECC-P256 (mobile) | `Domain/Entities/Security/ClientCertificate.cs` |
| `UserSecurityActivity` | Activités de sécurité | `Domain/Entities/Security/UserSecurityActivity.cs` |
| `CertificateRotationEvent` | Rotations de clés | `Domain/Entities/Security/CertificateRotationEvent.cs` |
| `AuditLog` | Journal d'audit (7 ans) | `Domain/Entities/AuditLog.cs` |
| `SosAlert` | Alertes d'urgence | `Domain/Entities/SosAlert.cs` |
| `UserPreferences` | Préférences, consentements | `Domain/Entities/UserPreferences.cs` |
| `UserStat` | Statistiques utilisateur | `Domain/Entities/UserStat.cs` |
| `Badge` / `UserBadge` | Badges, gamification | `Domain/Entities/Badge.cs`, `Domain/Entities/UserBadge.cs` |
| `EcoChallenge` / `ChallengeParticipation` | Défis écologiques | `Domain/Entities/EcoChallenge.cs`, `Domain/Entities/ChallengeParticipation.cs` |
| `GoTask` / `UserGoTaskProgression` | Tâches Go, progression | `Domain/Entities/GoTask.cs`, `Domain/Entities/UserGoTaskProgression.cs` |
| `SmartSuggestion` | Suggestions intelligentes | `Domain/Entities/SmartSuggestion.cs` |
| `SurveyTripAlert` | Enquêtes post-trajet | `Domain/Entities/SurveyTripAlert.cs` |
| `PlatformConfig` | Configuration plateforme | `Domain/Entities/PlatformConfig.cs` |
| `PlatformStats` | Statistiques globales | `Domain/Entities/PlatformStats.cs` |
| `MatchingScoreCache` | Cache scores d'affinité | `Domain/Entities/MatchingScoreCache.cs` |
| `UserLike` | Likes entre utilisateurs | `Domain/Entities/UserLike.cs` |
| `WaypointTrip` | Points d'étape trajet | `Domain/Entities/WaypointTrip.cs` |
| `Withdrawal` | Retraits conducteurs | `Domain/Entities/Withdrawal.cs` |

## 📊 Enums utilisés

Les documents légaux référencent également les enums suivants (`Domain/Enums/`):

- `UserRole` (Passenger, Driver, Admin)
- `UserStatus` (Active, Suspended, Banned, Deleted, PendingVerification)
- `DriverValidationStatus` (Pending, Approved, Rejected, DocsNeeded)
- `TripStatus` (Draft, Published, Full, Confirmed, InProgress, Completed, Cancelled, NoShow)
- `ReservationStatus` (Pending, Confirmed, Refused, Cancelled, CancelledByPassenger, CancelledByDriver, InProgress, Completed, NoShow, Expired)
- `PaymentStatus` (Pending, PreAuthorized, Captured, RefundedFull, RefundedPartial, Failed)
- `PaymentMethod` (Cash, Interac)
- `NotificationType`, `NotificationCategory`
- `ReportCategory`
- `PenaltyType`, `PenaltyStatus`
- `ConversationLevel`
- `DocumentType`
- `MediaType`, `MediaSector`
- `TripType`
- `SchoolRole`

## 🔐 Services Server Core concernés

Les traitements de données sont implémentés dans les services suivants (`Application/Services/`):

| Service | Responsabilité | Données concernées |
|---------|---------------|-------------------|
| `UserService` | Gestion comptes, profil | `User`, `UserPreferences`, `UserStat` |
| `AuthSessionService` | Authentification, sessions | `AuthSession`, `WebSessionKey` |
| `SecurityService` | Sécurité, certificats ECC | `ClientCertificate`, `UserSecurityActivity` |
| `PipedaComplianceService` | Conformité PIPEDA | Consentements, exports, anonymisation |
| `TrajetService` | Gestion trajets | `Trip`, `WaypointTrip`, `GeofenceZone` |
| `ReservationService` | Réservations | `Reservation`, `CompatibilityScore` |
| `FinanceService` | Paiements, revenus | `Transaction`, `Withdrawal`, `Penalty` |
| `VehicleService` | Véhicules | `Vehicle`, `DriverDocument` |
| `NotificationService` | Notifications | `Notification`, préférences opt-out |
| `ContentService` | Contenu dynamique | `Astuce`, `Nouveaute` (MongoDB) |
| `FaqService` | FAQ | `FaqItem` (MongoDB) |
| `MediaStorageService` | Gestion fichiers | `MediaStorage`, `MediaLog` |
| `GpsTrackingService` | GPS en temps réel | `GpsPosition` |
| `ReviewService` (dans `TrajetService`) | Avis, évaluations | `Review` |
| `SocialService` | Interactions sociales | `UserLike`, `PlaceFavori`, `Affinity` |
| `AdminService` | Modération, administration | `Report`, `Penalty`, `AuditLog` |
| `GamificationService` | Badges, défis, GoScore | `Badge`, `UserBadge`, `EcoChallenge`, `GoTask` |

## 📋 Conformité légale

### PIPEDA (Canada) et Loi québécoise sur la protection des renseignements personnels

- **Consentement** : Enregistré via `UserPreferences` et `ConsentementsPipedum` (PipedaComplianceService)
- **Droit d'accès** : Export de données via `RequestDataExportAsync()` (PipedaComplianceService)
- **Droit à l'effacement** : Anonymisation via `AnonymizeAccountAsync()` (PipedaComplianceService)
- **Conservation** : `AuditLog` (7 ans), `Transaction` (fiscal), `AuthSession` (court terme)
- **Security by design** : Certificats ECC-P256, rotation clés, kill-switch, logs d'activité

### Rôles et permissions

| Rôle | Permissions principales | Restrictions |
|------|----------------------|--------------|
| **Passenger** | Réserver, payer, noter, signaler | Ne peut pas publier de trajets |
| **Driver** | Publier trajets, gérer véhicule, recevoir paiements | Doit avoir `DriverProfile` approuvé |
| **Admin** | Modération, validation documents, gestion contenu, accès logs | Accès total, responsabilité de supervision |

## 🔄 Workflow de mise à jour

Lorsqu'une entité du Server Core est modifiée :

1. Mettre à jour le fichier `docs/legal/models-selected.md` avec les nouveaux champs
2. Réviser les sections impactées dans `privacy-policy.md` et `terms-of-use.md`
3. Incrémenter la date de « dernière mise à jour » en haut des documents concernés
4. Notifier l'équipe juridique (le cas échéant)

## 📞 Contact

Questions juridiques : `legal@covoiturage-lacite.example`  
Support technique : `support@covoiturage-lacite.example`

---
