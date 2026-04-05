using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IUserRepository : Domain.Interfaces.IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByMicrosoftIdAsync(string microsoftSsoId, CancellationToken ct = default);
    Task<User?> GetWithProfileAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetPublicProfileAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<User>> GetAllPaginatedAsync(int page, int pageSize, string? search = null, CancellationToken ct = default);
    Task<int> CountAsync(string? search = null, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<User>> GetTopByGoScoreAsync(int top, CancellationToken ct = default);
}
