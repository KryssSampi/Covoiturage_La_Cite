using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;

/// <summary>
/// Profil public étendu — inclut stats, likes, trajets publiés, trajets récurrents.
/// Données sensibles (email, téléphone) masquées.
/// </summary>
public record UserPublicDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public string? Bio { get; init; }
    public bool IsProfileVerified { get; init; }
    public bool CanBeDriver { get; init; }
    public SchoolRole SchoolRole { get; init; }
    public UserRole Role { get; init; }
    public int GoScore { get; init; }
    public string[] LanguagesSpoken { get; init; } = ["fr"];
    public DateTimeOffset CreatedAt { get; init; }

    // Likes
    public int LikesCount { get; init; }
    public bool IsLikedByMe { get; init; }

    // Favoris
    public bool IsFavorite { get; init; }

    // Sous-profil public conducteur (null si passager)
    public DriverProfilePublicDto? DriverProfile { get; init; }

    // Avis reçus (les plus récents, max 5)
    public IEnumerable<PublicReviewDto> RecentReviews { get; init; } = [];

    // Trajets publiés récents (max 5, pour les conducteurs)
    public IEnumerable<PublicTripDto> RecentPublishedTrips { get; init; } = [];

    // Itinéraires habituels du conducteur (trajets récurrents distincts)
    public IEnumerable<UsualTripDto> UsualTrips { get; init; } = [];
}

public record DriverProfilePublicDto
{
    public string ValidationStatus { get; init; } = string.Empty;
    public decimal AverageRating { get; init; }
    public int TotalTripsAsDriver { get; init; }
    public decimal Co2SavedKg { get; init; }
    public string? VehiclePhotoUrl { get; init; }
    public string? VehicleMake { get; init; }
    public string? VehicleModel { get; init; }
    public int? VehicleYear { get; init; }
    public string? VehicleColor { get; init; }
}

public record PublicReviewDto
{
    public string ReviewerName { get; init; } = string.Empty;
    public string? ReviewerAvatar { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record PublicTripDto
{
    public Guid Id { get; init; }
    public string DepartureLabel { get; init; } = string.Empty;
    public string ArrivalLabel { get; init; } = string.Empty;
    public DateOnly DepartureDate { get; init; }
    public TimeOnly DepartureTime { get; init; }
    public int AvailableSeats { get; init; }
    public decimal PricePerPassenger { get; init; }
}

public record UsualTripDto
{
    public string DepartureLabel { get; init; } = string.Empty;
    public string ArrivalLabel { get; init; } = string.Empty;
}
