using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class EcoChallenge
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string TitleEn { get; set; } = null!;
    public string MetricType { get; set; } = null!;     // distance_km | trips_count | co2_kg | unique_passengers
    public decimal TargetValue { get; set; }
    public int RewardPoints { get; set; }
    public Guid? RewardBadgeId { get; set; }
    public string Period { get; set; } = null!;         // monthly | weekly | all_time
    public DateTimeOffset ActiveFrom { get; set; }
    public DateTimeOffset ActiveUntil { get; set; }
    public string TargetRole { get; set; } = "all";     // passenger | driver | all

    // Navigation
    public Badge? RewardBadge { get; set; }
    public ICollection<ChallengeParticipation> Participations { get; set; } = new List<ChallengeParticipation>();
}
