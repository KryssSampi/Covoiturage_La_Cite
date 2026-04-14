using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Sse;
using Covoiturage_La_Cite_Server_Core_.Api.Hubs;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
// ReSharper disable once RedundantUsingDirective — NotificationCategory used in switch

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Notification;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;
    private readonly IUserRepository _userRepo;
    private readonly IEmailService _emailService;
    private readonly SignalREventService _signalR;
    private readonly SseChannelService _sse;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        INotificationRepository repo,
        IUserRepository userRepo,
        IEmailService emailService,
        SignalREventService signalR,
        SseChannelService sse,
        ILogger<NotificationService> logger)
    {
        _repo = repo;
        _userRepo = userRepo;
        _emailService = emailService;
        _signalR = signalR;
        _sse = sse;
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

        var responseDto = MapToResponse(notification);

        // ── Triggers asynchrones (fire-and-forget, ne bloque pas la réponse) ──
        _ = Task.Run(async () =>
        {
            try
            {
                await FireTriggersAsync(notification, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors des triggers pour notification {NotifId}", notification.Id);
            }
        }, ct);

        return responseDto;
    }

    public async Task DeleteAsync(Guid notificationId, Guid userId, CancellationToken ct = default)
    {
        var notification = await _repo.GetByIdAsync(notificationId, ct)
            ?? throw new KeyNotFoundException("Notification introuvable");

        if (notification.UserId != userId)
            throw new UnauthorizedAccessException("Cette notification ne vous appartient pas");

        await _repo.DeleteAsync(notificationId, ct);
    }

    // ── Triggers internes ────────────────────────────────────────────────────

    private async Task FireTriggersAsync(Domain.Entities.Notification n, CancellationToken ct)
    {
        var user = await _userRepo.GetWithProfileAsync(n.UserId, ct);
        if (user == null) return;

        var category = NotificationCategoryHelper.GetCategory(n.Type);
        var prefs = user.Preferences;

        var responseDto = MapToResponse(n);

        // 1. SSE temps réel → web client connecté
        _sse.Publish(n.UserId, "notification", responseDto);

        // 2. SignalR → clients SignalR connectés (mobile + web si connecté via WS)
        await _signalR.SendToUserAsync(n.UserId, "NotificationReceived", responseDto);

        // 3. Email selon les préférences par catégorie
        var sendEmail = category switch
        {
            NotificationCategory.Primordiale  => prefs?.EmailPrimordiales  ?? true,
            NotificationCategory.Secondaire   => prefs?.EmailSecondaires   ?? true,
            NotificationCategory.Negligeable  => prefs?.EmailNegligeables  ?? false,
            _ => false
        };

        if (sendEmail && (prefs?.EmailNotifications ?? true))
        {
            try
            {
                await _emailService.SendNotificationEmailAsync(
                    user.Email,
                    user.FirstName,
                    n.Title,
                    n.Body,
                    n.DeepLink,
                    ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Échec envoi email notification {NotifId}", n.Id);
            }
        }
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
