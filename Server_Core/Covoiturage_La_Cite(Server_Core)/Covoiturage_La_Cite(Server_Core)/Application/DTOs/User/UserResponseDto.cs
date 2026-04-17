using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;

/// <summary>
/// DTO réponse complet pour un utilisateur (profil connecté / admin).
/// </summary>
public record UserResponseDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public string? PhoneNumber { get; init; }
    public string? NotificationEmail { get; init; }
    public UserRole Role { get; init; }
    public SchoolRole SchoolRole { get; init; }
    public UserStatus Status { get; init; }
    public bool IsProfileVerified { get; init; }
    public bool CanBeDriver { get; init; }
    public int GoScore { get; init; }
    public int ReputationPoints { get; init; }
    public string Language { get; init; } = "fr";
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }

    // Sous-profils intégrés
    public DriverProfileDto? DriverProfile { get; init; }
    public UserPreferencesDto? Preferences { get; init; }
}

public record DriverProfileDto
{
    public Guid Id { get; init; }
    public string ValidationStatus { get; init; } = string.Empty;
    public decimal AverageRating { get; init; }
    public int TotalTripsAsDriver { get; init; }
    public decimal CancellationRate { get; init; }
    public int PunctualityScore { get; init; }
    public int NoShowCount { get; init; }
    public decimal Co2SavedKg { get; init; }
    public decimal BalanceAvailable { get; init; }
}

public record UserPreferencesDto
{
    public bool MusicAccepted { get; init; }
    public bool PetsAccepted { get; init; }
    public bool SmokingAccepted { get; init; }
    public string ConversationLevel { get; init; } = "moderate";
}
