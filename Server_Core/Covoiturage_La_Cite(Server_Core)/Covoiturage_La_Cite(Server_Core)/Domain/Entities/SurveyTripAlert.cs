namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

/// <summary>
/// Alerte de suivi de trajet — créée quand un passager s'abonne aux trajets
/// récurrents d'un conducteur spécifique sur un itinéraire donné.
/// </summary>
public class SurveyTripAlert
{
    public Guid Id { get; set; }

    /// <summary>Utilisateur abonné (passager).</summary>
    public Guid UserId { get; set; }

    /// <summary>Conducteur suivi.</summary>
    public Guid DriverId { get; set; }

    /// <summary>Nom affiché du conducteur (dénormalisé pour éviter les jointures).</summary>
    public string DriverName { get; set; } = string.Empty;

    public string DepartureLabel { get; set; } = string.Empty;
    public string ArrivalLabel { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public User Driver { get; set; } = null!;
}
