// ============================================================
//  Features/historique/DisplayModels/HistoriqueDisplayModels.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.historique.DisplayModels
{
    public enum HistoriqueRole { Passenger, Driver }

    public record HistoriqueCardDisplayModel(
        string              Id,
        HistoriqueRole      Role,
        string              DateTimeLabel,
        RouteDisplayModel   Route,
        // Autre personne (conducteur si passager, passager si conducteur)
        string              OtherPersonInitial,
        string              OtherPersonName,
        double?             OtherPersonRating,
        // Infos trajet
        string?             PriceLabel,        // "7,00 $"
        string?             Co2Label,          // "0,8 kg CO₂ évité"
        string              StatusLabel,       // "Complété", "Annulé"
        string              StatusColorHex,
        // Note reçue pour ce trajet (null = pas encore évalué)
        int?                MyRatingReceived,
        string?             RatingSourceLabel, // "Par Marie T."
        // Identifiant du trajet pour navigation vers TripDetail
        string              TripId = ""
    );
}
