namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class MatchingScoreCache
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid PassengerId { get; set; }
    public int GlobalScore { get; set; }
    public int DepartureProximityScore { get; set; }
    public int ArrivalProximityScore { get; set; }
    public int ScheduleScore { get; set; }
    public int PreferenceScore { get; set; }
    public int AffinityScore { get; set; }
    public int Bonuses { get; set; }
    public DateTimeOffset ComputedAt { get; set; }

    public Trip Trip { get; set; } = null!;
    public User Passenger { get; set; } = null!;
}
