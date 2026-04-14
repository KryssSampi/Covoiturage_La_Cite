using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Penalty
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? TripId { get; set; }
    public Guid? ReservationId { get; set; }
    public PenaltyType Type { get; set; }
    public decimal Amount { get; set; }
    public PenaltyStatus Status { get; set; }
    public DateTimeOffset ContestDeadline { get; set; }
    public string? ContestReason { get; set; }
    public string? AdminDecision { get; set; }
    public int GoScoreImpact { get; set; }
    public string TriggerReason { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? DeductedAt { get; set; }

    public User User { get; set; } = null!;
    public Trip? Trip { get; set; }
    public Reservation? Reservation { get; set; }
}
