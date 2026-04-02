using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Notification;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(INotificationRepository repo, ILogger<NotificationService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationResponseDto>> GetMyNotificationsAsync(Guid userId, int page, int pageSize, CancellationToken ct = default)
    {
        var notifications = await _repo.GetByUserIdAsync(userId, page, pageSize, ct);
        return notifications.Select(MapToResponse);
    }

    public async Task<IEnumerable<NotificationResponseDto>> GetUnreadAsync(Guid userId, CancellationToken ct = default)
    {
        var notifications = await _repo.GetUnreadByUserIdAsync(userId, ct);
        return notifications.Select(MapToResponse);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct = default)
        => await _repo.GetUnreadCountAsync(userId, ct);

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default)
    {
        var notification = await _repo.GetByIdAsync(notificationId, ct)
            ?? throw new KeyNotFoundException("Notification introuvable");

        if (notification.UserId != userId)
            throw new UnauthorizedAccessException("Cette notification ne vous appartient pas");

        await _repo.MarkAsReadAsync(notificationId, ct);
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default)
    {
        await _repo.MarkAllAsReadAsync(userId, ct);
        _logger.LogInformation("Toutes les notifications marquées lues pour {UserId}", userId);
    }

    public async Task<NotificationResponseDto> CreateAsync(CreateNotificationDto dto, CancellationToken ct = default)
    {
        var notification = new Domain.Entities.Notification
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Type = dto.Type,
            Title = dto.Title,
            Body = dto.Body,
            IsImportant = dto.IsImportant,
            IsRead = false,
            DeepLink = dto.DeepLink,
            Payload = dto.Payload,
            RelatedTripId = dto.RelatedTripId,
            RelatedReservationId = dto.RelatedReservationId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _repo.AddAsync(notification, ct);
        _logger.LogInformation("Notification créée: {NotifId} type={Type} pour {UserId}", notification.Id, dto.Type, dto.UserId);
        return MapToResponse(notification);
    }

    public async Task DeleteAsync(Guid notificationId, Guid userId, CancellationToken ct = default)
    {
        var notification = await _repo.GetByIdAsync(notificationId, ct)
            ?? throw new KeyNotFoundException("Notification introuvable");

        if (notification.UserId != userId)
            throw new UnauthorizedAccessException("Cette notification ne vous appartient pas");

        await _repo.DeleteAsync(notificationId, ct);
    }

    private static NotificationResponseDto MapToResponse(Domain.Entities.Notification n) => new()
    {
        Id = n.Id,
        UserId = n.UserId,
        Type = n.Type.ToString(),
        Title = n.Title,
        Body = n.Body,
        IsRead = n.IsRead,
        IsImportant = n.IsImportant,
        DeepLink = n.DeepLink,
        Payload = n.Payload,
        RelatedTripId = n.RelatedTripId,
        RelatedReservationId = n.RelatedReservationId,
        PushSentAt = n.PushSentAt,
        PushDelivered = n.PushDelivered,
        CreatedAt = n.CreatedAt
    };
}
