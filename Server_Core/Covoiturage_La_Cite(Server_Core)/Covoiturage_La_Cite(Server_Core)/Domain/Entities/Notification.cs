using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public bool IsImportant { get; set; }
    public string? DeepLink { get; set; }
    public string? Payload { get; set; }
    public Guid? RelatedTripId { get; set; }
    public Guid? RelatedReservationId { get; set; }
    public DateTimeOffset? PushSentAt { get; set; }
    public bool? PushDelivered { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public User User { get; set; } = null!;
}
