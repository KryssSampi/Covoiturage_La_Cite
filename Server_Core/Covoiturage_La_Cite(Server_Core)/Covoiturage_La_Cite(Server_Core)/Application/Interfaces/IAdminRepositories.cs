using Covoiturage_La_Cite_Server_Core_.Domain.Entities;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

// ── PlatformConfig ───────────────────────────────────────────────────────────

public interface IPlatformConfigRepository
{
    Task<PlatformConfig?> GetByKeyAsync(string key, CancellationToken ct = default);
    Task<IEnumerable<PlatformConfig>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<PlatformConfig>> GetByCategoryAsync(string category, CancellationToken ct = default);
    Task UpsertAsync(PlatformConfig config, CancellationToken ct = default);
    Task DeleteAsync(string key, CancellationToken ct = default);
}

// ── AuditLog ─────────────────────────────────────────────────────────────────

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog log, CancellationToken ct = default);
    Task<IEnumerable<AuditLog>> GetRecentAsync(int count = 50, CancellationToken ct = default);
    Task<IEnumerable<AuditLog>> GetByActorAsync(Guid actorId, int count = 50, CancellationToken ct = default);
    Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default);
    Task<long> GetCountAsync(CancellationToken ct = default);
}

// ── PlatformStats ────────────────────────────────────────────────────────────

public interface IPlatformStatsRepository
{
    Task<PlatformStats?> GetLatestAsync(CancellationToken ct = default);
    Task AddAsync(PlatformStats stats, CancellationToken ct = default);
    Task UpdateAsync(PlatformStats stats, CancellationToken ct = default);
}
