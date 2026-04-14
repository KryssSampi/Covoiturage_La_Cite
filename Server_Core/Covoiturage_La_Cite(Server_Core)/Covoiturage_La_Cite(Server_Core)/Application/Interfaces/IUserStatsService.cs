using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Stats;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

public interface IUserStatsService
{
    Task<UserStatsRawDto?> GetRawStatsAsync(Guid userId, string periode, CancellationToken ct = default);
}
