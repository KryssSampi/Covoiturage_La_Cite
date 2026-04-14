using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class SmartSuggestion
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public SuggestionType SuggestionType { get; set; }
    public decimal ConfidenceScore { get; set; }
    public string? SuggestedDeparture { get; set; }
    public string? SuggestedArrival { get; set; }
    public string? SuggestedTimeWindow { get; set; }
    public int[]? SuggestedDays { get; set; }
    public string ReasonLabel { get; set; } = string.Empty;
    public Guid? RelatedTripId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? ShownAt { get; set; }
    public DateTimeOffset? ActedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public User User { get; set; } = null!;
}
