// ============================================================
//  Features/reservationrequest/DisplayConverters/
//  ReservationRequestDisplayConverter.cs
//  Convertit ReservationRequestModel → ReservationRequestDetailDisplayModel
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayConverters
{
    public static class ReservationRequestDisplayConverter
    {
        public static ReservationRequestDetailDisplayModel ToDetailDisplayModel(
            ReservationRequestModel request)
        {
            return new ReservationRequestDetailDisplayModel
            {
                RequestId           = request.Id,
                PassengerName       = request.Applicant.Name,
                PassengerAvatarUrl  = request.Applicant.UrlPicture,
                PassengerRating     = request.Applicant.Note,
                PassengerTripCount  = request.Applicant.DoneTrips,
                Departure           = request.Departure,
                Destination         = request.Destination,
                Date                = FormatDate(request.Date),
                Time                = request.Time,
                CurrentPassengers   = request.CurrentPassengers,
                MaxPassengers       = request.MaxPassengers,
                Price               = request.Price,
            };
        }

        // ── Cartes de liste ────────────────────────────────────────────────

        public static ReservationListCardDisplayModel ToDriverCard(ReservationRequestModel r)
        {
            var (statusLabel, statusColor) = r.Status switch
            {
                "pending"  => ("En attente", "#d97706"),
                "accepted" => ("Acceptée",   "#16a34a"),
                "rejected" => ("Refusée",    "#dc2626"),
                _          => (r.Status,     "#6b7280"),
            };

            return new ReservationListCardDisplayModel
            {
                Role           = ReservationCardRole.Driver,
                Id             = r.Id,
                RequestId      = r.Id,
                Departure      = r.Departure,
                Destination    = r.Destination,
                Date           = FormatDateShort(r.Date),
                Time           = r.Time,
                StatusLabel    = statusLabel,
                StatusColorHex = statusColor,
                ApplicantName  = r.Applicant.Name,
                ApplicantRating= r.Applicant.Note,
                TripId         = r.TripId,
            };
        }

        public static ReservationListCardDisplayModel ToPassengerCard(ReservationModel r)
        {
            var (statusLabel, statusColor) = r.Status switch
            {
                ReservationStatus.Pending   => ("En attente",  "#d97706"),
                ReservationStatus.Confirmed => ("Confirmée",   "#16a34a"),
                ReservationStatus.Cancelled => ("Annulée",     "#dc2626"),
                ReservationStatus.Completed => ("Terminée",    "#6b7280"),
                ReservationStatus.InProgress=> ("En cours",   "#08316e"),
                ReservationStatus.Rejected  => ("Non retenue", "#dc2626"),
                _                           => ("Inconnue",   "#6b7280"),
            };

            return new ReservationListCardDisplayModel
            {
                Role           = ReservationCardRole.Passenger,
                Id             = r.Id,
                TripId         = r.TripId,
                Departure      = r.Departure,
                Destination    = r.Destination,
                Date           = FormatDateShort(r.Date),
                Time           = r.Time,
                StatusLabel    = statusLabel,
                StatusColorHex = statusColor,
                DriverName     = r.Driver.Name,
                DriverRating   = r.Driver.Rating,
            };
        }

        private static string FormatDate(string isoDate)
        {
            if (DateTime.TryParse(isoDate, out var dt))
                return dt.ToString("d MMMM yyyy", new System.Globalization.CultureInfo("fr-CA"));
            return isoDate;
        }

        private static string FormatDateShort(string isoDate)
        {
            if (DateTime.TryParse(isoDate, out var dt))
                return dt.ToString("d MMM", new System.Globalization.CultureInfo("fr-CA"));
            return isoDate;
        }
    }
}
