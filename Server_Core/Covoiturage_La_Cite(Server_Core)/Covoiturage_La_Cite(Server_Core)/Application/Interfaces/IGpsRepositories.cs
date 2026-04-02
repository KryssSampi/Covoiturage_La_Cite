using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Interfaces;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

// ── GPS Positions ────────────────────────────────────────────────────────────

public interface IGpsPositionRepository : IRepository<GpsPosition>
{
    Task<IEnumerable<GpsPosition>> GetByTripIdAsync(Guid tripId, CancellationToken ct = default);
    Task<GpsPosition?> GetLatestByTripAndUserAsync(Guid tripId, Guid userId, CancellationToken ct = default);
    Task<IEnumerable<GpsPosition>> GetTripTraceAsync(Guid tripId, DateTimeOffset? since = null, CancellationToken ct = default);
    Task BulkInsertAsync(IEnumerable<GpsPosition> positions, CancellationToken ct = default);
    Task DeleteOlderThanAsync(DateTimeOffset cutoff, CancellationToken ct = default);
}

// ── SOS Alerts ───────────────────────────────────────────────────────────────

public interface ISosAlertRepository : IRepository<SosAlert>
{
    Task<IEnumerable<SosAlert>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<SosAlert>> GetByTripIdAsync(Guid tripId, CancellationToken ct = default);
    Task<IEnumerable<SosAlert>> GetPendingAsync(CancellationToken ct = default);
    Task<SosAlert?> GetActiveByTripAsync(Guid tripId, CancellationToken ct = default);
}
