using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.SocialRepository;

// ── ReviewRepository ─────────────────────────────────────────────────────────

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _db;
    public ReviewRepository(AppDbContext db) => _db = db;

    public async Task<Review?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IEnumerable<Review>> GetAllAsync(CancellationToken ct = default)
        => await _db.Reviews.OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

    public async Task AddAsync(Review entity, CancellationToken ct = default)
    { await _db.Reviews.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }

    public async Task UpdateAsync(Review entity, CancellationToken ct = default)
    { _db.Reviews.Update(entity); await _db.SaveChangesAsync(ct); }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var r = await GetByIdAsync(id, ct); if (r != null) { _db.Reviews.Remove(r); await _db.SaveChangesAsync(ct); } }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Reviews.AnyAsync(r => r.Id == id, ct);

    public async Task<IEnumerable<Review>> GetByRevieweeIdAsync(Guid revieweeId, CancellationToken ct = default)
        => await _db.Reviews.Where(r => r.RevieweeId == revieweeId && r.IsPublished)
            .OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

    public async Task<IEnumerable<Review>> GetByReviewerIdAsync(Guid reviewerId, CancellationToken ct = default)
        => await _db.Reviews.Where(r => r.ReviewerId == reviewerId)
            .OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

    public async Task<Review?> GetByReservationAndReviewerAsync(Guid reservationId, Guid reviewerId, CancellationToken ct = default)
        => await _db.Reviews.FirstOrDefaultAsync(r => r.ReservationId == reservationId && r.ReviewerId == reviewerId, ct);

    public async Task<double> GetAverageRatingAsync(Guid revieweeId, CancellationToken ct = default)
    {
        var reviews = await _db.Reviews.Where(r => r.RevieweeId == revieweeId && r.IsPublished).ToListAsync(ct);
        return reviews.Count == 0 ? 0 : reviews.Average(r => r.Rating);
    }
}

// ── AffinityRepository ───────────────────────────────────────────────────────

public class AffinityRepository : IAffinityRepository
{
    private readonly AppDbContext _db;
    public AffinityRepository(AppDbContext db) => _db = db;

    public async Task<Affinity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Affinities.FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<IEnumerable<Affinity>> GetAllAsync(CancellationToken ct = default)
        => await _db.Affinities.ToListAsync(ct);

    public async Task AddAsync(Affinity entity, CancellationToken ct = default)
    { await _db.Affinities.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }

    public async Task UpdateAsync(Affinity entity, CancellationToken ct = default)
    { _db.Affinities.Update(entity); await _db.SaveChangesAsync(ct); }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var a = await GetByIdAsync(id, ct); if (a != null) { _db.Affinities.Remove(a); await _db.SaveChangesAsync(ct); } }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Affinities.AnyAsync(a => a.Id == id, ct);

    public async Task<Affinity?> GetByUserPairAsync(Guid userId, Guid targetUserId, CancellationToken ct = default)
        => await _db.Affinities.FirstOrDefaultAsync(a => a.UserId == userId && a.TargetUserId == targetUserId, ct);

    public async Task<IEnumerable<Affinity>> GetFavoritesAsync(Guid userId, CancellationToken ct = default)
        => await _db.Affinities.Where(a => a.UserId == userId && a.IsActuallyFavorite && !a.IsBlocked)
            .OrderByDescending(a => a.AffinityScore).ToListAsync(ct);

    public async Task<IEnumerable<Affinity>> GetBlockedAsync(Guid userId, CancellationToken ct = default)
        => await _db.Affinities.Where(a => a.UserId == userId && a.IsBlocked).ToListAsync(ct);

    public async Task<IEnumerable<Affinity>> GetTopAffinitiesAsync(Guid userId, int top = 10, CancellationToken ct = default)
        => await _db.Affinities.Where(a => a.UserId == userId && !a.IsBlocked)
            .OrderByDescending(a => a.AffinityScore).Take(top).ToListAsync(ct);
}

// ── ReportRepository ─────────────────────────────────────────────────────────

public class ReportRepository : IReportRepository
{
    private readonly AppDbContext _db;
    public ReportRepository(AppDbContext db) => _db = db;

    public async Task<Report?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Reports.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IEnumerable<Report>> GetAllAsync(CancellationToken ct = default)
        => await _db.Reports.OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

    public async Task AddAsync(Report entity, CancellationToken ct = default)
    { await _db.Reports.AddAsync(entity, ct); await _db.SaveChangesAsync(ct); }

    public async Task UpdateAsync(Report entity, CancellationToken ct = default)
    { _db.Reports.Update(entity); await _db.SaveChangesAsync(ct); }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    { var r = await GetByIdAsync(id, ct); if (r != null) { _db.Reports.Remove(r); await _db.SaveChangesAsync(ct); } }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => await _db.Reports.AnyAsync(r => r.Id == id, ct);

    public async Task<IEnumerable<Report>> GetByReporterIdAsync(Guid reporterId, CancellationToken ct = default)
        => await _db.Reports.Where(r => r.ReporterId == reporterId).OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

    public async Task<IEnumerable<Report>> GetByReportedUserIdAsync(Guid reportedUserId, CancellationToken ct = default)
        => await _db.Reports.Where(r => r.ReportedUserId == reportedUserId).OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

    public async Task<IEnumerable<Report>> GetPendingAsync(CancellationToken ct = default)
        => await _db.Reports.Where(r => r.Status == "Pending").OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

    public async Task<Report?> GetByReferenceAsync(string publicReference, CancellationToken ct = default)
        => await _db.Reports.FirstOrDefaultAsync(r => r.PublicReference == publicReference, ct);
}
