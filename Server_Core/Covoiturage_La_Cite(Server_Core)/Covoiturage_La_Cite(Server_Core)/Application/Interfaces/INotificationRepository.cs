using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Covoiturage_La_Cite_Server_Core_.Domain.Interfaces;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid notificationId, CancellationToken ct = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<Notification>> GetImportantByUserIdAsync(Guid userId, CancellationToken ct = default);
}
