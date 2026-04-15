// ============================================================
//  Features/tripdetail/DisplayConverters/TripDetailDisplayConverter.cs
//  Convertit TripViewData → DisplayModels de la feature TripDetail
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.tripdetail.DisplayConverters
{
    public static class TripDetailDisplayConverter
    {
        // ── Carte résumé ─────────────────────────────────────
        public static TripSummaryCardDisplayModel ToSummaryCard(
            TripViewData trip,
            TripViewerRole viewerRole,
            ExistingReservationInfo? existingReservation,
            string? source,
            string? sourceStatus)
        {
            bool isPassenger   = viewerRole == TripViewerRole.Passenger;
            bool isDriverOwner = viewerRole == TripViewerRole.DriverOwner;

            var button = BuildReserveButton(viewerRole, existingReservation, source, sourceStatus, trip.AvailableSeats);

            var canCancelReservation = isPassenger && existingReservation?.Status is
                TripReservationStatus.Pending or TripReservationStatus.Confirmed;
            var canCancelTrip = isDriverOwner && source != "reservation" &&
                sourceStatus is not ("cancelled" or "completed" or "no-show" or null);

            return new TripSummaryCardDisplayModel
            {
                DriverFirstName      = trip.Driver.FirstName,
                DriverAvatarUrl      = trip.Driver.AvatarUrl,
                DriverRating         = trip.Driver.Rating,
                DriverTripCount      = trip.Driver.TripCount,
                VehicleLabel         = trip.Vehicle.Label,
                VehicleColor         = trip.Vehicle.Color,
                DepartureDate        = trip.DepartureDate,
                DepartureTime        = trip.DepartureTime,
                EstimatedDurationMin = trip.EstimatedDuration,
                EstimatedDistanceKm  = trip.EstimatedDistance,
                DisplayPrice         = isDriverOwner ? trip.PricePerPassenger : trip.PassengerPrice,
                AvailableSeats       = trip.AvailableSeats,
                TotalSeats           = trip.TotalSeats,
                PaymentMethodLabel   = trip.PaymentMethod == PaymentMethod.Cash ? "En espèces" : "Interac",
                ReserveButton        = button,
                ShowCancelButton     = canCancelReservation || canCancelTrip,
                CancelLabel          = isPassenger ? "Annuler cette réservation" : "Annuler ce trajet",
                IsDriver             = isDriverOwner,
            };
        }

        // ── Point (départ ou arrivée) ─────────────────────────
        public static TripPointDisplayModel ToPointDisplayModel(TripPoint point, bool isDeparture)
            => new()
            {
                IsDeparture  = isDeparture,
                Label        = point.Label,
                FullAddress  = point.FullAddress,
                Instructions = point.Instructions,
                Lat          = point.Lat,
                Lng          = point.Lng,
            };

        // ── Préférences ────────────────────────────────────────
        public static TripPreferencesSectionDisplayModel ToPreferencesSection(TripPreferences prefs)
        {
            var items = new List<TripPreferenceItem>
            {
                new("baggage",  "Bagages",       prefs.BaggageAllowed),
                new("pet",      "Animaux",        prefs.PetsAllowed),
                new("smoke",    "Fumeurs",        prefs.SmokingAllowed),
                new("music",    "Musique",        prefs.MusicAllowed),
                new("flexible", "Itinéraire flexible", prefs.FlexibleItinerary),
            };
            return new TripPreferencesSectionDisplayModel
            {
                Items      = items,
                DriverNote = prefs.DriverNote,
            };
        }

        // ── Statut ─────────────────────────────────────────────
        public static TripStatusSectionDisplayModel ToStatusSection(TripStatusInfo status)
        {
            var lastUpdated = DateTime.TryParse(status.LastUpdatedAt, out var dt)
                ? dt.ToString("d MMMM yyyy", new System.Globalization.CultureInfo("fr-CA"))
                : status.LastUpdatedAt;

            return new TripStatusSectionDisplayModel
            {
                TripTypeLabel  = status.TripType == TripType.Unique ? "Unique" : "Récurrent",
                IsRecurrent    = status.IsRecurrent,
                MaxDetourLabel = status.MaxDetourMinutes.HasValue
                    ? $"{status.MaxDetourMinutes} min de détour max"
                    : null,
                LastUpdated    = lastUpdated,
            };
        }

        // ── Bouton réserver — logique identique au web ─────────
        private static ReserveButtonDisplayModel BuildReserveButton(
            TripViewerRole role,
            ExistingReservationInfo? existing,
            string? source,
            string? sourceStatus,
            int availableSeats)
        {
            // Admin → lecture seule
            if (role == TripViewerRole.Admin)
                return Btn(ReserveButtonKind.Readonly, "Vue administrateur", "#6b7280", false);

            // Conducteur auteur → gérer les demandes
            if (role == TripViewerRole.DriverOwner)
            {
                return sourceStatus switch
                {
                    "published"   => Btn(ReserveButtonKind.TripPublished,    "Gérer les demandes",     "#08316e"),
                    "full"        => Btn(ReserveButtonKind.TripFull,         "Trajet complet",          "#6b7280", false),
                    "confirmed"   => Btn(ReserveButtonKind.TripConfirmed,    "Trajet confirmé",         "#0d9488"),
                    "in-progress" => Btn(ReserveButtonKind.TripInProgress,   "En cours",                "#7c3aed"),
                    "completed"   => Btn(ReserveButtonKind.TripCompleted,    "Trajet terminé",          "#6b7280", false),
                    "cancelled"   => Btn(ReserveButtonKind.TripCancelled,    "Trajet annulé",           "#6b7280", false),
                    "imminent"    => Btn(ReserveButtonKind.TripImminent,     "Démarrer le trajet",      "#16a34a"),
                    _             => Btn(ReserveButtonKind.Manage,           "Gérer les demandes",      "#08316e"),
                };
            }

            // Passager — état basé sur source + existing
            if (source == "reservation" && sourceStatus is not null)
            {
                return sourceStatus switch
                {
                    "confirmed"   => Btn(ReserveButtonKind.ReservationConfirmed,   "Réservation confirmée",   "#16a34a", false),
                    "in-progress" => Btn(ReserveButtonKind.ReservationInProgress,  "Trajet en cours",         "#7c3aed", false),
                    "cancelled"   => Btn(ReserveButtonKind.ReservationCancelled,   "Réservation annulée",     "#6b7280", false),
                    "pending"     => Btn(ReserveButtonKind.ReservationPending,     "En attente de réponse",   "#f59e0b", false),
                    "completed"   => Btn(ReserveButtonKind.ReservationCompleted,   "Trajet terminé",          "#6b7280", false),
                    "rejected"    => Btn(ReserveButtonKind.ReservationRejected,    "Demande refusée",         "#dc2626", false),
                    "imminent"    => Btn(ReserveButtonKind.ReservationImminent,    "Départ imminent",         "#16a34a", false),
                    _             => Btn(ReserveButtonKind.Readonly, "—", "#6b7280", false),
                };
            }

            // Passager — pas de réservation en cours
            if (existing is null)
            {
                return availableSeats <= 0
                    ? Btn(ReserveButtonKind.Full,    "Trajet complet",   "#6b7280", false)
                    : Btn(ReserveButtonKind.Reserve, "Réserver ce trajet", "#08316e");
            }

            return existing.Status switch
            {
                TripReservationStatus.Pending   => Btn(ReserveButtonKind.Pending,   "En attente de réponse", "#f59e0b", false),
                TripReservationStatus.Confirmed => Btn(ReserveButtonKind.Confirmed, "Réservé ✓",             "#16a34a", false),
                TripReservationStatus.Refused   => Btn(ReserveButtonKind.Refused,   "Demande refusée",        "#dc2626", false),
                TripReservationStatus.Cancelled => Btn(ReserveButtonKind.Reserve,   "Réserver à nouveau",     "#08316e"),
                _                               => Btn(ReserveButtonKind.Readonly,  "—",                      "#6b7280", false),
            };
        }

        private static ReserveButtonDisplayModel Btn(
            ReserveButtonKind kind, string label, string bgHex, bool enabled = true)
            => new(kind, label, bgHex, "White", enabled);
    }
}
