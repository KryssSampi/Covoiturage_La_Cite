using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Notification;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationResponseDto>> GetMyNotificationsAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<IEnumerable<NotificationResponseDto>> GetUnreadAsync(Guid userId, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default);
    Task<NotificationResponseDto> CreateAsync(CreateNotificationDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid notificationId, Guid userId, CancellationToken ct = default);
}
