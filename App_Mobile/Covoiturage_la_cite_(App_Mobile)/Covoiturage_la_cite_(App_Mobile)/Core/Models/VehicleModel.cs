// ============================================================
//  Core/Models/VehicleModel.cs
//  Véhicule du conducteur (formulaire création trajet)
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Core.Models
{
    public class VehicleModel
    {
        public string Id { get; init; } = "";
        public string DriverId { get; init; } = "";
        public string Make { get; init; } = "";
        public string Model { get; init; } = "";
        public int? Year { get; init; }
        public string? Color { get; init; }
        public string? LicensePlate { get; init; }
        public int MaxSeats { get; init; }
        public bool IsActive { get; init; }
        public bool IsValidated { get; init; }

        /// <summary>Label affiché dans le sélecteur (ex : "Honda Civic 2020")</summary>
        public string Label => $"{Make} {Model}{(Year.HasValue ? $" {Year}" : "")}";

        /// <summary>Nombre max de passagers = MaxSeats - 1 (siège conducteur)</summary>
        public int MaxPassengers => Math.Max(0, MaxSeats - 1);
    }
}
