namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class ChallengeParticipation
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid EcoChallengeId { get; set; }
    public decimal CurrentValue { get; set; }
    public bool IsCompleted { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public bool RewardClaimed { get; set; }
    public DateTimeOffset JoinedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public EcoChallenge EcoChallenge { get; set; } = null!;
}
