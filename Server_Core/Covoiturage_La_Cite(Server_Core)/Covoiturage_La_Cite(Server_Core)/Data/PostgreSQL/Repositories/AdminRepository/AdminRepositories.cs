using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.AdminRepository;

// ── PlatformConfigRepository ─────────────────────────────────────────────────

public class PlatformConfigRepository : IPlatformConfigRepository
{
    private readonly AppDbContext _db;
    public PlatformConfigRepository(AppDbContext db) => _db = db;

    public async Task<PlatformConfig?> GetByKeyAsync(string key, CancellationToken ct = default)
        => await _db.PlatformConfigs.FirstOrDefaultAsync(c => c.Key == key, ct);
    public async Task<IEnumerable<PlatformConfig>> GetAllAsync(CancellationToken ct = default)
        => await _db.PlatformConfigs.OrderBy(c => c.Category).ThenBy(c => c.Key).ToListAsync(ct);
    public async Task<IEnumerable<PlatformConfig>> GetByCategoryAsync(string category, CancellationToken ct = default)
        => await _db.PlatformConfigs.Where(c => c.Category == category).OrderBy(c => c.Key).ToListAsync(ct);
    public async Task UpsertAsync(PlatformConfig config, CancellationToken ct = default)
    {
        var existing = await GetByKeyAsync(config.Key, ct);
        if (existing != null)
        {
            existing.Value = config.Value;
            existing.DataType = config.DataType;
            existing.Category = config.Category;
            existing.Description = config.Description;
            existing.LastModifiedByAdminId = config.LastModifiedByAdminId;
            existing.UpdatedAt = config.UpdatedAt;
        }
        else
        {
            await _db.PlatformConfigs.AddAsync(config, ct);
        }
        await _db.SaveChangesAsync(ct);
    }
    public async Task DeleteAsync(string key, CancellationToken ct = default)
    {
        var config = await GetByKeyAsync(key, ct);
        if (config != null) { _db.PlatformConfigs.Remove(config); await _db.SaveChangesAsync(ct); }
    }
}

// ── AuditLogRepository ───────────────────────────────────────────────────────

public class AuditLogRepository : IAuditLogRepository
{
    private readonly AppDbContext _db;
    public AuditLogRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(AuditLog log, CancellationToken ct = default)
    { await _db.AuditLogs.AddAsync(log, ct); await _db.SaveChangesAsync(ct); }
    public async Task<IEnumerable<AuditLog>> GetRecentAsync(int count = 50, CancellationToken ct = default)
        => await _db.AuditLogs.OrderByDescending(l => l.CreatedAt).Take(count).ToListAsync(ct);
    public async Task<IEnumerable<AuditLog>> GetByActorAsync(Guid actorId, int count = 50, CancellationToken ct = default)
        => await _db.AuditLogs.Where(l => l.ActorId == actorId).OrderByDescending(l => l.CreatedAt).Take(count).ToListAsync(ct);
    public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default)
        => await _db.AuditLogs.Where(l => l.EntityType == entityType && l.EntityId == entityId).OrderByDescending(l => l.CreatedAt).ToListAsync(ct);
    public async Task<long> GetCountAsync(CancellationToken ct = default)
        => await _db.AuditLogs.LongCountAsync(ct);
}

// ── PlatformStatsRepository ──────────────────────────────────────────────────

public class PlatformStatsRepository : IPlatformStatsRepository
{
    private readonly AppDbContext _db;
    public PlatformStatsRepository(AppDbContext db) => _db = db;

    public async Task<PlatformStats?> GetLatestAsync(CancellationToken ct = default)
        => await _db.PlatformStats.OrderByDescending(s => s.ComputedAt).FirstOrDefaultAsync(ct);
    public async Task AddAsync(PlatformStats stats, CancellationToken ct = default)
    { await _db.PlatformStats.AddAsync(stats, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(PlatformStats stats, CancellationToken ct = default)
    { _db.PlatformStats.Update(stats); await _db.SaveChangesAsync(ct); }
}
