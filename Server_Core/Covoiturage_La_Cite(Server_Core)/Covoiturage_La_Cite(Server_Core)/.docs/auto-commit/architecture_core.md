# architecture_core.md — Tiers Core (ASP.NET)
# Racine : D:\Covoiturage_La_Cite\Server_Core\Covoiturage_La_Cite(Server_Core)\Covoiturage_La_Cite(Server_Core)
# Généré le 2026-04-05 23:00 | 267 fichiers indexés
# Format : chemin/relatif|description

.gitignore|Fichier C# — gitignore
Api/Configurations/.gitkeep|Fichier C# — gitkeep
Api/Configurations/AuthConfiguration.cs|Fichier C# — auth configuration
Api/Controllers/Admin/AdminController.cs|Fichier C# — admin controller
Api/Controllers/Auth/AuthController.cs|Fichier C# — auth controller
Api/Controllers/Auth/AuthSessionController.cs|Fichier C# — auth session controller
Api/Controllers/Campus/CampusControllers.cs|Fichier C# — campus controllers
Api/Controllers/Chat/ChatController.cs|Fichier C# — chat controller
Api/Controllers/Content/ContentController.cs|Fichier C# — content controller
Api/Controllers/Draft/DraftController.cs|Fichier C# — draft controller
Api/Controllers/Finance/FinanceController.cs|Fichier C# — finance controller
Api/Controllers/Gamification/GamificationControllers.cs|Fichier C# — gamification controllers
Api/Controllers/Gamification/GoTaskController.cs|Fichier C# — go task controller
Api/Controllers/Gps/GpsControllers.cs|Fichier C# — gps controllers
Api/Controllers/Historique/HistoriqueController.cs|Fichier C# — historique controller
Api/Controllers/Matching/MatchingController.cs|Fichier C# — matching controller
Api/Controllers/Notification/NotificationController.cs|Fichier C# — notification controller
Api/Controllers/Onboarding/OnboardingController.cs|Fichier C# — onboarding controller
Api/Controllers/Pipeda/PipedaController.cs|Fichier C# — pipeda controller
Api/Controllers/Reservation/ReservationController.cs|Fichier C# — reservation controller
Api/Controllers/Security/SecurityController.cs|Fichier C# — security controller
Api/Controllers/Social/SocialControllers.cs|Fichier C# — social controllers
Api/Controllers/Sse/NotificationSseController.cs|Fichier C# — notification sse controller
Api/Controllers/Trip/TrajetController.cs|Fichier C# — trajet controller
Api/Controllers/UserController/UserController.cs|Fichier C# — user controller
Api/Controllers/Vehicle/VehiculeController.cs|Fichier C# — vehicule controller
Api/DTOs/.gitkeep|Fichier C# — gitkeep
Api/DTOs/Common/ApiResponse.cs|Fichier C# — api response
Api/Hubs/CovoiturageHub.cs|Fichier C# — covoiturage hub
Api/Middlewares/.gitkeep|Fichier C# — gitkeep
Api/Middlewares/CertificateValidationMiddleware.cs|Fichier C# — certificate validation middleware
Api/Middlewares/ExceptionMiddleware.cs|Fichier C# — exception middleware
Api/Middlewares/WebSessionKeyMiddleware.cs|Fichier C# — web session key middleware
Application/DTOs/.gitkeep|Fichier C# — gitkeep
Application/DTOs/Admin/AdminDtos.cs|Fichier C# — admin dtos
Application/DTOs/Auth/AuthDtos.cs|Fichier C# — auth dtos
Application/DTOs/Auth/AuthSessionDtos.cs|Fichier C# — auth session dtos
Application/DTOs/Campus/CampusDtos.cs|Fichier C# — campus dtos
Application/DTOs/Chat/ChatDtos.cs|Fichier C# — chat dtos
Application/DTOs/Content/ContentDtos.cs|Fichier C# — content dtos
Application/DTOs/Finance/FinanceDtos.cs|Fichier C# — finance dtos
Application/DTOs/Gamification/GamificationDtos.cs|Fichier C# — gamification dtos
Application/DTOs/Gps/GpsDtos.cs|Fichier C# — gps dtos
Application/DTOs/Matching/MatchingDtos.cs|Fichier C# — matching dtos
Application/DTOs/Notification/NotificationDtos.cs|Fichier C# — notification dtos
Application/DTOs/Onboarding/OnboardingDtos.cs|Fichier C# — onboarding dtos
Application/DTOs/Pipeda/PipedaDtos.cs|Fichier C# — pipeda dtos
Application/DTOs/Reservation/CreateReservationDto.cs|Fichier C# — create reservation dto
Application/DTOs/Reservation/ReservationEnrichedDto.cs|Fichier C# — reservation enriched dto
Application/DTOs/Reservation/ReservationResponseDto.cs|Fichier C# — reservation response dto
Application/DTOs/Security/SecurityDtos.cs|Fichier C# — security dtos
Application/DTOs/Social/SocialDtos.cs|Fichier C# — social dtos
Application/DTOs/Trip/CreateTrajetDto.cs|Fichier C# — create trajet dto
Application/DTOs/Trip/TrajetResponseDto.cs|Fichier C# — trajet response dto
Application/DTOs/User/PaginatedResult.cs|Fichier C# — paginated result
Application/DTOs/User/SurveyAlertDtos.cs|Fichier C# — survey alert dtos
Application/DTOs/User/UpdateUserDto.cs|Fichier C# — update user dto
Application/DTOs/User/UserPublicDto.cs|Fichier C# — user public dto
Application/DTOs/User/UserResponseDto.cs|Fichier C# — user response dto
Application/DTOs/Vehicle/VehiculeDtos.cs|Fichier C# — vehicule dtos
Application/Interfaces/.gitkeep|Fichier C# — gitkeep
Application/Interfaces/IAdminRepositories.cs|Fichier C# — i admin repositories
Application/Interfaces/IAdminService.cs|Fichier C# — i admin service
Application/Interfaces/IAuthSessionService.cs|Fichier C# — i auth session service
Application/Interfaces/ICampusRepositories.cs|Fichier C# — i campus repositories
Application/Interfaces/ICampusService.cs|Fichier C# — i campus service
Application/Interfaces/IChatService.cs|Fichier C# — i chat service
Application/Interfaces/IContentService.cs|Fichier C# — i content service
Application/Interfaces/IEmailService.cs|Fichier C# — i email service
Application/Interfaces/IFinanceRepositories.cs|Fichier C# — i finance repositories
Application/Interfaces/IFinanceService.cs|Fichier C# — i finance service
Application/Interfaces/IGamificationRepositories.cs|Fichier C# — i gamification repositories
Application/Interfaces/IGamificationService.cs|Fichier C# — i gamification service
Application/Interfaces/IGpsRepositories.cs|Fichier C# — i gps repositories
Application/Interfaces/IGpsTrackingService.cs|Fichier C# — i gps tracking service
Application/Interfaces/IMatchingService.cs|Fichier C# — i matching service
Application/Interfaces/INotificationRepository.cs|Fichier C# — i notification repository
Application/Interfaces/INotificationService.cs|Fichier C# — i notification service
Application/Interfaces/IOnboardingService.cs|Fichier C# — i onboarding service
Application/Interfaces/IPipedaRepositories.cs|Fichier C# — i pipeda repositories
Application/Interfaces/IPipedaService.cs|Fichier C# — i pipeda service
Application/Interfaces/IReservationRepository.cs|Fichier C# — i reservation repository
Application/Interfaces/IReservationService.cs|Fichier C# — i reservation service
Application/Interfaces/ISecurityRepositories.cs|Fichier C# — i security repositories
Application/Interfaces/ISecurityService.cs|Fichier C# — i security service
Application/Interfaces/ISocialRepositories.cs|Fichier C# — i social repositories
Application/Interfaces/ISocialServices.cs|Fichier C# — i social services
Application/Interfaces/ITrajetRepository.cs|Fichier C# — i trajet repository
Application/Interfaces/ITrajetService.cs|Fichier C# — i trajet service
Application/Interfaces/IUserRepository.cs|Fichier C# — i user repository
Application/Interfaces/IUserService.cs|Fichier C# — i user service
Application/Interfaces/IVehiculeRepository.cs|Fichier C# — i vehicule repository
Application/Interfaces/IVehiculeService.cs|Fichier C# — i vehicule service
Application/Jobs/HangfireJobRegistrar.cs|Fichier C# — hangfire job registrar
Application/Jobs/ScheduledJobs.cs|Fichier C# — scheduled jobs
Application/Jobs/TripJobs.cs|Fichier C# — trip jobs
Application/Jobs/UserJobs.cs|Fichier C# — user jobs
Application/Services/Admin/AdminService.cs|Fichier C# — admin service
Application/Services/Auth/AuthSessionCleanupService.cs|Fichier C# — auth session cleanup service
Application/Services/Auth/AuthSessionService.cs|Fichier C# — auth session service
Application/Services/Auth/EmailService.cs|Fichier C# — email service
Application/Services/Auth/MicrosoftSsoService.cs|Fichier C# — microsoft sso service
Application/Services/Auth/SessionCodeCleanupService.cs|Fichier C# — session code cleanup service
Application/Services/Auth/SessionCodeService.cs|Fichier C# — session code service
Application/Services/Auth/TokenService.cs|Fichier C# — token service
Application/Services/Campus/CampusService.cs|Fichier C# — campus service
Application/Services/Chat/ChatService.cs|Fichier C# — chat service
Application/Services/Content/ContentService.cs|Fichier C# — content service
Application/Services/Finance/FinanceService.cs|Fichier C# — finance service
Application/Services/Gamification/GamificationService.cs|Fichier C# — gamification service
Application/Services/Gamification/GoTaskService.cs|Fichier C# — go task service
Application/Services/Gps/GpsTrackingService.cs|Fichier C# — gps tracking service
Application/Services/Matching/MatchingService.cs|Fichier C# — matching service
Application/Services/Notification/NotificationCategoryHelper.cs|Fichier C# — notification category helper
Application/Services/Notification/NotificationService.cs|Fichier C# — notification service
Application/Services/Onboarding/OnboardingService.cs|Fichier C# — onboarding service
Application/Services/Pipeda/PipedaComplianceService.cs|Fichier C# — pipeda compliance service
Application/Services/Reservation/ReservationService.cs|Fichier C# — reservation service
Application/Services/Security/SecurityService.cs|Fichier C# — security service
Application/Services/Social/SocialServices.cs|Fichier C# — social services
Application/Services/Sse/SseChannelService.cs|Fichier C# — sse channel service
Application/Services/Trip/TrajetService.cs|Fichier C# — trajet service
Application/Services/User/UserService.cs|Fichier C# — user service
Application/Services/UserServices/UserServices.cs|Fichier C# — user services
Application/Services/Vehicle/VehiculeService.cs|Fichier C# — vehicule service
Application/Validations/.gitkeep|Fichier C# — gitkeep
Covoiturage_La_Cite(Server_Core).csproj|Projet C# — Covoiturage_La_Cite(Server_Core)
Covoiturage_La_Cite(Server_Core).http|Fichier C# — covoiturage  la  cite( server  core)
Data/Models/AlertesUrgence/AlertesUrgence.cs|Fichier C# — alertes urgence
Data/Models/Badge/Badge.cs|Fichier C# — badge
Data/Models/CategoriesSignalement/CategoriesSignalement.cs|Fichier C# — categories signalement
Data/Models/ComptesVirtuel/ComptesVirtuel.cs|Fichier C# — comptes virtuel
Data/Models/ConfigSysteme/ConfigSysteme.cs|Fichier C# — config systeme
Data/Models/ConsentementsPipedum/ConsentementsPipedum.cs|Fichier C# — consentements pipedum
Data/Models/ContactsUrgence/ContactsUrgence.cs|Fichier C# — contacts urgence
Data/Models/DefisEcologique/DefisEcologique.cs|Fichier C# — defis ecologique
Data/Models/DemandesMultiplesTracking/DemandesMultiplesTracking.cs|Fichier C# — demandes multiples tracking
Data/Models/DocumentsConducteur/DocumentsConducteur.cs|Fichier C# — documents conducteur
Data/Models/Evaluation/Evaluation.cs|Fichier C# — evaluation
Data/Models/ExportsDonnee/ExportsDonnee.cs|Fichier C# — exports donnee
Data/Models/Favori/Favori.cs|Fichier C# — favori
Data/Models/FavorisConducteur/FavorisConducteur.cs|Fichier C# — favoris conducteur
Data/Models/GeofenceEvent/GeofenceEvent.cs|Fichier C# — geofence event
Data/Models/GeofencesMobile/GeofencesMobile.cs|Fichier C# — geofences mobile
Data/Models/HistoriqueTrajet/HistoriqueTrajet.cs|Fichier C# — historique trajet
Data/Models/LieuxFavori/LieuxFavori.cs|Fichier C# — lieux favori
Data/Models/Litige/Litige.cs|Fichier C# — litige
Data/Models/LogsSecurite/LogsSecurite.cs|Fichier C# — logs securite
Data/Models/MobileDeviceInfo/MobileDeviceInfo.cs|Fichier C# — mobile device info
Data/Models/MobileSession/MobileSession.cs|Fichier C# — mobile session
Data/Models/PartagesPositionUrgence/PartagesPositionUrgence.cs|Fichier C# — partages position urgence
Data/Models/ParticipationsDefi/ParticipationsDefi.cs|Fichier C# — participations defi
Data/Models/Penalite/Penalite.cs|Fichier C# — penalite
Data/Models/PointsReputation/PointsReputation.cs|Fichier C# — points reputation
Data/Models/PositionsGp/PositionsGp.cs|Fichier C# — positions gp
Data/Models/PreferencesUtilisateur/PreferencesUtilisateur.cs|Fichier C# — preferences utilisateur
Data/Models/ProfilsConducteur/ProfilsConducteur.cs|Fichier C# — profils conducteur
Data/Models/RaisonsAnnulation/RaisonsAnnulation.cs|Fichier C# — raisons annulation
Data/Models/RemboursementsPenalite/RemboursementsPenalite.cs|Fichier C# — remboursements penalite
Data/Models/RemboursementsTransaction/RemboursementsTransaction.cs|Fichier C# — remboursements transaction
Data/Models/Reservation/Reservation.cs|Fichier C# — reservation
Data/Models/SessionsUtilisateur/SessionsUtilisateur.cs|Fichier C# — sessions utilisateur
Data/Models/Signalement/Signalement.cs|Fichier C# — signalement
Data/Models/StatistiquesGlobale/StatistiquesGlobale.cs|Fichier C# — statistiques globale
Data/Models/StatistiquesUtilisateur/StatistiquesUtilisateur.cs|Fichier C# — statistiques utilisateur
Data/Models/SuppressionsCompte/SuppressionsCompte.cs|Fichier C# — suppressions compte
Data/Models/Trajet/Trajet.cs|Fichier C# — trajet
Data/Models/TrajetsRecurrent/TrajetsRecurrent.cs|Fichier C# — trajets recurrent
Data/Models/Transaction/Transaction.cs|Fichier C# — transaction
Data/Models/User/User.cs|Fichier C# — user
Data/Models/UsersBadge/UsersBadge.cs|Fichier C# — users badge
Data/Models/VReservationsDetail/VReservationsDetail.cs|Fichier C# — v reservations detail
Data/Models/VTrajetsDisponible/VTrajetsDisponible.cs|Fichier C# — v trajets disponible
Data/Models/Vehicule/Vehicule.cs|Fichier C# — vehicule
Data/Models/WaypointsTrajet/WaypointsTrajet.cs|Fichier C# — waypoints trajet
Data/Models/ZonesCampus/ZonesCampus.cs|Fichier C# — zones campus
Data/MongoDB/DocumentModel/.gitkeep|Fichier C# — gitkeep
Data/MongoDB/Models/AppLog.cs|Fichier C# — app log
Data/MongoDB/Models/Astuce.cs|Fichier C# — astuce
Data/MongoDB/Models/ChatMessage.cs|Fichier C# — chat message
Data/MongoDB/Models/Nouveaute.cs|Fichier C# — nouveaute
Data/MongoDB/Models/UserActivity.cs|Fichier C# — user activity
Data/MongoDB/MongoDbContext.cs|Fichier C# — mongo db context
Data/MongoDB/MongoDbInitializer.cs|Fichier C# — mongo db initializer
Data/MongoDB/Repositories/.gitkeep|Fichier C# — gitkeep
Data/PostgreSQL/AppDbContext.cs|Fichier C# — app db context
Data/PostgreSQL/Repositories/AdminRepository/AdminRepositories.cs|Fichier C# — admin repositories
Data/PostgreSQL/Repositories/CampusRepository/CampusRepositories.cs|Fichier C# — campus repositories
Data/PostgreSQL/Repositories/FinanceRepository/FinanceRepositories.cs|Fichier C# — finance repositories
Data/PostgreSQL/Repositories/GamificationRepository/GamificationRepositories.cs|Fichier C# — gamification repositories
Data/PostgreSQL/Repositories/GpsRepository/GpsRepositories.cs|Fichier C# — gps repositories
Data/PostgreSQL/Repositories/NotificationRepository/NotificationRepository.cs|Fichier C# — notification repository
Data/PostgreSQL/Repositories/PipedaRepository/PipedaRepositories.cs|Fichier C# — pipeda repositories
Data/PostgreSQL/Repositories/ReservationRepository/ReservationRepository.cs|Fichier C# — reservation repository
Data/PostgreSQL/Repositories/SecurityRepository/SecurityRepositories.cs|Fichier C# — security repositories
Data/PostgreSQL/Repositories/SocialRepository/SocialRepositories.cs|Fichier C# — social repositories
Data/PostgreSQL/Repositories/TrajetRepository/TrajetRepository.cs|Fichier C# — trajet repository
Data/PostgreSQL/Repositories/UserRepository/UserRepository.cs|Fichier C# — user repository
Data/PostgreSQL/Repositories/VehiculeRepository/VehiculeRepository.cs|Fichier C# — vehicule repository
Data/PostgreSQL/Seeding/DatabaseSeeder.cs|Fichier C# — database seeder
Domain/Entities/Affinity.cs|Fichier C# — affinity
Domain/Entities/AuditLog.cs|Fichier C# — audit log
Domain/Entities/Badge.cs|Fichier C# — badge
Domain/Entities/ChallengeParticipation.cs|Fichier C# — challenge participation
Domain/Entities/DriverDocument.cs|Fichier C# — driver document
Domain/Entities/DriverProfile.cs|Fichier C# — driver profile
Domain/Entities/EcoChallenge.cs|Fichier C# — eco challenge
Domain/Entities/GeofenceZone.cs|Fichier C# — geofence zone
Domain/Entities/GoTask.cs|Fichier C# — go task
Domain/Entities/GpsPosition.cs|Fichier C# — gps position
Domain/Entities/MatchingScoreCache.cs|Fichier C# — matching score cache
Domain/Entities/Notification.cs|Fichier C# — notification
Domain/Entities/Penalty.cs|Fichier C# — penalty
Domain/Entities/PlatformConfig.cs|Fichier C# — platform config
Domain/Entities/PlatformStats.cs|Fichier C# — platform stats
Domain/Entities/Report.cs|Fichier C# — report
Domain/Entities/Reservation.cs|Fichier C# — reservation
Domain/Entities/Review.cs|Fichier C# — review
Domain/Entities/Security/AuthSession.cs|Fichier C# — auth session
Domain/Entities/Security/CertificateRotationEvent.cs|Fichier C# — certificate rotation event
Domain/Entities/Security/ClientCertificate.cs|Fichier C# — client certificate
Domain/Entities/Security/UserSecurityActivity.cs|Fichier C# — user security activity
Domain/Entities/Security/WebSessionKey.cs|Fichier C# — web session key
Domain/Entities/SmartSuggestion.cs|Fichier C# — smart suggestion
Domain/Entities/SosAlert.cs|Fichier C# — sos alert
Domain/Entities/SurveyTripAlert.cs|Fichier C# — survey trip alert
Domain/Entities/Transaction.cs|Fichier C# — transaction
Domain/Entities/Trip.cs|Fichier C# — trip
Domain/Entities/User.cs|Fichier C# — user
Domain/Entities/UserBadge.cs|Fichier C# — user badge
Domain/Entities/UserBehaviorPattern.cs|Fichier C# — user behavior pattern
Domain/Entities/UserGoTaskProgression.cs|Fichier C# — user go task progression
Domain/Entities/UserLike.cs|Fichier C# — user like
Domain/Entities/UserPreferences.cs|Fichier C# — user preferences
Domain/Entities/UserStat.cs|Fichier C# — user stat
Domain/Entities/Vehicle.cs|Fichier C# — vehicle
Domain/Entities/WaypointTrip.cs|Fichier C# — waypoint trip
Domain/Entities/Withdrawal.cs|Fichier C# — withdrawal
Domain/Enums/ChurnRisk.cs|Fichier C# — churn risk
Domain/Enums/ConversationLevel.cs|Fichier C# — conversation level
Domain/Enums/DocumentType.cs|Fichier C# — document type
Domain/Enums/DriverValidationStatus.cs|Fichier C# — driver validation status
Domain/Enums/NotificationCategory.cs|Fichier C# — notification category
Domain/Enums/NotificationType.cs|Fichier C# — notification type
Domain/Enums/PaymentMethod.cs|Fichier C# — payment method
Domain/Enums/PaymentStatus.cs|Fichier C# — payment status
Domain/Enums/PenaltyStatus.cs|Fichier C# — penalty status
Domain/Enums/PenaltyType.cs|Fichier C# — penalty type
Domain/Enums/ReportCategory.cs|Fichier C# — report category
Domain/Enums/ReservationStatus.cs|Fichier C# — reservation status
Domain/Enums/SchoolRole.cs|Fichier C# — school role
Domain/Enums/SuggestionType.cs|Fichier C# — suggestion type
Domain/Enums/TripStatus.cs|Fichier C# — trip status
Domain/Enums/TripType.cs|Fichier C# — trip type
Domain/Enums/UserRole.cs|Fichier C# — user role
Domain/Enums/UserStatus.cs|Fichier C# — user status
Domain/Interfaces/IRepository.cs|Fichier C# — i repository
Migrations/20260405031838_Initialization.Designer.cs|Fichier C# — 20260405031838  initialization  designer
Migrations/20260405031838_Initialization.cs|Fichier C# — 20260405031838  initialization
Migrations/20260405140435_AddIdentityVerificationFields.Designer.cs|Fichier C# — 20260405140435  add identity verification fields  designer
Migrations/20260405140435_AddIdentityVerificationFields.cs|Fichier C# — 20260405140435  add identity verification fields
Migrations/AppDbContextModelSnapshot.cs|Fichier C# — app db context model snapshot
Program.cs|Fichier C# — program
Properties/launchSettings.json|Fichier C# — launch settings
appsettings.Development.json|Configuration — appsettings.Development
appsettings.json|Configuration ASP.NET Core — variables d'environnement
docs/IMPLEMENTATION_DOC.md|Fichier C# — i m p l e m e n t a t i o n  d o c