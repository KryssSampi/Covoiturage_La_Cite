// ============================================================
//  Features/reservationrequest/DisplayModels/
//  ReservationCardDisplayModels.cs
//
//  Modèles de carte pour la liste des réservations.
//  ReservationPassengerCardDisplayModel → vue passager (mes réservations)
//  ReservationDriverCardDisplayModel   → vue conducteur (demandes reçues)
//
//  Ces deux types sont unifiés via ReservationListCardDisplayModel
//  (interface commune) pour le composant ItemList.
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Features.reservationrequest.DisplayModels
{
    public enum ReservationCardRole { Passenger, Driver }

    /// <summary>
    /// Carte unifiée utilisée dans ItemList&lt;ReservationListCardDisplayModel&gt;.
    /// Le champ Role permet au DataTemplate d'adapter l'affichage.
    /// </summary>
    public class ReservationListCardDisplayModel
    {
        // ── Discriminant ─────────────────────────────────────
        public ReservationCardRole Role { get; init; }

        // ── Commun ───────────────────────────────────────────
        public string Id          { get; init; } = "";
        public string Departure   { get; init; } = "";
        public string Destination { get; init; } = "";
        public string Date        { get; init; } = "";
        public string Time        { get; init; } = "";
        public string StatusLabel { get; init; } = "";
        public string StatusColorHex { get; init; } = "#6b7280";

        // ── Vue passager (Role = Passenger) ──────────────────
        /// <summary>Prénom + nom du conducteur.</summary>
        public string? DriverName   { get; init; }
        public double? DriverRating { get; init; }
        public string  TripId       { get; init; } = "";

        // ── Vue conducteur (Role = Driver) ───────────────────
        /// <summary>Prénom + nom du demandeur.</summary>
        public string? ApplicantName   { get; init; }
        public double? ApplicantRating { get; init; }
        public string  RequestId       { get; init; } = "";

        // ── Propriétés dérivées ───────────────────────────────
        public string PersonName => Role == ReservationCardRole.Driver
            ? (ApplicantName ?? "—")
            : (DriverName    ?? "—");

        public string PersonRoleLabel => Role == ReservationCardRole.Driver
            ? "Passager"
            : "Conducteur";

        public double PersonRating => Role == ReservationCardRole.Driver
            ? (ApplicantRating ?? 0.0)
            : (DriverRating    ?? 0.0);

        public string RatingLabel => PersonRating > 0 ? $"★ {PersonRating:F1}" : "—";
    }
}
