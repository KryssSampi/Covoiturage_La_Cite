/**
 * update-architecture.js
 *
 * Génère automatiquement le fichier .docs/.architecture-update/architecture.md
 * en listant tous les fichiers du projet et en ajoutant un commentaire descriptif
 * sur chaque fichier via un système de reconnaissance de patterns.
 *
 * Lancement : npm run update-architecture
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Équivalent de __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

/** Dossiers et fichiers à exclure du listing */
const EXCLUDED = new Set([
  "node_modules", ".next", ".git", "dist", "build", "out",
  ".turbo", ".cache", "coverage", ".yarn",
  "architecture_v2.md",     // fichier temporaire éventuel
  "package-lock.json",      // trop volumineux, peu utile dans l'archi
  "tsconfig.tsbuildinfo",   // artefact de compilation TS
  "favicon.ico",            // ressource binaire non documentée
]);

/** Extensions de fichiers à ignorer complètement */
const EXCLUDED_EXTENSIONS = new Set([
  ".ico", ".woff", ".woff2", ".ttf", ".eot",
]);

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, ".docs", ".architecture-update", "architecture.md");

// ─────────────────────────────────────────────────────────────────────────────
// Table de correspondance exacte chemin → commentaire
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ajoute ici les commentaires pour les fichiers spécifiques connus.
 * Clé = chemin relatif depuis la racine du projet (séparateurs POSIX).
 */
const EXACT_COMMENTS = {
  // ── .claude/ ───────────────────────────────────────────────────────────────
  ".claude/settings.local.json": "Configuration locale Claude Code — permissions shell autorisées (Bash, Node)",

  // ── Racine ────────────────────────────────────────────────────────────────
  "convert-script.js":      "Script de migration des imports (anciens paths → nouveaux alias)",
  "eslint.config.mjs":      "Configuration ESLint (règles JS/TS, plugins, ignores)",
  "next-env.d.ts":          "Déclarations de types Next.js générées automatiquement",
  "next.config.ts":         "Configuration Next.js (redirections, images, webpack, env)",
  "package.json":           "Dépendances npm + scripts (dev, build, lint, test)",
  "postcss.config.mjs":     "Configuration PostCSS (plugin Tailwind CSS v4)",
  "README.md":              "Documentation d'introduction du projet",
  "tsconfig.json":          "Configuration TypeScript (paths d'alias, options strict)",
  ".env":                   "Variables d'environnement (clés API, URL DB) — NE PAS COMMITER",
  ".gitignore":             "Fichiers exclus de Git (node_modules, .next, .env, etc.)",

  // ── app/ ──────────────────────────────────────────────────────────────────
  "app/error.tsx":          "Page d'erreur globale React (Error Boundary racine)",
  "app/globals.css":        "Styles globaux Tailwind + variables CSS personnalisées",
  "app/layout.tsx":         "Layout racine — providers globaux (AppState, Loader, Header)",
  "app/loading.tsx":        "Skeleton de chargement global Next.js",
  "app/page.tsx":           "Page d'accueil publique (homepage feature)",

  "app/(auth)/login/layout.tsx": "Layout page login (wrapper minimaliste centré)",
  "app/(auth)/login/page.tsx":   "Page de connexion — rendu de LoginArea (feature auth)",

  "app/(protected)/layout.tsx":                                "Layout protégé — vérifie session + injecte rôle utilisateur",
  "app/(protected)/admin/[id]/page.tsx":                       "Dashboard administrateur *(à implémenter)*",
  "app/(protected)/driver/planifier/[id]/page.tsx":            "Page planificateur conducteur — agenda + IndisponibilityProvider",
  "app/(protected)/passenger/planifier/[id]/page.tsx":         "Page planificateur passager — agenda + IndisponibilityProvider",
  "app/(protected)/trajets/page.tsx":                          "Page listing des trajets disponibles (rôle passager)",

  "app/api/unsplash/route.ts": "Route proxy Unsplash — récupère photos de villes sans exposer la clé API",

  // ── core/ ─────────────────────────────────────────────────────────────────
  "core/config/UserStatAdminConfig.ts":   "Configuration admin — seuils de tendance KPI (CO₂, GoScore, notes, trajets), labels GoScore, facteurs de conversion éco, seuils badges",
  "core/context/db.context.tsx":          "Context React DB — charge et cache toutes les entités (trips, users, reservations, etc.), expose données filtrées par utilisateur courant",
  "core/context/trip.context.tsx":        "Context React trajets — actions CRUD (créer, démarrer, compléter, annuler trajet) + réservation (demander, accepter, refuser, embarquement)",
  "core/context/loader.context.tsx":      "Context React du loader global — contrôle l'affichage du spinner",
  "core/lib/unsplash.ts":                 "Client Unsplash — fetch photos de destinations avec cache",
  "core/services/getlocation.current.ts": "Service géolocalisation — récupère position GPS courante",
  "core/services/location.suggestion.ts": "Service autocomplétion — suggestions d'adresses (API externe)",
  "core/state/app_state.ts":              "Store Zustand global — langue active, état utilisateur, rôle",
  "core/utils/date.utils.ts":             "Utilitaires de dates (formatage, comparaison, date-fns wrappers)",

  // ── docs/ ─────────────────────────────────────────────────────────────────
  "docs/IMPORT_MIGRATION_GUIDE.md": "Guide de migration des anciens imports vers les nouveaux alias TypeScript",
  "docs/.backup-info-2026-02-15T18-12-17-750Z.json": "Métadonnées de sauvegarde créées lors de la réorganisation de l'architecture (15 fév 2026)",

  // ── domain/models/ ────────────────────────────────────────────────────────
  "domain/models/AlertesUrgenceModel.ts":            "Table alertes_urgence — alertes SOS en temps réel",
  "domain/models/BadgeModel.ts":                     "Table badges — distinctions attribuables aux utilisateurs",
  "domain/models/CategoriesSignalementModel.ts":     "Table categories_signalement — types de signalements possibles",
  "domain/models/ComptesVirtuelModel.ts":            "Table comptes_virtuel — soldes et transactions du portefeuille in-app",
  "domain/models/ConfigSystemeModel.ts":             "Table config_systeme — paramètres globaux de l'application",
  "domain/models/ConsentementsPipedaModel.ts":       "Table consentements_pipeda — consentements LPRPDE/PIPEDA par utilisateur",
  "domain/models/ContactsUrgenceModel.ts":           "Table contacts_urgence — contacts d'urgence liés à un utilisateur",
  "domain/models/DefisEcologiqueModel.ts":           "Table defis_ecologique — défis verts disponibles",
  "domain/models/DemandesMultiplesTrackingModel.ts": "Table demandes_multiples_tracking — suivi demandes passager multi-conducteurs",
  "domain/models/DocumentsConducteurModel.ts":       "Table documents_conducteur — pièces justificatives (permis, assurance)",
  "domain/models/EvaluationModel.ts":                "Table evaluations — notes et commentaires post-trajet",
  "domain/models/ExportsDonneeModel.ts":             "Table exports_donnee — historique des exports RGPD/LPRPDE",
  "domain/models/FavoriModel.ts":                    "Table favoris — adresses favorites d'un utilisateur",
  "domain/models/FavorisConducteurModel.ts":         "Table favoris_conducteur — conducteurs mis en favoris par un passager",
  "domain/models/GeofenceEventModel.ts":             "Table geofence_events — événements d'entrée/sortie de zones géographiques",
  "domain/models/GeofencesMobileModel.ts":           "Table geofences_mobile — zones géographiques définies (campus, etc.)",
  "domain/models/HistoriqueTrajetModel.ts":          "Table historique_trajet — archive complète de tous les trajets terminés",
  "domain/models/index.ts":                          "Barrel export — exporte tous les modèles domain depuis un point unique",
  "domain/models/LieuxFavoriModel.ts":               "Table lieux_favori — lieux sauvegardés avec label (maison, travail, etc.)",
  "domain/models/LitigeModel.ts":                    "Table litiges — disputes entre conducteur et passager",
  "domain/models/LogsSecuriteModel.ts":              "Table logs_securite — journaux d'événements de sécurité (connexions, tokens)",
  "domain/models/MobileDeviceInfoModel.ts":          "Table mobile_device_info — infos appareil mobile (OS, token push)",
  "domain/models/MobileSessionModel.ts":             "Table mobile_sessions — sessions actives sur appareils mobiles",
  "domain/models/PartagesPositionUrgenceModel.ts":   "Table partages_position_urgence — partage GPS d'urgence en temps réel",
  "domain/models/ParticipationsDefiModel.ts":        "Table participations_defi — participation d'un utilisateur à un défi écologique",
  "domain/models/PenaliteModel.ts":                  "Table penalites — pénalités financières (annulations tardives, no-show)",
  "domain/models/PointsReputationModel.ts":          "Table points_reputation — historique des points GoScore",
  "domain/models/PositionsGpModel.ts":               "Table positions_gp — positions GPS temps réel des véhicules en trajet",
  "domain/models/PreferencesUtilisateurModel.ts":    "Table preferences_utilisateur — préférences (musique, animaux, bagages, etc.)",
  "domain/models/ProfilsConducteurModel.ts":         "Table profils_conducteur — véhicule, disponibilités, zones desservies",
  "domain/models/RaisonsAnnulationModel.ts":         "Table raisons_annulation — catalogue des motifs d'annulation",
  "domain/models/RemboursementsPenaliteModel.ts":    "Table remboursements_penalite — contestations et remboursements de pénalités",
  "domain/models/RemboursementsTransactionModel.ts": "Table remboursements_transaction — remboursements de transactions",
  "domain/models/ReservationModel.ts":               "Table reservations — réservations passager sur un trajet conducteur",
  "domain/models/SessionsUtilisateurModel.ts":       "Table sessions_utilisateur — sessions JWT actives",
  "domain/models/SignalementModel.ts":               "Table signalements — signalements de comportements inappropriés",
  "domain/models/SpatialRefSyModel.ts":              "Table spatial_ref_sys — référentiel PostGIS pour données géospatiales",
  "domain/models/StatistiquesGlobaleModel.ts":       "Table statistiques_globale — KPIs agrégés de la plateforme",
  "domain/models/StatistiquesUtilisateurModel.ts":   "Table statistiques_utilisateur — stats CO2, km, économies par utilisateur",
  "domain/models/SuppressionsCompteModel.ts":        "Table suppressions_compte — demandes de suppression RGPD/LPRPDE",
  "domain/models/TrajetModel.ts":                    "Table trajets — trajets publiés par les conducteurs (origine→destination)",
  "domain/models/TrajetsRecurrentModel.ts":          "Table trajets_recurrent — modèles de trajets récurrents hebdomadaires",
  "domain/models/TransactionModel.ts":               "Table transactions — transactions financières in-app (paiements, remboursements)",
  "domain/models/UserModel.ts":                      "Table users — profil complet utilisateur (email, rôle, statut, etc.)",
  "domain/models/UsersBadgeModel.ts":                "Table users_badge — badges obtenus par un utilisateur",
  "domain/models/VehiculeModel.ts":                  "Table vehicules — véhicules enregistrés par les conducteurs",
  "domain/models/WaypointsTrajetModel.ts":           "Table waypoints_trajet — points d'arrêt intermédiaires d'un trajet",
  "domain/models/ZonesCampuModel.ts":                "Table zones_campu — zones campus (ex: pavillons La Cité)",

  // ── features/auth/ ────────────────────────────────────────────────────────
  "features/admin/types/adminTrips.ts":  "Types admin — SimulationEvent, AdminTrip, AdminReservation et SimulateResult pour la simulation d'événements trajet",
  "features/auth/components/loginArea.tsx":  "Formulaire de connexion complet (email/password + validation)",
  "features/auth/hooks/useAuth.tsx":         "Hook session — vérifie token, retourne user + rôle courant",
  "features/auth/hooks/useloginForm.tsx":    "Hook formulaire login — gestion champs, validation, submit",

  // ── features/dashboard/components/driver/ ─────────────────────────────────
  "features/dashboard/components/driver/finance.section.tsx":              "Section finances — revenus, solde, transactions récentes",
  "features/dashboard/components/driver/publised_trips.section.tsx":       "Section trajets publiés — liste des trajets actifs du conducteur",
  "features/dashboard/components/driver/quickplan.section.tsx":            "Section accès rapide — raccourci planification d'un nouveau trajet",
  "features/dashboard/components/driver/reservation_requests.section.tsx": "Section demandes — liste des demandes passagers à approuver/refuser",

  // ── features/dashboard/components/passenger/ ──────────────────────────────
  "features/dashboard/components/passenger/destination.card.tsx":          "Carte destination — affiche une destination avec photo Unsplash",
  "features/dashboard/components/passenger/recents-destinations.section.tsx": "Section destinations récentes du passager",
  "features/dashboard/components/passenger/recommended-rides.section.tsx": "Section trajets recommandés (basé sur historique)",
  "features/dashboard/components/passenger/reservations.section.tsx":      "Section réservations actives du passager",
  "features/dashboard/components/passenger/usual-destinations.section.tsx":"Section lieux habituels (maison, travail, campus)",

  // ── features/dashboard/components/shared/ ─────────────────────────────────
  "features/dashboard/components/shared/favorites.section.tsx":     "Section favoris — conducteurs et lieux favoris",
  "features/dashboard/components/shared/goboard.section.tsx":       "Section GoBoard — tableau de missions/défis actifs",
  "features/dashboard/components/shared/hero.tsx":                  "Hero dashboard — salutation, photo profil, GoScore dial",
  "features/dashboard/components/shared/lacite_astuces.section.tsx":"Section astuces La Cité — conseils covoiturage illustrés",
  "features/dashboard/components/shared/notifications.section.tsx": "Section notifications — alertes et messages récents",
  "features/dashboard/components/shared/nouveautes.section.tsx":    "Section nouveautés — annonces et mises à jour de la plateforme",
  "features/dashboard/components/shared/reviews.section.tsx":       "Section évaluations — avis reçus et moyennes de notes",
  "features/dashboard/components/shared/stats.section.tsx":         "Section statistiques — CO2 économisé, km, économies, trajets",
  "features/dashboard/components/shared/supersearch.section.tsx":   "Section super recherche — recherche trajet avancée avec filtres",

  // ── features/dashboard/hooks/ ─────────────────────────────────────────────
  "features/dashboard/hooks/useFavorites.ts":           "Hook favoris — fetch et gestion des favoris utilisateur",
  "features/dashboard/hooks/useGoBoard.ts":             "Hook GoBoard — chargement des missions et calcul progression",
  "features/dashboard/hooks/useNotifications.ts":       "Hook notifications — liste, compteur non-lus, marquage comme lu",
  "features/dashboard/hooks/useNouveautesSlider.ts":    "Hook slider nouveautés — navigation carousel des annonces",
  "features/dashboard/hooks/usePublishedTrips.ts":      "Hook trajets publiés — liste et statuts des trajets conducteur",
  "features/dashboard/hooks/useRecentDestinations.ts":  "Hook destinations récentes — historique des points de départ/arrivée",
  "features/dashboard/hooks/useRecommendedRides.ts":    "Hook trajets recommandés — algorithme de suggestion basé sur habitudes",
  "features/dashboard/hooks/useReservationRequests.ts": "Hook demandes de réservation — approbation/refus côté conducteur",
  "features/dashboard/hooks/useReservations.ts":        "Hook réservations — réservations actives et historique passager",
  "features/dashboard/hooks/useSuperSearch.ts":         "Hook super recherche — filtres, tri, pagination des résultats",
  "features/dashboard/hooks/useUsualDestinations.ts":   "Hook lieux habituels — chargement et gestion (maison, travail, campus)",

  // ── features/dashboard/types/ ─────────────────────────────────────────────
  "features/dashboard/types/applicant.types.ts":          "Types données candidat/demandeur de réservation",
  "features/dashboard/types/destination.types.ts":        "Types destination (label, coordonnées, photo Unsplash)",
  "features/dashboard/types/driver.types.ts":             "Types données conducteur pour les sections dashboard",
  "features/dashboard/types/favorite.types.ts":           "Types favoris (conducteur favori, lieu favori)",
  "features/dashboard/types/financesummary.types.ts":     "Types résumé financier (revenu mois, solde, transactions)",
  "features/dashboard/types/goboard.types.ts":            "Types GoBoard (mission, défi, progression, récompense)",
  "features/dashboard/types/lacite_astuces.types.ts":     "Types astuce La Cité (titre, description, image)",
  "features/dashboard/types/notification.types.ts":       "Types notification (type, message, icône, date, lu)",
  "features/dashboard/types/passenger.types.ts":          "Types données passager pour les sections dashboard",
  "features/dashboard/types/publishedtrip.types.ts":      "Types trajet publié (origine, destination, horaires, places)",
  "features/dashboard/types/publishedtripstatus.types.ts":"Enum statuts trajet publié (actif, complet, annulé, terminé)",
  "features/dashboard/types/reservation.types.ts":        "Types réservation passager (trajet, statut, passager)",
  "features/dashboard/types/reservationrequest.types.ts": "Types demande de réservation (passager, trajet, message)",
  "features/dashboard/types/reservationStatus.types.ts":  "Enum statuts réservation (en attente, acceptée, refusée, annulée)",
  "features/dashboard/types/review.types.ts":             "Types évaluation (note, commentaire, auteur, date)",
  "features/dashboard/types/search.types.ts":             "Types recherche avancée (filtres, critères, résultats)",
  "features/dashboard/types/trip.types.ts":               "Types trajet UI simplifié (affiché dans les cartes dashboard)",
  "features/dashboard/types/trips.way.types.ts":          "Types sens/direction de trajet (aller, retour, aller-retour)",

  // ── features/dashboard/converters/ ────────────────────────────────────────
  "features/dashboard/converters/dashboard.converter.ts":            "Convertisseur dashboard — transforme TripModel/ReservationModel/NotificationModel en types UI dashboard (Trip, Reservation, PublishedTrip, Notification, Review)",

  // ── features/reservations/converters/ ─────────────────────────────────────
  "features/reservations/converters/reservation.converter.ts":       "Convertisseur réservations — transforme ReservationModel en vue passager (Reservation) et vue conducteur (ReservationRequest)",

  // ── features/search/converters/ ───────────────────────────────────────────
  "features/search/converters/search.converter.ts":                  "Convertisseur recherche — transforme TripSearchDTO et TripModel en TripWithCoords pour les résultats de recherche cartographiques",

  // ── features/trajet-en-cours/converters/ ──────────────────────────────────
  "features/trajet-en-cours/converters/trajet-en-cours.converter.ts":"Convertisseur trajet en cours — transforme TripModel + UserModel + VehicleModel en types UI (ConducteurInfo, PassagerInfo, TrajetEnCoursData)",

  // ── features/trajets/converters/ ──────────────────────────────────────────
  "features/trajets/converters/trip.converter.ts":                   "Convertisseur trajets — transforme TripModel en PublishedTripViewData (TripDriver, TripVehicle, TripPoint, TripPreferencesView, TripStatusInfo)",

  // ── features/homepage/ ────────────────────────────────────────────────────
  "features/homepage/component/header.tsx":           "Header navigation page d'accueil (logo, liens, langue, CTA)",
  "features/homepage/component/hero.tsx":             "Section hero — accroche principale + CTA inscription/connexion",
  "features/homepage/component/howitwork_section.tsx":"Section comment ça marche — étapes illustrées",
  "features/homepage/component/stats_section.tsx":    "Section statistiques — chiffres clés de la plateforme",
  "features/homepage/component/whyus_section.tsx":    "Section avantages — arguments clés (écologie, économie, sécurité...)",
  "features/homepage/hooks/useActiveNav.ts":          "Hook nav active — détecte section visible pour surlignage menu",
  "features/homepage/hooks/useAdvantages.ts":         "Hook avantages — données statiques des cartes avantages",
  "features/homepage/hooks/useHomepageStats.ts":      "Hook stats homepage — chiffres dynamiques ou statiques",
  "features/homepage/hooks/useHowItWorksSteps.ts":    "Hook étapes — données et icônes des étapes comment ça marche",
  "features/homepage/hooks/hooks-index.ts":           "Alias barrel hooks homepage — compatibilité avec les anciens imports",
  "features/homepage/hooks/useNavLinks.ts":           "Hook liens nav — génère les liens de navigation avec labels",

  // ── features/planner/ ────────────────────────────────────────────────────
  "features/planner/components/shared/calendar.tsx":          "Composant calendrier principal — orchestre SuperCalendar",
  "features/planner/components/shared/CalendarCarousel.tsx":  "Carousel de semaines — navigation gauche/droite entre semaines",
  "features/planner/components/shared/CalendarNav.tsx":       "Barre de navigation calendrier (semaine courante, boutons prev/next)",
  "features/planner/components/shared/DayCell.tsx":           "Cellule d'en-tête de jour — affiche le nom + date du jour",
  "features/planner/components/shared/hero.tsx":              "Hero planificateur — barre de recherche + panneau indisponibilités",
  "features/planner/components/shared/MonthGrid.tsx":         "Grille mensuelle — vue alternative au calendrier hebdomadaire",
  "features/planner/components/shared/RideCell.tsx":          "Cellule trajet — affiche un trajet réservé dans une case horaire",
  "features/planner/components/shared/rides.area.tsx":        "Zone listing rides — affiche les trajets planifiables selon le rôle",
  "features/planner/components/shared/TimeCell.tsx":          "Cellule horaire — case interactive avec menu contextuel + checkbox indispo",
  "features/planner/components/shared/TimeSlotRow.tsx":       "Ligne horaire — aligne les TimeCells pour un créneau (ex: 08h30)",
  "features/planner/components/shared/WeekColumn.tsx":        "Colonne de semaine — regroupe les créneaux d'un jour donné",
  "features/planner/components/shared/WeekGrid.tsx":          "Grille hebdomadaire — layout principal du calendrier 7 colonnes",
  "features/planner/constants/calendar.constants.ts":         "Constantes calendrier (heures min/max, intervalles, jours de la semaine)",
  "features/planner/context/IndisponibilityContext.tsx":      "Context indisponibilités — état global du setter + liste des créneaux bloqués",
  "features/planner/context/SearchBarContext.tsx":            "Context barre de recherche — état partagé origin/destination/date",
  "features/planner/hooks/useCalendarWindow.ts":              "Hook fenêtre calendrier — calcule la semaine visible (début, fin, jours)",
  "features/planner/hooks/useIndisponibilityActions.ts":      "Hook wrapper — expose useIndisponibility() comme point d'entrée recommandé",
  "features/planner/services/calendar.mock.ts":               "Service mock — données de trajets fictives pour développement UI",
  "features/planner/types/calendar.types.ts":                 "Types UI calendrier (Ride, TimeSlot, WeekDay, Indisponibility, etc.)",
  "features/planner/utils/calendar.utils.ts":                 "Utilitaires calendrier (hasRideInSlot, formatSlotTime, getWeekDays, etc.)",

  // ── server/ ────────────────────────────────────────────────────────────────
  "server/middleware/redirection/connected.ts":    "Middleware — redirige les utilisateurs déjà connectés (ex: /login → /dashboard)",
  "server/middleware/redirection/off-connexion.ts":"Middleware — redirige les utilisateurs non-connectés vers /login",

  // ── shared/ ────────────────────────────────────────────────────────────────
  "shared/components/footer.tsx":          "Footer global — liens légaux, réseaux sociaux, logo",
  "shared/components/GlobalLoader.tsx":    "Loader plein écran (spinner/overlay) — affiché pendant transitions",
  "shared/components/header.tsx":          "Header global avec navigation — rôle-adaptatif, menu mobile",
  "shared/components/LoaderManager.tsx":   "Gestionnaire de loaders — orchestre GlobalLoader + NavigationLoader",
  "shared/components/NavigationLoader.tsx":"Loader de navigation — barre de progression en haut de page",
  "shared/hooks/usebreakpoint.ts":         "Hook breakpoints — retourne le breakpoint Tailwind actif (sm, md, lg, xl)",
  "shared/hooks/useheader.tsx":            "Hook header — état sticky, scroll, menu mobile ouvert/fermé",
  "shared/hooks/useheader.tsx.tmp.24528.1774359567541": "Fichier temporaire — copie de travail du hook useheader lors d'un enregistrement partiel (à supprimer)",
  "shared/hooks/useismobileortable.ts":    "Hook device — retourne true si l'écran est mobile ou tablette",
  "shared/hooks/usemobileDetection.ts":    "Hook user-agent — détecte les appareils mobiles via navigator",
  "shared/types/header.types.ts":          "Types du header (liens de navigation, props, état menu)",
  "shared/ui/buttons/reserversion.map.button.tsx":"Bouton carte de réservation — ouvre la vue map d'un trajet",
  "shared/ui/buttons/togglelang.tsx":      "Bouton toggle langue (FR/EN)",
  "shared/ui/logo/main_logo.tsx":          "Composant logo principal La Cité Covoiturage",
  "shared/ui/toggles/simple_toggle.tsx":   "Toggle switch simple (on/off) — réutilisable dans les paramètres",
  "shared/ui/goscoredial.tsx":             "Composant GoScore — jauge animée avec aiguille (cadran réputation)",
  "shared/ui/warm-sentence.tsx":           "Phrase de bienvenue chaleureuse — utilisée dans hero dashboard",

  // ── public/ ────────────────────────────────────────────────────────────────
  "public/assets/destinations-pictures/default-city.png": "Photo par défaut pour une destination non-trouvée sur Unsplash",
  "public/assets/destinations-pictures/la-cite.png":      "Photo du campus La Cité Collégiale (destination principale)",
  "public/assets/destinations-pictures/maison.png":       "Icône/photo pour la destination Maison",
  "public/assets/destinations-pictures/travail.png":      "Icône/photo pour la destination Travail",
  "public/assets/goscore-dial/goscore-dial.png":           "Cadran du GoScore (jauge réputation utilisateur)",
  "public/assets/goscore-dial/goscore-needle.png":         "Aiguille animée du GoScore dial",
  "public/assets/notification-icons/canceled.png":        "Icône notification — trajet annulé",
  "public/assets/notification-icons/check.png":           "Icône notification — confirmation / succès",
  "public/assets/notification-icons/info.png":            "Icône notification — information générale",
  "public/assets/notification-icons/rappel-urgent.png":   "Icône notification — rappel urgent (départ imminent)",
  "public/assets/notification-icons/rappel.png":          "Icône notification — rappel standard",
  "public/assets/placeholder/placeholer-profile-picture.png":"Photo de profil par défaut (avatar anonyme)",
  "public/assets/reservertion_map_button/reservation-map.png":"Bouton carte — miniature map pour bouton de réservation",

  "public/img/astuces.lacite/be-punctual.png":           "Illustration astuce — soyez ponctuel",
  "public/img/astuces.lacite/communicate-with-driver.png":"Illustration astuce — communiquez avec votre conducteur",
  "public/img/astuces.lacite/plan-early.png":            "Illustration astuce — planifiez à l'avance",
  "public/img/astuces.lacite/share-yours-experiences.png":"Illustration astuce — partagez vos expériences",
  "public/img/avantages/communauté.png":                 "Icône avantage — communauté",
  "public/img/avantages/flexibilité.png":                "Icône avantage — flexibilité des horaires",
  "public/img/avantages/simplicité.png":                 "Icône avantage — simplicité d'utilisation",
  "public/img/avantages/sécurité.png":                   "Icône avantage — sécurité des trajets",
  "public/img/avantages/écologie.png":                   "Icône avantage — impact écologique positif",
  "public/img/avantages/économie.png":                   "Icône avantage — économies financières",
  "public/img/statistics.dashboard/statistics-ecologie.png":"Icône stats — CO2 économisé",
  "public/img/statistics.dashboard/statistics-goscore.png": "Icône stats — note GoScore",
  "public/img/statistics.dashboard/statistics-note.png":    "Icône stats — évaluation moyenne",
  "public/img/statistics.dashboard/statistics-trajets.png": "Icône stats — nombre de trajets",
  "public/img/acceuil-hero-img.png":             "Image hero page d'accueil — photo ambiance covoiturage",
  "public/img/driver-hero.png":                  "Image hero dashboard conducteur",
  "public/img/nouveautes-section-background.png":"Fond section nouveautés homepage",
  "public/img/passenger-hero.png":               "Image hero dashboard passager",
  "public/img/planifier-background.png":         "Image de fond pour la page planificateur",
  "public/img/Rectangle.png":                    "Image décorative rectangle (section hero accueil)",
  "public/img/school-carpoling-black-logoavif.png":"Logo La Cité Covoiturage version noire",
  "public/file.svg":   "SVG générique Next.js (template par défaut)",
  "public/globe.svg":  "SVG globe Next.js (template par défaut)",
  "public/next.svg":   "SVG logo Next.js",
  "public/vercel.svg": "SVG logo Vercel",
  "public/window.svg": "SVG fenêtre Next.js (template par défaut)",

  // ── scripts/ ──────────────────────────────────────────────────────────────
  "scripts/generate-architecture.js":    "Script — génère l'arborescence du projet (listing fichiers)",
  "scripts/generate-models.js":          "Script — génère les fichiers de modèles domain depuis un schéma DB",
  "scripts/reaorganise-architecture.js": "Script — réorganise l'architecture (déplace fichiers selon convention)",
  "scripts/update-architecture.js":      "Script — met à jour architecture.md avec commentaires automatiques (npm run update-architecture)",

  // ── scripts/auto-commit/ ─────────────────────────────────────────────────
  "scripts/auto-commit/.env":                   "Variables d'environnement du script auto-commit (clé API Anthropic) — NE PAS COMMITER",
  "scripts/auto-commit/auto_commit.log":        "Journal des exécutions du script auto-commit (horodatage, modèle IA, résultat)",
  "scripts/auto-commit/auto_commit.py":         "Script Python — commit automatique avec message généré par IA (Claude/Ollama) et fallback de secours",
  "scripts/auto-commit/setup_cron.sh":          "Script Bash — installe le cron job quotidien (23h00) pour auto-commit avec choix backend IA (Claude/Ollama)",
  "scripts/auto-commit/update_architecture.py": "Script Python — génère architecture.md simplifié (chemin | description) avec reconnaissance de patterns par feature",

  // ── tests/ ────────────────────────────────────────────────────────────────
  "tests/fixtures/testdata.ts":                                "Données de test génériques partagées entre les fixtures",
  "tests/fixtures/dashboard/index.ts":                        "Barrel export de toutes les fixtures dashboard",
  "tests/fixtures/dashboard/favorites.fixtures.ts":           "Données fictives — favoris utilisateur",
  "tests/fixtures/dashboard/finance.fixtures.ts":             "Données fictives — résumé financier conducteur",
  "tests/fixtures/dashboard/goboard.fixtures.ts":             "Données fictives — missions et défis GoBoard",
  "tests/fixtures/dashboard/lacite_astuces.fixtures.ts":      "Données fictives — astuces La Cité",
  "tests/fixtures/dashboard/notifications.fixtures.ts":       "Données fictives — notifications",
  "tests/fixtures/dashboard/nouveautes.fixtures.ts":          "Données fictives — annonces/nouveautés",
  "tests/fixtures/dashboard/publishedtrips.fixtures.ts":      "Données fictives — trajets publiés conducteur",
  "tests/fixtures/dashboard/recentDestination.fixtures.ts":   "Données fictives — destinations récentes passager",
  "tests/fixtures/dashboard/reservationrequest.fixtures.ts":  "Données fictives — demandes de réservation",
  "tests/fixtures/dashboard/reservations.fixtures.ts":        "Données fictives — réservations actives passager",
  "tests/fixtures/dashboard/reviews.fixtures.ts":             "Données fictives — évaluations et commentaires",
  "tests/fixtures/dashboard/stats.fixtures.ts":               "Données fictives — statistiques utilisateur",
  "tests/fixtures/dashboard/trips.fixtures.ts":               "Données fictives — trajets (vue UI simplifiée)",
  "tests/fixtures/dashboard/tripways.fixtures.ts":            "Données fictives — sens/direction des trajets",
  "tests/fixtures/dashboard/usualDestination.fixtures.ts":    "Données fictives — lieux habituels passager",
  "features/planner/context/PlannerFeatureProvider.tsx": "Context global du planificateur — regroupe tous les providers nécessaires au fonctionnement du calendrier",

  // ── .docs/updating-files/Create-TripView/ ─────────────────────────────────
  ".docs/updating-files/Create-TripView/BasicInfoSection.tsx":       "Prototype — section formulaire infos de base du trajet (départ, arrivée, date, heure)",
  ".docs/updating-files/Create-TripView/CreateTripForm.tsx":         "Prototype — formulaire principal de création de trajet avec layout 2 colonnes et actions publier/brouillon",
  ".docs/updating-files/Create-TripView/MapPreviewSection.tsx":      "Prototype — section prévisualisation carte du trajet avec placeholder Maps/Leaflet",
  ".docs/updating-files/Create-TripView/PricingLeftSection.tsx":     "Prototype — section tarification gauche avec prix, mode de paiement et préférences toggle",
  ".docs/updating-files/Create-TripView/PricingRightSection.tsx":    "Prototype — section tarification droite avec stepper de prix et sélection mode de paiement",
  ".docs/updating-files/Create-TripView/StepperInput.tsx":           "Composant UI — input numérique avec boutons +/− (stepper) réutilisable",
  ".docs/updating-files/Create-TripView/TogglePreferenceRow.tsx":    "Composant UI — ligne de préférence avec interrupteur toggle et icône",
  ".docs/updating-files/Create-TripView/VehicleSection.tsx":         "Prototype — section sélection de véhicule et gestion du nombre de places disponibles",

  // ── .docs/updating-files/favorites-and-statistics/ ────────────────────────
  ".docs/updating-files/favorites-and-statistics/App.tsx":               "Prototype — point d'entrée démo avec switcher entre pages Favoris et Statistiques",
  ".docs/updating-files/favorites-and-statistics/favoris (1).html":      "Maquette HTML — page Mes Favoris avec CSS intégré (lieux, utilisateurs, alertes)",
  ".docs/updating-files/favorites-and-statistics/FavorisPage.tsx":       "Prototype — page Mes Favoris avec onglets lieux, utilisateurs favoris et alertes trajet",
  ".docs/updating-files/favorites-and-statistics/LaCite_Pages.jsx":      "Prototype monofichier — composants partagés, hooks, données mock et pages combinées (JSX)",
  ".docs/updating-files/favorites-and-statistics/mockData.ts":           "Données mock — jeux de données fictifs pour favoris, statistiques, finances et GoBoard",
  ".docs/updating-files/favorites-and-statistics/shared.tsx":            "Composants partagés — Navbar, Card, TrendMsg, Toggle et styles CSS globaux réutilisables",
  ".docs/updating-files/favorites-and-statistics/statistiques.html":     "Maquette HTML — page Mes Statistiques avec graphiques CSS (KPI, CO₂, notes)",
  ".docs/updating-files/favorites-and-statistics/StatistiquesPage.tsx":  "Prototype — page Statistiques avec KPI, graphique CO₂, scatter et badges obtenus",
  ".docs/updating-files/favorites-and-statistics/types.ts":              "Types TypeScript — interfaces pour Favoris, Statistiques, Finances et GoBoard",

  // ── .docs/updating-files/GoBoard-and-Finances/ ────────────────────────────
  ".docs/updating-files/GoBoard-and-Finances/App.tsx":            "Prototype — point d'entrée démo 4 pages (Favoris, Finances, GoBoard, Statistiques)",
  ".docs/updating-files/GoBoard-and-Finances/finances.html":      "Maquette HTML — page Mes Finances avec solde, transactions et histogramme",
  ".docs/updating-files/GoBoard-and-Finances/FinancesPage.tsx":   "Prototype — page Finances avec solde, transactions, pénalités et graphique revenus/semaine",
  ".docs/updating-files/GoBoard-and-Finances/goboard.html":       "Maquette HTML — page Go! Board avec GoScore, classement et missions",
  ".docs/updating-files/GoBoard-and-Finances/GoBoardPage.tsx":    "Prototype — page Go! Board avec jauge GoScore, missions, classement et défis écologiques",

  // ── .docs/updating-files/ListingView/ ─────────────────────────────────────
  ".docs/updating-files/ListingView/ActiveChipsBar.tsx":    "Composant — barre de chips de filtres actifs avec suppression individuelle et globale",
  ".docs/updating-files/ListingView/EmptyState.tsx":        "Composant — état vide générique (aucun résultat) avec CTA configurable",
  ".docs/updating-files/ListingView/FilterDropdown.tsx":    "Composant — dropdown de filtres multi-groupes avec checkboxes et compteur actif",
  ".docs/updating-files/ListingView/ListDetailPage.tsx":    "Prototype — page liste/détail générique avec recherche, filtres, tri et vue détail latérale",
  ".docs/updating-files/ListingView/MobileDetailSheet.tsx": "Composant — bottom sheet mobile pour afficher le détail d'un élément sélectionné",
  ".docs/updating-files/ListingView/Skeletons.tsx":         "Composant — squelettes de chargement (skeleton) pour les cartes et le panneau de détail",
  ".docs/updating-files/ListingView/SortDropdown.tsx":      "Composant — dropdown de tri avec options sélectionnables et indicateur actif",

  // ── .docs/updating-files/Published_TripView/ ──────────────────────────────
  ".docs/updating-files/Published_TripView/MapOverlay.tsx":               "Composant — overlay plein écran de la carte au clic avec placeholder d'intégration",
  ".docs/updating-files/Published_TripView/PublishedTripView.tsx":        "Prototype — page complète de consultation d'un trajet publié avec carte, résumé et réservation",
  ".docs/updating-files/Published_TripView/ReservationConfirmModal.tsx":  "Composant — modale de confirmation de réservation avec résumé trajet et conducteur",
  ".docs/updating-files/Published_TripView/ReserveButton.tsx":            "Composant — bouton de réservation multi-états (réserver, en attente, confirmé, complet)",
  ".docs/updating-files/Published_TripView/TripMapArea.tsx":              "Composant — zone carte statique en haut de page avec badge durée/distance et lien overlay",
  ".docs/updating-files/Published_TripView/TripPointSection.tsx":         "Composant — carte de détail d'un point de trajet (départ ou arrivée) avec adresse",
  ".docs/updating-files/Published_TripView/TripPreferencesSection.tsx":   "Composant — section préférences du trajet (bagages, animaux, fumeur, musique, message)",
  ".docs/updating-files/Published_TripView/TripStatusSection.tsx":        "Composant — section statut du trajet (type, récurrence, paiement, places, dernière MAJ)",
  ".docs/updating-files/Published_TripView/TripSummaryCard.tsx":          "Composant — carte résumé du trajet avec conducteur, prix, véhicule et bouton réserver",

  // ── .docs/updating-files/mapservice/ ────────────────────────────────────
  ".docs/updating-files/mapservice/TrajetMapV2.tsx": "Prototype — carte Leaflet v2 (CARTO Voyager, polyline bicolore, couches campus/Overpass, boutons off-screen, recalcul OSRM)",

  // ── .docs/updating-files/matching-services-models/ ────────────────────────
  ".docs/updating-files/matching-services-models/AffiniteModel.ts":              "Prototype modèle — relation d'affinité entre deux utilisateurs (score 0–100, favoris, historique trajets communs, notes mutuelles, blocage)",
  ".docs/updating-files/matching-services-models/SignalementLitigeModel.ts":     "Prototype modèle — signalement comportemental + litige formel (cible, sévérité, preuves, statut traitement, impact affinité)",
  ".docs/updating-files/matching-services-models/UserModel.v2.additions.ts":     "Guide d'intégration — champs v2 à ajouter au UserModel (punctualityScore, noShowCount, preferencesId)",
  ".docs/updating-files/matching-services-models/UserPreferencesModel.ts":       "Prototype modèle — préférences utilisateur détaillées (comportement trajet, paiement, langue, seuils matching, notifications, confidentialité)",

  // ── .docs/updating-files/ongoing-trip-View/ ───────────────────────────────
  ".docs/updating-files/ongoing-trip-View/index.hooks.ts":              "Prototype — hook useProgression simulant un trajet temps réel avec timer, calcul d'ETA et régénération auto de fixture",
  ".docs/updating-files/ongoing-trip-View/other-components.tsx":        "Prototype — page assemblant ProgressionSection, Messagerie, SignalementOverlay et évaluation post-trajet",
  ".docs/updating-files/ongoing-trip-View/ProgressionMessagerie.tsx":   "Prototype — barre de progression temps réel avec étapes, ETA, distances et animation de fin de trajet",
  ".docs/updating-files/ongoing-trip-View/SignalementOverlay.tsx":      "Prototype — overlay signalement multi-étapes (cible, motif, sévérité, détails) avec motifs adaptatifs par rôle",
  ".docs/updating-files/ongoing-trip-View/trajet-en-cours.html":       "Prototype — maquette HTML/CSS statique complète de la page trajet en cours (nav, cartes, progression, messagerie)",

  // ── features/map-service/layers/ ──────────────────────────────────────────
  "features/map-service/layers/campus.ts":    "Couche carte — polygone périmètre campus La Cité + marqueurs zones internes avec visibilité conditionnelle au zoom",
  "features/map-service/layers/offscreen.ts": "Couche carte — boutons directionnels sur les bords de la carte pour POIs hors du viewport avec repositionnement dynamique",
  "features/map-service/layers/overpass.ts":  "Couche carte — requêtes Overpass API (arrêts bus + stations-service) avec debounce 600 ms et cache par bounding-box",

  // ── features/trajet-en-cours/hooks/ ───────────────────────────────────────
  "features/trajet-en-cours/hooks/index.hooks.ts": "Hooks feature — useProgression (simulation trajet), useMessagerie (conversations) et useSignalement (formulaire multi-étapes)",

  // ── Autres ────────────────────────────────────────────────────────────────
  "lib/db.ts":    "Service — pool de connexions PostgreSQL (singleton) avec support SSL pour BD cloud",
  ".env.local":   "Configuration — variables d'environnement sensibles (DATABASE_URL, clés API, SSL)",

  // ── tests/ ────────────────────────────────────────────────────────────────
  "tests/JsonStorageManager.ts":  "Gestionnaire bas-niveau JSON — lecture/écriture fichiers tests/db/*.json avec fs.watch et EventEmitter pour détection de changements",
  "tests/PersistenceManager.ts":  "Singleton d'écriture — seul point d'accès autorisé aux fichiers JSON (liste blanche d'entités, anti-traversée de chemin)",

  // ── tests/db/ — Base de données JSON statique (développement + tests) ─────
  "tests/db/affinites.json":                "Données test — relations d'affinité entre utilisateurs (favoris, score, trajets communs)",
  "tests/db/astuces.json":                  "Données test — astuces La Cité bilingues (planifier, ponctualité, communication, partage)",
  "tests/db/badges.json":                   "Données test — catalogue de badges attribuables (Confirmé, Régulier, etc.) avec seuils et icônes",
  "tests/db/bank_accounts.json":            "Données test — comptes bancaires utilisateurs (solde, transactions dépôt/retrait)",
  "tests/db/drafts.json":                   "Données test — brouillons de trajets non publiés (formulaire de création sauvegardé)",
  "tests/db/driver_finance_accounts.json":  "Données test — comptes financiers conducteurs (solde, commission, transactions revenus/pénalités)",
  "tests/db/eco_challenges.json":           "Données test — défis écologiques (Éco-Débutant, Éco-Conscient, Éco-Warrior) avec cibles CO₂",
  "tests/db/goboard_classement.json":       "Données test — classement GoBoard des utilisateurs par GoScore",
  "tests/db/goevents.json":                 "Données test — événements GoBoard générés à la complétion d'une GoTask (titre, points, date)",
  "tests/db/gotask-to-goevent.ts":          "Convertisseur serveur — écoute les GoTasks complétées et génère automatiquement les GoEvents correspondants",
  "tests/db/gotasks.json":                  "Données test — missions GoBoard bilingues avec progression par utilisateur (isDone, completeAt)",
  "tests/db/indisponibilities.json":        "Données test — créneaux d'indisponibilité par utilisateur (dates bloquées dans le calendrier)",
  "tests/db/lieux_favoris.json":            "Données test — lieux favoris géolocalisés (Campus La Cité, Domicile, etc.) avec icônes et ancrage carte",
  "tests/db/messages.json":                 "Données test — messages texte entre utilisateurs liés à un trajet (envoyeur, destinataire, lu/non-lu)",
  "tests/db/notifications.json":            "Données test — notifications système (demande reçue, trajet confirmé, rappel) avec lien et statut lu",
  "tests/db/nouveautes.json":               "Données test — annonces vidéo YouTube de la plateforme (titre, URL, thumbnail)",
  "tests/db/passenger_finance_accounts.json":"Données test — comptes financiers passagers (économies estimées, fonds en transit, transactions paiements)",
  "tests/db/penalites.json":                "Données test — pénalités financières (annulation tardive, retard, no-show) avec montant et statut",
  "tests/db/reservations.json":             "Données test — réservations passager sur trajets (statut, prix, confirmation embarquement, score compatibilité)",
  "tests/db/reviews.json":                  "Données test — évaluations post-trajet (note, commentaire, tags, rôle évalué)",
  "tests/db/StaticDb.ts":                   "Singleton client — accès à la base JSON via API routes /api/db/* avec cache mémoire et invalidation",
  "tests/db/trips.json":                    "Données test — trajets publiés complets (origine, destination, coordonnées, polyline, passagers, préférences, statut)",
  "tests/db/user_preferences.json":         "Données test — préférences utilisateur détaillées (conversation, musique, fumeur, animaux, paiement, seuils matching)",
  "tests/db/user_stats.json":               "Données test — statistiques utilisateur (KPIs, CO₂, trajets, note, GoScore, ponctualité, scatter distances)",
  "tests/db/users.json":                    "Données test — profils utilisateurs complets (email, rôle, driverProfile, passengerProfile, GoScore, badges)",
  "tests/db/vehicles.json":                 "Données test — véhicules enregistrés (marque, modèle, année, couleur, immatriculation, places, validation)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Génération automatique de commentaires par pattern
// (utilisé pour les fichiers NON présents dans EXACT_COMMENTS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère un commentaire automatique basé sur le nom et le chemin du fichier.
 * @param {string} rel - chemin relatif POSIX depuis la racine
 * @returns {string}
 */
function autoComment(rel) {
  const parts   = rel.split("/");
  const filename = parts[parts.length - 1];
  const base     = filename.replace(/\.(tsx?|jsx?|css|md|mjs|mts)$/, "");
  const inFolder = (name) => parts.includes(name);

  // ── Fichiers spéciaux ────────────────────────────────────────────────────
  if (filename === ".gitkeep")  return "Placeholder — dossier réservé pour implémentation future";
  if (filename === "index.ts" || filename === "index.tsx") {
    const parent = parts[parts.length - 2] || "";
    return `Barrel export du dossier ${parent}/`;
  }

  // ── Patterns par nom de fichier ──────────────────────────────────────────

  // Context React
  if (/Context\.(tsx?|jsx?)$/.test(filename)) {
    const name = base.replace("Context", "").replace(/([A-Z])/g, " $1").trim();
    return `Context React — gestion de l'état ${name}`;
  }

  // Hooks
  if (/^use[A-Z]/.test(base) && (inFolder("hooks") || /\.(tsx?|ts)$/.test(filename))) {
    const name = base.replace(/^use/, "").replace(/([A-Z])/g, " $1").trim().toLowerCase();
    return `Hook — ${name}`;
  }

  // Types
  if (/\.types\.(tsx?|ts)$/.test(filename)) {
    const name = base.replace(".types", "").replace(/([A-Z])/g, " $1").trim().toLowerCase();
    return `Types TypeScript — ${name}`;
  }

  // Sections de composants
  if (/\.section\.(tsx?|jsx?)$/.test(filename)) {
    const name = base.replace(".section", "").replace(/[-_]/g, " ");
    return `Section composant — ${name}`;
  }

  // Cartes
  if (/\.card\.(tsx?|jsx?)$/.test(filename)) {
    const name = base.replace(".card", "").replace(/[-_]/g, " ");
    return `Composant carte — ${name}`;
  }

  // Modèles domain
  if (/Model\.(tsx?|ts)$/.test(filename) && inFolder("models")) {
    const name = base.replace("Model", "").replace(/([A-Z])/g, " $1").trim().toLowerCase();
    return `Modèle DB — table ${name}`;
  }

  // Fixtures de test
  if (/\.fixtures\.(tsx?|ts)$/.test(filename)) {
    const name = base.replace(".fixtures", "").replace(/[-_]/g, " ");
    return `Données fictives de test — ${name}`;
  }

  // Services
  if (inFolder("services")) {
    return `Service — ${base.replace(/[-_.]/g, " ")}`;
  }

  // Utils
  if (inFolder("utils") || /\.utils\.(tsx?|ts)$/.test(filename)) {
    const name = base.replace(".utils", "").replace(/[-_]/g, " ");
    return `Utilitaires — ${name}`;
  }

  // Constants
  if (inFolder("constants") || /\.constants\.(tsx?|ts)$/.test(filename)) {
    const name = base.replace(".constants", "").replace(/[-_]/g, " ");
    return `Constantes — ${name}`;
  }

  // Pages Next.js
  if (filename === "page.tsx" || filename === "page.ts") {
    const route = parts.slice(0, -1).join("/");
    return `Page Next.js — route /${route}`;
  }

  // Layouts Next.js
  if (filename === "layout.tsx" || filename === "layout.ts") {
    const route = parts.slice(0, -1).join("/") || "racine";
    return `Layout Next.js — ${route}`;
  }

  // Routes API
  if (filename === "route.ts" || filename === "route.tsx") {
    const route = parts.slice(0, -1).join("/");
    return `Route API Next.js — ${route}`;
  }

  // Composants React génériques
  if (/\.(tsx|jsx)$/.test(filename) && inFolder("components")) {
    return `Composant React — ${base.replace(/[-_]/g, " ")}`;
  }

  // Scripts
  if (inFolder("scripts") && /\.(js|mjs|ts)$/.test(filename)) {
    return `Script utilitaire — ${base.replace(/[-_]/g, " ")}`;
  }

  // Images
  if (/\.(png|jpg|jpeg|webp|avif|svg|gif)$/.test(filename)) {
    return `Ressource image — ${base}`;
  }

  // CSS
  if (/\.css$/.test(filename)) {
    return `Feuille de styles — ${base}`;
  }

  // Markdown
  if (/\.md$/.test(filename)) {
    return `Documentation Markdown — ${base}`;
  }

  // Fallback
  return `Fichier — ${base.replace(/[-_]/g, " ")} *(à documenter)*`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parcours du système de fichiers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retourne la liste de tous les fichiers du projet (hors exclusions).
 * @param {string} dir - dossier à parcourir
 * @param {string} [base=""] - préfixe relatif accumulé
 * @returns {string[]} chemins relatifs POSIX
 */
function walk(dir, base = "") {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
    // Dossiers en premier, puis fichiers, ordre alphabétique
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of entries) {
    if (EXCLUDED.has(entry.name)) continue;
    const relPath = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...walk(path.join(dir, entry.name), relPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!EXCLUDED_EXTENSIONS.has(ext)) {
        results.push(relPath);
      }
    }
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Génération du contenu Markdown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Regroupe les fichiers par dossier de premier niveau et génère le Markdown.
 * @param {string[]} files
 * @returns {string}
 */
function buildMarkdown(files) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-CA", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Compteurs
  let knownCount   = 0;
  let unknownCount = 0;

  // Construit les lignes annotées
  const lines = files.map((rel) => {
    const comment = EXACT_COMMENTS[rel];
    if (comment) {
      knownCount++;
      return `${rel}  # ${comment}`;
    }
    const auto = autoComment(rel);
    if (auto.includes("*(à documenter)*")) unknownCount++;
    else knownCount++;
    return `${rel}  # ${auto}`;
  });

  // Regroupe par section de premier niveau
  const sections = {};
  for (const line of lines) {
    const topDir = line.split("/")[0].split("  #")[0];
    if (!sections[topDir]) sections[topDir] = [];
    sections[topDir].push(line);
  }

  let md = `# Architecture — Cité-Covoiturage\n`;
  md += `> Mis à jour automatiquement le ${dateStr} — exclut \`node_modules/\`, \`.next/\`, \`.git/\`\n`;
  md += `> Format : \`chemin/relatif/fichier  # description du rôle du fichier\`\n`;
  md += `> Fichiers documentés : **${knownCount}** | À documenter : **${unknownCount}**\n\n`;
  md += `---\n\n`;

  for (const [section, sectionLines] of Object.entries(sections)) {
    md += `## ${section}/\n\n`;
    md += "```\n";
    md += sectionLines.join("\n");
    md += "\n```\n\n";
  }

  md += `---\n\n`;
  md += `*Généré par \`npm run update-architecture\` — mettre à jour \`EXACT_COMMENTS\` dans \`scripts/update-architecture.js\` pour tout nouveau fichier significatif.*\n`;

  return md;
}

// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée
// ─────────────────────────────────────────────────────────────────────────────
function main() {
  console.log("🔍 Scan du projet en cours...");
  const files = walk(ROOT);
  console.log(`📁 ${files.length} fichiers trouvés`);

  const markdown = buildMarkdown(files);

  // S'assure que le dossier de sortie existe
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, markdown, "utf-8");

  console.log(`✅ architecture.md mis à jour → ${path.relative(ROOT, OUTPUT)}`);

  // Résumé
  const unknownFiles = files.filter((rel) => {
    const c = EXACT_COMMENTS[rel];
    if (c) return false;
    return autoComment(rel).includes("*(à documenter)*");
  });

  if (unknownFiles.length > 0) {
    console.log(`\n⚠️  ${unknownFiles.length} fichier(s) sans commentaire précis (commentaire générique appliqué) :`);
    unknownFiles.forEach((f) => console.log(`   - ${f}`));
    console.log(`\n💡 Ajoutez-les dans EXACT_COMMENTS dans scripts/update-architecture.js\n`);
  } else {
    console.log("🎉 Tous les fichiers ont un commentaire documenté !\n");
  }
}

main();
