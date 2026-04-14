using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Vehicle
{
    public Guid Id { get; set; }
    public Guid DriverProfileId { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public string? PhotoUrl { get; set; }
    /// <summary>Vérifié par un admin. Apparaît dans la console admin tant que false.</summary>
    public bool Verified { get; set; }
    /// <summary>URLs des photos du véhicule soumises lors de l'onboarding (jusqu'à 6).</summary>
    public List<string> VehiclePhotoUrls { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public DriverProfile DriverProfile { get; set; } = null!;
    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}
