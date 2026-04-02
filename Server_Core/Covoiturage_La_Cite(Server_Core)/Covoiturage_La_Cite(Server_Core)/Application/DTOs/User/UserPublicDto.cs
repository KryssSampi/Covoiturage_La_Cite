using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;

/// <summary>
/// Profil public d'un utilisateur — données sensibles masquées.
/// </summary>
public record UserPublicDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public bool IsProfileVerified { get; init; }
    public bool CanBeDriver { get; init; }
    public SchoolRole SchoolRole { get; init; }
    public int GoScore { get; init; }
    public string Language { get; init; } = "fr";
    public DateTimeOffset CreatedAt { get; init; }

    // Sous-profil public conducteur (si pertinent)
    public DriverProfilePublicDto? DriverProfile { get; init; }
}

public record DriverProfilePublicDto
{
    public string ValidationStatus { get; init; } = string.Empty;
    public decimal AverageRating { get; init; }
    public int TotalTripsAsDriver { get; init; }
    public decimal Co2SavedKg { get; init; }
}
