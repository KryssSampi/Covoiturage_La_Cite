# architecture.md — généré le 2026-03-24 23:02

.env|Fichier — env
.env.local|Fichier — env
.gitignore|Fichier — gitignore
README.md|Fichier — r e a d m e
app/(Public)/.gitkeep|Fichier — gitkeep
app/(admin)/.gitkeep|Fichier — gitkeep
app/(auth)/login/layout.tsx|Layout Next.js — login
app/(auth)/login/page.tsx|Page Next.js — login
app/(protected)/admin/[id]/page.tsx|Page protégée admin (rôle dynamique)
app/(protected)/driver/[id]/page.tsx|Page protégée driver (rôle dynamique)
app/(protected)/driver/brouillons/[id]/page.tsx|Sous-page brouillons — section driver
app/(protected)/driver/create-trip/[id]/page.tsx|Sous-page create-trip — section driver
app/(protected)/driver/favoris/[id]/page.tsx|Sous-page favoris — section driver
app/(protected)/driver/finances/[id]/page.tsx|Sous-page finances — section driver
app/(protected)/driver/goboard/[id]/page.tsx|Sous-page goboard — section driver
app/(protected)/driver/historique/[id]/page.tsx|Sous-page historique — section driver
app/(protected)/driver/notifications/[id]/page.tsx|Sous-page notifications — section driver
app/(protected)/driver/nouveautes/[id]/page.tsx|Sous-page nouveautes — section driver
app/(protected)/driver/planifier/[id]/page.tsx|Sous-page planifier — section driver
app/(protected)/driver/reservations/[id]/page.tsx|Sous-page reservations — section driver
app/(protected)/driver/reviews/[id]/page.tsx|Sous-page reviews — section driver
app/(protected)/driver/search/[id]/page.tsx|Sous-page search — section driver
app/(protected)/driver/statistiques/[id]/page.tsx|Sous-page statistiques — section driver
app/(protected)/layout.tsx|Layout Next.js — (protected)
app/(protected)/notifications/page.tsx|Page Next.js — notifications
app/(protected)/passenger/[id]/page.tsx|Page protégée passenger (rôle dynamique)
app/(protected)/passenger/favoris/[id]/page.tsx|Sous-page favoris — section passenger
app/(protected)/passenger/finances/[id]/page.tsx|Sous-page finances — section passenger
app/(protected)/passenger/goboard/[id]/page.tsx|Sous-page goboard — section passenger
app/(protected)/passenger/historique/[id]/page.tsx|Sous-page historique — section passenger
app/(protected)/passenger/notifications/[id]/page.tsx|Sous-page notifications — section passenger
app/(protected)/passenger/nouveautes/[id]/page.tsx|Sous-page nouveautes — section passenger
app/(protected)/passenger/planifier/[id]/page.tsx|Sous-page planifier — section passenger
app/(protected)/passenger/reservations/[id]/page.tsx|Sous-page reservations — section passenger
app/(protected)/passenger/reviews/[id]/page.tsx|Sous-page reviews — section passenger
app/(protected)/passenger/search/[id]/page.tsx|Sous-page search — section passenger
app/(protected)/passenger/statistiques/[id]/page.tsx|Sous-page statistiques — section passenger
app/(protected)/trajet-en-cours/[id]/page.tsx|Page protégée trajet-en-cours (rôle dynamique)
app/(protected)/trajets/[id]/page.tsx|Page protégée trajets (rôle dynamique)
app/(protected)/trajets/page.tsx|Page Next.js — trajets
app/api/admin/simulate/route.ts|Route API — admin/simulate
app/api/admin/trips/route.ts|Route API — admin/trips
app/api/admin/users/route.ts|Route API — admin/users
app/api/astuces/route.ts|Route API — astuces
app/api/auth/.gitkeep|Fichier — gitkeep
app/api/auth/signin/route.ts|Route API — auth/signin
app/api/dashboard/driver/[id]/finance/route.ts|Route API — dashboard/driver/[id]/finance
app/api/dashboard/driver/[id]/route.ts|Route API — dashboard/driver/[id]
app/api/dashboard/passenger/[id]/route.ts|Route API — dashboard/passenger/[id]
app/api/db/[entity]/route.ts|Route API — db/[entity]
app/api/drafts/[id]/route.ts|Route API — drafts/[id]
app/api/drafts/route.ts|Route API — drafts
app/api/driver/historique/route.ts|Route API — driver/historique
app/api/driver/reservation-requests/route.ts|Route API — driver/reservation-requests
app/api/favoris/alerte-toggle/route.ts|Route API — favoris/alerte-toggle
app/api/favoris/route.ts|Route API — favoris
app/api/favoris/user-favori/route.ts|Route API — favoris/user-favori
app/api/finances/route.ts|Route API — finances
app/api/goboard/route.ts|Route API — goboard
app/api/gotasks/route.ts|Route API — gotasks
app/api/indisponibilities/[id]/route.ts|Route API — indisponibilities/[id]
app/api/lieux-favoris/route.ts|Route API — lieux-favoris
app/api/middleware/.gitkeep|Fichier — gitkeep
app/api/notifications/[id]/read/route.ts|Route API — notifications/[id]/read
app/api/notifications/read-all/route.ts|Route API — notifications/read-all
app/api/notifications/route.ts|Route API — notifications
app/api/nouveautes/route.ts|Route API — nouveautes
app/api/passenger/historique/route.ts|Route API — passenger/historique
app/api/passenger/reservations-enriched/route.ts|Route API — passenger/reservations-enriched
app/api/passenger/search/route.ts|Route API — passenger/search
app/api/payment/bank-account/route.ts|Route API — payment/bank-account
app/api/payment/deposit/route.ts|Route API — payment/deposit
app/api/payment/withdraw/route.ts|Route API — payment/withdraw
app/api/reservations/[id]/accept/route.ts|Route API — reservations/[id]/accept
app/api/reservations/[id]/cancel/route.ts|Route API — reservations/[id]/cancel
app/api/reservations/[id]/refuse/route.ts|Route API — reservations/[id]/refuse
app/api/reservations/[id]/reject/route.ts|Route API — reservations/[id]/reject
app/api/reservations/[id]/route.ts|Route API — reservations/[id]
app/api/reservations/[id]/start/route.ts|Route API — reservations/[id]/start
app/api/reservations/route.ts|Route API — reservations
app/api/reviews/enriched/route.ts|Route API — reviews/enriched
app/api/reviews/route.ts|Route API — reviews
app/api/sse/db-watch/[entity]/route.ts|Route API — sse/db-watch/[entity]
app/api/statistiques/route.ts|Route API — statistiques
app/api/trajets/.gitkeep|Fichier — gitkeep
app/api/trips/[id]/route.ts|Route API — trips/[id]
app/api/trips/[id]/status/route.ts|Route API — trips/[id]/status
app/api/trips/route.ts|Route API — trips
app/api/unsplash/route.ts|Route API — unsplash
app/api/users/.gitkeep|Fichier — gitkeep
app/api/users/route.ts|Route API — users
app/api/vehicles/route.ts|Route API — vehicles
app/error.tsx|Page d'erreur — app
app/globals.css|Fichier — globals
app/layout.tsx|Layout Next.js — app
app/loading.tsx|Skeleton de chargement — app
app/page.tsx|Page Next.js — app
config/.gitkeep|Fichier — gitkeep
convert-script.js|Fichier — convert script
core/config/.gitkeep|Fichier — gitkeep
core/config/UserStatAdminConfig.ts|Module core — config/ user stat admin config
core/context/.gitkeep|Fichier — gitkeep
core/context/db.context.tsx|Context React — db
core/context/loader.context.tsx|Context React — loader
core/context/trip.context.tsx|Context React — trip
core/guards/.gitkeep|Fichier — gitkeep
core/hooks/.gitkeep|Fichier — gitkeep
core/lib/.gitkeep|Fichier — gitkeep
core/lib/unsplash.ts|Module core — lib/unsplash
core/models/AffiniteModel.ts|Modèle de données — Affinite
core/models/BadgeModel.ts|Modèle de données — Badge
core/models/BankAccountModel.ts|Modèle de données — BankAccount
core/models/DriverFinanceAccountModel.ts|Modèle de données — DriverFinanceAccount
core/models/IndisponibilityModel.ts|Modèle de données — Indisponibility
core/models/MessageModel.ts|Modèle de données — Message
core/models/NotificationModel.ts|Modèle de données — Notification
core/models/NouveauteModel.ts|Modèle de données — Nouveaute
core/models/PassengerFinanceAccountModel.ts|Modèle de données — PassengerFinanceAccount
core/models/ReservationModel.ts|Modèle de données — Reservation
core/models/ReviewModel.ts|Modèle de données — Review
core/models/SignalementModel.ts|Modèle de données — Signalement
core/models/TripModel.ts|Modèle de données — Trip
core/models/UserModel.ts|Modèle de données — User
core/models/UserPreferencesModel.ts|Modèle de données — UserPreferences
core/models/UserStatModel.ts|Modèle de données — UserStat
core/models/VehicleModel.ts|Modèle de données — Vehicle
core/models/index.ts|Module core — models/index
core/services/.gitkeep|Fichier — gitkeep
core/services/getlocation.current.ts|Module core — services/getlocation current
core/services/index.ts|Module core — services/index
core/services/location.suggestion.ts|Module core — services/location suggestion
core/services/notification.service.ts|Module core — services/notification service
core/services/reservation.service.ts|Module core — services/reservation service
core/services/review.service.ts|Module core — services/review service
core/services/trip.service.ts|Module core — services/trip service
core/services/user.service.ts|Module core — services/user service
core/services/vehicle.service.ts|Module core — services/vehicle service
core/state/.gitkeep|Fichier — gitkeep
core/state/app_state.ts|Store global — app state
core/utils/.gitkeep|Fichier — gitkeep
core/utils/date.utils.ts|Utilitaires — date
core/utils/indisponibility.utils.ts|Utilitaires — indisponibility
docs/.backup-info-2026-02-15T18-12-17-750Z.json|Fichier — backup info 2026 02 15 t18 12 17 750 z
docs/.gitkeep|Fichier — gitkeep
docs/CHANGELOG_PHASE3.md|Fichier — c h a n g e l o g  p h a s e3
docs/IMPORT_MIGRATION_GUIDE.md|Fichier — i m p o r t  m i g r a t i o n  g u i d e
domain/exceptions/.gitkeep|Fichier — gitkeep
domain/models/AffiniteModel.ts|Fichier — affinite model
domain/models/AlertesUrgenceModel.ts|Fichier — alertes urgence model
domain/models/BadgeModel.ts|Fichier — badge model
domain/models/CategoriesSignalementModel.ts|Fichier — categories signalement model
domain/models/ComptesVirtuelModel.ts|Fichier — comptes virtuel model
domain/models/ConfigSystemeModel.ts|Fichier — config systeme model
domain/models/ConsentementsPipedaModel.ts|Fichier — consentements pipeda model
domain/models/ContactsUrgenceModel.ts|Fichier — contacts urgence model
domain/models/DefisEcologiqueModel.ts|Fichier — defis ecologique model
domain/models/DemandesMultiplesTrackingModel.ts|Fichier — demandes multiples tracking model
domain/models/DocumentsConducteurModel.ts|Fichier — documents conducteur model
domain/models/EvaluationModel.ts|Fichier — evaluation model
domain/models/ExportsDonneeModel.ts|Fichier — exports donnee model
domain/models/FavoriModel.ts|Fichier — favori model
domain/models/FavorisConducteurModel.ts|Fichier — favoris conducteur model
domain/models/GeofenceEventModel.ts|Fichier — geofence event model
domain/models/GeofencesMobileModel.ts|Fichier — geofences mobile model
domain/models/HistoriqueTrajetModel.ts|Fichier — historique trajet model
domain/models/LieuxFavoriModel.ts|Fichier — lieux favori model
domain/models/LitigeModel.ts|Fichier — litige model
domain/models/LogsSecuriteModel.ts|Fichier — logs securite model
domain/models/MobileDeviceInfoModel.ts|Fichier — mobile device info model
domain/models/MobileSessionModel.ts|Fichier — mobile session model
domain/models/PartagesPositionUrgenceModel.ts|Fichier — partages position urgence model
domain/models/ParticipationsDefiModel.ts|Fichier — participations defi model
domain/models/PenaliteModel.ts|Fichier — penalite model
domain/models/PointsReputationModel.ts|Fichier — points reputation model
domain/models/PositionsGpModel.ts|Fichier — positions gp model
domain/models/PreferencesUtilisateurModel.ts|Fichier — preferences utilisateur model
domain/models/ProfilsConducteurModel.ts|Fichier — profils conducteur model
domain/models/RaisonsAnnulationModel.ts|Fichier — raisons annulation model
domain/models/RemboursementsPenaliteModel.ts|Fichier — remboursements penalite model
domain/models/RemboursementsTransactionModel.ts|Fichier — remboursements transaction model
domain/models/ReservationModel.ts|Fichier — reservation model
domain/models/SessionsUtilisateurModel.ts|Fichier — sessions utilisateur model
domain/models/SignalementModel.ts|Fichier — signalement model
domain/models/SpatialRefSyModel.ts|Fichier — spatial ref sy model
domain/models/StatistiquesGlobaleModel.ts|Fichier — statistiques globale model
domain/models/StatistiquesUtilisateurModel.ts|Fichier — statistiques utilisateur model
domain/models/SuppressionsCompteModel.ts|Fichier — suppressions compte model
domain/models/TrajetModel.ts|Fichier — trajet model
domain/models/TrajetsRecurrentModel.ts|Fichier — trajets recurrent model
domain/models/TransactionModel.ts|Fichier — transaction model
domain/models/UserModel.ts|Fichier — user model
domain/models/UsersBadgeModel.ts|Fichier — users badge model
domain/models/VehiculeModel.ts|Fichier — vehicule model
domain/models/WaypointsTrajetModel.ts|Fichier — waypoints trajet model
domain/models/ZonesCampuModel.ts|Fichier — zones campu model
domain/models/index.ts|Fichier — index
domain/repositories/.gitkeep|Fichier — gitkeep
domain/types/.gitkeep|Fichier — gitkeep
domain/validators/.gitkeep|Fichier — gitkeep
eslint.config.mjs|Fichier — eslint config
features/admin/components/AdminTripsPanel.tsx|Composant admin trips panel — feature administration
features/admin/components/TripSimulationCard.tsx|Composant trip simulation card — feature administration
features/admin/components/UsersList.tsx|Composant users list — feature administration
features/admin/hooks/useAdminTrips.ts|Hook useAdminTrips — feature administration
features/admin/types/adminTrips.ts|Fichier — admin trips
features/auth/.gitkeep|Fichier — gitkeep
features/auth/components/index.ts|Composant index — feature authentification
features/auth/components/loginArea.tsx|Composant login area — feature authentification
features/auth/hooks/index.ts|Fichier — index
features/auth/hooks/useAuth.tsx|Hook useAuth — feature authentification
features/auth/hooks/useloginForm.tsx|Hook useloginForm — feature authentification
features/auth/index.ts|Barrel export — feature authentification
features/brouillons/components/BrouillonsPage.tsx|Composant brouillons — feature brouillons
features/brouillons/components/DraftDetailView.tsx|Composant draft detail view — feature brouillons
features/brouillons/components/DraftTripCard.tsx|Composant draft trip card — feature brouillons
features/brouillons/hooks/useDrafts.ts|Hook useDrafts — feature brouillons
features/brouillons/index.ts|Barrel export — feature brouillons
features/brouillons/types/draft.types.ts|Types draft — feature brouillons
features/brouillons/types/index.ts|Fichier — index
features/dashboard/README.md|Fichier — r e a d m e
features/dashboard/components/driver/finance.section.tsx|Composant driver/finance section — feature tableau de bord
features/dashboard/components/driver/index.ts|Composant driver/index — feature tableau de bord
features/dashboard/components/driver/published_trips.section.tsx|Composant driver/published trips section — feature tableau de bord
features/dashboard/components/driver/quickplan.section.tsx|Composant driver/quickplan section — feature tableau de bord
features/dashboard/components/driver/reservation_requests.section.tsx|Composant driver/reservation requests section — feature tableau de bord
features/dashboard/components/passenger/destination.card.tsx|Composant passenger/destination card — feature tableau de bord
features/dashboard/components/passenger/index.ts|Composant passenger/index — feature tableau de bord
features/dashboard/components/passenger/recents-destinations.section.tsx|Composant passenger/recents destinations section — feature tableau de bord
features/dashboard/components/passenger/recommended-rides.section.tsx|Composant passenger/recommended rides section — feature tableau de bord
features/dashboard/components/passenger/reservations.section.tsx|Composant passenger/reservations section — feature tableau de bord
features/dashboard/components/passenger/usual-destinations.section.tsx|Composant passenger/usual destinations section — feature tableau de bord
features/dashboard/components/shared/favorites.section.tsx|Composant shared/favorites section — feature tableau de bord
features/dashboard/components/shared/goboard.section.tsx|Composant shared/goboard section — feature tableau de bord
features/dashboard/components/shared/hero.tsx|Composant shared/hero — feature tableau de bord
features/dashboard/components/shared/index.ts|Composant shared/index — feature tableau de bord
features/dashboard/components/shared/lacite_astuces.section.tsx|Composant shared/lacite astuces section — feature tableau de bord
features/dashboard/components/shared/notifications.section.tsx|Composant shared/notifications section — feature tableau de bord
features/dashboard/components/shared/nouveautes.section.tsx|Composant shared/nouveautes section — feature tableau de bord
features/dashboard/components/shared/reviews.section.tsx|Composant shared/reviews section — feature tableau de bord
features/dashboard/components/shared/stats.section.tsx|Composant shared/stats section — feature tableau de bord
features/dashboard/components/shared/supersearch.section.tsx|Composant shared/supersearch section — feature tableau de bord
features/dashboard/context/DashboardContext.tsx|Context dashboard context — feature tableau de bord
features/dashboard/converters/dashboard.converter.ts|Converter dashboard converter — feature tableau de bord
features/dashboard/hooks/index.ts|Fichier — index
features/dashboard/hooks/useFavorites.ts|Hook useFavorites — feature tableau de bord
features/dashboard/hooks/useGoBoard.ts|Hook useGoBoard — feature tableau de bord
features/dashboard/hooks/useLiveDrafts.ts|Hook useLiveDrafts — feature tableau de bord
features/dashboard/hooks/useLiveFinance.ts|Hook useLiveFinance — feature tableau de bord
features/dashboard/hooks/useLiveGoTasks.ts|Hook useLiveGoTasks — feature tableau de bord
features/dashboard/hooks/useLiveTrips.ts|Hook useLiveTrips — feature tableau de bord
features/dashboard/hooks/useNotifications.ts|Hook useNotifications — feature tableau de bord
features/dashboard/hooks/useNouveautesSlider.ts|Hook useNouveautesSlider — feature tableau de bord
features/dashboard/hooks/usePublishedTrips.ts|Hook usePublishedTrips — feature tableau de bord
features/dashboard/hooks/useRecentDestinations.ts|Hook useRecentDestinations — feature tableau de bord
features/dashboard/hooks/useRecommendedRides.ts|Hook useRecommendedRides — feature tableau de bord
features/dashboard/hooks/useReservationRequests.ts|Hook useReservationRequests — feature tableau de bord
features/dashboard/hooks/useReservations.ts|Hook useReservations — feature tableau de bord
features/dashboard/hooks/useSuperSearch.ts|Hook useSuperSearch — feature tableau de bord
features/dashboard/hooks/useUsualDestinations.ts|Hook useUsualDestinations — feature tableau de bord
features/dashboard/types/affinite.types.ts|Types affinite — feature tableau de bord
features/dashboard/types/applicant.types.ts|Types applicant — feature tableau de bord
features/dashboard/types/destination.types.ts|Types destination — feature tableau de bord
features/dashboard/types/driver.types.ts|Types driver — feature tableau de bord
features/dashboard/types/favorite.types.ts|Types favorite — feature tableau de bord
features/dashboard/types/financesummary.types.ts|Types financesummary — feature tableau de bord
features/dashboard/types/goboard.types.ts|Types goboard — feature tableau de bord
features/dashboard/types/index.ts|Fichier — index
features/dashboard/types/lacite_astuces.types.ts|Types lacite astuces — feature tableau de bord
features/dashboard/types/notification.types.ts|Types notification — feature tableau de bord
features/dashboard/types/passenger.types.ts|Types passenger — feature tableau de bord
features/dashboard/types/publishedtrip.types.ts|Types publishedtrip — feature tableau de bord
features/dashboard/types/publishedtripstatus.types.ts|Types publishedtripstatus — feature tableau de bord
features/dashboard/types/reservation.types.ts|Types reservation — feature tableau de bord
features/dashboard/types/reservationStatus.types.ts|Types reservation status — feature tableau de bord
features/dashboard/types/reservationrequest.types.ts|Types reservationrequest — feature tableau de bord
features/dashboard/types/review.types.ts|Types review — feature tableau de bord
features/dashboard/types/search.types.ts|Types search — feature tableau de bord
features/dashboard/types/survey-destination.types.ts|Types survey destination — feature tableau de bord
features/dashboard/types/trip.types.ts|Types trip — feature tableau de bord
features/dashboard/types/trips.way.types.ts|Types trips way — feature tableau de bord
features/dashboard/types/user-profile.types.ts|Types user profile — feature tableau de bord
features/favoris/components/AddLieuOverlay.tsx|Composant add lieu overlay — feature favoris
features/favoris/components/AddUserOverlay.tsx|Composant add user overlay — feature favoris
features/favoris/components/AlerteCard.tsx|Composant alerte card — feature favoris
features/favoris/components/FavorisPage.new.tsx|Composant favoris page new — feature favoris
features/favoris/components/FavorisPage.tsx|Composant favoris — feature favoris
features/favoris/components/FavorisPage.v2.tsx|Composant favoris page v2 — feature favoris
features/favoris/components/LieuItem.tsx|Composant lieu item — feature favoris
features/favoris/components/StatsStrip.tsx|Composant stats strip — feature favoris
features/favoris/components/TabBar.tsx|Composant tab bar — feature favoris
features/favoris/components/UserCard.tsx|Composant user card — feature favoris
features/favoris/components/ui/Card.tsx|Composant ui/ card — feature favoris
features/favoris/components/ui/CardHeader.tsx|Composant ui/ card header — feature favoris
features/favoris/components/ui/Toggle.tsx|Composant ui/ toggle — feature favoris
features/favoris/components/ui/TrendMsg.tsx|Composant ui/ trend msg — feature favoris
features/favoris/hooks/useFavoris.ts|Hook useFavoris — feature favoris
features/favoris/index.ts|Barrel export — feature favoris
features/favoris/types/favoris.types.ts|Types favoris — feature favoris
features/finances/components/CardBankAccount.tsx|Composant card bank account — feature finances
features/finances/components/CardHistogramme.tsx|Composant card histogramme — feature finances
features/finances/components/CardPenalites.tsx|Composant card penalites — feature finances
features/finances/components/CardResumeMensuel.tsx|Composant card resume mensuel — feature finances
features/finances/components/CardRetrait.tsx|Composant card retrait — feature finances
features/finances/components/CardScatter.tsx|Composant card scatter — feature finances
features/finances/components/CardSolde.tsx|Composant card solde — feature finances
features/finances/components/CardTransactions.tsx|Composant card transactions — feature finances
features/finances/components/FinancesPage.tsx|Composant finances — feature finances
features/finances/components/HistogramSemaines.tsx|Composant histogram semaines — feature finances
features/finances/components/ScatterGainHeure.tsx|Composant scatter gain heure — feature finances
features/finances/components/ui/Card.tsx|Composant ui/ card — feature finances
features/finances/components/ui/CardHeader.tsx|Composant ui/ card header — feature finances
features/finances/components/ui/PeriodSelector.tsx|Composant ui/ period selector — feature finances
features/finances/components/ui/TrendMsg.tsx|Composant ui/ trend msg — feature finances
features/finances/components/ui/ZoomControls.tsx|Composant ui/ zoom controls — feature finances
features/finances/hooks/useFinances.ts|Hook useFinances — feature finances
features/finances/index.ts|Barrel export — feature finances
features/finances/types/finances.types.ts|Types finances — feature finances
features/goboard/components/CardClassement.tsx|Composant card classement — feature GoBoard
features/goboard/components/CardDefis.tsx|Composant card defis — feature GoBoard
features/goboard/components/CardHistoriquePoints.tsx|Composant card historique points — feature GoBoard
features/goboard/components/CardMissions.tsx|Composant card missions — feature GoBoard
features/goboard/components/DialGoScore.tsx|Composant dial go score — feature GoBoard
features/goboard/components/GoBoardPage.tsx|Composant go board — feature GoBoard
features/goboard/components/ScatterProgression.tsx|Composant scatter progression — feature GoBoard
features/goboard/components/ui/Card.tsx|Composant ui/ card — feature GoBoard
features/goboard/components/ui/CardHeader.tsx|Composant ui/ card header — feature GoBoard
features/goboard/components/ui/TrendMsg.tsx|Composant ui/ trend msg — feature GoBoard
features/goboard/components/ui/ZoomControls.tsx|Composant ui/ zoom controls — feature GoBoard
features/goboard/hooks/useGoBoard.ts|Hook useGoBoard — feature GoBoard
features/goboard/index.ts|Barrel export — feature GoBoard
features/goboard/types/goboard.types.ts|Types goboard — feature GoBoard
features/historique/components/DriverHistoriquePage.tsx|Composant driver historique — feature historique
features/historique/components/PassengerHistoriquePage.tsx|Composant passenger historique — feature historique
features/historique/hooks/useDriverHistoriqueList.ts|Hook useDriverHistoriqueList — feature historique
features/historique/hooks/usePassengerHistoriqueList.ts|Hook usePassengerHistoriqueList — feature historique
features/historique/index.ts|Barrel export — feature historique
features/homepage/component/header.tsx|Fichier — header
features/homepage/component/hero.tsx|Fichier — hero
features/homepage/component/howitwork_section.tsx|Fichier — howitwork section
features/homepage/component/index.ts|Fichier — index
features/homepage/component/stats_section.tsx|Fichier — stats section
features/homepage/component/whyus_section.tsx|Fichier — whyus section
features/homepage/hooks/hooks-index.ts|Fichier — hooks index
features/homepage/hooks/index.ts|Fichier — index
features/homepage/hooks/useActiveNav.ts|Hook useActiveNav — feature page d'accueil
features/homepage/hooks/useAdvantages.ts|Hook useAdvantages — feature page d'accueil
features/homepage/hooks/useHomepageStats.ts|Hook useHomepageStats — feature page d'accueil
features/homepage/hooks/useHowItWorksSteps.ts|Hook useHowItWorksSteps — feature page d'accueil
features/homepage/hooks/useNavLinks.ts|Hook useNavLinks — feature page d'accueil
features/homepage/index.ts|Barrel export — feature page d'accueil
features/map-service/constants/index.ts|Fichier — index
features/map-service/index.ts|Barrel export — feature map-service
features/map-service/layers/campus.ts|Fichier — campus
features/map-service/layers/index.ts|Fichier — index
features/map-service/layers/offscreen.ts|Fichier — offscreen
features/map-service/layers/overpass.ts|Fichier — overpass
features/map-service/markers/index.ts|Fichier — index
features/map-service/popups/index.ts|Fichier — index
features/map-service/types/index.ts|Fichier — index
features/notifications/.gitkeep|Fichier — gitkeep
features/notifications/components/NotificationsPage.tsx|Composant notifications — feature notifications
features/notifications/hooks/useNotificationsList.ts|Hook useNotificationsList — feature notifications
features/notifications/index.ts|Barrel export — feature notifications
features/nouveautes/components/NouveautesPage.tsx|Composant nouveautes — feature nouveautés
features/nouveautes/hooks/useNouveautesList.ts|Hook useNouveautesList — feature nouveautés
features/nouveautes/index.ts|Barrel export — feature nouveautés
features/planner/components/shared/CalendarCarousel.tsx|Composant shared/ calendar carousel — feature planificateur
features/planner/components/shared/CalendarNav.tsx|Composant shared/ calendar nav — feature planificateur
features/planner/components/shared/CalendarToast.tsx|Composant shared/ calendar toast — feature planificateur
features/planner/components/shared/DayCell.tsx|Composant shared/ day cell — feature planificateur
features/planner/components/shared/MonthGrid.tsx|Composant shared/ month grid — feature planificateur
features/planner/components/shared/RideCell.tsx|Composant shared/ ride cell — feature planificateur
features/planner/components/shared/TimeCell.tsx|Composant shared/ time cell — feature planificateur
features/planner/components/shared/TimeSlotRow.tsx|Composant shared/ time slot row — feature planificateur
features/planner/components/shared/WeekColumn.tsx|Composant shared/ week column — feature planificateur
features/planner/components/shared/WeekGrid.tsx|Composant shared/ week grid — feature planificateur
features/planner/components/shared/calendar.tsx|Composant shared/calendar — feature planificateur
features/planner/components/shared/hero.tsx|Composant shared/hero — feature planificateur
features/planner/components/shared/rides.area.tsx|Composant shared/rides area — feature planificateur
features/planner/components/shared/rides/RidesAreaHeader.tsx|Composant shared/rides/ rides area header — feature planificateur
features/planner/components/shared/rides/RidesEmptyState.tsx|Composant shared/rides/ rides empty state — feature planificateur
features/planner/components/shared/rides/RidesList.tsx|Composant shared/rides/ rides list — feature planificateur
features/planner/components/shared/rides/RidesStatusLegend.tsx|Composant shared/rides/ rides status legend — feature planificateur
features/planner/components/shared/rides/RidesToolbar.tsx|Composant shared/rides/ rides toolbar — feature planificateur
features/planner/constants/calendar.constants.ts|Fichier — calendar constants
features/planner/constants/rides.area.constants.ts|Fichier — rides area constants
features/planner/context/IndisponibilityContext.tsx|Context indisponibility context — feature planificateur
features/planner/context/PlannerContext.tsx|Context planner context — feature planificateur
features/planner/context/PlannerFeatureProvider.tsx|Context planner feature provider — feature planificateur
features/planner/context/SearchBarContext.tsx|Context search bar context — feature planificateur
features/planner/hooks/useCalendarWindow.ts|Hook useCalendarWindow — feature planificateur
features/planner/hooks/useIndisponibilityActions.ts|Hook useIndisponibilityActions — feature planificateur
features/planner/hooks/useRideArea.ts|Hook useRideArea — feature planificateur
features/planner/services/calendar.mock.ts|Fichier — calendar mock
features/planner/types/calendar.types.ts|Types calendar — feature planificateur
features/planner/types/rides.area.types.ts|Types rides area — feature planificateur
features/planner/utils/calendar.utils.ts|Fichier — calendar utils
features/planner/utils/ride.normalizer.ts|Fichier — ride normalizer
features/profile/.gitkeep|Fichier — gitkeep
features/reservations/components/DriverReservationsPage.tsx|Composant driver reservations — feature réservations
features/reservations/components/PassengerReservationsPage.tsx|Composant passenger reservations — feature réservations
features/reservations/converters/reservation.converter.ts|Converter reservation converter — feature réservations
features/reservations/hooks/useDriverReservationRequestsList.ts|Hook useDriverReservationRequestsList — feature réservations
features/reservations/hooks/usePassengerReservationsList.ts|Hook usePassengerReservationsList — feature réservations
features/reservations/index.ts|Barrel export — feature réservations
features/reviews/components/ReviewsPage.tsx|Composant reviews — feature avis
features/reviews/hooks/useReviewsList.ts|Hook useReviewsList — feature avis
features/reviews/index.ts|Barrel export — feature avis
features/search/components/shared/ActiveFiltersBar.tsx|Composant shared/ active filters bar — feature recherche
features/search/components/shared/FilterSection.tsx|Composant shared/ filter section — feature recherche
features/search/components/shared/ListingZone.tsx|Composant shared/ listing zone — feature recherche
features/search/components/shared/MapCircuitCard.tsx|Composant shared/ map circuit card — feature recherche
features/search/components/shared/MapView.tsx|Composant shared/ map view — feature recherche
features/search/components/shared/PassengerTripCard.tsx|Composant shared/ passenger trip card — feature recherche
features/search/components/shared/RecommendedTripCard.tsx|Composant shared/ recommended trip card — feature recherche
features/search/components/shared/RouteMapSearch.tsx|Composant shared/ route map search — feature recherche
features/search/components/shared/SortSection.tsx|Composant shared/ sort section — feature recherche
features/search/components/shared/index.ts|Composant shared/index — feature recherche
features/search/converters/search.converter.ts|Converter search converter — feature recherche
features/search/hooks/useDriverSearch.ts|Hook useDriverSearch — feature recherche
features/search/hooks/useMatchingScore.ts|Hook useMatchingScore — feature recherche
features/search/hooks/usePassengerSearch.ts|Hook usePassengerSearch — feature recherche
features/search/hooks/useRouteMap.ts|Hook useRouteMap — feature recherche
features/search/services/osrm.service.ts|Fichier — osrm service
features/search/types/search.feature.types.ts|Types search feature — feature recherche
features/search/utils/matchingV4.ts|Fichier — matching v4
features/statistiques/components/BadgesGrid.tsx|Composant badges grid — feature statistiques
features/statistiques/components/CO2BarChart.tsx|Composant c o2 bar chart — feature statistiques
features/statistiques/components/CO2DistanceScatter.tsx|Composant c o2 distance scatter — feature statistiques
features/statistiques/components/ImpactEcoSection.tsx|Composant impact eco section — feature statistiques
features/statistiques/components/KpiCard.tsx|Composant kpi card — feature statistiques
features/statistiques/components/NotesTimeline.tsx|Composant notes timeline — feature statistiques
features/statistiques/components/StatistiquesPage.tsx|Composant statistiques — feature statistiques
features/statistiques/components/TripsList.tsx|Composant trips list — feature statistiques
features/statistiques/components/ui/Card.tsx|Composant ui/ card — feature statistiques
features/statistiques/components/ui/CardHeader.tsx|Composant ui/ card header — feature statistiques
features/statistiques/components/ui/PeriodSelector.tsx|Composant ui/ period selector — feature statistiques
features/statistiques/components/ui/TrendMsg.tsx|Composant ui/ trend msg — feature statistiques
features/statistiques/components/ui/ZoomControls.tsx|Composant ui/ zoom controls — feature statistiques
features/statistiques/hooks/useStatistiques.ts|Hook useStatistiques — feature statistiques
features/statistiques/index.ts|Barrel export — feature statistiques
features/statistiques/types/statistiques.types.ts|Types statistiques — feature statistiques
features/trajet-en-cours/components/LitigeOverlay.tsx|Composant litige overlay — feature trajet-en-cours
features/trajet-en-cours/components/ProgressionMessagerie.tsx|Composant progression messagerie — feature trajet-en-cours
features/trajet-en-cours/components/SignalementOverlay.tsx|Composant signalement overlay — feature trajet-en-cours
features/trajet-en-cours/components/TrajetEnCoursPage.tsx|Composant trajet en cours — feature trajet-en-cours
features/trajet-en-cours/components/TrajetMap.tsx|Composant trajet map — feature trajet-en-cours
features/trajet-en-cours/converters/trajet-en-cours.converter.ts|Converter trajet en cours converter — feature trajet-en-cours
features/trajet-en-cours/fixtures/index.fixtures.ts|Fichier — index fixtures
features/trajet-en-cours/fixtures/map.fixtures.ts|Fichier — map fixtures
features/trajet-en-cours/hooks/index.hooks.ts|Fichier — index hooks
features/trajet-en-cours/hooks/useTrajetMap.ts|Hook useTrajetMap — feature trajet-en-cours
features/trajet-en-cours/types/map.types.ts|Types map — feature trajet-en-cours
features/trajet-en-cours/types/messagerie.types.ts|Types messagerie — feature trajet-en-cours
features/trajet-en-cours/types/progression-signalement.types.ts|Types progression signalement — feature trajet-en-cours
features/trajet-en-cours/types/trajet-en-cours.types.ts|Types trajet en cours — feature trajet-en-cours
features/trajets/components/create-trip/CreateTripForm.tsx|Composant create trip/ create trip form — feature trajets
features/trajets/components/create-trip/index.ts|Composant create trip/index — feature trajets
features/trajets/components/create-trip/sections/BasicInfoSection.tsx|Composant create trip/sections/ basic info section — feature trajets
features/trajets/components/create-trip/sections/MapPreviewSection.tsx|Composant create trip/sections/ map preview section — feature trajets
features/trajets/components/create-trip/sections/PricingLeftSection.tsx|Composant create trip/sections/ pricing left section — feature trajets
features/trajets/components/create-trip/sections/PricingRightSection.tsx|Composant create trip/sections/ pricing right section — feature trajets
features/trajets/components/create-trip/sections/VehicleSection.tsx|Composant create trip/sections/ vehicle section — feature trajets
features/trajets/components/create-trip/sections/index.ts|Composant create trip/sections/index — feature trajets
features/trajets/components/create-trip/ui/StepperInput.tsx|Composant create trip/ui/ stepper input — feature trajets
features/trajets/components/create-trip/ui/TogglePreferenceRow.tsx|Composant create trip/ui/ toggle preference row — feature trajets
features/trajets/components/create-trip/ui/index.ts|Composant create trip/ui/index — feature trajets
features/trajets/components/published-trip/PublishedTripView.tsx|Composant published trip/ published trip view — feature trajets
features/trajets/components/published-trip/index.ts|Composant published trip/index — feature trajets
features/trajets/components/published-trip/sections/TripMapArea.tsx|Composant published trip/sections/ trip map area — feature trajets
features/trajets/components/published-trip/sections/TripPointSection.tsx|Composant published trip/sections/ trip point section — feature trajets
features/trajets/components/published-trip/sections/TripPreferencesSection.tsx|Composant published trip/sections/ trip preferences section — feature trajets
features/trajets/components/published-trip/sections/TripStatusSection.tsx|Composant published trip/sections/ trip status section — feature trajets
features/trajets/components/published-trip/sections/TripSummaryCard.tsx|Composant published trip/sections/ trip summary card — feature trajets
features/trajets/components/published-trip/sections/index.ts|Composant published trip/sections/index — feature trajets
features/trajets/components/published-trip/ui/MapOverlay.tsx|Composant published trip/ui/ map overlay — feature trajets
features/trajets/components/published-trip/ui/ReservationConfirmModal.tsx|Composant published trip/ui/ reservation confirm modal — feature trajets
features/trajets/components/published-trip/ui/ReserveButton.tsx|Composant published trip/ui/ reserve button — feature trajets
features/trajets/components/published-trip/ui/index.ts|Composant published trip/ui/index — feature trajets
features/trajets/components/shared/LeafletStaticMap.tsx|Composant shared/ leaflet static map — feature trajets
features/trajets/components/shared/StaticPolylineMap.tsx|Composant shared/ static polyline map — feature trajets
features/trajets/constants/trip.constants.ts|Fichier — trip constants
features/trajets/converters/trip.converter.ts|Converter trip converter — feature trajets
features/trajets/fixtures/published-trip.fixtures.ts|Fichier — published trip fixtures
features/trajets/hooks/index.ts|Fichier — index
features/trajets/hooks/useCreateTrip.ts|Hook useCreateTrip — feature trajets
features/trajets/hooks/usePublishedTripView.ts|Hook usePublishedTripView — feature trajets
features/trajets/index.ts|Barrel export — feature trajets
features/trajets/types/index.ts|Fichier — index
features/trajets/types/published-trip.view.types.ts|Types published trip view — feature trajets
features/trajets/types/trip.create.types.ts|Types trip create — feature trajets
index.ts|Fichier — index
infrastructure/adapters/.gitkeep|Fichier — gitkeep
infrastructure/api/.gitkeep|Fichier — gitkeep
infrastructure/mappers/.gitkeep|Fichier — gitkeep
infrastructure/repositories/.gitkeep|Fichier — gitkeep
lib/db.ts|Fichier — db
next-env.d.ts|Fichier — next env d
next.config.ts|Fichier — next config
package-lock.json|Fichier — package lock
package.json|Fichier — package
postcss.config.mjs|Fichier — postcss config
scripts/.gitkeep|Fichier — gitkeep
scripts/clean-test-db.js|Script — clean test db
scripts/generate-architecture.js|Script — generate architecture
scripts/generate-models.js|Script — generate models
scripts/reaorganise-architecture.js|Script — reaorganise architecture
scripts/seed-dashboard.js|Script — seed dashboard
scripts/seed-test-db.js|Script — seed test db
scripts/update-architecture.js|Script — update architecture
server/actions/.gitkeep|Fichier — gitkeep
server/auth/.gitkeep|Fichier — gitkeep
server/errors/.gitkeep|Fichier — gitkeep
server/middleware/.gitkeep|Fichier — gitkeep
server/middleware/redirection/connected.ts|Fichier — connected
server/middleware/redirection/off-connexion.ts|Fichier — off connexion
server/services/PaymentService.ts|Fichier — payment service
shared/assets/.gitkeep|Fichier — gitkeep
shared/components/.gitkeep|Fichier — gitkeep
shared/components/CancelConfirmToast.tsx|Composant partagé — cancel confirm toast
shared/components/FeatureHeader.tsx|Composant partagé — feature header
shared/components/GlobalLoader.tsx|Composant partagé — global loader
shared/components/LoaderManager.tsx|Composant partagé — loader manager
shared/components/NavigationLoader.tsx|Composant partagé — navigation loader
shared/components/PassengerAvatars.tsx|Composant partagé — passenger avatars
shared/components/ReservationDecisionToast.tsx|Composant partagé — reservation decision toast
shared/components/ReservationRequestToast.tsx|Composant partagé — reservation request toast
shared/components/footer.tsx|Composant partagé — footer
shared/components/header.tsx|Composant partagé — header
shared/components/list-detail-page/ListDetailPage.tsx|Composant partagé — list detail page/ list detail page
shared/components/list-detail-page/components/ActiveChipsBar.tsx|Composant partagé — list detail page/components/ active chips bar
shared/components/list-detail-page/components/EmptyState.tsx|Composant partagé — list detail page/components/ empty state
shared/components/list-detail-page/components/FilterDropdown.tsx|Composant partagé — list detail page/components/ filter dropdown
shared/components/list-detail-page/components/MobileDetailSheet.tsx|Composant partagé — list detail page/components/ mobile detail sheet
shared/components/list-detail-page/components/Skeletons.tsx|Composant partagé — list detail page/components/ skeletons
shared/components/list-detail-page/components/SortDropdown.tsx|Composant partagé — list detail page/components/ sort dropdown
shared/components/list-detail-page/hooks/useListDetail.ts|Composant partagé — list detail page/hooks/use list detail
shared/components/list-detail-page/index.ts|Composant partagé — list detail page/index
shared/components/list-detail-page/types/index.ts|Composant partagé — list detail page/types/index
shared/components/trip-header-card/TripHeaderCard.tsx|Composant partagé — trip header card/ trip header card
shared/fixtures/favoris.fixtures.ts|Fichier — favoris fixtures
shared/hooks/.gitkeep|Fichier — gitkeep
shared/hooks/useScrollReveal.ts|Hook partagé — useScrollReveal
shared/hooks/usebreakpoint.ts|Hook partagé — usebreakpoint
shared/hooks/useheader.tsx|Hook partagé — useheader
shared/hooks/useheader.tsx.tmp.24528.1774359567541|Fichier — useheader tsx tmp 24528
shared/hooks/useismobileortable.ts|Hook partagé — useismobileortable
shared/hooks/usemobileDetection.ts|Hook partagé — usemobileDetection
shared/providers/.gitkeep|Fichier — gitkeep
shared/types/header.types.ts|Types partagés — header
shared/types/lieu-favori.types.ts|Types partagés — lieu favori
shared/ui/.gitkeep|Fichier — gitkeep
shared/ui/buttons/reserversion.map.button.tsx|Fichier — reserversion map button
shared/ui/buttons/togglelang.tsx|Fichier — togglelang
shared/ui/goscoredial.tsx|Fichier — goscoredial
shared/ui/logo/main_logo.tsx|Fichier — main logo
shared/ui/toggles/simple_toggle.tsx|Fichier — simple toggle
shared/ui/warm-sentence.tsx|Fichier — warm sentence
shared/utils/.gitkeep|Fichier — gitkeep
shared/utils/lieu-favori-icon.tsx|Fichier — lieu favori icon
shared/utils/status.utils.ts|Fichier — status utils
styles/.gitkeep|Fichier — gitkeep
tests/.gitkeep|Fichier — gitkeep
tests/JsonStorageManager.ts|Test — json storage manager
tests/PersistenceManager.ts|Test — persistence manager
tests/db/StaticDb.ts|Test — db/ static db
tests/db/affinites.json|Base de données test — affinites
tests/db/astuces.json|Base de données test — astuces
tests/db/badges.json|Base de données test — badges
tests/db/bank_accounts.json|Base de données test — bank_accounts
tests/db/drafts.json|Base de données test — drafts
tests/db/driver_finance_accounts.json|Base de données test — driver_finance_accounts
tests/db/eco_challenges.json|Base de données test — eco_challenges
tests/db/goboard_classement.json|Base de données test — goboard_classement
tests/db/goevents.json|Base de données test — goevents
tests/db/gotask-to-goevent.ts|Test — db/gotask to goevent
tests/db/gotasks.json|Base de données test — gotasks
tests/db/indisponibilities.json|Base de données test — indisponibilities
tests/db/lieux_favoris.json|Base de données test — lieux_favoris
tests/db/messages.json|Base de données test — messages
tests/db/notifications.json|Base de données test — notifications
tests/db/nouveautes.json|Base de données test — nouveautes
tests/db/passenger_finance_accounts.json|Base de données test — passenger_finance_accounts
tests/db/penalites.json|Base de données test — penalites
tests/db/reservations.json|Base de données test — reservations
tests/db/reviews.json|Base de données test — reviews
tests/db/trips.json|Base de données test — trips
tests/db/user_preferences.json|Base de données test — user_preferences
tests/db/user_stats.json|Base de données test — user_stats
tests/db/users.json|Base de données test — users
tests/db/vehicles.json|Base de données test — vehicles
tests/fixtures/brouillons/drafts.fixtures.ts|Fixtures — drafts (brouillons)
tests/fixtures/dashboard/favorites.fixtures.ts|Fixtures — favorites (dashboard)
tests/fixtures/dashboard/finance.fixtures.ts|Fixtures — finance (dashboard)
tests/fixtures/dashboard/goboard.fixtures.ts|Fixtures — goboard (dashboard)
tests/fixtures/dashboard/index.ts|Test — fixtures/dashboard/index
tests/fixtures/dashboard/lacite_astuces.fixtures.ts|Fixtures — lacite astuces (dashboard)
tests/fixtures/dashboard/notifications.fixtures.ts|Fixtures — notifications (dashboard)
tests/fixtures/dashboard/nouveautes.fixtures.ts|Fixtures — nouveautes (dashboard)
tests/fixtures/dashboard/publishedtrips.fixtures.ts|Fixtures — publishedtrips (dashboard)
tests/fixtures/dashboard/recentDestination.fixtures.ts|Fixtures — recent destination (dashboard)
tests/fixtures/dashboard/reservationrequest.fixtures.ts|Fixtures — reservationrequest (dashboard)
tests/fixtures/dashboard/reservations.fixtures.ts|Fixtures — reservations (dashboard)
tests/fixtures/dashboard/reviews.fixtures.ts|Fixtures — reviews (dashboard)
tests/fixtures/dashboard/stats.fixtures.ts|Fixtures — stats (dashboard)
tests/fixtures/dashboard/surveyDestination.fixtures.ts|Fixtures — survey destination (dashboard)
tests/fixtures/dashboard/trips.fixtures.ts|Fixtures — trips (dashboard)
tests/fixtures/dashboard/tripways.fixtures.ts|Fixtures — tripways (dashboard)
tests/fixtures/dashboard/usualDestination.fixtures.ts|Fixtures — usual destination (dashboard)
tests/fixtures/favoris/favoris.fixtures.ts|Fixtures — favoris (favoris)
tests/fixtures/finances/finances.fixtures.ts|Fixtures — finances (finances)
tests/fixtures/goboard/goboard.fixtures.ts|Fixtures — goboard (goboard)
tests/fixtures/search/search_trips.fixtures.ts|Fixtures — search trips (search)
tests/fixtures/statistiques/statistiques.fixtures.ts|Fixtures — statistiques (statistiques)
tests/fixtures/testdata.ts|Test — fixtures/testdata
tsconfig.json|Fichier — tsconfig
types/.gitkeep|Fichier — gitkeep