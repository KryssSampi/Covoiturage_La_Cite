using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;

public record NotificationResponseDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public bool IsRead { get; init; }
    public bool IsImportant { get; init; }
    public string? DeepLink { get; init; }
    public string? Payload { get; init; }
    public Guid? RelatedTripId { get; init; }
    public Guid? RelatedReservationId { get; init; }
    public DateTimeOffset? PushSentAt { get; init; }
    public bool? PushDelivered { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record CreateNotificationDto
{
    public Guid UserId { get; init; }
    public NotificationType Type { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public bool IsImportant { get; init; }
    public string? DeepLink { get; init; }
    public string? Payload { get; init; }
    public Guid? RelatedTripId { get; init; }
    public Guid? RelatedReservationId { get; init; }
}
