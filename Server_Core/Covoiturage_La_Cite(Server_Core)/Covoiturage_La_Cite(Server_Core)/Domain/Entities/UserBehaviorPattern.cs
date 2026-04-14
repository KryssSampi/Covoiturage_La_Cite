using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class UserBehaviorPattern
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? MostFrequentDeparture { get; set; }
    public string? MostFrequentArrival { get; set; }
    public int[] TypicalDepartureDays { get; set; } = [];
    public TimeOnly? TypicalDepartureTimeStart { get; set; }
    public TimeOnly? TypicalDepartureTimeEnd { get; set; }
    public decimal AvgSessionsPerWeek { get; set; }
    public ChurnRisk ChurnRisk { get; set; }
    public DateTimeOffset? LastTripDate { get; set; }
    public decimal PatternConfidence { get; set; }
    public DateTimeOffset RecomputedAt { get; set; }

    public User User { get; set; } = null!;
}
