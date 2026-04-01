// ============================================================
//  Features/notifications/DisplayConverters/NotificationsDisplayConverter.cs
//  Convertit NotificationModel → NotificationDetailDisplayModel
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.notifications.DisplayConverters
{
    public static class NotificationsDisplayConverter
    {
        // ── Types conducteur (onglet "Conducteur") ────────────────────────
        private static readonly HashSet<NotificationType> DriverTypes = new()
        {
            NotificationType.ReservationReceived,
            NotificationType.TripCreated,
        };

        public static NotificationCardDisplayModel ToCardDisplayModel(NotificationModel m)
        {
            DateTime dt = DateTime.TryParse(m.CreatedAt, out var p) ? p : DateTime.Now;
            var snippet = m.Message.Length > 70 ? m.Message[..67] + "…" : m.Message;

            return new NotificationCardDisplayModel
            {
                Id           = m.Id,
                TypeLabel    = TypeLabel(m.Type),
                TypeIconKey  = TypeIconKey(m.Type),
                Title        = m.Title,
                DateStr      = dt.ToString("d MMM", new System.Globalization.CultureInfo("fr-CA")),
                Snippet      = snippet,
                IsRead       = m.IsRead,
                IsUrgent     = NotificationConstants.IsImportant(m.Type),
                IsDriverRole = DriverTypes.Contains(m.Type),
            };
        }

        public static NotificationDetailDisplayModel ToDetailDisplayModel(NotificationModel m)
        {
            var isUrgent = NotificationConstants.IsImportant(m.Type);

            // ── Parsing date/heure ────────────────────────────────
            DateTime dt = DateTime.TryParse(m.CreatedAt, out var parsed) ? parsed : DateTime.Now;
            var dateStr = dt.ToString("dddd d MMMM yyyy", new System.Globalization.CultureInfo("fr-CA"));
            var timeStr = dt.ToString("HH:mm");

            var dm = new NotificationDetailDisplayModel
            {
                Id          = m.Id,
                TypeLabel   = TypeLabel(m.Type),
                TypeIconKey = TypeIconKey(m.Type),
                IsUrgent    = isUrgent,
                Title       = m.Title,
                DateStr     = dateStr,
                TimeStr     = timeStr,
                IsRead      = m.IsRead,
                Message     = m.Message,
                ActionLabel = m.LinkLabel ?? DefaultLinkLabel(m.Type),
                ActionLink  = m.Link,
            };

            // ── Payload trajet ────────────────────────────────────
            if (m.TripDetails is { } td)
            {
                var rows = new List<NotifTripDetailRow>
                {
                    new("location", "De",      td.Departure),
                    new("arrow",    "Vers",     td.Arrival),
                    new("calendar", "Date",     $"{td.Date} à {td.Time}"),
                    new("dollar",   "Tarif",    $"{td.Price:F2} $"),
                };
                if (td.EstimatedDurationMinutes.HasValue)
                    rows.Add(new("clock",  "Durée",  $"{td.EstimatedDurationMinutes} min"));
                if (td.AvailableSeats.HasValue)
                    rows.Add(new("seat",   "Places", $"{td.AvailableSeats} disponible{(td.AvailableSeats > 1 ? "s" : "")}"));

                dm.TripRows = rows;
                dm.HasTripDetails = true;
            }

            // ── Payload réservation ───────────────────────────────
            if (m.ReservationDetails is { } rd)
            {
                var persons = new List<NotifPersonData>();
                if (!string.IsNullOrWhiteSpace(rd.PassengerName))
                    persons.Add(new("Passager", rd.PassengerName, rd.PassengerRating));
                if (!string.IsNullOrWhiteSpace(rd.DriverName))
                    persons.Add(new("Conducteur", rd.DriverName, null));

                dm.Persons = persons;
                dm.HasReservationDetails = persons.Count > 0;
            }

            // ── Payload avis ──────────────────────────────────────
            if (m.ReviewDetails is { } rev)
            {
                dm.Review = new NotifReviewData(rev.Rating, rev.Comment, rev.ReviewerName);
                dm.HasReviewDetails = true;
            }

            // ── Payload sécurité ──────────────────────────────────
            if (m.SecurityDetails is { } sec)
            {
                dm.Security = new NotifSecurityData(
                    sec.ClientType == "web" ? "Navigateur web" : "Application mobile",
                    sec.Location
                );
                dm.HasSecurityDetails = true;
            }

            return dm;
        }

        // ── Helpers ───────────────────────────────────────────────
        private static string TypeLabel(NotificationType t) => t switch
        {
            NotificationType.ReservationReceived  => "Nouvelle demande",
            NotificationType.ReservationSent      => "Demande envoyée",
            NotificationType.ReservationAccepted  => "Réservation confirmée",
            NotificationType.ReservationRefused   => "Demande non retenue",
            NotificationType.ReservationCancelled => "Réservation annulée",
            NotificationType.TripCreated          => "Trajet publié",
            NotificationType.TripStartingSoon     => "Départ imminent",
            NotificationType.TripStarted          => "Trajet démarré",
            NotificationType.TripCompleted        => "Trajet terminé",
            NotificationType.TripCancelled        => "Trajet annulé",
            NotificationType.NewReviewReceived    => "Nouvel avis",
            NotificationType.CancellationPenalty  => "Pénalité appliquée",
            NotificationType.SecurityAlert        => "Alerte de sécurité",
            _                                     => "Information",
        };

        private static string TypeIconKey(NotificationType t) => t switch
        {
            NotificationType.ReservationReceived  => "bell",
            NotificationType.ReservationAccepted
            or NotificationType.TripCreated
            or NotificationType.TripCompleted     => "check_circle",
            NotificationType.ReservationRefused
            or NotificationType.ReservationCancelled
            or NotificationType.TripCancelled     => "x_circle",
            NotificationType.TripStartingSoon
            or NotificationType.TripStarted       => "calendar",
            NotificationType.NewReviewReceived    => "star",
            NotificationType.CancellationPenalty  => "warning",
            NotificationType.SecurityAlert        => "shield",
            _                                     => "bell",
        };

        private static string DefaultLinkLabel(NotificationType t) => t switch
        {
            NotificationType.ReservationReceived  => "Voir les demandes",
            NotificationType.ReservationSent      => "Voir ma demande",
            NotificationType.ReservationAccepted  => "Voir le trajet",
            NotificationType.ReservationRefused   => "Chercher un autre trajet",
            NotificationType.ReservationCancelled => "Voir mes réservations",
            NotificationType.TripCreated          => "Voir le trajet",
            NotificationType.TripStartingSoon
            or NotificationType.TripStarted       => "Suivre le trajet",
            NotificationType.TripCompleted        => "Voir le résumé",
            NotificationType.TripCancelled        => "Chercher un autre trajet",
            NotificationType.NewReviewReceived    => "Voir l'avis",
            NotificationType.CancellationPenalty  => "Voir les pénalités",
            NotificationType.SecurityAlert        => "Voir l'activité récente",
            _                                     => "En savoir plus",
        };
    }
}
