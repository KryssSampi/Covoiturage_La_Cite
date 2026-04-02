namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class UserBadge
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BadgeId { get; set; }
    public DateTimeOffset AwardedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Badge Badge { get; set; } = null!;
}
