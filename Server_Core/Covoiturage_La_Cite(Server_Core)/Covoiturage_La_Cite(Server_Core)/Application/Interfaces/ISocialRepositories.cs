using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Interfaces;

namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

// ── Reviews ──────────────────────────────────────────────────────────────────

public interface IReviewRepository : IRepository<Review>
{
    Task<IEnumerable<Review>> GetByRevieweeIdAsync(Guid revieweeId, CancellationToken ct = default);
    Task<IEnumerable<Review>> GetByReviewerIdAsync(Guid reviewerId, CancellationToken ct = default);
    Task<Review?> GetByReservationAndReviewerAsync(Guid reservationId, Guid reviewerId, CancellationToken ct = default);
    Task<double> GetAverageRatingAsync(Guid revieweeId, CancellationToken ct = default);
}

// ── Affinités / Favoris ──────────────────────────────────────────────────────

public interface IAffinityRepository : IRepository<Affinity>
{
    Task<Affinity?> GetByUserPairAsync(Guid userId, Guid targetUserId, CancellationToken ct = default);
    Task<IEnumerable<Affinity>> GetFavoritesAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<Affinity>> GetBlockedAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<Affinity>> GetTopAffinitiesAsync(Guid userId, int top = 10, CancellationToken ct = default);
}

// ── Signalements ─────────────────────────────────────────────────────────────

public interface IReportRepository : IRepository<Report>
{
    Task<IEnumerable<Report>> GetByReporterIdAsync(Guid reporterId, CancellationToken ct = default);
    Task<IEnumerable<Report>> GetByReportedUserIdAsync(Guid reportedUserId, CancellationToken ct = default);
    Task<IEnumerable<Report>> GetPendingAsync(CancellationToken ct = default);
    Task<Report?> GetByReferenceAsync(string publicReference, CancellationToken ct = default);
}
