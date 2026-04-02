using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Affinity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TargetUserId { get; set; }
    public int AffinityScore { get; set; }
    public bool IsActuallyFavorite { get; set; }
    public DateTimeOffset? FavoriteSince { get; set; }
    public int TotalTripsTogether { get; set; }
    public decimal? AvgRatingGiven { get; set; }
    public decimal? AvgRatingReceived { get; set; }
    public DateTimeOffset? LastTripDate { get; set; }
    public bool IsBlocked { get; set; }
    public bool HadIncident { get; set; }
    public int IncidentCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public User TargetUser { get; set; } = null!;
}
