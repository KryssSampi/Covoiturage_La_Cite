using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Social;

// ── Review ───────────────────────────────────────────────────────────────────

public record ReviewResponseDto
{
    public Guid Id { get; init; }
    public Guid TripId { get; init; }
    public Guid ReservationId { get; init; }
    public Guid ReviewerId { get; init; }
    public Guid RevieweeId { get; init; }
    public string RevieweeRole { get; init; } = string.Empty;
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public string[] Tags { get; init; } = [];
    public bool IsPublished { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record CreateReviewDto
{
    public Guid TripId { get; init; }
    public Guid ReservationId { get; init; }
    public Guid RevieweeId { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public string[] Tags { get; init; } = [];
}

// ── Affinity / Favori ────────────────────────────────────────────────────────

public record AffinityResponseDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public Guid TargetUserId { get; init; }
    public int AffinityScore { get; init; }
    public bool IsActuallyFavorite { get; init; }
    public DateTimeOffset? FavoriteSince { get; init; }
    public int TotalTripsTogether { get; init; }
    public decimal? AvgRatingGiven { get; init; }
    public bool IsBlocked { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

// ── Report / Signalement ─────────────────────────────────────────────────────

public record ReportResponseDto
{
    public Guid Id { get; init; }
    public string PublicReference { get; init; } = string.Empty;
    public Guid TripId { get; init; }
    public Guid ReporterId { get; init; }
    public Guid? ReportedUserId { get; init; }
    public string Category { get; init; } = string.Empty;
    public string SeverityLevel { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? ResolvedAt { get; init; }
}

public record CreateReportDto
{
    public Guid TripId { get; init; }
    public Guid? ReportedUserId { get; init; }
    public ReportCategory Category { get; init; }
    public string SeverityLevel { get; init; } = "medium";
    public string Description { get; init; } = string.Empty;
    public string[] EvidenceUrls { get; init; } = [];
}
