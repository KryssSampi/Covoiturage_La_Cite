using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.GpsRepository;

// ── GpsPositionRepository ────────────────────────────────────────────────────

public class GpsPositionRepository : IGpsPositionRepository
{
    private readonly AppDbContext _db;
    public GpsPositionRepository(AppDbContext db) => _db = db;

    public async Task<GpsPosition?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.GpsPositions.FirstOrDefaultAsync(g => g.Id == (long)(object)id, ct);
    public async Task<IEnumerable<GpsPosition>> GetAllAsync(CancellationToken ct = default)
        => await _db.GpsPositions.ToListAsync(ct);
    public async Task AddAsync(GpsPosition entity, CancellationToken ct = default)
    { await _db.GpsPositions.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(GpsPosition entity, CancellationToken ct = default)
    { _db.GpsPositions.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var g = await GetByIdAsync(id, ct); if (g != null) { _db.GpsPositions.Remove(g); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.GpsPositions.AnyAsync(g => g.Id == (long)(object)id, ct);

    public async Task<IEnumerable<GpsPosition>> GetByTripIdAsync(Guid tripId, CancellationToken ct = default)
        => await _db.GpsPositions.Where(g => g.TripId == tripId).OrderBy(g => g.CapturedAt).ToListAsync(ct);

    public async Task<GpsPosition?> GetLatestByTripAndUserAsync(Guid tripId, Guid userId, CancellationToken ct = default)
        => await _db.GpsPositions.Where(g => g.TripId == tripId && g.UserId == userId)
            .OrderByDescending(g => g.CapturedAt).FirstOrDefaultAsync(ct);

    public async Task<IEnumerable<GpsPosition>> GetTripTraceAsync(Guid tripId, DateTimeOffset? since = null, CancellationToken ct = default)
    {
        var query = _db.GpsPositions.Where(g => g.TripId == tripId);
        if (since.HasValue)
            query = query.Where(g => g.CapturedAt >= since.Value);
        return await query.OrderBy(g => g.CapturedAt).ToListAsync(ct);
    }

    public async Task BulkInsertAsync(IEnumerable<GpsPosition> positions, CancellationToken ct = default)
    {
        await _db.GpsPositions.AddRangeAsync(positions, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteOlderThanAsync(DateTimeOffset cutoff, CancellationToken ct = default)
    {
        await _db.GpsPositions.Where(g => g.CapturedAt < cutoff).ExecuteDeleteAsync(ct);
    }
}

// ── SosAlertRepository ───────────────────────────────────────────────────────

public class SosAlertRepository : ISosAlertRepository
{
    private readonly AppDbContext _db;
    public SosAlertRepository(AppDbContext db) => _db = db;

    public async Task<SosAlert?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.SosAlerts.FirstOrDefaultAsync(a => a.Id == id, ct);
    public async Task<IEnumerable<SosAlert>> GetAllAsync(CancellationToken ct = default)
        => await _db.SosAlerts.ToListAsync(ct);
    public async Task AddAsync(SosAlert entity, CancellationToken ct = default)
    { await _db.SosAlerts.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }
    public async Task UpdateAsync(SosAlert entity, CancellationToken ct = default)
    { _db.SosAlerts.Update(entity); await _db.SaveChangesAsync(ct); }
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var a = await GetByIdAsync(id, ct); if (a != null) { _db.SosAlerts.Remove(a); await _db.SaveChangesAsync(ct); } }
    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.SosAlerts.AnyAsync(a => a.Id == id, ct);

    public async Task<IEnumerable<SosAlert>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _db.SosAlerts.Where(a => a.UserId == userId).OrderByDescending(a => a.TriggeredAt).ToListAsync(ct);
    public async Task<IEnumerable<SosAlert>> GetByTripIdAsync(Guid tripId, CancellationToken ct = default)
        => await _db.SosAlerts.Where(a => a.TripId == tripId).OrderByDescending(a => a.TriggeredAt).ToListAsync(ct);
    public async Task<IEnumerable<SosAlert>> GetPendingAsync(CancellationToken ct = default)
        => await _db.SosAlerts.Where(a => a.Status == "triggered" || a.Status == "contacted")
            .OrderBy(a => a.TriggeredAt).ToListAsync(ct);
    public async Task<SosAlert?> GetActiveByTripAsync(Guid tripId, CancellationToken ct = default)
        => await _db.SosAlerts.FirstOrDefaultAsync(a => a.TripId == tripId && a.ResolvedAt == null, ct);
}
