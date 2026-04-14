namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Stats;

/// <summary>
/// Données brutes pour le calcul des statistiques utilisateur côté BFF.
/// Retournées par GET /api/user-stats/{userId}?periode=XXX
/// </summary>
public record UserStatsRawDto
{
    public Guid UserId { get; init; }
    public int GoScore { get; init; }

    // Agrégats globaux (UserStat)
    public int TotalTripsAsDriver { get; init; }
    public int TotalTripsAsPassenger { get; init; }
    public decimal TotalCo2SavedKg { get; init; }
    public decimal TotalDistanceKm { get; init; }
    public decimal AverageRatingAsDriver { get; init; }
    public int TotalReviewsReceived { get; init; }
    public decimal TotalEarningsDriver { get; init; }

    // Trajets filtrés par période
    public IEnumerable<TripStatDto> Trips { get; init; } = Enumerable.Empty<TripStatDto>();

    // Avis reçus filtrés par période
    public IEnumerable<ReviewStatDto> Reviews { get; init; } = Enumerable.Empty<ReviewStatDto>();

    // Badges obtenus
    public IEnumerable<BadgeStatDto> Badges { get; init; } = Enumerable.Empty<BadgeStatDto>();
}

public record TripStatDto
{
    public Guid Id { get; init; }
    public string DepartureLabel { get; init; } = string.Empty;
    public string ArrivalLabel { get; init; } = string.Empty;
    public DateOnly DepartureDate { get; init; }
    public int PassengerCount { get; init; }
    public decimal DistanceKm { get; init; }
    public decimal PricePerPassenger { get; init; }
    public decimal Co2SavedKg { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal? AverageRating { get; init; }
}

public record ReviewStatDto
{
    public int Rating { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record BadgeStatDto
{
    public Guid BadgeId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string IconUrl { get; init; } = string.Empty;
    public DateTimeOffset ObtainedAt { get; init; }
}
