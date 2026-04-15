// ============================================================
//  Test/Fixtures/NotificationFixtures.cs
//  Données de test pour les notifications (miroir des fixtures web)
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;

namespace Covoiturage_la_cite__App_Mobile_.Test.Fixtures
{
    public static class NotificationFixtures
    {
        public static readonly IReadOnlyList<NotificationModel> All = new List<NotificationModel>
        {
            new()
            {
                Id         = "notif-001",
                UserId     = "user-driver-01",
                Type       = NotificationType.ReservationReceived,
                Title      = "Nouvelle demande de réservation",
                Message    = "Marie Tremblay souhaite rejoindre votre trajet Ottawa → Gatineau du 2 avril à 08h00.",
                IsRead     = false,
                IsImportant = true,
                Link       = "reservations",
                CreatedAt  = "2026-04-02T07:30:00Z",
                TripDetails = new NotificationTripDetails(
                    TripId: "trip-001",
                    Departure: "Campus La Cité, Ottawa",
                    Arrival:   "Place d'Orléans",
                    Date:      "2026-04-02",
                    Time:      "08:00",
                    Price:     8.00,
                    AvailableSeats: 2,
                    EstimatedDurationMinutes: 35
                ),
                ReservationDetails = new NotificationReservationDetails(
                    ReservationId:    "resa-101",
                    PassengerName:    "Marie Tremblay",
                    PassengerAvatar:  null,
                    PassengerRating:  4.8,
                    PassengerTripCount: 12,
                    DriverName:       null,
                    DriverAvatar:     null
                )
            },
            new()
            {
                Id         = "notif-002",
                UserId     = "user-passenger-01",
                Type       = NotificationType.ReservationAccepted,
                Title      = "Votre réservation a été acceptée",
                Message    = "Jean Dupont a accepté votre demande pour le trajet du 2 avril à 08h00.",
                IsRead     = true,
                IsImportant = true,
                Link       = "trajets",
                CreatedAt  = "2026-04-01T20:15:00Z",
                TripDetails = new NotificationTripDetails(
                    TripId: "trip-001",
                    Departure: "Campus La Cité, Ottawa",
                    Arrival:   "Place d'Orléans",
                    Date:      "2026-04-02",
                    Time:      "08:00",
                    Price:     9.20,
                    AvailableSeats: 1,
                    EstimatedDurationMinutes: 35
                )
            },
            new()
            {
                Id         = "notif-003",
                UserId     = "user-driver-01",
                Type       = NotificationType.TripCreated,
                Title      = "Trajet publié avec succès",
                Message    = "Votre trajet Ottawa → Gatineau du 2 avril est maintenant visible par les passagers.",
                IsRead     = true,
                IsImportant = false,
                Link       = "trajets",
                CreatedAt  = "2026-04-01T18:00:00Z",
            },
            new()
            {
                Id         = "notif-004",
                UserId     = "user-passenger-01",
                Type       = NotificationType.NewReviewReceived,
                Title      = "Nouvel avis reçu",
                Message    = "Jean Dupont vous a laissé un avis suite à votre trajet du 28 mars.",
                IsRead     = false,
                IsImportant = false,
                CreatedAt  = "2026-03-29T09:00:00Z",
                ReviewDetails = new NotificationReviewDetails(
                    ReviewId:     "review-001",
                    ReviewerName: "Jean Dupont",
                    ReviewerAvatar: null,
                    Rating:       4.5,
                    Comment:      "Passager ponctuel et agréable, trajet sans souci."
                )
            },
            new()
            {
                Id         = "notif-005",
                UserId     = "user-driver-01",
                Type       = NotificationType.SecurityAlert,
                Title      = "Nouvelle connexion détectée",
                Message    = "Une connexion a été effectuée sur votre compte depuis un navigateur web.",
                IsRead     = false,
                IsImportant = true,
                CreatedAt  = "2026-03-31T14:22:00Z",
                SecurityDetails = new NotificationSecurityDetails(
                    ClientType: "web",
                    Location:   "Ottawa, ON",
                    UserAgent:  null
                )
            },
        };
    }
}
