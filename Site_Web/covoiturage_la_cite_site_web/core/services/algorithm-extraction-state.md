# Algorithm Extraction State

## Principle

Routes and hooks should keep:
- request/response handling
- input validation
- UI state management
- side-effect orchestration

Algorithms should move to `core/services` or `core/utils`.

## Updated Call Sites

- `app/api/passenger/search/route.ts`
- `app/api/trips/route.ts`
- `app/api/trips/[id]/route.ts`
- `app/api/trips/[id]/status/route.ts`
- `app/api/reservations/route.ts`
- `app/api/reservations/[id]/accept/route.ts`
- `app/api/reservations/[id]/cancel/route.ts`
- `app/api/reservations/[id]/refuse/route.ts`
- `app/api/reservations/[id]/reject/route.ts`
- `app/api/reservations/[id]/start/route.ts`
- `app/api/vehicles/route.ts`
- `app/api/drafts/route.ts`
- `app/api/drafts/[id]/route.ts`
- `app/api/notifications/route.ts`
- `app/api/notifications/read-all/route.ts`
- `app/api/notifications/[id]/read/route.ts`
- `app/api/reviews/route.ts`
- `app/api/reviews/enriched/route.ts`
- `app/api/favoris/route.ts`
- `app/api/favoris/user-favori/route.ts`
- `app/api/favoris/alerte-toggle/route.ts`
- `app/api/lieux-favoris/route.ts`
- `app/api/auth/signin/route.ts`
- `app/api/admin/users/route.ts`
- `app/api/admin/trips/route.ts`
- `app/api/indisponibilities/[id]/route.ts`
- `features/notifications/hooks/useNotificationsList.ts`
- `features/reviews/hooks/useReviewsList.ts`
- `features/nouveautes/hooks/useNouveautesList.ts`
- `shared/components/list-detail-page/hooks/useListDetail.ts`
- `features/homepage/hooks/useAdvantages.ts`
- `features/homepage/hooks/useHowItWorksSteps.ts`
- `features/homepage/hooks/useNavLinks.ts`
- `features/homepage/hooks/useHomepageStats.ts`
- `features/dashboard/hooks/useNotifications.ts`
- `features/dashboard/hooks/useRecentDestinations.ts`
- `features/dashboard/hooks/useUsualDestinations.ts`
- `features/dashboard/hooks/useNouveautesSlider.ts`
- `features/search/hooks/usePassengerSearch.ts`
- `features/search/hooks/useDriverSearch.ts`
- `features/trajets/hooks/useCreateTrip.ts`

## Additional Core Services And Utils Added

- `core/utils/api-route.utils.ts`
  - shared id generation
  - current ISO timestamp helper
  - descending date sort helper

- `core/utils/create-trip-form.utils.ts`
  - reads geo/session draft data
  - builds create-trip payload

- `core/utils/list-detail.utils.ts`
  - nested field access
  - text search
  - filter matching
  - active chip building
  - filtered/sorted list projection
  - selected id normalization

- `core/services/passenger-search.service.ts`
  - loads passenger search context
  - runs server-side matching
  - builds DTOs and blocked results

- `core/services/passenger-search-client.service.ts`
  - computes client-side passenger filtering/sorting fallback

- `core/services/driver-circuit.service.ts`
  - filters and sorts driver circuits

- `core/services/trip-api.service.ts`
  - filters trip query results
  - builds a persisted trip record from POST payload

- `core/services/trip-lifecycle-api.service.ts`
  - trip detail CRUD helpers
  - trip status transition orchestration

- `core/services/reservation-api.service.ts`
  - filters reservation query results
  - builds a pending reservation record

- `core/services/reservation-acceptance.service.ts`
  - full acceptance workflow
  - cancels competing pending requests
  - updates trip occupancy
  - triggers payment pre-auth
  - emits notifications

- `core/services/reservation-lifecycle-api.service.ts`
  - cancel / refuse / reject / start workflows
  - holding release and seat rollback
  - reservation lifecycle notifications

- `core/services/vehicle-api.service.ts`
  - vehicle query
  - persisted vehicle record builder

- `core/services/draft-api.service.ts`
  - draft query / save / patch / delete
  - unavailability-aware filtering

- `core/services/notification-api.service.ts`
  - notification query
  - mark-one and mark-all workflows

- `core/services/review-api.service.ts`
  - review query
  - review creation record builder
  - enriched review projection

- `core/services/auth-api.service.ts`
  - email normalization and institutional validation
  - signin user lookup

- `core/services/lieux-favoris-api.service.ts`
  - lieux favoris query / save / delete

- `core/services/favoris-api.service.ts`
  - favoris page aggregation
  - alert toggle helpers
  - user favori add/remove workflow

- `core/services/admin-api.service.ts`
  - admin users sanitization
  - admin trips enrichment

- `core/services/indisponibility-api.service.ts`
  - empty fallback projection
  - sanitized save workflow

- `core/services/list-detail-config.service.ts`
  - centralized list-detail configs for notifications, reviews and nouveautes

- `core/services/homepage-content.service.ts`
  - homepage content collections
  - localized label/title/description helpers

- `core/services/dashboard-selector.service.ts`
  - dashboard notifications projection
  - recent/usual destinations sorting and survey mapping

- `core/services/nouveautes-slider.service.ts`
  - slider transition presets
  - next / previous index helpers

- `core/services/dashboard-driver.service.ts`
  - `buildDriverDashboard(driverId)` — full driver dashboard aggregation

- `core/services/dashboard-passenger.service.ts`
  - `buildPassengerDashboard(passengerId)` — full passenger dashboard aggregation

- `core/services/historique.service.ts`
  - `buildDriverHistorique(driverId)` — all trips enriched with passengers/pending
  - `buildPassengerHistorique(passengerId)` — reservations → enriched trips
  - `buildDriverReservationRequests(driverId)` — pending reservations enriched

- `core/services/simulation.service.ts`
  - `runSimulation(tripId, event, params)` — admin simulation orchestration

- `core/services/routing.service.ts`
  - `fetchRoute(dep, arr)` — OSRM single route
  - `fetchCircuits(dep, arr, depLabel, arrLabel)` — multi-circuit generation

- `core/services/live-trips.service.ts`
  - `isImminent(trip)`, `mapStatus(trip, count)`, `toPublishedTrip(...)` — live trip mapping
  - `VISIBLE_STATUSES` — status allowlist

- `features/trajet-en-cours/utils/trajet-progression.utils.ts`
  - `calculer(fixture, sec)` — pure progression state calculation

- `features/trajet-en-cours/utils/trajet-map.utils.ts`
  - `enrichPolyline`, `densifyPolyline`, `buildState`, `fetchOsrmRoute`

- `features/trajet-en-cours/utils/signalement-pdf.utils.ts`
  - `genererRapportPDF(data, trajetId, refNum)` — HTML report generation

- `features/dashboard/utils/presentation-sort.utils.ts`
  - `organizeRequests(requests)`, `organizeTrips(trips)`

## Remaining Algorithms To Move

### Priority A: Server Routes With Business Logic

- `app/api/passenger/reservations-enriched/route.ts`
  - data aggregation / enrichment algorithms
  - should move to dedicated dashboard/history/query services

### Priority B: Hooks With Heavy Derived Logic

- `features/search/hooks/useRouteMap.ts`
  - parsing/search orchestration
  - suggestion ranking / route prep helpers

- `features/search/hooks/useMatchingScore.ts`
  - duplicate matching logic candidate for merge or deletion

- `features/trajets/hooks/usePublishedTripView.ts`
  - reservation request building
  - trip view derived state

- `features/planner/hooks/useRideArea.ts`
  - ride grouping / planner derivation

- `features/planner/hooks/useCalendarWindow.ts`
  - date window calculation rules

- `features/planner/hooks/useIndisponibilityActions.ts`
  - action orchestration rules for unavailability

- `features/dashboard/hooks/useReservations.ts`
- `features/dashboard/hooks/useReservationRequests.ts`
- `features/dashboard/hooks/usePublishedTrips.ts`
- `features/dashboard/hooks/useRecommendedRides.ts`
- `features/dashboard/hooks/useSuperSearch.ts`
- `features/dashboard/hooks/useLiveTrips.ts`
  - sorting / grouping / recommendation logic should move to dashboard query services and selectors

- `features/historique/hooks/useDriverHistoriqueList.ts`
- `features/historique/hooks/usePassengerHistoriqueList.ts`
  - normalization, partitioning, sorting logic

- `features/reservations/hooks/useDriverReservationRequestsList.ts`
- `features/reservations/hooks/usePassengerReservationsList.ts`
  - list partitioning and presentation scoring

### Priority C: Feature Services Still Outside Core

- search converters / dashboard converters containing decision logic
  - move decision rules to core services
  - keep converters as shape mapping only

### Priority D: Query/Selector Utilities

- favorites, finances, notifications, nouveautes, statistiques hooks
  - move non-trivial filtering / sorting / aggregation to selector utilities under core

## Recommended Next Extraction Order

1. dashboard aggregation routes
2. OSRM / routing strategy
3. planner / dashboard heavy hooks
4. reservation / history presentation selectors
5. remaining presentation selectors

## Notes

- Call sites were intentionally kept in place in this pass.
- The next pass should continue without moving components/pages yet.
- Once extraction is stable, a later pass can centralize call sites and remove duplicate algorithms.
