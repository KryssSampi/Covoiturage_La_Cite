namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class UserStat
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public int TotalTripsAsDriver { get; set; }
    public int TotalTripsAsPassenger { get; set; }
    public decimal TotalCo2SavedKg { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public decimal AverageRatingAsDriver { get; set; }
    public decimal AverageRatingAsPassenger { get; set; }
    public int TotalReviewsGiven { get; set; }
    public int TotalReviewsReceived { get; set; }
    public int TotalPenalties { get; set; }
    public decimal TotalEarningsDriver { get; set; }
    public decimal TotalSpentPassenger { get; set; }
    public int BadgesCount { get; set; }
    public int ChallengesCompleted { get; set; }
    public DateTimeOffset? LastTripDate { get; set; }
    public DateTimeOffset RecomputedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
