// ============================================================
//  Core/Models/CreateTripFormModel.cs
//  État du formulaire de création de trajet (miroir du web)
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Core.Models
{
    public class TripFormPreferences
    {
        public bool BaggageAllowed { get; set; }
        public bool PetsAllowed { get; set; }
        public bool SmokingAllowed { get; set; }
        public bool MusicAllowed { get; set; }
        public bool FlexibleItinerary { get; set; }
        public string? DriverNote { get; set; }

        public static TripFormPreferences Default => new();
    }

    public class CreateTripFormState
    {
        // Obligatoires
        public string DepartureLocation { get; set; } = "";
        public string ArrivalLocation { get; set; } = "";
        public string? DepartureInstructions { get; set; }
        public string? ArrivalInstructions { get; set; }
        public string DepartureDate { get; set; } = "";    // yyyy-MM-dd
        public string DepartureTime { get; set; } = "";   // HH:mm
        public string VehicleId { get; set; } = "";

        // Avec valeurs par défaut
        public TripType TripType { get; set; } = TripType.Unique;
        public int MaxPassengers { get; set; } = 4;
        public int AvailableSeats { get; set; } = 3;
        public double PricePerPassenger { get; set; } = 5.0;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public TripFormPreferences Preferences { get; set; } = TripFormPreferences.Default;

        // Optionnels
        public string? Notes { get; set; }
        public int[]? RecurrenceDays { get; set; }        // 0=Dim…6=Sam
        public string? RecurrenceEndDate { get; set; }   // yyyy-MM-dd

        /// <summary>Pré-remplissage depuis la page de recherche</summary>
        public record Prefill(
            string? DepartureLocation,
            string? ArrivalLocation,
            string? DepartureDate,
            string? DepartureTime
        );

        public static CreateTripFormState FromPrefill(Prefill? prefill)
        {
            var s = new CreateTripFormState();
            if (prefill is null) return s;
            if (!string.IsNullOrWhiteSpace(prefill.DepartureLocation)) s.DepartureLocation = prefill.DepartureLocation;
            if (!string.IsNullOrWhiteSpace(prefill.ArrivalLocation))   s.ArrivalLocation   = prefill.ArrivalLocation;
            if (!string.IsNullOrWhiteSpace(prefill.DepartureDate))     s.DepartureDate     = prefill.DepartureDate;
            if (!string.IsNullOrWhiteSpace(prefill.DepartureTime))     s.DepartureTime     = prefill.DepartureTime;
            return s;
        }
    }

    /// <summary>Erreurs de validation du formulaire (clés = noms de propriétés)</summary>
    public class CreateTripFormErrors
    {
        public string? DepartureLocation { get; set; }
        public string? ArrivalLocation { get; set; }
        public string? DepartureDate { get; set; }
        public string? DepartureTime { get; set; }
        public string? VehicleId { get; set; }

        public bool HasErrors =>
            DepartureLocation is not null || ArrivalLocation is not null ||
            DepartureDate is not null     || DepartureTime is not null   ||
            VehicleId is not null;

        public void Clear()
        {
            DepartureLocation = null;
            ArrivalLocation   = null;
            DepartureDate     = null;
            DepartureTime     = null;
            VehicleId         = null;
        }
    }
}
